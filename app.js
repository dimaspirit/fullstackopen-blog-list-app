const { MONGODB_URI } = require('./config');
const express = require('express');
require('express-async-errors');

const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const logger = require('./utils/logger');
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const getTokenFrom = require('./utils/tokenExtractor');

mongoose.set('strictQuery', false);

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB', MONGODB_URI)
  }).catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  });

app.use(cors());
app.use(express.json());
app.use(getTokenFrom);
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

console.log('process.env.NODE_ENV', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'teste2e') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app