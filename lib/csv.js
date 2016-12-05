#!/usr/bin/env node

function getS3Handler() {
    let AWS = require('aws-sdk')
    let S3 = new AWS.S3({
        apiVersion: '2006-03-01'
    });
    return S3;
}

function upload(bucket, file) {
    let params = {
        Bucket: bucket, /* required */
        Key: file, /* required */
        ACL: 'private',
    }

    getS3Handler().putObject(params, function (err, data) {
        if (err) console.log(err.message); // an error occurred
        else console.log('Successfully uploaded to S3');           // successful response
    });
}

(function () {

    let generator = {};

    exports.generate = generator.go = () => {
        let program = require('commander');

        program
            .arguments('<file>')
            .option('-i, --input <datafilepath>', 'The input csv data file')
            .option('-s, --schema <schemafilepath>', 'The JSON schema file path')
            .option('-d, --destination <outputfilepath>', 'The output file path')
            .option('-u, --upload <s3bucket>', 'The name of the s3 bucket to upload the file')
            .action(function (file) {
                console.log('data: %s schema: %s output: %s',
                    program.input, program.schema, program.destination);
            })
            .parse(process.argv);



        let parse = require('csv-parse');
        let fs = require('fs');

        let file = fs.readFileSync(program.input);
        if (typeof file === 'undefined') throw new Error('Cannot find the data file');

        let sfile = fs.readFileSync(program.schema);
        if (typeof sfile === 'undefined') throw new Error('Cannot find the schema file');
        let sObj = JSON.parse(sfile);

        const schema_props = Object.keys(sObj.properties);
        parse(file, {
            columns: schema_props
        }, function (err, output) {
            if (err) throw err;

            fs.writeFile(program.destination, JSON.stringify(output), (err) => {
                if (err) throw err;
                console.log('Finished coversion...saved ' + program.destination);

                if (typeof program.upload !== 'undefined') {
                    console.log('doing an upload');
                    if (program.destination.lastIndexOf('/') !== -1) {
                        let s3key = program.destination.slice(program.destination.lastIndexOf('/') + 1);
                         upload(program.upload, program.destination);
                    } else {
                        let s3key = program.destination;
                         upload(program.upload, program.destination);
                    }

                    if (typeof s3key !== 'undefined') {
                        upload(program.upload, program.destination);

                    }
                }
            });
        });
    }

    if (!module.parent) {
        generator.go();
    }
})();
