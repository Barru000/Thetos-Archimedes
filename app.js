// app.js
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const secureHeaders = require('./secure-headers');

const app = express();
app.use(secureHeaders);
app.use(express.static('public'));

const certOptions = {
	key: fs.readFileSync(path.join(__dirname, 'cert/server.key')),
	cert: fs.readFileSync(path.join(__dirname, 'cert/server.crt'))
};

https.createServer(certOptions, app).listen(3443, () => {
	console.log('HTTPS server running at https://localhost:3443');
});