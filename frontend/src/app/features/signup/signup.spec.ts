import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ProfileService } from '../../core/services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { Signup, profileUsername, signupErrorKey } from './signup';

describe('signupErrorKey', () => {
  it.each([
    ['auth/email-already-in-use', 'signup.errors.emailInUse'],
    ['auth/invalid-email', 'signup.errors.invalidEmail'],
    ['auth/weak-password', 'signup.errors.weakPassword'],
    ['auth/too-many-requests', 'signup.errors.tooMany'],
    ['auth/network-request-failed', 'signup.errors.network'],
    ['auth/something-new', 'signup.errors.generic'],
  ])('maps %s', (code, key) => {
    expect(signupErrorKey({ code })).toBe(key);
  });

  it('shows nothing when the person closes the Google window', () => {
    expect(signupErrorKey({ code: 'auth/popup-closed-by-user' })).toBeNull();
    expect(signupErrorKey({ code: 'auth/cancelled-popup-request' })).toBeNull();
  });

  it('copes with errors that are not from Firebase', () => {
    expect(signupErrorKey(new Error('boom'))).toBe('signup.errors.generic');
    expect(signupErrorKey(null)).toBe('signup.errors.generic');
  });
});

describe('profileUsername', () => {
  const google = { displayName: 'Ana Google', email: 'ana.g@example.com' };

  it('uses the username that was typed, without the spaces around it', () => {
    expect(profileUsername('  Ana  ', google)).toBe('Ana');
  });

  it('falls back to the name of the account, then to the start of the email', () => {
    expect(profileUsername('', google)).toBe('Ana Google');
    expect(profileUsername(' ', { displayName: null, email: 'ana.g@example.com' })).toBe('ana.g');
  });

  it('skips names that are too short and never goes over the limit', () => {
    expect(profileUsername('A', google)).toBe('Ana Google');
    expect(profileUsername('x'.repeat(40), null)).toBe('x'.repeat(24));
  });

  it('still gives a valid username when there is nothing to use', () => {
    expect(profileUsername('', null)).toBe('user');
    expect(profileUsername('', { displayName: null, email: null })).toBe('user');
  });
});

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>;
  let element: HTMLElement;
  let auth: Record<'signUp' | 'logInWithGoogle' | 'currentUser', ReturnType<typeof vi.fn>>;
  let profile: Record<'create', ReturnType<typeof vi.fn>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    auth = {
      signUp: vi.fn(() => Promise.resolve()),
      logInWithGoogle: vi.fn(() => Promise.resolve()),
      currentUser: vi.fn(() => null),
    };
    profile = {
      create: vi.fn((username: string, role: string) =>
        Promise.resolve({ uid: 'u1', username, email: null, role }),
      ),
    };
    TestBed.configureTestingModule({
      imports: [Signup, provideTranslocoTesting()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: ProfileService, useValue: profile },
      ],
    });
    TestBed.inject(LanguageService).setLang('en');
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Signup);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  const settle = async () => {
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
    element.querySelector<HTMLElement>(selector)!.click();
    await settle();
  };
  const submit = async () => {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await settle();
  };
  const fill = async (password = 'secret123') => {
    await type('signup-username', '  Ana  ');
    await type('signup-email', ' ana@example.com ');
    await type('signup-password', password);
  };

  it('has a heading, the welcome and labelled username, email and password', () => {
    expect(text('h1')).toBe('Create an account');
    expect(text('.copy__title')).toBe('Your notebook starts with a first anime.');
    expect(text('label[for="signup-username"]')).toBe('Username');
    expect(text('label[for="signup-email"]')).toBe('Email');
    expect(text('label[for="signup-password"]')).toBe('Password');
    expect(field('signup-password').type).toBe('password');
  });

  it('offers the three roles, with Moe Magical chosen, and no age or other question', () => {
    const roles = [...element.querySelectorAll<HTMLInputElement>('input[name="role"]')];

    expect(roles.map((role) => role.value)).toEqual(['moe', 'haku', 'senpai']);
    expect(roles.map((role) => role.checked)).toEqual([true, false, false]);
    expect(text('.role--haku')).toContain('Haku Sama');
    expect(text('.role--senpai')).toContain('Senpai');
    expect(element.querySelector('.roles__about')).toBeNull();
    expect(element.querySelector('select, [type="checkbox"]')).toBeNull();
  });

  it('links to the login and lets visitors go on without an account', () => {
    expect(element.querySelector('a[href="/login"]')?.textContent).toContain('Log in');
    expect(element.querySelector('a[href="/"]')?.textContent).toContain('Continue without');
  });

  it('shows and hides the password', async () => {
    await click('.field__toggle');
    expect(field('signup-password').type).toBe('text');
    await click('.field__toggle');
    expect(field('signup-password').type).toBe('password');
  });

  describe('creating the account', () => {
    it('signs up with the trimmed values, saves the profile, applies the role and goes to the home', async () => {
      await fill();
      await click('input[value="haku"]');
      await submit();

      expect(auth.signUp).toHaveBeenCalledWith('ana@example.com', 'secret123', 'Ana');
      expect(profile.create).toHaveBeenCalledWith('Ana', 'haku');
      expect(TestBed.inject(ThemeService).role()).toBe('haku');
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('asks for everything before calling Firebase', async () => {
      await type('signup-username', 'Ana');
      await submit();

      expect(auth.signUp).not.toHaveBeenCalled();
      expect(text('[role="alert"]')).toBe('Fill in your username, email and password.');
      expect(field('signup-email').getAttribute('aria-invalid')).toBe('true');
    });

    it('says when the email is wrong', async () => {
      await type('signup-username', 'Ana');
      await type('signup-email', 'ana@');
      await type('signup-password', 'secret123');
      await submit();

      expect(text('[role="alert"]')).toBe("That email doesn't look right.");
      expect(auth.signUp).not.toHaveBeenCalled();
    });

    it('says when the username is too short', async () => {
      await type('signup-username', 'A');
      await type('signup-email', 'ana@example.com');
      await type('signup-password', 'secret123');
      await submit();

      expect(text('[role="alert"]')).toBe('Your username needs 2 to 24 characters.');
    });

    it('says when the password is too short', async () => {
      await fill('short');
      await submit();

      expect(text('[role="alert"]')).toBe('The password needs at least 8 characters.');
      expect(field('signup-password').getAttribute('aria-invalid')).toBe('true');
      expect(auth.signUp).not.toHaveBeenCalled();
    });

    it('explains an email that already has an account and stays on the page', async () => {
      auth.signUp.mockRejectedValue({ code: 'auth/email-already-in-use' });
      await fill();
      await submit();

      expect(text('[role="alert"]')).toContain('There is already an account');
      expect(profile.create).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('applies the role of the profile that already existed, not the one chosen', async () => {
      profile.create.mockResolvedValue({ uid: 'u1', username: 'Ana', email: null, role: 'senpai' });
      await fill();
      await submit();

      expect(TestBed.inject(ThemeService).role()).toBe('senpai');
      expect(navigate).toHaveBeenCalledWith('/');
    });

    describe('when the profile cannot be saved', () => {
      const failOnce = async () => {
        profile.create.mockRejectedValueOnce({ status: 503 });
        await fill();
        await click('input[value="haku"]');
        await submit();
      };

      beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined));

      it('stays on the page with an error and no role applied yet', async () => {
        await failOnce();

        expect(text('[role="alert"]')).toContain("we couldn't save your profile");
        expect(navigate).not.toHaveBeenCalled();
        expect(TestBed.inject(ThemeService).role()).toBe('guest');
      });

      it('offers to try again instead of creating the account twice', async () => {
        await failOnce();

        expect(element.querySelector('button[type="submit"]')).toBeNull();
        expect(element.querySelector('.button--outline')).toBeNull();
        expect(text('.button--primary')).toBe('Try again');
      });

      it('repeats only the profile and then goes to the home', async () => {
        await failOnce();
        await click('.button--primary');

        expect(auth.signUp).toHaveBeenCalledOnce();
        expect(profile.create).toHaveBeenCalledTimes(2);
        expect(profile.create).toHaveBeenLastCalledWith('Ana', 'haku');
        expect(TestBed.inject(ThemeService).role()).toBe('haku');
        expect(navigate).toHaveBeenCalledWith('/');
        expect(element.querySelector('[role="alert"]')).toBeNull();
      });

      it('keeps offering it while the backend is still down', async () => {
        await failOnce();
        profile.create.mockRejectedValueOnce({ status: 503 });
        await click('.button--primary');

        expect(text('[role="alert"]')).toContain("we couldn't save your profile");
        expect(text('.button--primary')).toBe('Try again');
        expect(navigate).not.toHaveBeenCalled();
      });
    });

    it('does not send twice while it is waiting', async () => {
      let finish!: () => void;
      auth.signUp.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
      await fill();
      await submit();
      await submit();

      expect(auth.signUp).toHaveBeenCalledOnce();
      expect(element.querySelector('button[type="submit"]')?.getAttribute('aria-busy')).toBe(
        'true',
      );
      expect(text('button[type="submit"]')).toBe('Creating your account…');

      finish();
      await settle();
      expect(element.querySelector('button[type="submit"]')?.getAttribute('aria-busy')).toBe(
        'false',
      );
    });
  });

  describe('Google', () => {
    it('signs up with Google, saves the profile and applies the chosen role', async () => {
      auth.currentUser.mockReturnValue({ displayName: 'Ana Google', email: 'ana@example.com' });
      await click('input[value="senpai"]');
      await click('.button--outline');

      expect(auth.logInWithGoogle).toHaveBeenCalledOnce();
      expect(profile.create).toHaveBeenCalledWith('Ana Google', 'senpai');
      expect(TestBed.inject(ThemeService).role()).toBe('senpai');
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('prefers the username that was typed', async () => {
      auth.currentUser.mockReturnValue({ displayName: 'Ana Google', email: 'ana@example.com' });
      await type('signup-username', 'Anita');
      await click('.button--outline');

      expect(profile.create).toHaveBeenCalledWith('Anita', 'moe');
    });

    it('offers to try again when its profile cannot be saved', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      profile.create.mockRejectedValueOnce({ status: 503 });
      await click('.button--outline');
      expect(text('.button--primary')).toBe('Try again');

      await click('.button--primary');

      expect(auth.logInWithGoogle).toHaveBeenCalledOnce();
      expect(profile.create).toHaveBeenCalledTimes(2);
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('says nothing when the person closes the Google window', async () => {
      auth.logInWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
      await click('.button--outline');

      expect(element.querySelector('[role="alert"]')).toBeNull();
      expect(profile.create).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('follows the language', async () => {
    TestBed.inject(LanguageService).setLang('ca');
    await settle();

    expect(text('h1')).toBe('Crear un compte');
    expect(text('.copy__title')).toBe('La teva llibreta comença amb un primer anime.');
    expect(text('label[for="signup-username"]')).toBe("Nom d'usuari");
  });
});
