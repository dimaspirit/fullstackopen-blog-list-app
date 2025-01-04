const { PORT, MONGODB_URI } = require('./config');

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const logger = require('./utils/logger');
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs');

mongoose.set('strictQuery', false);

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB', MONGODB_URI)
  }).catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  });

app.use(cors());
app.use(express.json());
console.log('TEST');
app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});