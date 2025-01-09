require('@dotenvx/dotenvx').config();

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV;

module.exports = {
  MONGODB_URI,
  NODE_ENV,
  SECRET,
  PORT,
};