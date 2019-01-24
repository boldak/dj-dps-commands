let fs = require("fs");
let iconv = require('iconv-lite');
let Promise = require("bluebird");


module.exports = (params) => {
	
	return new Promise( ( resolve, reject ) => {
		let d = fs.readFileSync(params.file);

	    d = iconv.decode( new Buffer(d,"binary"), params.encoding ).toString();
		try {
			d = JSON.parse(d);
			resolve ({
				data: d,
				type: "json"
			})
		} catch(e){
			reject(e.toString())
		}		
	})
}