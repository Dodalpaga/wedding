// LRU cache of compressed frames. Decoded bitmaps have their own smaller cache.
export class FrameBlobCache {
  private readonly entries = new Map<number, Blob>();
  private bytes = 0;

  constructor(private readonly maxBytes: number) {}

  get(index: number) {
    const blob = this.entries.get(index);
    if (blob) {
      this.entries.delete(index);
      this.entries.set(index, blob);
    }
    return blob;
  }

  set(index: number, blob: Blob) {
    const previous = this.entries.get(index);
    if (previous) { this.bytes -= previous.size; this.entries.delete(index); }
    if (blob.size > this.maxBytes) return;
    while (this.bytes + blob.size > this.maxBytes) {
      const oldest = this.entries.keys().next().value as number;
      this.bytes -= this.entries.get(oldest)!.size;
      this.entries.delete(oldest);
    }
    this.entries.set(index, blob);
    this.bytes += blob.size;
  }

  clear() { this.entries.clear(); this.bytes = 0; }
}
