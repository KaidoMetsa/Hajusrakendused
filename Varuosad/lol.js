const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  const urlParams = new URL(req.url, `http://${req.headers.host}`);
  const queryObject = urlParams.searchParams;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  if (queryObject.get('lol')) {
    res.end('Hello  World');
  } else {
    res.end('Hello World');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);



  
});
