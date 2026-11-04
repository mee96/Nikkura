import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoBackground } from './video-background';

describe('VideoBackground', () => {
  let fixture: ComponentFixture<VideoBackground>;
  let element: HTMLElement;
  let play: ReturnType<typeof vi.fn<() => Promise<void>>>;
  let playing: boolean[];

  const video = () => element.querySelector('video');

  function mockReducedMotion(reduce: boolean): void {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: reduce && query.includes('reduce'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  }

  async function render(src = '/clip.mp4'): Promise<void> {
    fixture = TestBed.createComponent(VideoBackground);
    fixture.componentRef.setInput('src', src);
    playing = [];
    fixture.componentInstance.playingChange.subscribe((value) => playing.push(value));
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  beforeEach(() => {
    play = vi.fn<() => Promise<void>>(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    mockReducedMotion(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is decoration only: hidden from screen readers', async () => {
    await render();

    expect(element.getAttribute('aria-hidden')).toBe('true');
    expect(video()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('plays a silent, endless, inline video and asks to start it', async () => {
    await render();
    const clip = video()!;

    expect(clip.getAttribute('src')).toBe('/clip.mp4');
    expect(clip.muted).toBe(true);
    expect(clip.loop).toBe(true);
    expect(clip.hasAttribute('playsinline')).toBe(true);
    expect(clip.hasAttribute('autoplay')).toBe(true);
    expect(play).toHaveBeenCalled();
  });

  it('is hidden until the first frame plays, then fades in and says so', async () => {
    await render();
    expect(video()?.classList).not.toContain('video--on');

    video()!.dispatchEvent(new Event('playing'));
    await fixture.whenStable();

    expect(video()?.classList).toContain('video--on');
    expect(playing.at(-1)).toBe(true);
  });

  it('hides again and says so if the video fails', async () => {
    await render();
    video()!.dispatchEvent(new Event('playing'));
    video()!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(video()?.classList).not.toContain('video--on');
    expect(playing.at(-1)).toBe(false);
  });

  it('starts over if it ever reaches the end', async () => {
    await render();
    const clip = video()!;
    clip.currentTime = 5;
    play.mockClear();

    clip.dispatchEvent(new Event('ended'));

    expect(clip.currentTime).toBe(0);
    expect(play).toHaveBeenCalledOnce();
  });

  it('plays again when the tab comes back', async () => {
    await render();
    vi.spyOn(video()!, 'paused', 'get').mockReturnValue(true);
    play.mockClear();

    document.dispatchEvent(new Event('visibilitychange'));

    expect(play).toHaveBeenCalledOnce();
  });

  it('has no video without an address', async () => {
    await render('');

    expect(video()).toBeNull();
    expect(playing.at(-1)).toBe(false);
  });

  it('has no video with reduced motion: the mesh stays still', async () => {
    mockReducedMotion(true);
    await render();

    expect(video()).toBeNull();
  });
});
