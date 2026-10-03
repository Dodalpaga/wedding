<#
Extract every decoded video frame to a separate WebP. No FPS filter, resizing or crop.
Examples (PowerShell, run from the project root):
  .\scripts\extract-video-frames.ps1
  .\scripts\extract-video-frames.ps1 -InputVideo '.\public\assets\movie.mp4' -OutputDirectory '.\public\assets\movie-frames'
  .\scripts\extract-video-frames.ps1 -Lossless -OutputDirectory '.\public\assets\torii-lossless'
FFmpeg/ffprobe may be on PATH or in build/tools/ffmpeg/bin/ (portable, local only).
#>
[CmdletBinding()]
param(
  [string]$InputVideo = (Join-Path $PSScriptRoot '../public/assets/Torii_better_fps.mp4'),
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '../public/assets/torii-better-fps-frames'),
  [string]$FFmpegPath,
  [string]$FFprobePath,
  [ValidateRange(0, 100)][int]$Quality = 85,
  [switch]$Lossless
)
$ErrorActionPreference = 'Stop'

function Resolve-VideoTool([string]$ExplicitPath, [string]$Name) {
  if ($ExplicitPath) {
    if (Test-Path -LiteralPath $ExplicitPath -PathType Leaf) { return (Resolve-Path -LiteralPath $ExplicitPath).Path }
    throw "Tool does not exist: $ExplicitPath"
  }
  $command = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($command) { return $command.Source }
  $portable = Join-Path $PSScriptRoot "../build/tools/ffmpeg/bin/$Name.exe"
  if (Test-Path -LiteralPath $portable -PathType Leaf) { return (Resolve-Path -LiteralPath $portable).Path }
  throw "Install FFmpeg and ffprobe on PATH, or pass -${Name}Path with the executable path."
}

$videoPath = (Resolve-Path -LiteralPath $InputVideo).Path
$outputPath = [IO.Path]::GetFullPath($OutputDirectory)
$ffmpegTool = Resolve-VideoTool $FFmpegPath 'ffmpeg'
if (!$FFprobePath) {
  $siblingProbe = Join-Path (Split-Path $ffmpegTool) 'ffprobe.exe'
  if (Test-Path -LiteralPath $siblingProbe) { $FFprobePath = $siblingProbe }
}
$ffprobeTool = Resolve-VideoTool $FFprobePath 'ffprobe'
if ((Test-Path -LiteralPath $outputPath) -and (Get-ChildItem -LiteralPath $outputPath -Force | Select-Object -First 1)) {
  throw "Output directory is not empty: $outputPath. Choose a new directory; existing files are never overwritten."
}

$sourceHash = (Get-FileHash -LiteralPath $videoPath -Algorithm SHA256).Hash
$probeJson = & $ffprobeTool -v error -select_streams v:0 -count_frames -show_entries 'stream=width,height,avg_frame_rate,r_frame_rate,nb_frames,nb_read_frames,duration:format=duration' -of json $videoPath
if ($LASTEXITCODE -ne 0) { throw 'ffprobe failed to read the video.' }
$probe = ($probeJson -join "`n") | ConvertFrom-Json
$stream = $probe.streams[0]
if (!$stream) { throw 'No video stream found.' }
$expectedCount = [int]$stream.nb_read_frames
if ($expectedCount -lt 1) { throw 'Unable to count decoded source frames.' }
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
$pattern = Join-Path $outputPath 'frame-%06d.webp'
$losslessValue = if ($Lossless) { '1' } else { '0' }
Write-Host "Extracting $expectedCount frames, $($stream.width)x$($stream.height), FPS $($stream.avg_frame_rate)."
$arguments = @('-hide_banner', '-nostdin', '-loglevel', 'warning', '-n', '-i', $videoPath,
  '-map', '0:v:0', '-an', '-sn', '-dn', '-fps_mode', 'passthrough', '-c:v', 'libwebp',
  '-lossless', $losslessValue, '-q:v', [string]$Quality, '-compression_level', '4',
  '-threads', '2', '-start_number', '1', '-f', 'image2', $pattern)
& $ffmpegTool @arguments
if ($LASTEXITCODE -ne 0) { throw 'FFmpeg extraction failed. Partial results are kept for inspection.' }

$frames = @(Get-ChildItem -LiteralPath $outputPath -Filter 'frame-*.webp' -File | Sort-Object Name)
if ($frames.Count -ne $expectedCount) { throw "Frame count mismatch: extracted $($frames.Count), expected $expectedCount." }
for ($index = 0; $index -lt $frames.Count; $index++) {
  if ($frames[$index].Name -ne ('frame-{0:D6}.webp' -f ($index + 1))) { throw 'Frame numbering has a gap.' }
}
if ((Get-FileHash -LiteralPath $videoPath -Algorithm SHA256).Hash -ne $sourceHash) { throw 'Source video changed during extraction.' }
$bytes = ($frames | Measure-Object -Property Length -Sum).Sum
$metadata = [ordered]@{
  source = [IO.Path]::GetFileName($videoPath)
  sourceSha256 = $sourceHash
  width = $stream.width
  height = $stream.height
  averageFrameRate = $stream.avg_frame_rate
  durationSeconds = $probe.format.duration
  frameCount = $frames.Count
  pattern = 'frame-{frame}.webp'
  padding = 6
  startNumber = 1
  lossless = [bool]$Lossless
  quality = $Quality
  totalBytes = $bytes
}
$metadata | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outputPath 'sequence.json') -Encoding utf8
Write-Host ("Done: {0} frames, {1:N2} MiB, {2}" -f $frames.Count, ($bytes / 1MB), $outputPath)
