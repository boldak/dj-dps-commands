let Promise = require("bluebird");
let storageUtils = require("../utils");


class DefImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.description error";
  }
}



module.exports = {
    name: "ddl.description",
    synonims: {
        "ddl.description": "ddl.description",
        "ddl.definition":"ddl.description",
        "ddl.def": "ddl.description",
        "ddl.desc": "ddl.description"
    },

    "internal aliases":{
        "model":"model",
        "entity": "model",
        "collection": "model",
        "schema" : "schema"
    },

    defaultProperty: {
        "ddl.description":"schema",
        "ddl.def": "schema",
        "ddl.definition": "schema",
        "ddl.desc": "schema"
    },

   

    execute: function(command, state) {

        return new Promise(function(resolve, reject) {
            let criteria = {}
            if (command.settings.model) criteria.identity = command.settings.model;
            if (command.settings.schema) criteria.schema = command.settings.schema;

            Entities.find(criteria)
                    .then((res) => {
                        if (res.length == 0 ) reject(new DefImplError(`Cannot find models with criteria '${JSON.stringify(criteria)}'`))
                        Promise.all(res.map((item) => storageUtils.accessIsAvailable(state.client, item.identity, 'desc')))
                            .then((accessible) => {
                                state.head = {
                                    data: res.filter((item,index) => accessible[index]),
                                    type: "json"
                                }
                                resolve(state)        
                            })
                            .catch( e => reject(new DefImplError(e.toString())))    
                    })
                    
                    .catch( e => reject(new DefImplError(e.toString())))
        })    
    },

    help: {
        synopsis: "Get Description for Stored Collections",
        name: {
            "default": "ddl.definition",
            synonims: ["ddl.definition", "ddl.def"]
        },
        input: ["none"],
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
