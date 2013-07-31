Bones Mongo
--------------
Overrides for [Backbone](http://documentcloud.github.com/backbone/) to use
[MongoDB](http://www.mongodb.org/) for Model persistence. Intended for
server-side use of Backbone like in
[Bones](https://github.com/developmentseed/bones).

### Installation

    npm install bones-mongodb

### Usage

    var Backbone = require('backbone');

    // Create a new bones-mongodb handler for a database 'documents'.
    var mongo = require('bones-mongodb')({
        host: '127.0.0.1',
        port: '27017',
        name: 'documents'
    });

    // Create database and assign sync method to Backbone.
    mongo.install(function(err) {
        Backbone.sync = mongo.sync;
    });

    // Backbone.sync will now load and save models from a 'documents' mongo db.

 

### Filters (mongo queries)

    new Collection().fetch({
        filter: {
            name: 'Sergey'
        }
    })

### Run tests

    cd bones-mongodb/
    npm test

