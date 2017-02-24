const crypto = require('crypto');

const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));
let digest = etag.digest('hex');


const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };

  return respondJSON(request, response, 200, responseJSON);
};

const getUsersMeta = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSONMeta(request, response, 200);
};


const updateUser = (request, response) => {
  const newUser = {
    createdAt: Date.now(),
  };

  users[newUser.createdAt] = newUser;
  
  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');

  return respondJSON(request, response, 201, newUser);
};

const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
  }

  users[body.name].name = body.name;
  users[body.name].age = body.age;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};


const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {

  respondJSONMeta(request, response, 404);
};


module.exports = {
  getUsers,
  getUsersMeta,
  addUser,
  updateUser,
  notFound,
  notFoundMeta,
};
