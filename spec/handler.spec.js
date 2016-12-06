'use strict'

const handler = require(process.cwd() + '/src/handler');
const fs = require('fs');

// custom error object for write neg test validation error
// this should probs go in a helpr
function ValidationException(message) {
    this.name = "ValidationException";
    this.message = (message || "");
}
ValidationException.prototype = Error.prototype;


let event = {
    "destination": "db",
    "source": process.cwd() + "/spec/samples/sample.event.json",
    "table": "testone",
    "location": "local",
    "schema": process.cwd() + "/spec/samples/sample.schema.json"
}

//
let context = {
        fail: function (msg) {
            // console.log(msg);
            expect(msg).toBeDefined();
        },
        succeed: function (data) {
            // console.log(data);
            expect(data).toBeDefined();
            expect(data.statusCode).toBeDefined();
            expect(data.statusCode).toEqual(200);
        }
    }
    //ˇ
let callback = {
    anyting: function (err, res) {}
}

let $getClientMock = {
    put: function (data) {
        this.data = data;
        return $getClientMock;
    },
    promise: function () {
        try {
            if (typeof this.data === 'object' && typeof this.data.Item.title === 'undefined') {
                throw new ValidationException('One of the required keys was not given a value');
            }
        } catch (err) {
            return Promise.reject(err);

        }
        return Promise.resolve('recorded written')

    }
};

