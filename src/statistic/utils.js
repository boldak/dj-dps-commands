let util = require("util");
let _ = require("lodash-node")
let StatError = require("./staterror")

module.exports = {
	
	isMatrix(matrix){
		if(!util.isArray(matrix)) return false;
		if (matrix.filter( r => !util.isArray(r)).length > 0) return false;
		return true; 
	},



	matrix2floats(matrix){
		try {
			let res = matrix.map( row => row.map(col => Number.parseFloat(col.toString())))
			let validations = res.map( r => r.filter( v => Number.isNaN(v)))
			let v = []
			validations.forEach(r => { v = v.concat(r)})
			if ( v.length > 0 ) throw new StatError("Cannot convert values to floats") 
			return res	
		} catch (e) {
			throw new StatError("Cannot convert values to floats")
		}
	},

	array2floats(array){
		try {
			let res = array.map( d => Number.parseFloat(d.toString()))
			let v = res.filter( r =>  Number.isNaN(r))
			if ( v.length > 0 ) throw new StatError("Cannot convert values to floats") 
			return res	
		} catch (e) {
			throw new StatError("Cannot convert values to floats")
		}
	},

	transpose(matrix){
		let res = []
		matrix[0].forEach( (r, index) => {
            res.push(matrix.map(item => item[index]))
        })
        return res
	}

}