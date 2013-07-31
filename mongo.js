var util = require('util'),
    events = require('events'),
    Mongo = require('mongodb').Db,
    Server = require('mongodb').Server;


var _connection = null;

//  Database interface for the MongoDB
//
//  Options hash:
//    name, host, port
//
//  Opens the database and emits an 'open' event on success, or an 'error' event if there was a problem.
var Database = module.exports = function(options) {
  var self = this,
      host = options.host || '127.0.0.1',
      port = options.port || 27017,
      name = options.name || 'testdb';
      
  var db = new Mongo(name, new Server(host, port, {}));

  if (!_connection) {
    db.open(function(err, database) {
      if(err) {
        self.emit('database', 'error', err);
      } else {
        _connection = database;
        self.emit('database', 'open');
      }
    });
  }
};

// Support events
util.inherits(Database, events.EventEmitter);

//  Returns a connection to the database, or null if the database is not (yet) open
Database.prototype.getConnection = function() {
  return _connection;
};
