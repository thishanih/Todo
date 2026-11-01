import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
process.env.API_KEY = 'todo-api-test-key';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/todo-api-tests';

const { app } = await import('../src/app.js');

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not bind to a TCP port.');
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

async function request(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (!headers.has('x-api-key')) {
    headers.set('x-api-key', 'todo-api-test-key');
  }

  return fetch(`${baseUrl}${path}`, { ...options, headers });
}

test('health endpoint returns a healthy response with an API key', async () => {
  const response = await request('/api/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'ok');
  assert.match(body.data.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('health endpoint rejects a missing API key', async () => {
  const response = await request('/api/health', {
    headers: { 'x-api-key': '' },
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Invalid or missing API key',
  });
});

test('GET /api/todos rejects invalid pagination input', async () => {
  const response = await request('/api/todos?page=0&limit=20');
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.statusCode, 400);
  assert.equal(body.error.message, 'Page must be at least 1');
});

test('POST /api/todos rejects a missing title', async () => {
  const response = await request('/api/todos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ description: 'Missing required title' }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Title is required and must be text.');
});

test('PUT /api/todos/:id rejects an empty update', async () => {
  const response = await request('/api/todos/507f1f77bcf86cd799439011', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Provide at least one field to update.');
});

test('PATCH /api/todos/:id/done rejects an invalid todo ID', async () => {
  const response = await request('/api/todos/not-an-id/done', {
    method: 'PATCH',
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(
    body.error.message,
    'Invalid TODO ID. Please provide a valid ID.',
  );
});

test('DELETE /api/todos/:id rejects an invalid todo ID', async () => {
  const response = await request('/api/todos/not-an-id', { method: 'DELETE' });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(
    body.error.message,
    'Invalid TODO ID. Please provide a valid ID.',
  );
});
