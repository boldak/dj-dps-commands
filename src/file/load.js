let mime = require("mime");
let path = require("path");
let util = require("util");

let FileLoadImplError = function(message) {
    this.message = message;
    this.name = "Command 'file.load' implementation error";
}

FileLoadImplError.prototype = Object.create(Error.prototype);
FileLoadImplError.prototype.constructor = FileLoadImplError;



let loaders = {
    "text/csv": require("./loaders/csv"),
    "text/plain": require("./loaders/txt"),
    "text/xml": require("./loaders/xml"),
    "text/html": require("./loaders/html"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": require("./loaders/xlsx"),
    "application/json": require("./loaders/json"),
    "application/rdf+xml": require("./loaders/rdf")
}

let impl = function(params) {
    
    let filename = params.file;
    if (filename) {
        
        let loader = loaders[mime.lookup(path.basename(filename))]
        
        if (loader) {
            try {
                return loader(params)
            } catch (e) {
                throw new FileLoadImplError( e.toString() );
            }
        } else {
            throw new FileLoadImplError("Mime type: '" + mime.lookup(path.basename(filename)) + "' not supported");
        }

    } else {
        throw new FileLoadImplError("Cannot load empty file");
    }
}


module.exports = {
    name: "file.load",

    synonims: {
        "file.import": "file.load"
   },

    "internal aliases":{
        "file": "file",
        "encode": "encoding"
     },
    
    defaultProperty: {
        "file.load": "file",
        "file.import": "file",
    },

    execute: function(command, state, config) {
        
        if (!util.isString(command.settings.file))
            throw new FileLoadImplError("Incompatible file value: " + JSON.stringify(command.settings.file))
        
        command.settings.encoding = command.settings.encoding || "utf8"  
        
        return impl(command.settings)
            .then( res => {
                 state.head = res;
                 return state
            })

    },
    
    help: {
        synopsis: "Import data from file",

        name: {
            "default": "file.load",
            synonims: ["file.import"]
        },
        "default param": "file",
        params: [{
            name: "file",
            synopsis: "File name with extention",
            synonims: [],
            "default value": "none"
        }],

        example: {
            description: "load csv and convert to JSON",
            code: "file.load(file:'data.csv')"
        }
    }
}
