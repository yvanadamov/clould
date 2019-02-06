const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const routes = require('./routes');

server.use(bodyParser.json());
server.use('/', routes);

server.listen(8090);

module.exports = server;