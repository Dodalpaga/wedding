import { FrameBlobCache } from './frame-blob-cache';
import type { FrameBufferSettings } from './frame-sequence';

type BufferOptions<T> = {
  settings: FrameBufferSettings;
  frameCount: number;
  reducedMotion: boolean;
  fetchFrame: (index: number, signal: AbortSignal) => Promise<Blob>;
  decode: (blob: Blob) => Promise<T>;
  release: (frame: T) => void;
  onReady: () => void;
};

// Downloads can fill a large, cheap compressed buffer without decoding every
// image. Only a bounded window around the camera becomes full-size bitmaps.
export class JourneyFrameBuffer<T> {
  private readonly blobs: FrameBlobCache;
  private readonly bitmaps = new Map<number, T>();
  private readonly downloads = new Map<number, AbortController>();
  private readonly decoding = new Set<number>();
  private readonly failed = new Set<number>();
  private readonly fetched = new Set<number>();
  private wanted = 0;
  private presented = -1;
  private pendingPresentation = -1;
  private presentationReset = false;
  private destination = 0;
  private direction = 1;
  private speed = 0;
  private latencyMs = 250;
  private reduced: boolean;
  private visible = true;
  private disposed = false;

  constructor(private readonly options: BufferOptions<T>) {
    this.blobs = new FrameBlobCache(options.settings.blobCacheBytes);
    this.reduced = options.reducedMotion;
  }

  seek(index: number, direction: number, framesPerSecond = 0, destination = index) {
    const next = Math.max(0, Math.min(this.options.frameCount - 1, Math.round(index)));
    const jump = Math.abs(next - this.wanted);
    const nextDirection = direction < 0 ? -1 : 1;
    if (nextDirection !== this.direction || jump > this.options.settings.downloadBehind) {
      this.fetched.clear();
      this.pendingPresentation = -1;
    }
    // The held image can lag behind the camera when direction changes. Applying
    // the previous direction's monotonic bound would freeze it until the camera
    // crosses that old image, even if the new target is already decoded.
    if (nextDirection !== this.direction || jump > this.options.settings.downloadBehind) this.presentationReset = true;
    this.wanted = this.reduced ? 0 : next;
    this.destination = this.reduced ? 0 : Math.max(0, Math.min(this.options.frameCount - 1, Math.round(destination)));
    this.direction = nextDirection;
    this.speed = Math.min(1200, Math.max(0, framesPerSecond));
    // A deliberate anchor/jump gets a free network lane immediately. Normal
    // scrolling keeps in-flight prefetches instead of repeatedly cancelling them.
    {
      this.downloads.forEach((controller, loaded) => {
        const behindCamera = (this.wanted - loaded) * this.direction > this.options.settings.downloadBehind;
        if ((behindCamera || (jump > this.options.settings.downloadBehind
          && Math.abs(loaded - this.wanted) > this.options.settings.downloadBehind))
          && Math.abs(loaded - this.destination) > 2) {
          controller.abort(); this.downloads.delete(loaded);
        }
      });
    }
    this.prune();
    this.pump();
  }

  nearest(index: number) {
    const exact = this.bitmaps.get(index);
    if (exact !== undefined) return { index, frame: exact };
    let nearest: { index: number; frame: T } | undefined;
    let gap = Infinity;
    this.bitmaps.forEach((frame, loaded) => {
      const distance = Math.abs(loaded - index);
      if (distance < gap) { gap = distance; nearest = { index: loaded, frame }; }
    });
    return nearest;
  }

  exact(index: number) {
    const frame = this.bitmaps.get(index);
    return frame === undefined ? undefined : { index, frame };
  }

  // Within one direction, only present images between the last image and the
  // camera. Reversals/jumps start a new bound; otherwise late speculative
  // decodes must never jump ahead and then back.
  presentation(index: number, direction: number) {
    const held = this.bitmaps.has(this.presented) ? this.presented : -1;
    let selected = this.presentationReset ? -1 : held;
    this.bitmaps.forEach((_, loaded) => {
      if (direction >= 0 ? loaded <= index && (selected < 0 || loaded > selected)
        : loaded >= index && (selected < 0 || loaded < selected)) selected = loaded;
    });
    if (selected < 0) selected = held;
    if (selected < 0) return undefined;
    return { index: selected, frame: this.bitmaps.get(selected)! };
  }

