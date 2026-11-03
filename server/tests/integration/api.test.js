/**
 * NAKKO Platform - Integration Test: API Endpoints & Module Communication
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../src/app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    // Start on ephemeral port 0
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

describe('API Integration Endpoints', () => {
  test('GET /api/health should report healthy status and active innovations', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'healthy');
    assert.equal(body.innovations.dynamicSearchSpaceReduction, 'ACTIVE');
    assert.equal(body.innovations.atomicStateExecutionProtocol, 'ACTIVE');
  });

  test('GET /api/services should return gig catalog', async () => {
    const res = await fetch(`${baseUrl}/api/services`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 6);
  });

  test('POST /api/auth/login and GET /api/auth/me should authenticate and return user', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh@nakko.in',
        password: 'nakko2026',
        role: 'worker'
      })
    });

    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.equal(loginData.success, true);
    assert.ok(loginData.token);
    assert.equal(loginData.user.role, 'WORKER');

    // Test GET /api/auth/me with Bearer token
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.success, true);
    assert.equal(meData.user.email, 'ramesh@nakko.in');
  });

  test('POST /api/bookings should create booking and assign worker', async () => {
    const res = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'Plumbing',
        address: 'Sector 62, Noida, Uttar Pradesh',
        scheduledTime: 'Today, 4:00 PM',
        notes: 'Emergency pipeline issue'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.id);
    assert.ok(body.data.workerName);
    assert.equal(body.data.service, 'Plumbing');
  });

  test('PATCH /api/workers/:id/availability should update online status', async () => {
    // Generate auth token for worker
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@nakko.in', password: 'nakko2026', role: 'worker' })
    });
    const { token } = await loginRes.json();

    const patchRes = await fetch(`${baseUrl}/api/workers/w-101/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isAvailable: true })
    });

    assert.equal(patchRes.status, 200);
    const patchData = await patchRes.json();
    assert.equal(patchData.success, true);
    assert.equal(patchData.data.isAvailable, true);
  });

  test('GET /api/welfare/worker/:id should return simulated BOCW / e-Shram report', async () => {
    const res = await fetch(`${baseUrl}/api/welfare/worker/w-101`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.isSimulated, true);
    assert.ok(body.data.welfareId);
    assert.equal(body.data.status, 'ACTIVE_ENROLLED');
  });

  test('GET /api/dev/metrics and /api/dev/logs should return system telemetry', async () => {
    const metricsRes = await fetch(`${baseUrl}/api/dev/metrics`);
    assert.equal(metricsRes.status, 200);
    const metrics = await metricsRes.json();
    assert.equal(metrics.success, true);
    assert.ok(metrics.data.apiStatus);

    const logsRes = await fetch(`${baseUrl}/api/dev/logs`);
    assert.equal(logsRes.status, 200);
    const logs = await logsRes.json();
    assert.equal(logs.success, true);
    assert.ok(Array.isArray(logs.data));
  });
});
