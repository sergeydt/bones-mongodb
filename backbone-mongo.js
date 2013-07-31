// Provides a `Backbone.sync` or `Model.sync` method for the server-side
// context. Uses MongoDB for model persistence.
var _ = require('underscore'),
    Backbone = require('backbone'),
    Mongo = require('./mongo');

module.exports = function (config) {

    var db = new Mongo(config);

    // Helper function to get a URL from a Model or Collection as a property
    // or as a function.
    var getUrl = function (object) {
        if (object.url instanceof Function) {
            return object.url();
        } else if (typeof object.url === 'string') {
            return object.url;
        }
    };

    // Set up database, waiting for connection
    var install = function (callback) {
        //      var connection = null;
        if (db.getConnection()) {
            return callback(null);
        } else {
            db.on('database', function (mess) {
                if (mess === 'open') {
                    return callback(null);
                }
            })
        }
    };

    // Prepare model for saving / deleting.
    var toJSON = function (model) {
        var doc = model.toJSON();
        doc._id = getUrl(model);
        return doc;
    }

    // Backbone sync method.
    var sync = function (method, model, options) {
        var filter = options.filter || {};
        var sort = options.sort || {};
        var skip = options.skip || null; 
        var limit = options.limit || null;
        var success = options.success || function () {};
        var error = options.error || function () {};
        var json = toJSON(model);
        json._id = model._id || model.id;
        json.id = model._id || model.id;
        var url = getUrl(model);
        var con = db.getConnection();
        var params = url.match(/\/api\/([^\/]+)\/?(.*)/);
        var col_name = params[1];
        var model_id = params[2];

        switch (method) {
        case 'read':
            con.collection(col_name, function (err, collection) {
                if (err) return error(err);
                if (model.id) {
                    collection.findOne({
                        _id: model_id
                    }, function (err, dbModel) {
                        if (err) return error(err);
                        success(dbModel);
                    })
                } else {
                    collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(function (err, models) {
                        if (err) return error(err);
                        success(models);
                    })
                }
            })

            break;
        case 'create':
        case 'update':
            con.collection(col_name, function (err, collection) {
                if (err) return error(err);
                collection.findOne({
                    _id: model_id
                }, function (err, dbModel) {
                    if (err) return error(err);
                    if (!dbModel) {
                        // create
                        //console.log('---------CREATE', json);
                        collection.insert(json, function (err, dbModel) {
                            if (err) return error(err);
                            success(dbModel);
                        });
                    } else {
                        // update
                        collection.update({
                            _id: model_id
                        }, json, function (err) {
                            if (err) return error(err);
                            //console.log('---------UPDATE', json, dbModel);
                            //success(dbModel);
                            success(json);
                        });
                    }
                });
            });
            break;
        case 'delete':
            con.collection(col_name, function (err, collection) {
                if (err) return error(err);
                collection.findOne({
                    _id: model_id
                }, function (err, dbModel) {
                    if (err) return error(err);
                    if (!dbModel) {
                        // not found - error
                        error('could not delete - not found');
                    } else {
                        // found - removing
                        collection.remove({_id: model_id}, function (err, dbModel) {
                            if (err) return error(err);
                            success(dbModel);
                        });
                    }
                });
            });
            break;
        }
    };

    return {
        db: db,
        install: install,
        sync: sync
    };
};

