// app.js
const express = require('express');
const secureHeaders = require('./secure-headers');
const app = express();
app.use(secureHeaders);
app.use(express.static('public'));
app.listen(3000);