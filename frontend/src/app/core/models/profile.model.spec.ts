import { AccountRole, fromApiRole, toApiRole } from './profile.model';

describe('profile roles', () => {
  const pairs: [AccountRole, string][] = [
    ['moe', 'moe_magical'],
    ['haku', 'haku_sama'],
    ['senpai', 'senpai'],
  ];

  it.each(pairs)('turns %s into %s and back', (role, apiRole) => {
    expect(toApiRole(role)).toBe(apiRole);
    expect(fromApiRole(apiRole)).toBe(role);
  });

  it('does not know a role the backend has not announced', () => {
    expect(fromApiRole('guest')).toBeNull();
    expect(fromApiRole('')).toBeNull();
  });
});
