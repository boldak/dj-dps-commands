var Promise = require("bluebird");
var util = require("util");
let storageUtils = require("../utils");



class DDLExtendPermissionsImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.extendPermissions error";
  }
}

module.exports = {
    name: "ddl.extendPermissions",
    synonims: {
        "ddl.extendPermissions": "ddl.extendPermissions",
        "ddl.grant": "ddl.extendPermissions"
    },

    "internal aliases":{
        "model":"model",
        "entity":"model",
        "collection":"model",
        "for":"model",
        
        "value":"value",
        "permissions":"value",
        "perm":"value",
        "grants":"value"
    },

    // ddl.create(type: "user", as:{{schema}})
    // ddl.create(type: "user", schema:{{schema}})

    defaultProperty: {
    },

   

    execute: function(command, state) {
        return new Promise((resolve, reject) => {
            
            
            command.settings = command.settings || {};
            if(util.isUndefined(command.settings.model)){
                reject(new DDLExtendPermissionsImplError(`Model identity is undefined.`));
                return                
            }

            command.settings.value = command.settings.value || {};
            storageUtils
                .extendPermissions(command.settings.model,command.settings.value)
                .then( res => {
                    state.head = {
                        data: res,
                        type: "json"
                    }
                    resolve(state)
                })
                .catch((e) => {
                    reject (new DDLExtendPermissionsImplError(e.toString()))
                })
        })
    },                        
    
            
    
    help: {
        synopsis: "Create new entity collection",
        name: {
            "default": "ddl.create",
            synonims: ["ddl.entity"]
        },
        input: ["waterline model description"],
        output: "json",
        "default param": "model",
        params: [{
            name: "model",
            synopsis: "Collection name. Retuns all definitions when collection name is undefined",
            type: ["string"],
            synonims: ["model", "for"],
            "default value": "undefined"
        }],
        example: {
            description: "Get Definition for All Stored Collections",
            code: "def()"
        }

    }
}
