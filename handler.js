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
        this.data = this.event.body;
    }


    /**
     * setTable - Sets the name of the data table
     *
     * @return {type}  description
     */
    setTable() {
        this.table = this.event.table;
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
        let fs = require('fs');
        let file = fs.readFileSync(process.cwd() + "/schema.json");
        if (typeof file === 'undefined') throw new Error('Cannot find the schema file');
        this.schema = JSON.parse(file);
    }


    /**
     * getData - retrieves the data from the source if it's a file or calls the setter
     *
     * @return {type}  description
     */
    getData() {
      if (this.source === 'local'){
        let fs = require('fs');
        let file = fs.readFileSync(process.cwd() + "/event.json");
        if (typeof file === 'undefined') throw new Error('Cannot find the schema file');
        this.data = JSON.parse(file);
      }
      else {
        this.setData();
      }

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
    map(item){
      let data = {};

      let schema_props = Object.keys(this.schema.properties);
      schema_props.forEach(function(k, idx){
        if (typeof item[k] !== 'undefined'){
          data[k] = item[k];
        }
      });

      console.log(data);
      return data;
    }
    /**
     * creates a record
     *
     * @return {type}  description
     */
    create() {
        let quintus = this;
        this.data.forEach(function(item, index) {
            let mapped = quintus.map(item);
            quintus.validate(mapped, quintus.schema)
                .then(function() {
                    return quintus.dbWrite(item)
                })
                .then(function(res) {
                    return quintus.successCallback(res)
                })
                .catch((err) => {
                    return quintus.errorCallback(err)
                });
        })
    }


    /**
     * write - writes the data to the data store
     * ideally this would go in DAL as doubtless you'll need it elsewhere
     *
     * @param  {object} data the record
     * @return {promise}      promise results or error
     */
    dbWrite(data) {
            let lucilla = this;
            let params = {
                TableName: this.table,
                Item: data
            };
            console.log("Adding a new item..." + params.TableName);
            return new Promise(function(resolve, reject) {
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

module.exports = Importer;
module.exports.importer = (event, context, callback) => {
    let doIt = new Importer(event, context);
    doIt.create();
};
