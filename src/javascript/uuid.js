let Promise = require("bluebird");
let uuid = require('uuid');

class DDLAlterImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.alter error";
  }
}

module.exports = {
    name: "uuid",
    synonims: {
        "uuid": "uuid",
        "guid": "uuid"
    },

    "internal aliases":{
    },

    
    defaultProperty: {
    },

   

    execute: function(command, state) {
        return new Promise((resolve, reject) => {
            state.head = {
                data: uuid.v4(),
                type: "json"
            }
            resolve(state)
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
