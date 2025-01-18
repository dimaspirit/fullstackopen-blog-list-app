const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const { SECRET } = require('../config'); 

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user');
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const user = await User.findById(decodedToken.id);

  // create a new blog
  const blog = new Blog(Object.assign({}, request.body, { user: user.id }));
  const result = await blog.save();
  // Update user with new blog
  user.blogs = user.blogs.concat(result.id);
  await user.save();

  const updatedBlog = await Blog.findById(result.id);
  await updatedBlog.populate('user');

  response.status(201).json(updatedBlog);
});

blogsRouter.put('/:id', async(request, response) => {
  const { id } = request.params;

  const decodedToken = jwt.verify(request.token, SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const blog = await Blog.findOneAndUpdate({_id: id}, request.body, { new: true }).populate('user');
  response.status(200).json(blog);
});

blogsRouter.delete('/:id', async(request, response) => {
  const { id } = request.params;

  const decodedToken = jwt.verify(request.token, SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const blog = await Blog.findOne({_id: id});

  if(!blog.user.equals(decodedToken.id)) {
    return response.status(403).json({ error: 'access denied' });
  }

  await blog.deleteOne();
  response.status(200).end();
});

module.exports = blogsRouter;