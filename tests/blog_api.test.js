const { test, after, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const Blog = require('../models/blog');

const app = require('../app');
const api = supertest(app);

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const initBlogs = [
  {
    "author": "Wes Bos",
    "title": "Data URLs and Pool in your URL",
    "url": "https://wesbos.com/pool-in-your-url",
    "upvotes": 4
  }
];

const BASE_URL = '/api/blogs';

describe.only(`API ${BASE_URL}`, () => {
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

  test.only('a valid note can be added ', async () => {
    const newBlog = {
      author: 'Dmytro Lobanov',
      title: 'How Internet Works',
      url: 'https://dimaspirit.github.io/',
      upvotes: 4,
    };

    await api
      .post(BASE_URL)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const response = await api.get(BASE_URL);
    const titles = response.body.map(r => r.title);
  
    assert.strictEqual(response.body.length, initBlogs.length + 1);
    assert(titles.includes('How Internet Works'));
  });

  test.only('blog without title is not added', async () => {
    const newBlog = {
      author: 'No author',
      url: 'No URL',
      upvotes: 0,
    };

    await api
      .post(BASE_URL)
      .send(newBlog)
      .expect(400);
  
    const notesAtEnd = await blogsInDb();
  
    assert.strictEqual(notesAtEnd.length, initBlogs.length)
  })

  after(async () => {
    await mongoose.connection.close();
  });
});