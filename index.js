const app = require('./app');
const { PORT, NODE_ENV } = require('./config');
const logger = require('./utils/logger');

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}, in ${NODE_ENV} mode`);
});