describe("Handler", function () {
    let o;

    beforeEach(function () {
        o = new handler(event, context, callback);
    })

    afterEach(function () {
        o.event.source = process.cwd() + "/spec/samples/sample.event.json";
        o.event.table = "testone";

    })

    // describe("handler export", function(){
    //     handler.import(event, context, callback);
    // })

    it('can instantiate class with params', function () {
        expect(o).toBeDefined();
        expect(o.context).toBeDefined();
        expect(o.event).toBeDefined();
        expect(o.callback).toBeDefined();

        expect(o.event.destination).toMatch(event.destination);
        expect(typeof o.context).toMatch('object');
        expect(typeof o.callback).toMatch('object');

        expect(o.event.source).toMatch(event.source);
        expect(o.setSource).toBeDefined();
        expect(o.setTable).toBeDefined();
        expect(o.getClient).toBeDefined();
        expect(o.getSchema).toBeDefined();
        expect(o.getData).toBeDefined();
        expect(o.validate).toBeDefined();
        expect(o.write).toBeDefined();
        // expect(o.create).toBeDefined();
        expect(o.errorCallback).toBeDefined();
        expect(o.successCallback).toBeDefined();
        expect(o.render).toBeDefined();

        expect(o.responseError).not.toBeDefined();
        expect(o.responseSuccess).not.toBeDefined();
    })


    describe('can mock the client', function () {

        let o;
        beforeEach(function () {
            o = new handler(event, context, callback);
            spyOn(o, 'getClient').and.callThrough();

        })


        it('can mock the client', function () {
            let client = o.getClient();
            expect(o.getClient).toHaveBeenCalled();
            expect(client).toBeTruthy();
        })
    })


    describe('callbacks', function () {

        let o;
        beforeEach(function () {
            o = new handler(event, context, callback);
        })


        it('success', function () {
            o.successCallback({
                "good": "job"
            });

            expect(o.responseSuccess).toBeDefined();
            expect(o.responseSuccess.body).toBeDefined();
            expect(o.responseSuccess.statusCode).toMatch(/200/);

        })

        it('error', function () {
            o.errorCallback({
                "bad": "job"
            });

            expect(o.responseError).toBeDefined();
            expect(o.responseError.body).toBeDefined();
            expect(o.responseError.statusCode).toMatch(/400/);


        })
    })

    describe('method call', function () {

        describe('setSource', function () {

            it('can set the source', function (done) {
                o.setSource()
                    .then(function (res) {
                        expect(res).toBeDefined();
                        expect(res).toMatch(event.source);
                        expect(o.source).toBeDefined();
                        expect(o.source).toMatch(event.source);
                        expect(o.source).toMatch(o.event.source);
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })

            it('cannot set the source', function (done) {
                delete o.event.source;
                o.setSource().
                then(function (res) {
                        expect(res).not.toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).toBeDefined();
                        expect(err).toMatch('No source set');
                        done();
                    })
            })

        })

        describe('setTable', function () {

            it('can set the table', function (done) {
                o.setTable().
                then(function (res) {
                        expect(res).toBeDefined();
                        expect(res).toMatch(event.table);
                        expect(o.table).toMatch(event.table);
                        expect(o.table).toMatch(o.event.table);
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })


            it('cannot set the table', function (done) {
                delete o.event.table;
                o.setTable().
                then(function (res) {
                        expect(res).not.toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).toBeDefined();
                        expect(err).toMatch('No table set');
                        done();
                    })
            })

            it('can set the table chained', function (done) {
                // console.log(o);
                o.setSource()
                    .then(function (source) {
                        return o.setTable();
                    })
                    .then(function (res) {
                        expect(res).toBeDefined();
                        expect(res).toMatch(event.table);
                        expect(o.table).toMatch(event.table);
                        expect(o.table).toMatch(o.event.table);
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })

        })

        describe('getSchema', function () {
            beforeEach(function () {
                o.event.schema = 'spec/samples/dp.schema.json';

            })

            it('can set the schema', function (done) {
                o.getSchema().
                then(function (res) {
                        expect(res).toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })

            it('cannot set the schema', function (done) {
                delete o.event.schema;
                o.getSchema().
                then(function (res) {
                        expect(res).not.toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).toBeDefined();
                        done();
                    })
            })

            it('cannot set the schema body', function (done) {
                o.event.schema = process.cwd() + '/spec/samples/dp.schema.empty.json';
                // fs.chmod(process.cwd() + '/spec/samples/dp.schema.empty.json', '400');
                o.getSchema().
                then(function (res) {
                        expect(res).not.toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).toBeDefined();
                        expect(err).toMatch('Cannot read the schema file');
                        done();
                    })
            })

            it('can set the schema chained', function (done) {
                o.setSource()
                    .then(function (source) {
                        expect(source).toBeDefined();
                        return o.setTable();
                    })
                    .then(function (table) {
                        expect(table).toBeDefined();
                        return o.getSchema();
                    })
                    .then(function (res) {
                        expect(res).toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })
        })

        describe("getData", function () {
            it('can get the data', function (done) {
                o.source = process.cwd() + '/spec/samples/sample.event.json';
                o.getData()
                    .then(function (res) {
                        expect(res).toBeDefined();
                        expect(res[0].uuid).toBeDefined();
                        expect(res[1].uuid).toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })

            it('can get the data chained', function (done) {

                o.setSource()
                    .then(function (source) {
                        expect(source).toBeDefined();
                        return o.setTable();
                    })
                    .then(function (table) {
                        expect(table).toBeDefined();
                        return o.getSchema();
                    })
                    .then(function (schema) {
                        expect(schema).toBeDefined();
                        return o.getData();
                    })
                    .then(function (res) {
                        expect(res).toBeDefined();
                        expect(res[0].uuid).toBeDefined();
                        expect(res[1].uuid).toBeDefined();
                        done();

                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })

            it('cannot get the data from body', function (done) {
                o.getData().
                then(function (res) {
                        expect(res).not.toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).toBeDefined();
                        done();
                    })
            })
        })


        describe('Validate', function () {

            let o;
            beforeEach(function () {
                o = new handler(event, context, callback);
            })

            it('can validate', function (done) {
                let fs = require('fs');
                let data = {
                    "uuid": "54cf99a7-3eb4-4ab8-9e1c-3cc650b485ae",
                    "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
                    "title": "Griffin"
                };
                let file = fs.readFileSync(process.cwd() + "/spec/samples/sample.schema.json");
                o.schema = JSON.parse(file);

                o.validate(data)
                    .then(function (res) {
                        expect(res).toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })

            it('cannnot validate', function (done) {
                let fs = require('fs');
                let data = {
                    "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
                    "title": "Griffin"
                };
                let file = fs.readFileSync(process.cwd() + "/spec/samples/sample.schema.json");
                let schema = JSON.parse(file);

                o.validate(data, schema)
                    .then(function (res) {
                        expect(res).not.toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        //   console.log(err);
                        expect(err).toBeDefined();
                        done();
                    })
            })
        })


        describe('Create', function () {

            let o;
            let fs = require('fs');

            beforeEach(function () {
                o = new handler(event, context, callback);
                let file = fs.readFileSync(process.cwd() + "/spec/samples/sample.schema.json");
                o.schema = JSON.parse(file);
                o.data = [{
                    "uuid": "4B626EE5-F473-487B-B33F-3363C06EF531",
                    "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
                    "title": "Melanon"
                }, {
                    "uuid": "F9DD3E7B-98E9-4BD0-B6F6-AF8D425EA982",
                    "title": "Richardson"
                }];
                o.table = "testone";
            })

            it('can create', function (done) {
                // console.log(o);
                o.create()
                    .then(function (res) {
                        expect(res).toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        console.log(err);
                        expect(err).not.toBeDefined();
                        done();
                    })
            })
        })



        describe('Write', function () {

            let o;
            let fs = require('fs');

            beforeEach(function () {
                o = new handler(event, context, callback);
                let file = fs.readFileSync(process.cwd() + "/spec/samples/sample.schema.json");
                o.schema = JSON.parse(file);
                o.table = "testone";

                spyOn(o, 'getClient').and.returnValue($getClientMock);


            })

            it('can write', function (done) {
                let data = {
                    "uuid": "F9DD3E7B-98E9-4BD0-B6F6-AF8D425EA982",
                    "title": "Richardson"
                };
                o.write(data)
                    .then(function (res) {
                        expect(res).toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).not.toBeDefined();
                        done();
                    })
            })

            it('cannot write', function (done) {
                let data = {
                    "uuid": "F9DD3E7B-98E9-4BD0-B6F6-AF8D425EA982",
                    "jessue": "Richardson"
                };
                o.write(data)
                    .then(function (res) {
                        expect(o.getClient).toHaveBeenCalledTimes(1);
                        expect(res).not.toBeDefined();
                        done();
                    })
                    .catch(function (err) {
                        expect(err).toBeDefined();
                        expect(err).toMatch('ValidationException: One of the required keys was not given a value');
                        done();
                    })
            })
        })


        describe('Run', function () {

                it('can get response', function (done) {
                    o.render();
                    expect(o.responseSuccess).toBeDefined();
                    done();
                })
            }) // Run
    })
})