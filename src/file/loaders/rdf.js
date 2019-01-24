let fs = require("fs");
let iconv = require('iconv-lite');
let xmljson = require("xml2js");
let Promise = require("bluebird")


module.exports = (params) => {
	let d = fs.readFileSync(params.file);

    d = iconv.decode( new Buffer(d,"binary"), params.encoding ).toString();
    

    return new Promise( ( resolve, reject ) => {
      let parser = new xmljson.Parser({
        attrkey: "_attributes",
        charkey: "_text"

      });
      
      parser.parseString(d, ( error, result ) => {
      	if (error) reject(error.toString())
        resolve({
          data: result,
          type: "json"
        })  
      })
    })
}