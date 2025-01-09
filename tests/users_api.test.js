const { test, after, describe, beforeEach } = require('node:test');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const assert = require('node:assert');
const api = require('./api_helpers');

const User = require('../models/user');

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(u => u.toJSON());
}

describe('API /api/users', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({ username: 'test', passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'test2',
      password: 'hello',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    assert(usernames.includes(newUser.username));
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'test',
      password: 'testpassword',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const brokenUser = {
      username: 'qw',
      password: 'testpassword',
    };
    const usersAtStart = await usersInDb()

    const result = await api
      .post('/api/users')
      .send(brokenUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('username and password must be at least 3 characters long'));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });
});
