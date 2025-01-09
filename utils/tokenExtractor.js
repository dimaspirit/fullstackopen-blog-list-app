const getTokenFrom = (request, response, next) => {
  const schemeName = 'Bearer ';
  const authorization = request.get('authorization');

  if (authorization && authorization.startsWith(schemeName)) {
    request.token = authorization.slice(schemeName.length);
  } else {
    request.token = undefined;
  }

  next();
}

module.exports = getTokenFrom;