  markPresented(index: number) {
    this.presented = index;
    this.pendingPresentation = -1;
    this.presentationReset = false;
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      this.presented = -1;
      this.pendingPresentation = -1;
      this.presentationReset = true;
      this.wanted = 0;
      this.destination = 0;
      this.abortDownloads();
      this.blobs.clear();
      this.fetched.clear();
      this.bitmaps.forEach((frame, index) => {
        if (index !== 0) { this.options.release(frame); this.bitmaps.delete(index); }
      });
    }
    this.pump();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (!visible) this.abortDownloads();
    else this.pump();
  }

  dispose() {
    this.disposed = true;
    this.abortDownloads();
    this.bitmaps.forEach(this.options.release);
    this.bitmaps.clear();
    this.blobs.clear();
  }

  private abortDownloads() {
    this.downloads.forEach(controller => controller.abort());
    this.downloads.clear();
  }

  private decodeOrder() {
    if (this.reduced) return [0];
    const { cacheSize, decodeAhead } = this.options.settings;
    const behind = cacheSize - decodeAhead - 1;
    // Fast scrolling skips source frames. Prepare the next likely display
    // position before spending decode slots on every intermediate image.
    const stride = Math.max(1, Math.min(decodeAhead, Math.round(this.speed / 60)));
    const order = new Set([this.wanted, this.destination, this.wanted + stride * this.direction,
      this.wanted + this.direction, this.wanted - this.direction]);
    for (let delta = 2; delta <= decodeAhead; delta++) order.add(this.wanted + delta * this.direction);
    for (let delta = 2; delta <= behind; delta++) order.add(this.wanted - delta * this.direction);
    const valid = Array.from(order).filter(index => index >= 0 && index < this.options.frameCount);
    // A held image occupies a real cache slot. Otherwise the last speculative
    // decode would be evicted and immediately decoded again forever at rest.
    const reserved = [this.presented, this.pendingPresentation]
      .filter(index => this.bitmaps.has(index) && !valid.includes(index)).length;
    return valid.slice(0, Math.max(1, cacheSize - reserved));
  }

  private prune() {
    const keep = new Set(this.decodeOrder());
    // Keep useful previously drawn frames until their replacements are ready.
    while (this.bitmaps.size > this.options.settings.cacheSize) {
      let victim = -1;
      let distance = -1;
      this.bitmaps.forEach((_, index) => {
        const gap = Math.abs(index - this.wanted) + (keep.has(index) ? 0 : this.options.frameCount);
        if (index !== this.wanted && index !== this.presented && index !== this.pendingPresentation && gap > distance) { victim = index; distance = gap; }
      });
      const frame = this.bitmaps.get(victim);
      if (frame === undefined) break;
      this.options.release(frame);
      this.bitmaps.delete(victim);
    }
  }

  private pump() {
    if (this.disposed || !this.visible) return;
    const order = this.decodeOrder();
    const critical = new Set(order);
    // On cold/fast scroll the camera may outrun downloads, not just decoding.
    // Decode the newest received image behind it instead of ignoring all blobs
    // outside the narrow future window until scrolling stops.
    if (!this.reduced && this.presented >= 0 && !this.bitmaps.has(this.wanted) && !this.blobs.has(this.wanted)
      && this.decoding.size < this.options.settings.decodeConcurrency) {
      const candidate = this.blobs.between(this.presented, this.wanted, this.direction);
      if (candidate && !this.bitmaps.has(candidate.index) && !this.decoding.has(candidate.index) && !this.failed.has(candidate.index)) {
        void this.decodeFrame(candidate.index, candidate.blob);
      }
    }
    for (const index of order) {
      if (this.decoding.size >= this.options.settings.decodeConcurrency) break;
      if (this.bitmaps.has(index) || this.decoding.has(index) || this.failed.has(index)) continue;
      // A speculative decode cannot be cancelled once createImageBitmap starts.
      // Keep a lane available so a new camera position needn't wait behind a
      // full queue of images it has already passed.
      if (index !== this.wanted && index !== this.destination
        && this.decoding.size >= Math.max(1, this.options.settings.decodeConcurrency - 1)) break;
      const blob = this.blobs.get(index);
      if (blob) void this.decodeFrame(index, blob);
    }

    const { fetchConcurrency, downloadAhead, downloadMaxAhead, downloadBehind, preloadAll } = this.options.settings;
    const ahead = Math.min(downloadMaxAhead, Math.max(downloadAhead, Math.ceil(this.speed * (this.latencyMs / 1000 + 1))));
    // Callers can prepare an anchor destination before the camera reaches it.
    const downloads = new Set([this.wanted, this.destination, ...order]);
    if (!this.reduced) {
      for (let delta = 1; delta <= ahead; delta++) downloads.add(this.wanted + delta * this.direction);
      for (let delta = 1; delta <= downloadBehind; delta++) downloads.add(this.wanted - delta * this.direction);
      if (preloadAll) for (let index = 0; index < this.options.frameCount; index++) {
        // Full prefetch is one pass, even if a future asset set exceeds the budget.
        if (!this.fetched.has(index)) downloads.add(index);
      }
    }
    for (const index of Array.from(downloads)) {
      if (this.downloads.size >= fetchConcurrency) break;
      if (index < 0 || index >= this.options.frameCount || this.blobs.has(index) || this.bitmaps.has(index)
        || this.downloads.has(index) || this.decoding.has(index) || this.failed.has(index)) continue;
      // Do not repeatedly refill evicted speculative frames when a source set
      // exceeds the byte budget. A reversal/jump starts a fresh prefetch pass.
      if (index !== this.destination && !critical.has(index) && this.fetched.has(index)) continue;
      // Background transfers leave one slot for the current frame after a seek.
      if (index !== this.destination && Math.abs(index - this.wanted) > 2 && this.downloads.size >= fetchConcurrency - 1) break;
      void this.downloadFrame(index);
    }
  }

  private async downloadFrame(index: number) {
    const controller = new AbortController();
    this.downloads.set(index, controller);
    const start = performance.now();
    try {
      const blob = await this.options.fetchFrame(index, controller.signal);
      if (this.disposed || controller.signal.aborted) return;
      this.latencyMs = this.latencyMs * .8 + Math.min(3000, performance.now() - start) * .2;
      this.blobs.set(index, blob);
      this.fetched.add(index);
    } catch {
      if (!this.disposed && !controller.signal.aborted) this.failed.add(index);
    } finally {
      if (this.downloads.get(index) === controller) this.downloads.delete(index);
      this.pump();
    }
  }

  private async decodeFrame(index: number, blob: Blob) {
    this.decoding.add(index);
    try {
      const frame = await this.options.decode(blob);
      // A fast scroll can outrun a decode. An image behind the camera is still
      // useful if it advances the last presentation: discarding every such
      // result would freeze the background until scrolling stops.
      const canPresent = this.presented >= 0 && (this.direction >= 0
        ? index <= this.wanted && index > this.presented
        : index >= this.wanted && index < this.presented);
      if (this.disposed || (!this.decodeOrder().includes(index) && !canPresent)) { this.options.release(frame); return; }
      const previousGap = Math.abs((this.nearest(this.wanted)?.index ?? -this.options.frameCount) - this.wanted);
      this.bitmaps.set(index, frame);
      if (canPresent && (this.pendingPresentation < 0 || (index - this.pendingPresentation) * this.direction > 0)) {
        this.pendingPresentation = index;
      }
      this.prune();
      if (this.visible && (canPresent || Math.abs(index - this.wanted) <= previousGap)) this.options.onReady();
    } catch {
      if (!this.disposed) this.failed.add(index);
    } finally {
      this.decoding.delete(index);
      this.pump();
    }
  }
}
