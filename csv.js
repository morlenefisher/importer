#!/usr/bin/env node


(function () {

    let generator = {};

    exports.generate = generator.go = () => {
        let args = process.argv.slice(2);

        let source = args[0];
        let schemas = args[1]

        console.log(source);
        console.log(schemas);

        let parse = require('csv-parse');
        let fs = require('fs');

        let file = fs.readFileSync(process.cwd() + '/' + source);
        if (typeof file === 'undefined') throw new Error('Cannot find the data file');

        let sfile = fs.readFileSync(process.cwd() + '/' + schemas);
        if (typeof sfile === 'undefined') throw new Error('Cannot find the schema file');
        let schema = JSON.parse(sfile);

        const schema_props = Object.keys(schema.properties);
        console.log(schema_props);

        parse(file, {
            columns: schema_props
        }, function (err, output) {
                if (err) throw err;
            // console.log(output);

            fs.writeFile('sample.json', JSON.stringify(output), (err) => {
                if (err) throw err;
                console.log('It\'s saved!');
            });
        });
    }

    if (!module.parent) {
        generator.go();
    }
})();
