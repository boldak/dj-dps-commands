var fs = require('fs');
var Promise = require("bluebird");
var util = require("util");
let storageUtils = require("../utils");



class DDLAlterImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.alter error";
  }
}

module.exports = {
    name: "ddl.alter",
    synonims: {
        "ddl.alter": "ddl.alter",
        "ddl.modify": "ddl.alter"
    },

    "internal aliases":{
        "model":"model",
        "entity":"model",
        "collection":"model",
        "schema":"schema"
    },

    // ddl.create(type: "user", as:{{schema}})
    // ddl.create(type: "user", schema:{{schema}})

    defaultProperty: {
        "ddl.alter":"schema",
        "ddl.modify": "schema"
    },

   

    execute: function(command, state) {
        return new Promise((resolve, reject) => {

            command.settings = command.settings || {};
            
            if(command.settings.model){
                command.settings.model = (util.isArray(command.settings.model)) ? command.settings.model : [command.settings.model];
                let errorDetected = false;
                command.settings.model.forEach((item) => {
                    if (!item.identity){ 
                        reject(new DDLAlterImplError(`Identity for collection ${JSON.stringify(item)} is undefined.`));
                        errorDetected = true;
                    }    
                    if (!item.attributes) {
                        reject(new DDLAlterImplError(`Type of collection ${JSON.stringify(item)} is undefined.`));
                        errorDetected = true;
                    }       
                })
                if(errorDetected) return
            }        

            if (command.settings.schema && !command.settings.schema.identity) reject(new DDLAlterImplError(`Schema identity for ${JSON.stringify(command.settings.schema.entities)} is undefined.`))      
            if (command.settings.schema && !command.settings.schema.entities) reject(new DDLAlterImplError(`Entities description for schema ${command.settings.schema.identity} is undefined.`))      
            
            let models = [];

            if (command.settings.schema){
                for(let [identity, model] of Object.entries(command.settings.schema.entities)) {
                    models.push({
                       identity:identity,
                       schema: command.settings.schema.identity,
                       model: model,
                       owner: state.client,
                       permissions: command.settings.schema.permissions || model.permissions
                    })
                }
            }else if (command.settings.model){
                
                models = command.settings.model.map((item) => {
                    return {
                        schema:item.schema ||"GLOBAL",
                        identity: item.identity,
                        model: {attributes: item.attributes},
                        owner: state.client,
                        permissions: item.permissions
                    }
                })
            }

            Promise.all( models.map((model) => {
                return new Promise((resolve,reject) => {
                        storageUtils.access(state.client, model.identity.toLowerCase(), "alter")
                        .then(() => {
                            Entities
                                .findOne({identity:model.identity.toLowerCase()})
                                .then((col) => {
                                    // if (col){
                                    //     reject(new DDLCreateImplError(`Doublicate '${model.identity}' collection`))
                                    //     return
                                    // }

                                    fs.writeFileSync(   `./api/models/${model.identity}.js`, 
                                                `module.exports = ${JSON.stringify(model.model)}`
                                            );

                                    Entities
                                        .update({identity:model.identity}, model)
                                        .then((res) => {
                                            resolve(res)
                                        })
                                        .catch((e) => {
                                            reject (new DDLAlterImplError(e.toString()))
                                        })
                                })    
                        })
                        .catch((e) => {
                            reject (new DDLAlterImplError(e.toString()))
                        })
                        
                    })
                })
            )
            .then(() => {
                state.head = {
                    data: models,
                    type: "json"
                }
                require("../utils")
                storageUtils
                    .reloadORM(sails)
                    .then(() => { resolve(state) })
                    .catch((e) => { reject(new DDLAlterImplError(e.toString()))})
            })
            .catch((e) => {
                reject(new DDLAlterImplError(e.toString())) 
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
