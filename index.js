/**
 * Module dependencies.
 */

var app = module.exports = require('lib/boot');
var http = require('http');
var https = require('https');
var balance = require('lib/balance');
var config = require('lib/config');
var fs = require('fs');
var log = require('debug')('democracyos:root');

var secure = 'https' == config.protocol;

/**
 * Configure standard server
 */
var server = http.createServer(app);
var port = process.env.PORT || config.publicPort; // Heroku's $PORT env variable


/**
 * Configure secure server (SSL) if necessary
 */
var secureServer;
var securePort;
if (secure) {
  var https = config.https;

  var privateKey = fs.readFileSync(https.serverKey, 'utf-8');
  var certificate = fs.readFileSync(https.serverCert, 'utf-8');

  secureServer = https.createServer({ key: privateKey, cert: certificate }, app);
  securePort = https.port;
}

var launch = function launchServer () {
    server.listen(port, function() {
      log('Application started on port %d', port);
    });

    if (secureServer && securePort) {
      secureServer.listen(securePort, function() {
        log('Secure application started on port %d', securePort);
      });
    }
  };

/**
 * Launch the server!
 */

if (module === require.main) launch();
