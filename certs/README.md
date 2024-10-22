# SSL Certificates for HTTPS

Secure server using self-signed certificate examples.

## Create Self-signed Certificate
This is how you can create a Self-signed Certificate for local node server.
Linux command or use Cygwin for windows:
```sh
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```
This should leave you with two files, ***cert.pem*** (the certificate) and ***key.pem*** (the private key). 
Put these files in the same directory as your Node.js server file. This is all you need for a SSL connection.

## Node JS setup
This is an example from [nodejs.org](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/)
```js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);
```