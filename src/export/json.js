var fs = require("fs");

var JsonConverterError = function(message) {
    this.message = message;
    this.name = "JSOON converter error";
}
JsonConverterError.prototype = Object.create(Error.prototype);
JsonConverterError.prototype.constructor = JsonConverterError;


module.exports = (data, params, locale, script, scriptContext) => {

        try {
            
            fs.writeFileSync("./.tmp/public/downloads/" + params.file, JSON.stringify(data, null,"\t"));
            return { url: "/downloads/" + params.file }
        
        } catch (e) {

             throw new JsonConverterError(e.toString())

        }
}        
    