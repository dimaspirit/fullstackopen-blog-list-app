const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user');
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const users = await User.find({});
  const user = await User.findById(users[0].id);
  // create a new blog
  const blog = new Blog(Object.assign({}, request.body, { user: users[0].id }));
  const result = await blog.save();
  // Update user with new blog
  user.blogs = user.blogs.concat(result.id);
  await user.save();

  response.status(201).json(result);
});

module.exports = blogsRouter;