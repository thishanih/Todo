import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Todo } from '../src/models/todo.model.js';
import { listTodosQuerySchema } from '../src/validation/todo.schema.js';
const mongoServer = await MongoMemoryServer.create();
const mongoUri = mongoServer.getUri('todo-api-tests');
process.env.API_KEY = 'todo-api-test-key';
process.env.MONGODB_URI = mongoUri;

const { app } = await import('../src/app.js');

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  await mongoose.connect(mongoUri);
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
  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Todo.deleteMany({});
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

test('GET /api/todos rejects an invalid status filter', async () => {
  const response = await request('/api/todos?status=complete');

  assert.equal(response.status, 400);
});

test('GET /api/todos rejects search terms over 200 characters', async () => {
  const query = new URLSearchParams({ search: 'x'.repeat(201) });
  const response = await request(`/api/todos?${query}`);

  assert.equal(response.status, 400);
});

test('TODO list query parses search and boolean status filters', () => {
  assert.deepEqual(
    listTodosQuerySchema.parse({
      search: '  quarterly report  ',
      status: 'false',
    }),
    {
      page: 1,
      limit: 20,
      search: 'quarterly report',
      status: false,
    },
  );
  assert.equal(listTodosQuerySchema.parse({ status: 'true' }).status, true);
});

test('TODO endpoints create, read, update, toggle, and delete persisted todos', async () => {
  const createResponse = await request('/api/todos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Initial title',
      description: 'Initial description',
    }),
  });
  const createdBody = await createResponse.json();
  const createdTodo = createdBody.data;

  assert.equal(createResponse.status, 201);
  assert.equal(createdBody.success, true);
  assert.equal(createdTodo.title, 'Initial title');
  assert.equal(createdTodo.description, 'Initial description');
  assert.equal(createdTodo.done, false);

  const listResponse = await request('/api/todos?search=Initial');
  const listBody = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(listBody.data.pagination.totalDocs, 1);
  assert.equal(listBody.data.todos[0]._id, createdTodo._id);

  const updateResponse = await request(`/api/todos/${createdTodo._id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Updated title',
      description: 'Updated description',
    }),
  });
  const updatedBody = await updateResponse.json();
  assert.equal(updateResponse.status, 200);
  assert.equal(updatedBody.data.title, 'Updated title');
  assert.equal(updatedBody.data.description, 'Updated description');

  const persistedResponse = await request('/api/todos?search=Updated');
  const persistedBody = await persistedResponse.json();
  assert.equal(persistedBody.data.todos[0]._id, createdTodo._id);
  assert.equal(persistedBody.data.todos[0].description, 'Updated description');

  const toggleResponse = await request(`/api/todos/${createdTodo._id}/done`, {
    method: 'PATCH',
  });
  const toggledBody = await toggleResponse.json();
  assert.equal(toggleResponse.status, 200);
  assert.equal(toggledBody.data.done, true);

  const completedResponse = await request('/api/todos?status=true');
  const completedBody = await completedResponse.json();
  assert.equal(completedBody.data.todos[0]._id, createdTodo._id);

  const untoggleResponse = await request(`/api/todos/${createdTodo._id}/done`, {
    method: 'PATCH',
  });
  assert.equal((await untoggleResponse.json()).data.done, false);

  const deleteResponse = await request(`/api/todos/${createdTodo._id}`, {
    method: 'DELETE',
  });
  assert.equal(deleteResponse.status, 200);
  assert.equal(await Todo.countDocuments(), 0);

  const afterDeleteResponse = await request('/api/todos?search=Updated');
  const afterDeleteBody = await afterDeleteResponse.json();
  assert.equal(afterDeleteBody.data.pagination.totalDocs, 0);
  assert.deepEqual(afterDeleteBody.data.todos, []);
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

test('POST and PUT reject titles and descriptions over their maximum lengths', async () => {
  const updates = [
    { title: 'x'.repeat(201) },
    { description: 'x'.repeat(2001) },
  ];
  const creates = [
    { title: 'x'.repeat(201) },
    { title: 'Valid title', description: 'x'.repeat(2001) },
  ];

  for (const body of creates) {
    const response = await request('/api/todos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    assert.equal(response.status, 400);
  }

  for (const body of updates) {
    const response = await request('/api/todos/507f1f77bcf86cd799439011', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    assert.equal(response.status, 400);
  }
});

test('TODO model enforces title minimum and title and description maximums', async () => {
  const tooShortTitle = new Todo({ title: '' });
  await assert.rejects(tooShortTitle.validate(), (error: unknown) => {
    return (
      error instanceof mongoose.Error.ValidationError &&
      ['required', 'minlength'].includes(error.errors.title?.kind ?? '')
    );
  });

  const tooLongTitle = new Todo({ title: 'x'.repeat(201) });
  await assert.rejects(tooLongTitle.validate(), (error: unknown) => {
    return (
      error instanceof mongoose.Error.ValidationError &&
      error.errors.title?.kind === 'maxlength'
    );
  });

  const tooLongDescription = new Todo({
    title: 'Valid title',
    description: 'x'.repeat(2001),
  });
  await assert.rejects(tooLongDescription.validate(), (error: unknown) => {
    return (
      error instanceof mongoose.Error.ValidationError &&
      error.errors.description?.kind === 'maxlength'
    );
  });
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
