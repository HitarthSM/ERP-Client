import { describe, it, expect, vi } from 'vitest';

vi.mock('./clerk', () => ({
  clerk: { setActive: vi.fn().mockResolvedValue(undefined) },
}));

import { resolveSignInStatus, clerkErrorMessage } from './auth-flow';
import { clerk } from './clerk';

function fakeSignIn(overrides: Record<string, unknown> = {}) {
  return {
    status: 'complete',
    createdSessionId: 'sess_123',
    supportedSecondFactors: [],
    prepareSecondFactor: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

describe('resolveSignInStatus', () => {
  it('activates the session and navigates home on complete', async () => {
    const navigate = vi.fn();
    const refresh = vi.fn().mockResolvedValue(undefined);
    const signIn = fakeSignIn({ status: 'complete', createdSessionId: 'sess_123' });

    await resolveSignInStatus(signIn, { navigate, refresh });

    expect(clerk.setActive).toHaveBeenCalledWith({ session: 'sess_123' });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('prepares the email second factor and navigates to /verify-second-factor on needs_second_factor', async () => {
    const navigate = vi.fn();
    const refresh = vi.fn();
    const prepareSecondFactor = vi.fn().mockResolvedValue(undefined);
    const signIn = fakeSignIn({
      status: 'needs_second_factor',
      supportedSecondFactors: [{ strategy: 'email_code', emailAddressId: 'idn_1' }],
      prepareSecondFactor,
    });

    await resolveSignInStatus(signIn, { navigate, refresh });

    expect(prepareSecondFactor).toHaveBeenCalledWith({ strategy: 'email_code', emailAddressId: 'idn_1' });
    expect(navigate).toHaveBeenCalledWith('/verify-second-factor', { replace: true });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('prepares the email second factor and navigates to /verify-second-factor on needs_client_trust', async () => {
    const navigate = vi.fn();
    const refresh = vi.fn();
    const prepareSecondFactor = vi.fn().mockResolvedValue(undefined);
    const signIn = fakeSignIn({
      status: 'needs_client_trust',
      supportedSecondFactors: [{ strategy: 'email_code', emailAddressId: 'idn_1' }],
      prepareSecondFactor,
    });

    await resolveSignInStatus(signIn, { navigate, refresh });

    expect(prepareSecondFactor).toHaveBeenCalledWith({ strategy: 'email_code', emailAddressId: 'idn_1' });
    expect(navigate).toHaveBeenCalledWith('/verify-second-factor', { replace: true });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('throws for an unhandled status so the caller can show a toast', async () => {
    const navigate = vi.fn();
    const refresh = vi.fn();
    const signIn = fakeSignIn({ status: 'needs_identifier' });

    await expect(resolveSignInStatus(signIn, { navigate, refresh })).rejects.toThrow(/needs_identifier/);
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('clerkErrorMessage', () => {
  it('returns longMessage when available', () => {
    const err = { errors: [{ longMessage: 'Password is too short' }] };
    expect(clerkErrorMessage(err, 'Fallback')).toBe('Password is too short');
  });

  it('provides friendly message for form_password_incorrect', () => {
    const err = { errors: [{ code: 'form_password_incorrect', message: 'is incorrect' }] };
    expect(clerkErrorMessage(err, 'Fallback')).toBe('Password is incorrect. Please try again.');
  });

  it('provides friendly message for form_identifier_not_found', () => {
    const err = { errors: [{ code: 'form_identifier_not_found', message: 'not found' }] };
    expect(clerkErrorMessage(err, 'Fallback')).toBe("Couldn't find an account with that email address.");
  });

  it('returns generic error.message when no error array exists', () => {
    const err = new Error('Network timeout');
    expect(clerkErrorMessage(err, 'Fallback')).toBe('Network timeout');
  });

  it('returns fallback when no error message or array is provided', () => {
    expect(clerkErrorMessage({}, 'Fallback message')).toBe('Fallback message');
  });
});

