'use strict'

let handler = require(process.cwd() + '/handler');

let event = {
    "body": [{
        "uuid": "54cf99a7-3eb4-4ab8-9e1c-3cc650b485ae",
        "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
        "title": "Griffin"
    },
    {
        "uuid": "5289cc67-dfc2-41a4-a5b0-25091037cc60",
        "title": "Richardson"
    }],
    "destination": "db",
    "source": "sample.json",
    "table": "testone",
    "location": "local",
    "schema": "dp.schema.json"
}


//
let context = {
    fail: function(msg) {
        expect(msg).toBeDefined();
    },
    succeed: function(data) {
        expect(data).toBeDefined();
        expect(data.statusCode).toBeDefined();
        expect(data.statusCode).toEqual(200);
    }
}
//ˇ
let callback = {
    anyting: function(err, res) { }
}


describe("Handler", function() {
    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
    })

    it('can instantiate class with params', function() {
        expect(o).toBeDefined();
        expect(o.context).toBeDefined();
        expect(o.event).toBeDefined();
        expect(o.callback).toBeDefined();

        expect(o.event.destination).toMatch(event.destination);
        expect(typeof o.context).toMatch('object');
        expect(typeof o.callback).toMatch('object');

        expect(o.event.source).toMatch(event.source);
    })

    it('can set the source', function(done) {
        o.setSource().
            then(function(res) {
                expect(res).toBeDefined();
                expect(res).toMatch(event.source);
                done();
            })
            .catch(function(err) {
                expect(err).not.toBeDefined();
                done();
            })
    })

    it('can set the table', function(done) {
        o.setTable().
            then(function(res) {
                expect(res).toBeDefined();
                expect(res).toMatch(event.table);
                done();
            })
            .catch(function(err) {
                expect(err).not.toBeDefined();
                done();
            })
    })

    it('can set the schema', function(done) {
        o.getSchema().
            then(function(res) {
                expect(res).toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).not.toBeDefined();
                done();
            })
    })
})


describe("data from body", function() {
    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
        delete o.source;
    })

    it('can get the data from body', function(done) {
        o.getData()
            .then(function(res) {
                expect(res).toBeDefined();
                expect(res[0].uuid).toBeDefined();
                expect(res[0].uuid).toMatch(event.body[0].uuid);
                expect(res[1].uuid).toBeDefined();
                expect(res[1].uuid).toMatch(event.body[1].uuid);
                done();
            })
            .catch(function(err) {
                expect(err).not.toBeDefined();
                done();
            })
    })
})

describe("data from file", function() {
    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
    })


    it('can get the data from file', function(done) {

        o.getData()
            .then(function(res) {
                expect(res).toBeDefined();
                expect(res[0].uuid).toBeDefined();
                expect(res[0].uuid).toMatch(event.body[0].uuid);
                expect(res[1].uuid).toBeDefined();
                expect(res[1].uuid).toMatch(event.body[1].uuid);
                done();
            })
            .catch(function(err) {
                expect(err).not.toBeDefined();
                done();
            })
    })
})

describe('can mock the client', function() {

    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
        spyOn(o, 'getClient').and.callThrough();

    })


    it('can mock the client', function() {
        let client = o.getClient();
        expect(o.getClient).toHaveBeenCalled();
        expect(client).toBeTruthy();
    })
})

xdescribe('can run', function() {

    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
    })


    it('can import', function() {
        o.run();
        expect(o.responseSuccess).toBeDefined();
    })
})

describe('callbacks', function() {

    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
    })


    it('success', function() {
        o.successCallback({
            "good": "job"
        });

        expect(o.responseSuccess).toBeDefined();
        expect(o.responseSuccess.body).toBeDefined();
        expect(o.responseSuccess.statusCode).toMatch(/200/);

    })

    it('error', function() {
        o.errorCallback({
            "bad": "job"
        });

        expect(o.responseError).toBeDefined();
        expect(o.responseError.body).toBeDefined();
        expect(o.responseError.statusCode).toMatch(/400/);


    })
})


