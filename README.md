# digitalxlabs-importer [![Build Status](https://travis-ci.org/digitalXlabs/importer.png?branch=master)](https://travis-ci.org/digitalXlabs/importer) [![CircleCI](https://circleci.com/gh/digitalXlabs/importer/tree/master.svg?style=shield)](https://circleci.com/gh/digitalXlabs/importer/tree/master)

Import data from json source to [AWS dynamodb](https://aws.amazon.com/dynamodb) using [AWS Lambda](https://aws.amazon.com/lambda), and [Serverless](https://serverless.com/)

## Files
 - handler.js: Contains the class and module to do the importing
 - handler.spec.js: Test script
 - jsdoc.json: Configuration for [JSDoc](http://usejsdoc.org)
 - package.json: Package.json files detailing dependencies for this project and License info etc.
 - sample.create.table.js: script to create dynamodb table
 - sample.event,json: Contains a test dataset that will validate against the included Schema
 - sample.schema,json: Sample JSON schema against which the dataset will be validated
 - serverless.yml: Serverless configuration file, detailing resources, handlers and everything needed to get your lambda script up to AWS


## Prerequisites

 - AWS account, you will need this to actually store the lamda script and it's where dynamodb is as well
 - You will need to create the table that is to store the data
 - Serverless will need to be installed on your machine, if you want to use it's awesome features.
 - AWS access key and secret (generate this is the IAM service section and use this with serverless to deploy the code)

## Install (Quickie)

- `npm install -g serverless` (if you don't already have it installed)
- `git clone git@github.com:digitalXlabs/importer.git`
- `npm install --production`
- `serverless deploy`


## Tests

```sh
npm install
npm test
```

## Dependencies

- [json-schema-remote](https://github.com/entrecode/json-schema-remote): Node.js module to validate JSON objects against a JSON Schema, including remote references ($ref)
- [uuid](https://github.com/defunctzombie/node-uuid): Rigorous implementation of RFC4122 (v1 and v4) UUIDs.

## Dev Dependencies

- [aws-sdk](https://github.com/aws/aws-sdk-js): AWS SDK for JavaScript
- [ink-docstrap](https://github.com/docstrap/docstrap): DocStrap is Bootstrap based template for JSDoc3
- [jasmine-node](https://github.com/mhevery/jasmine-node): DOM-less simple JavaScript BDD testing framework for Node


## License

MIT

_Generated by [package-json-to-readme](https://github.com/zeke/package-json-to-readme)_
