/**
 * NAKKO Platform - Unit Test: Authentication & Authorization
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { ROLES } from '../../src/shared/constants/roles.js';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/environment.js';

describe('AuthService Unit Tests', () => {
  test('should securely hash password and verify with bcrypt', async () => {
    const rawPassword = 'SecurePassword2026!';
    const hash = await AuthService.hashPassword(rawPassword);

    assert.notEqual(hash, rawPassword);
    assert.ok(hash.startsWith('$2')); // bcrypt salt prefix

    const isMatch = await AuthService.comparePassword(rawPassword, hash);
    assert.equal(isMatch, true);

    const isBadMatch = await AuthService.comparePassword('WrongPassword', hash);
    assert.equal(isBadMatch, false);
  });

  test('should generate valid signed JWT with role and identity claims', async () => {
    const mockUser = {
      _id: 'u-test-123',
      id: 'u-test-123',
      email: 'test@nakko.in',
      role: ROLES.WORKER,
      name: 'Ramesh Test',
      cooperativeId: 'coop-1'
    };

    const token = AuthService.generateToken(mockUser);
    assert.ok(token);

    const decoded = jwt.verify(token, env.JWT_SECRET);
    assert.equal(decoded.email, 'test@nakko.in');
    assert.equal(decoded.role, ROLES.WORKER);
    assert.equal(decoded.name, 'Ramesh Test');
  });

  test('should register a new client and enforce required fields', async () => {
    await assert.rejects(
      async () => {
        await AuthService.register({ name: 'Incomplete' });
      },
      { name: 'ValidationError' }
    );

    const uniqueEmail = `test_${Date.now()}@nakko.in`;
    const regResult = await AuthService.register({
      name: 'Aarav Mehta',
      email: uniqueEmail,
      password: 'password123',
      role: 'client'
    });

    assert.equal(regResult.user.email, uniqueEmail);
    assert.equal(regResult.user.role, ROLES.CLIENT);
    assert.ok(regResult.token);
  });

  test('should reject login with incorrect password', async () => {
    await assert.rejects(
      async () => {
        await AuthService.login({
          email: 'ramesh@nakko.in',
          password: 'definitely_wrong_password'
        });
      },
      { name: 'UnauthorizedError' }
    );
  });
});

