var Promise = require("bluebird");


var PermissionError = function(message) {
    this.message = message;
    this.name = "Access denied";
}
PermissionError.prototype = Object.create(Error.prototype);
PermissionError.prototype.constructor = PermissionError;





module.exports =  {
    name: "@permission",
    synonims: {
        "@permission": "@permission",
        "@access": "@permission",
        "@for": "@permission"
    },
    
    defaultProperty: {
        "@permission": "test",
        "@access": "test",
        "@for": "test"
    },

    "internal aliases":{
        "test":"test"
    },

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            if(command.settings.test){
                if (command.settings.test(state.client)){
                    resolve(state)
                }else{
                    
                    reject(new PermissionError(`for client:  ${(state.client)?JSON.stringify(state.client):"undefined"}`))
                }
            }
            
            reject(new PermissionError("Permission test is undefined"))
        })
    },

    help: {
        synopsis: "Save context into cache",
        name: {
            "default": "cache",
            synonims: ["cache","save"]
        },
        "default param": "none",
        params: [],
        example: {
            description: "Save context into cache",
            code: "load(\n    ds:'47611d63-b230-11e6-8a1a-0f91ca29d77e_2016_02',\n    as:'json'\n)\nselect('$.metadata')\nextend()\ntranslate()\ncache()\nselect(\"$.data_id\")\n"
        }

    }
} 