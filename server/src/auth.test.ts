import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('worker passwords', () => {
  it('hashes with a random salt and verifies without exposing plaintext', async () => {
    const first = await hashPassword('a-unique-worker-password');
    const second = await hashPassword('a-unique-worker-password');
    expect(first).not.toBe(second);
    expect(first).not.toContain('a-unique-worker-password');
    expect(await verifyPassword('a-unique-worker-password', first)).toBe(true);
    expect(await verifyPassword('wrong-password', first)).toBe(false);
  });
  it('rejects short passwords', async () => {
    await expect(hashPassword('too-short')).rejects.toThrow('at least 12');
  });
});
