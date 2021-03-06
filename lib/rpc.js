'use strict';

/**
 * Module dependencies.
 */

var packet = require('./packet.js');
var debug = require('debug')('sdk');

/**
 * Module exports.
 */

module.exports = Rpc;

/**
 * Rpc Constructor
 */

function Rpc() {
  this.invokeMap = {};

  window.addEventListener('message', this.onMessage.bind(this), false);
}

Rpc.prototype.connect = function() {
  this.send({ type: 'connection.request' });
};

Rpc.prototype.send = function(message) {
  window.parent.postMessage(message, '*');
};

Rpc.prototype.onMessage = function(event) {
  var invokeResponsePacket = event.data;
  var handler = this.invokeMap[invokeResponsePacket.id];

  if (invokeResponsePacket.error) {
    debug('err response received', invokeResponsePacket.error);
  } else {
    debug('response received', invokeResponsePacket.result);
  }

  handler && handler(invokeResponsePacket.error || null, invokeResponsePacket.result);
};

Rpc.prototype.invoke = function(method, params, cb) {
  var invokeRequestPacket = new packet.InvokeRequest(method, params || {});

  this.invokeMap[invokeRequestPacket.id] = cb;
  this.send(invokeRequestPacket);
};
