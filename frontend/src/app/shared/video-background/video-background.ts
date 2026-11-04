import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * Full-screen silent video that loops forever, behind the page. It is decoration:
 * hidden from screen readers and never takes clicks.
 *
 * - It fades in once the first frame plays, over whatever is behind it (the pastel
 *   mesh), and `playingChange` tells the page so it can switch to light text.
 * - If the video cannot load or play, nothing is shown and `playingChange` stays false.
 * - With reduced motion there is no video at all: the mesh stays still.
 * - It never stays paused: it restarts at the end and resumes when the tab comes back.
 */
@Component({
  selector: 'app-video-background',
  template: `
    @if (enabled()) {
      <video
        #video
        class="video"
        [class.video--on]="ready()"
        [src]="src()"
        [muted]="true"
        [loop]="true"
        autoplay
        playsinline
        disablepictureinpicture
        preload="auto"
        aria-hidden="true"
        (playing)="started()"
        (error)="failed()"
        (ended)="restart()"
      ></video>
    }
  `,
  styleUrl: './video-background.scss',
  host: { 'aria-hidden': 'true', '(document:visibilitychange)': 'resume()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoBackground {
  private readonly document = inject(DOCUMENT);
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  /** Address of the video file; empty for none. */
  readonly src = input('');
  /** True once the video is playing, false if it fails. */
  readonly playingChange = output<boolean>();

  protected readonly ready = signal(false);
  private readonly prefersReducedMotion = signal(false);
  protected readonly enabled = computed(() => !!this.src() && !this.prefersReducedMotion());

  constructor() {
    const query = this.document.defaultView?.matchMedia?.(REDUCED_MOTION);
    if (query) {
      this.prefersReducedMotion.set(query.matches);
      query.addEventListener('change', (event) => this.prefersReducedMotion.set(event.matches));
    }

    // The browser only autoplays a video that is muted, and Angular's `muted` attribute
    // does not set the property, so set it and ask to play as soon as the element exists.
    effect(() => {
      const element = this.video()?.nativeElement;
      if (!element) {
        this.ready.set(false);
        this.playingChange.emit(false);
        return;
      }
      element.muted = true;
      element.loop = true;
      void element.play?.()?.catch(() => undefined);
    });
  }

  protected started(): void {
    this.ready.set(true);
    this.playingChange.emit(true);
  }

  protected failed(): void {
    this.ready.set(false);
    this.playingChange.emit(false);
  }

  /** Safety net: `loop` should make this unreachable, but the video must never stop. */
  protected restart(): void {
    const element = this.video()?.nativeElement;
    if (!element) return;
    element.currentTime = 0;
    void element.play?.()?.catch(() => undefined);
  }

  protected resume(): void {
    const element = this.video()?.nativeElement;
    if (element?.paused && this.document.visibilityState === 'visible') {
      void element.play?.()?.catch(() => undefined);
    }
  }
}
