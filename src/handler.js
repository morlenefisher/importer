'use strict';


class Importer {


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
     * setSource - The source is the souce of the data
     *
     * @return {<Promise>}  description
     */
    setSource() {
        console.log('...in setSource');
        return (typeof this.event.source === 'undefined') ? Promise.reject('No source set') : Promise.resolve(this.source = this.event.source);
    }

    /**
     * setTable - Sets the name of the data table
     * 
     * @returns <Promise>
     * 
     * @memberOf Importer
     */
    setTable() {
        console.log('...in setTable');
        return (typeof this.event.table === 'undefined') ? Promise.reject('No table set') : Promise.resolve(this.table = this.event.table);
    }



    /**
     * getSchema - description
     *
     * @return {type}  description
     */
    getSchema() {
        console.log('...in getSchema');
        let that = this;
        let fs = require('fs');
        return new Promise(function (resolve, reject) {
            if (typeof that.event.schema === 'undefined') {
                reject('there is no schema');
            }
            try {
                resolve(that.schema = JSON.parse(fs.readFileSync(that.event.schema)));
            }
            catch (err) {
                reject('Cannot read the schema file');
            }
        })
    }


    /**
     * getData - retrieves the data from the source if it's a file or from the event.body
     *
     * @return {type}  description
     */
    getData() {

        console.log('...in getData');
        // console.trace();
        let that = this;
        let fs = require('fs');

        return new Promise(function (resolve, reject) {
            if (typeof that.source === 'undefined') {
                reject('the source is not set');
            }
            try {
                resolve(that.data = JSON.parse(fs.readFileSync(that.source)));
            }
            catch (err) {
                reject('Cannot read the source file');
            }
        })
    }


    /**
     * validate - validates an object against the given schema
     *
     * @param  {object} data   data object
     * @return {type}        description
     */
    validate(data) {
                console.log('...in validate');

        let quintus = this;
        let validator = require('json-schema-remote');
        return new Promise(function (resolve, reject) {
            validator.validate(data, quintus.schema)
                .then(function () {
                    resolve(data);
                })
                .catch(function (error) {
                    reject(error);
                });
        })
    }


    /**
     * creates a record
     *
     * @return {type}  description
     */
    create() {
        console.log('...in create');

        let validated = this.data.map(this.validate, this);
        return Promise.all(validated);

    }


    /**
     * write - writes the data to the data store
     * ideally this would go in DAL as doubtless you'll need it elsewhere
     *
     * @param  {object} data the record
     * @return {promise}      promise results or error
     */
    write(data) {

                console.log('...in write');
                console.log(data);
                data.updatedAt = new Date();
        let lucilla = this;
        let params = {
            TableName: this.table,
            Item: data
        };
        // console.trace();

        return new Promise(function (resolve, reject) {
            // console.log("Adding a new item to " + params.TableName);
            lucilla.getClient().put(params).promise()
                .then(function (data) {
                    resolve(data);
                })
                .catch(function (err) {
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

    /**
     * Gets the process running
     * 
     * 
     * @memberOf Importer
     */
    render() {
        // let quintus = this;
        console.log('...in render');
        this.setSource()
            .then(this.setTable())
            .then(this.getSchema())
            .then(this.getData())
            .then(this.create())
            .then(function(res){
                console.log(res);
                return this.write();
            })
            .then(this.successCallback())
            .catch(this.errorCallback())
    }
}

module.exports = Importer;
module.exports.import = (event, context, callback) => {
    let doIt = new Importer(event, context, callback);
    doIt.render();

};
