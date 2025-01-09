const { test, after, describe, beforeEach, before } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Blog = require('../models/blog');
const User = require('../models/user');

const api = require('./api_helpers');

const initBlogs = [
  {
    author: "Wes Bos",
    title: "Data URLs and Pool in your URL",
    url: "https://wesbos.com/pool-in-your-url",
    likes: 4,
  }
];

const blogToAdd = {
  author: 'Dmytro Lobanov',
  title: 'How Internet Works',
  url: 'https://dimaspirit.github.io/',
  likes: 4,
};

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const BASE_URL = '/api/blogs';

describe.only(`API ${BASE_URL}`, () => {
  let userId;
  const user = {
    username: 'test',
    password: 'testpassword',
  };

  before(async () => {
    await User.deleteMany({});

    const result = await api
      .post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    userId = result.body.id;
  });

  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObject = new Blog(initBlogs[0]);
    await blogObject.save();
  });

  test.only('blogs are returned as json', async () => {
    await api
      .get(BASE_URL)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
  
  test.only('blogs are returned right amount of blogs length', async () => {
    const response = await api.get(BASE_URL);
    assert.strictEqual(response.body.length, initBlogs.length);
  });

  test.only('a note without authorization failed', async () => {
    const result = await api
      .post(BASE_URL)
      .send({...blogToAdd, user: 'fakebodyid'})
      .expect(401)
      .expect('Content-Type', /application\/json/);

    assert(result.body.error.includes('token invalid'));
  });

  test.only('a valid note can be added', async () => {
    const loginResult = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .post(BASE_URL)
      .send({...blogToAdd, user: userId})
      .set('Authorization', `Bearer ${loginResult.body.token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const response = await api.get(BASE_URL);
    const titles = response.body.map(r => r.title);
  
    assert.strictEqual(response.body.length, initBlogs.length + 1);
    assert(titles.includes(blogToAdd.title));
  });

  test('blog without title is not added', async () => {
    const newBlog = Object.assign({}, blogToAdd, { user: userId });
    delete newBlog.title;

    const loginResult = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .post(BASE_URL)
      .send(newBlog)
      .set('Authorization', `Bearer ${loginResult.body.token}`)
      .expect(400);
  
    const notesAtEnd = await blogsInDb();
  
    assert.strictEqual(notesAtEnd.length, initBlogs.length)
  });

  test('blog without url is not added', async () => {
    const newBlog = Object.assign({}, blogToAdd, { user: userId });
    delete newBlog.url;

    const loginResult = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .post(BASE_URL)
      .send(newBlog)
      .set('Authorization', `Bearer ${loginResult.body.token}`)
      .expect(400);
  
    const notesAtEnd = await blogsInDb();
  
    assert.strictEqual(notesAtEnd.length, initBlogs.length)
  });

  test('blog without likes is added with default value', async () => {
    const newBlog = {
      author: 'test author',
      title: 'test title',
      url: 'test url',
      user: userId
    };

    const loginResult = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .post(BASE_URL)
      .send(newBlog)
      .set('Authorization', `Bearer ${loginResult.body.token}`)
      .expect(201);
  
    const notesAtEnd = await blogsInDb();
    const addedBlog = notesAtEnd.find(blog => blog.title === newBlog.title);

    assert.strictEqual(addedBlog.likes, 0);
  });

  after(async () => {
    await Blog.deleteMany({});
    await mongoose.connection.close();
  });
});