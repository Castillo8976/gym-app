const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('rejects malformed registration requests at the HTTP boundary', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.error, true);
  assert.match(response.body.message, /name|email|password/i);
});

test('rejects protected routes without authentication', async () => {
  const response = await request(app).get('/api/users/me');

  assert.equal(response.status, 401);
  assert.equal(response.body.error, true);
});