describe('negative tests', function() {
    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
    })

    it('cannot set the source', function(done) {
        delete o.event.source;
        o.setSource().
            then(function(res) {
                expect(res).not.toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).toBeDefined();
                done();
            })
    })

    it('cannot set the table', function(done) {
        delete o.event.table;
        o.setTable().
            then(function(res) {
                expect(res).not.toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).toBeDefined();
                done();
            })
    })

    it('cannot set the schema', function(done) {
        delete o.event.schema;
        o.getSchema().
            then(function(res) {
                expect(res).not.toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).toBeDefined();
                done();
            })
    })

    it('cannot set the schema body', function(done) {
        o.event.schema = 'dp.schema.empty.json';
        o.getSchema().
            then(function(res) {
                expect(res).not.toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).toBeDefined();
                done();
            })
    })


    it('cannot get the data from body', function(done) {
        delete o.event.body;
        o.getData().
            then(function(res) {
                expect(res).not.toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).toBeDefined();
                done();
            })
    })
})

describe('Validate', function() {

    let o;
    beforeEach(function() {
        o = new handler(event, context, callback);
    })

    it('can validate', function(done) {
        let fs = require('fs');
        let data = {
            "uuid": "54cf99a7-3eb4-4ab8-9e1c-3cc650b485ae",
            "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
            "title": "Griffin"
        };
        let file = fs.readFileSync(process.cwd() + "/sample.schema.json");
        o.schema = JSON.parse(file);

        o.validate(data)
            .then(function(res) {
                expect(res).toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).not.toBeDefined();
                done();
            })
    })

    it('cannnot validate', function(done) {
        let fs = require('fs');
        let data = {
            "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
            "title": "Griffin"
        };
        let file = fs.readFileSync(process.cwd() + "/sample.schema.json");
        let schema = JSON.parse(file);

       o.validate(data, schema)
            .then(function(res) {
                expect(res).not.toBeDefined();
                done();
            })
            .catch(function(err) {
                //   console.log(err);
                expect(err).toBeDefined();
                done();
            })
    })
})


describe('Create', function() {

    let o;
    let fs = require('fs');

    beforeEach(function() {
        o = new handler(event, context, callback);
        let file = fs.readFileSync(process.cwd() + "/sample.schema.json");
        o.schema = JSON.parse(file);
        o.data = [{
            "uuid": "4B626EE5-F473-487B-B33F-3363C06EF531",
            "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
            "title": "Melanon"
        },
        {
            "uuid": "F9DD3E7B-98E9-4BD0-B6F6-AF8D425EA982",
            "title": "Richardson"
        }];
        o.table = "testone";
    })

    it('can create', function(done) {
        // console.log(o);
        o.create()
            .then(function(res) {
                expect(res).toBeDefined();
                done();
            })
            .catch(function(err) {
                 console.log(err);
                expect(err).not.toBeDefined();
                done();
            })
    })
})



describe('Write', function() {

    let o;
    let fs = require('fs');

    beforeEach(function() {
        o = new handler(event, context, callback);
        let file = fs.readFileSync(process.cwd() + "/sample.schema.json");
        o.schema = JSON.parse(file);
        o.data = [{
            "uuid": "4B626EE5-F473-487B-B33F-3363C06EF531",
            "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
            "title": "Melanon Niceness"
        },
        {
            "uuid": "F9DD3E7B-98E9-4BD0-B6F6-AF8D425EA982",
            "title": "Richardson"
        }];
        o.table = "testone";


    })

    it('can write', function(done) {
        let data = o.data[0];
        o.write(data)
            .then(function(res) {
                expect(res).toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).not.toBeDefined();
                done();
            })
    })

     it('cannot write', function(done) {
        let data = {
            "uuid": "F9DD3E7B-98E9-4BD0-B6F6-AF8D425EA982",
            "jessue": "Richardson"
        };
        o.write(data)
            .then(function(res) {
                expect(res).not.toBeDefined();
                done();
            })
            .catch(function(err) {
                expect(err).toBeDefined();
                expect(err).toMatch('ValidationException: One of the required keys was not given a value');
                done();
            })
    })
})