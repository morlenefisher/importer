var parse = require('csv-parse');
var fs = require('fs');

let file = fs.readFileSync(process.cwd() + "/sample.csv");
if (typeof file === 'undefined') throw new Error('Cannot find the data file');

let sfile = fs.readFileSync(process.cwd() + "/db.schema.json");
if (typeof sfile === 'undefined') throw new Error('Cannot find the schema file');
let schema = JSON.parse(sfile);

const schema_props = Object.keys(schema.properties);
console.log(schema_props);

parse(file, {
    columns: schema_props
}, function(err, output) {
    console.log(err);
    console.log(output);
});
