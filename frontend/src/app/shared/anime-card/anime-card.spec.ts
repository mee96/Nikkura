import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { makeAnime, tag } from '../../../testing/anime';
import { provideTranslocoTesting } from '../../../testing/transloco';
import { Anime } from '../../core/models/jikan.model';
import { LanguageService } from '../../core/services/language.service';
import { AnimeCard } from './anime-card';

describe('AnimeCard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AnimeCard, provideTranslocoTesting()],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => localStorage.clear());

  async function render(anime: Anime, lang: 'ca' | 'es' | 'en' = 'en'): Promise<HTMLElement> {
    TestBed.inject(LanguageService).setLang(lang);
    const fixture = TestBed.createComponent(AnimeCard);
    fixture.componentRef.setInput('anime', anime);
    TestBed.tick();
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  const text = (element: HTMLElement, selector: string) =>
    element.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  it('links to the anime page and shows title, type, year and demographic', async () => {
    const element = await render(makeAnime({ mal_id: 52991, title: 'Frieren', year: 2023 }));

    expect(element.querySelector('a')?.getAttribute('href')).toBe('/anime/52991');
    expect(text(element, '.card__title')).toBe('Frieren');
    expect(text(element, '.card__meta')).toBe('TV2023Shoujo');
  });

  it('translates the type and the demographic', async () => {
    const element = await render(
      makeAnime({ type: 'Movie', year: 2020, demographics: [tag('Shounen')] }),
      'ca',
    );

    expect(text(element, '.card__meta')).toBe('Pel·lícula2020Shounen');
  });

  it('formats the score for the language', async () => {
    expect(text(await render(makeAnime({ score: 8.7 }), 'ca'), '.card__badge--score')).toContain(
      '8,7',
    );
  });

  it('shows the score in English with a dot', async () => {
    expect(text(await render(makeAnime({ score: 8.7 }), 'en'), '.card__badge--score')).toBe(
      '★Score 8.7',
    );
  });

  it('has no score badge for an unscored anime', async () => {
    expect(
      (await render(makeAnime({ score: null }))).querySelector('.card__badge--score'),
    ).toBeNull();
  });

  it('marks ecchi with +18 and explains it to screen readers', async () => {
    const element = await render(makeAnime({ explicit_genres: [tag('Ecchi', 9)] }));

    expect(text(element, '.card__badge--mature')).toContain('+18');
    expect(text(element, '.card__badge--mature .visually-hidden')).toBe('For ages 18 and over');
  });

  it('uses a decorative cover, as the title is already in the link', async () => {
    const element = await render(
      makeAnime({
        images: {
          jpg: { image_url: 'small.jpg', large_image_url: 'large.jpg' },
          webp: { image_url: null, large_image_url: 'large.webp' },
        },
      }),
    );
    const image = element.querySelector('img');

    expect(image?.getAttribute('src')).toBe('large.webp');
    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('loading')).toBe('lazy');
  });
});
