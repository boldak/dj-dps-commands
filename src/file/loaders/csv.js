let fs = require("fs");
let iconv = require('iconv-lite');
let csvjson = require("csvjson");
let Promise = require("bluebird");


module.exports = (params) => {
	return new Promise( ( resolve, reject ) => {
		let d = fs.readFileSync(params.file);

		let options = {
	          delimiter: params.delimiter || ";",
	          quote: params.quote || '"'
	        }
	        
	    d = iconv.decode( new Buffer(d,'binary'), params.encoding ).toString().trim();
		d = csvjson.toObject(d, options);
		
		resolve ({
			data: d,
			type: "json"
		})	
	})

}