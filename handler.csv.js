'use strict';


class ImporterCSV {


    /**
     * constructor - class constructor
     * Creates class properties from the event, context and callback
     * passed in parameters
     *
     * @param  {object} event    description
     * @param  {object} context  description
     * @param  {function} callback description
     * @return {void}
     */

    constructor(event, context, callback) {
        this.event = event;
        this.context = context;
        this.callback = callback;

    }


    /**
     * setSource - The source is the souce of the data
     *
     * @return {type}  description
     */
    setSource() {
        this.source = this.event.source;
    }


    /**
     * setDestination - this is the destination of the data usually this is your db
     *
     * @return {type}  description
     */
    setDestination() {
        this.destination = this.event.destination;
    }


    /**
     * setData - sets the data to a class property
     *
     * @return {type}  description
     */
    setData() {

        return new Promise(function(resolve, reject) {
            if (!this.event.body) reject('No table specified');
            this.data = this.event.body;
            resolve(this.data);
        })
    }


    /**
     * setTable - Sets the name of the data table
     *
     * @return {type}  description
     */
    setTable() {
        return new Promise(function(resolve, reject) {
            if (!this.event.table) reject('No table specified');
            this.table = this.event.table;
            resolve(this.table);
        })
    }

    /**
     * getSQSHandler - description
     *
     * @return {type}  description
     */
    getClient() {
        let AWS = require('aws-sdk')
        AWS.config.update({
            region: "eu-west-1",
            endpoint: "http://localhost:8044"
        });

        return new AWS.DynamoDB.DocumentClient();
    }

    /**
     * getSchema - description
     *
     * @return {type}  description
     */
    getSchema() {
        return new Promise(function(resolve, reject) {
            let fs = require('fs');
            let file = fs.readFileSync(process.cwd() + "/dp.schema.json");
            if (typeof file === 'undefined') reject(new Error('Cannot find the schema file'));
            this.schema = JSON.parse(file);
            resolve(this.schema);
        })

    }


    /**
     * getData - retrieves the data from the source if it's a file or calls the setter
     *
     * @return {type}  description
     */
    getData() {
        let that = this;
        return new Promise(function(resolve, reject) {
            console.log('the source is ' + that.source);
            if (that.source === 'local') {
                console.log('source is local');

                let parse = require('csv-parse');
                let fs = require('fs');

                let file = fs.readFileSync(process.cwd() + "/sample.event.csv");
                if (typeof file === 'undefined') reject(new Error('Cannot find the data file'));

                let schema_props = Object.keys(that.schema.properties);
                if (typeof schema_props === 'undefined') reject(new Error('there is no schema'));

                parse(file, {
                    columns: schema_props
                }, function(err, output) {
                    if (err) {
                        console.log(err);
                    }
                    console.log(output);

                    that.data = output; //console.log(output);
                    resolve(that.data);
                });
            } else {
                resolve(that.setData());
            }
        })

    }


    /**
     * validate - validates an object against the given schema
     *
     * @param  {object} data   data object
     * @param  {string} schema schema or url of the schema to use
     * @return {type}        description
     */
    validate(data, schema) {
        let validator = require('json-schema-remote');
        return new Promise(function(resolve, reject) {
            validator.validate(data, schema)
                .then(function() {
                    resolve(true);
                })
                .catch(function(error) {
                    reject(error);
                });
        })
    }


    /**
     * map - maps data properties to the schema properties
     *
     * @return {type}  description
     */
    map(item) {
        let data = {};

        let schema_props = Object.keys(this.schema.properties);
        schema_props.forEach(function(k, idx) {
            if (typeof item[k] !== 'undefined') {
                data[k] = item[k];
            }
        });
        return data;
    }


    /**
     * creates a record
     *
     * @return {type}  description
     */
    create() {
        let quintus = this;

        this.setTable()
            .then(function(table) {
                console.log(table);
                return quintus.getSchema();
            })
            .then(function(schema) {
                console.log(schema);
                return quintus.getData();
            })
            .then(function(data) {
                console.log(data);
                // data.forEach(function(item, index) {
                //     quintus.validate(item, quintus.schema)
                //         .then(function() {
                //             return quintus.write(item)
                //         })
                //         .then(function(res) {
                //             return quintus.successCallback(res)
                //         })
                //         .catch((err) => {
                //             return quintus.errorCallback(err)
                //         });
                // })
            })

    }

    /**
     * write - writes the data to the data store
     * ideally this would go in DAL as doubtless you'll need it elsewhere
     *
     * @param  {object} data the record
     * @return {promise}      promise results or error
     */
    write(data) {
            let lucilla = this;
            let params = {
                TableName: this.table,
                Item: data
            };

            return new Promise(function(resolve, reject) {
                console.log("Adding a new item to " + params.TableName);
                lucilla.getClient().put(params).promise()
                    .then(function(data) {
                        resolve(data);
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })

        } // write



    /**
     * sets up the error response object
     *
     * @return {type}  description
     */
    errorCallback(err) {
        this.responseError = {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(err),
        }
        console.log(err);
        this.context.fail(this.responseError);

    }

    /**
     * sets up the success response object
     *
     * @return {type}  description
     */
    successCallback(result) {
        this.responseSuccess = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(result),
        };

        this.context.succeed(this.responseSuccess);

    }
}

//
module.exports = ImporterCSV;
module.exports.importer = (event, context, callback) => {
    let doIt = new ImporterCSV(event, context);

    console.log(doIt);

    doIt.create();
};
