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
     * setSource - The source is the souce of the data
     *
     * @return {type}  description
     */
    setSource() {
        let that = this;

        return new Promise(function(resolve, reject) {
            if (typeof that.event.source === 'undefined') {
                reject('there is no source');
            }

            resolve(that.source = that.event.source);
        })

    }

    /**
     * setTable - Sets the name of the data table
     *
     * @return {type}  description
     */
    setTable() {
        let that = this;
        return new Promise(function(resolve, reject) {
            if (typeof that.event.table === 'undefined') {
                reject('there is no table');
            }

            resolve(that.table = that.event.table);
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
        let that = this;
        let fs = require('fs');
        return new Promise(function(resolve, reject) {
            if (typeof that.event.schema === 'undefined') {
                reject('there is no schema');
            }

            let file = fs.readFileSync(process.cwd() + "/" + that.event.schema);
            if (typeof file === 'undefined') {
                reject('Cannot read the schema file');
            } else {
                resolve(that.schema = JSON.parse(file));
            }
        })
    }


    /**
     * getData - retrieves the data from the source if it's a file or from the event.body
     *
     * @return {type}  description
     */
    getData() {
        let that = this;
        return new Promise(function(resolve, reject) {
            if (typeof that.source !== 'undefined') {
                let fs = require('fs');
                let file = fs.readFileSync(process.cwd() + '/' + that.source);
                if (typeof file === 'undefined') {
                    reject(new Error('Cannot find the data file'));
                }
                resolve(that.data = JSON.parse(file));
            }
            else {

                if (typeof that.event.body === 'undefined') {
                    reject('there is no body');
                }

                resolve(that.data = that.event.body);
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
        let quintus = this;
        let validator = require('json-schema-remote');
        return new Promise(function(resolve, reject) {
            validator.validate(data, quintus.schema)
                .then(function(res) {
                    resolve(data);
                })
                .catch(function(error) {
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
        let lucilla = this;
        let params = {
            TableName: this.table,
            Item: data
        };

        return new Promise(function(resolve, reject) {
            // console.log("Adding a new item to " + params.TableName);
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

    run() {
        this.setSource()
            .then(this.setTable)
            .then(this.getSchema)
            .then(this.getData)

            .then(this.create)
            .then(this.write)
            .then(this.successCallback)
            .catch(this.errorCallback)
    }
}

module.exports = Importer;
module.exports.importer = (event, context, callback) => {
    let doIt = new Importer(event, context);
    doIt.run();
};
