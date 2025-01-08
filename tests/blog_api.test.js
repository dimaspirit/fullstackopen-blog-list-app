const { test, after, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Blog = require('../models/blog');

const api = require('./api_helpers');

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

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

const BASE_URL = '/api/blogs';

describe(`API ${BASE_URL}`, () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObject = new Blog(initBlogs[0]);
    await blogObject.save();
  });

  test('blogs are returned as json', async () => {
    await api
      .get(BASE_URL)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
  
  test('blogs are returned right amount of blogs length', async () => {
    const response = await api.get(BASE_URL);
    assert.strictEqual(response.body.length, initBlogs.length);
  });

  test('a valid note can be added ', async () => {
    await api
      .post(BASE_URL)
      .send(blogToAdd)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const response = await api.get(BASE_URL);
    const titles = response.body.map(r => r.title);
  
    assert.strictEqual(response.body.length, initBlogs.length + 1);
    assert(titles.includes(blogToAdd.title));
  });

  test('blog without title is not added', async () => {
    const newBlog = Object.assign({}, blogToAdd);
    delete newBlog.title;

    await api
      .post(BASE_URL)
      .send(newBlog)
      .expect(400);
  
    const notesAtEnd = await blogsInDb();
  
    assert.strictEqual(notesAtEnd.length, initBlogs.length)
  });

  test('blog without url is not added', async () => {
    const newBlog = Object.assign({}, blogToAdd);
    delete newBlog.url;

    await api
      .post(BASE_URL)
      .send(newBlog)
      .expect(400);
  
    const notesAtEnd = await blogsInDb();
  
    assert.strictEqual(notesAtEnd.length, initBlogs.length)
  });

  test('blog without likes is added with default value', async () => {
    const newBlog = {
      author: 'test author',
      title: 'test title',
      url: 'test url',
    };

    await api
      .post(BASE_URL)
      .send(newBlog)
      .expect(201);
  
    const notesAtEnd = await blogsInDb();
    const addedBlog = notesAtEnd.find(blog => blog.title === newBlog.title);

    assert.strictEqual(addedBlog.likes, 0);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});