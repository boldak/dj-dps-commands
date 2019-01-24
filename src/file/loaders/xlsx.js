let xlsx = require('xlsx');
let Promise = require("bluebird");


module.exports = (params) => {
	return new Promise( ( resolve, reject ) => {
		
		let d = xlsx.readFile(params.file)
		
		for(i in d.Sheets){
		 d.Sheets[i] = xlsx.utils.sheet_to_json(d.Sheets[i]);	
		}

		resolve ({
			data: d.Sheets,
			type: "json"
		})	
	})	
}