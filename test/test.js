var Database = require('..');
var assert = require('assert');
var Backbone = require('backbone');
var _ = require('underscore')._;

var data = [
    {
        'id': 'one',
        'name': 'One - 1',
    },
    {
        'id': 'two',
        'name': 'Two - 2'
    },
    {
        'id': 'three',
        'name': 'Three - 3'
    }
];


var TestNumber = Backbone.Model.extend({
    url: function() {
        return '/api/Number/' + this.id;
    }
});

var TestNumbers = Backbone.Collection.extend({
    model: TestNumber,
    url: '/api/Number'
});


// Install and destroy database.
// -----------------------------
describe('install', function() {
    var db = Database({name: 'backbone_mongo_test_install'});

    it('should install the database', function(done) {
        db.install(done);
    });

});



// Create db, save documents, load documents, destroy documents, destroy db.
// -------------------------------------------------------------------------
describe('save', function() {
    var db = Database({name: 'backbone_mongo_test_install'});
    TestNumber.prototype.sync = db.sync;

    it('should install the database', function(done) {
        db.install(done);
    });

    _.each(data, function(d) {
        var model, rev;

        it('should save ' + d.id, function(done) {
            new TestNumber().save(d, {
                success: function(m) {
                    done();
                },
                error: function(err) { throw err; }
            });
        });

        it('should load ' + d.id, function(done) {
            new TestNumber({ id: d.id }).fetch({
                success: function(model) {
//                    console.log('MODEL LOADED', model);
//                    assert.equal(model.get('_rev'), rev);
                    done();
                },
                error: function(err) { throw err; }
            });
        });

        it('should destroy ' + d.id, function(done) {
            new TestNumber({ id: d.id }).destroy({
                success: function() { done() },
                error: function(err) { throw err; }
            });
        })
    });
});

// Use a view to load a collection.
// --------------------------------
describe('view', function() {
    var db = Database({name: 'backbone_mongo_test_view'});

    // Extend TestNumber to not interfere with concurrently running save test.
    var ViewNumber = TestNumber.extend({});
    var ViewNumbers = TestNumbers.extend({
        model: ViewNumber
    });
    ViewNumber.prototype.sync = db.sync;
    ViewNumbers.prototype.sync = db.sync;

    it('should install the database', function(done) {
        db.install(done);
    });

    _.each(data, function(d) {
        it('should save ' + d.id, function(done) {
            new ViewNumber().save(d, {
                success: function() { done(); },
                error: function(err) { throw err; }
            });
        });
    });

    it('should return all data in the view', function(done) {
        new ViewNumbers().fetch({
            success: function(collection) {
                var names = collection.map(function(model) {
                    return model.get('name');
                });
                _.each(data, function(d) {
                    assert.equal(true, names.indexOf(d.name) != -1);
                });
                done();
            },
            error: function(err) { throw err; }
        });
    });

});


