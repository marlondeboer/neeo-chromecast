'use strict';
const util = require('util')

var debug = require('debug')('marlon')

var Client                = require('castv2-client').Client;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
var mdns                  = require('mdns');

var sequence = [
    mdns.rst.DNSServiceResolve(),
    'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
    mdns.rst.makeAddressesUnique()
];
var browser = mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});
var chromecasts = [];

// check available chromecasts at startup
  browser.on('serviceUp', function(service) {
    var items = Object.keys(service);
    items.forEach(function(item) {
      if (item == "txtRecord") {
	 debug(util.inspect(service, false, null));
         chromecasts.push({id: service['name'], name: service['txtRecord']['fn'], ip: service['addresses'][0]});
        }
      })
    browser.stop();
  })
  browser.start();

module.exports.discoverLiteDevices = function() {
  debug(util.inspect(chromecasts, false, null));
  return chromecasts;
}

module.exports.onButtonPressed = function onButtonPressed(name, deviceid) {
  debug('[CONTROLLER]', name, 'button was pressed: ', deviceid);
  var client = new Client();
  var host = '';
 
  for (var key in chromecasts) {
    if (chromecasts[key]['id'] == deviceid) {
      host = chromecasts[key]['ip']
    }
  }

  client.connect(host, function() {
    client.getSessions(function(err, sessions) {

      if (!sessions.length) {
        client.close();
	return;
      } else {
        debug("sessions count: " + sessions.length);
      }

      var session = sessions[0];
      debug("session object:" + util.inspect(session, false, null));

      client.join(session, DefaultMediaReceiver, function(err, player) {
         player.getStatus(function (err, status){
	   
           debug("status: " + util.inspect(status, false, null)); 
           if (status['playerState'] == "PLAYING") {
              player.pause();
            } else if (status['playerState'] == "PAUSED") {
	      player.play();
            }
         })
      })
    })
  })
}
