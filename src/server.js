const http = require('http'); // pull in the HTTP server module
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const url = require('url');
const query = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk); 
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();

      const bodyParams = query.parse(bodyString);

      jsonHandler.addUser(request, res, bodyParams);
    });
  }
};

const onRequest = (request, response) => {
  console.log(request.url);
    
  const parsedUrl = url.parse(request.url);
    
  switch (request.method) {
    case 'POST':
      if (parsedUrl.pathname === '/addUser'){
        handlePost(request, response, parsedUrl);
      } else {
        jsonHandler.notFound(request, response);
      }
      break;
    case 'GET':
      if (parsedUrl.pathname === '/') {
        htmlHandler.getIndex(request, response);
      } else if (parsedUrl.pathname === '/style.css') {
        htmlHandler.getStyle(request, response);
      } else if (parsedUrl.pathname === '/getUsers') {
        jsonHandler.getUsers(request, response);
      } else if (parsedUrl.pathname === '/updateUser') {
        jsonHandler.updateUser(request, response);
      } else {
        jsonHandler.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (parsedUrl.pathname === '/getUsers') {
        jsonHandler.getUsersMeta(request, response);
      } else {
        jsonHandler.notFoundMeta(request, response);
      }
      break;
    default:
      jsonHandler.notFound(request, response);
  }
    
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);