import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { Login, authErrorKey, safeReturnUrl } from './login';

describe('safeReturnUrl', () => {
  it('keeps a path inside Nikkura, with its query', () => {
    expect(safeReturnUrl('/kura')).toBe('/kura');
    expect(safeReturnUrl('/explore?genres=romance')).toBe('/explore?genres=romance');
  });

  it.each([undefined, '', 'kura', 'https://evil.example', '//evil.example', '/\\evil.example'])(
    'sends %j to the home',
    (url) => {
      expect(safeReturnUrl(url)).toBe('/');
    },
  );
});

describe('authErrorKey', () => {
  it.each([
    ['auth/invalid-credential', 'login.errors.credentials'],
    ['auth/wrong-password', 'login.errors.credentials'],
    ['auth/user-not-found', 'login.errors.credentials'],
    ['auth/invalid-email', 'login.errors.credentials'],
    ['auth/too-many-requests', 'login.errors.tooMany'],
    ['auth/network-request-failed', 'login.errors.network'],
    ['auth/something-new', 'login.errors.generic'],
  ])('maps %s', (code, key) => {
    expect(authErrorKey({ code })).toBe(key);
  });

  it('shows nothing when the person closes the Google window', () => {
    expect(authErrorKey({ code: 'auth/popup-closed-by-user' })).toBeNull();
    expect(authErrorKey({ code: 'auth/cancelled-popup-request' })).toBeNull();
  });

  it('copes with errors that are not from Firebase', () => {
    expect(authErrorKey(new Error('boom'))).toBe('login.errors.generic');
    expect(authErrorKey(null)).toBe('login.errors.generic');
  });
});

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let element: HTMLElement;
  let auth: Record<'logIn' | 'logInWithGoogle' | 'resetPassword', ReturnType<typeof vi.fn>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    auth = {
      logIn: vi.fn(() => Promise.resolve()),
      logInWithGoogle: vi.fn(() => Promise.resolve()),
      resetPassword: vi.fn(() => Promise.resolve()),
    };
    TestBed.configureTestingModule({
      imports: [Login, provideTranslocoTesting()],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    TestBed.inject(LanguageService).setLang('en');
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  const settle = async () => {
    // Let the pending promises of the handlers finish before looking at the screen.
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    await fixture.whenStable();
  };
  const text = (selector: string) =>
    element.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
  const field = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const type = async (id: string, value: string) => {
    const input = field(id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await settle();
  };
  const click = async (selector: string) => {
    element.querySelector<HTMLButtonElement>(selector)!.click();
    await settle();
  };
  const submit = async () => {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await settle();
  };
  const fill = async () => {
    await type('login-email', 'ana@example.com');
    await type('login-password', 'secret1');
  };

  it('has a heading, the welcome and a form with labelled email and password', () => {
    expect(text('h1')).toBe('Log in');
    expect(text('.copy__title')).toBe('Your anime notebook is waiting for you.');
    expect(text('label[for="login-email"]')).toBe('Email');
    expect(text('label[for="login-password"]')).toBe('Password');
    expect(field('login-email').type).toBe('email');
    expect(field('login-password').type).toBe('password');
  });

  it('asks for nothing else: no age, no role', () => {
    expect([...element.querySelectorAll('input')].map((input) => input.id)).toEqual([
      'login-email',
      'login-password',
    ]);
    expect(element.querySelector('select, [type="checkbox"], [type="radio"]')).toBeNull();
  });

  it('links to sign-up and lets visitors go on without an account', () => {
    expect(element.querySelector('a[href="/signup"]')?.textContent).toContain('Create one');
    expect(element.querySelector('a[href="/"]')?.textContent).toContain('Continue without');
  });

  it('shows and hides the password', async () => {
    await click('.field__toggle');
    expect(field('login-password').type).toBe('text');
    expect(text('.field__toggle')).toBe('Hide');

    await click('.field__toggle');
    expect(field('login-password').type).toBe('password');
  });

  describe('logging in with email and password', () => {
    it('logs in and goes to the home', async () => {
      await fill();
      await submit();

      expect(auth.logIn).toHaveBeenCalledWith('ana@example.com', 'secret1');
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('goes back to the page the guard sent the person away from', async () => {
      fixture.componentRef.setInput('returnUrl', '/kura');
      await fill();
      await submit();

      expect(navigate).toHaveBeenCalledWith('/kura');
    });

    it('never goes to another site', async () => {
      fixture.componentRef.setInput('returnUrl', 'https://evil.example');
      await fill();
      await submit();

      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('asks for both fields before calling Firebase', async () => {
      await type('login-email', 'ana@example.com');
      await submit();

      expect(auth.logIn).not.toHaveBeenCalled();
      expect(text('[role="alert"]')).toBe('Enter your email and password.');
      expect(field('login-password').getAttribute('aria-invalid')).toBe('true');
    });

    it('explains wrong credentials and stays on the page', async () => {
      auth.logIn.mockRejectedValue({ code: 'auth/invalid-credential' });
      await fill();
      await submit();

      expect(text('[role="alert"]')).toBe('The email or the password is not correct.');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('clears the error on the next try', async () => {
      auth.logIn.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
      await fill();
      await submit();
      await submit();

      expect(element.querySelector('[role="alert"]')).toBeNull();
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('does not send twice while it is waiting', async () => {
      let finish!: () => void;
      auth.logIn.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
      await fill();
      await submit();
      await submit();

      expect(auth.logIn).toHaveBeenCalledOnce();
      expect(element.querySelector('button[type="submit"]')?.getAttribute('aria-busy')).toBe(
        'true',
      );
      expect(text('button[type="submit"]')).toBe('Logging in…');

      finish();
      await settle();
      expect(element.querySelector('button[type="submit"]')?.getAttribute('aria-busy')).toBe(
        'false',
      );
    });
  });

  describe('Google', () => {
    it('logs in with Google and goes to the home', async () => {
      await click('.button--outline');

      expect(auth.logInWithGoogle).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('says nothing when the person closes the Google window', async () => {
      auth.logInWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
      await click('.button--outline');

      expect(element.querySelector('[role="alert"]')).toBeNull();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('explains other errors', async () => {
      auth.logInWithGoogle.mockRejectedValue({ code: 'auth/network-request-failed' });
      await click('.button--outline');

      expect(text('[role="alert"]')).toBe('No connection. Check it and try again.');
    });
  });

  describe('forgot password', () => {
    it('asks for the email first', async () => {
      await click('.login__forgot');

      expect(auth.resetPassword).not.toHaveBeenCalled();
      expect(text('[role="alert"]')).toContain('Enter your email');
    });

    it('sends the link and says so, without revealing whether the account exists', async () => {
      await type('login-email', 'ana@example.com');
      await click('.login__forgot');

      expect(auth.resetPassword).toHaveBeenCalledWith('ana@example.com');
      expect(text('[role="status"]')).toContain('If an account exists');
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('follows the language', async () => {
    TestBed.inject(LanguageService).setLang('ca');
    await settle();

    expect(text('h1')).toBe('Entrar');
    expect(text('.copy__title')).toBe("La teva llibreta d'anime t'està esperant.");
    expect(field('login-email').placeholder).toBe('tu@exemple.cat');
  });
});
