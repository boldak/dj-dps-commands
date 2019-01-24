let fs = require("fs");
let iconv = require('iconv-lite');
let Promise = require("bluebird");


module.exports = (params) => {
	
	return new Promise( ( resolve, reject ) => {
		let d = fs.readFileSync(params.file);

	    d = iconv.decode( new Buffer(d,"binary"), params.encoding ).toString();
		
		resolve ({
			data: d,
			type: "string"
		})	
	})
}