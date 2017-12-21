// var fs = require('fs');
var Promise = require("bluebird");
var del = require("del");
var util = require("util");
let storageUtils = require("../utils");
let doDeleteData = require('../dml/delete');


class DDLDropImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.drop error";
  }
}

module.exports = {
    name: "ddl.drop",
    synonims: {
        "ddl.drop":"ddl.drop",
        "ddl.destroy":"ddl.drop"
    },

    "internal aliases":{
        "model":"model",
        "entity":"model",
        "collection":"model",
        "schema": "schema"
    },

    defaultProperty: {
        "ddl.drop":"schema",
        "ddl.destroy":"schema"
    },


    execute: function(command, state) {

        return new Promise(function(resolve, reject) {
            let criteria = {}
            if (command.settings.model) criteria.identity = command.settings.model;
            if (command.settings.schema) criteria.schema = command.settings.schema;
            Entities.find(criteria)
                    .then((res) => {
                        if (res.length == 0 ) {
                            reject(new DDLDropImplError(`Cannot find '${JSON.stringify(criteria)}'`))
                            return    
                        }
                        Promise.all(res.map((item) => {
                            return storageUtils.access(state.client, item.identity, "drop")
                        }))
                        .then(() => {
                            Promise.all(res.map((item) => {
                                  return  doDeleteData.execute({settings:{collection: item.identity}},state) 
                            }))
                            .then(() => {
                                state.head = {
                                    data: res,
                                    type: "json"
                                }
                                Entities
                                    .destroy(criteria)
                                    .then(() => {
                                        Promise
                                            .all(res.map((item) => {
                                                return new Promise( (resolve,reject) => { 
                                                            del(`./api/models/${item.identity}.js`)
                                                                .then (() => { resolve(`./api/models/${item.identity}.js`)})
                                                                .catch((e) => { reject(new DDLDropImplError(e.toString()))})
                                                        })
                                            }))
                                            .then(() => {
                                                storageUtils
                                                    .reloadORM(sails)
                                                    .then(() => { resolve(state) })
                                                    .catch((e) => { reject(new DDLDropImplError(e.toString()))})
                                                })
                                            .catch((e) => { reject(new DDLDropImplError(e.toString()))})
                                    })
                                    .catch((e) => { reject(new DDLDropImplError(e.toString()))})    
                                })
                                .catch((e) => { reject(new DDLDropImplError(e.toString()))})  
                            })
                        .catch((e) => { reject(new DDLDropImplError(e.toString()))}) 
                    })
                    .catch((e) => { reject(new DDLDropImplError(e.toString()))})
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
