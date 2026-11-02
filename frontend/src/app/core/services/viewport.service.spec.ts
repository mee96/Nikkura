import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DESKTOP_QUERY, ViewportService } from './viewport.service';

describe('ViewportService', () => {
  function fakeMedia(matches: boolean) {
    const listeners: ((event: { matches: boolean }) => void)[] = [];
    const query = {
      matches,
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
        listeners.push(listener),
    };
    const matchMedia = vi.fn(() => query);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: { defaultView: { matchMedia } },
        },
      ],
    });
    return {
      matchMedia,
      change: (value: boolean) => listeners.forEach((l) => l({ matches: value })),
    };
  }

  it('follows the desktop media query', () => {
    const media = fakeMedia(true);
    const service = TestBed.inject(ViewportService);

    expect(media.matchMedia).toHaveBeenCalledWith(DESKTOP_QUERY);
    expect(service.isDesktop()).toBe(true);

    media.change(false);
    expect(service.isDesktop()).toBe(false);
  });

  it('treats a browser without matchMedia as not desktop', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: {} } }],
    });

    expect(TestBed.inject(ViewportService).isDesktop()).toBe(false);
  });
});
