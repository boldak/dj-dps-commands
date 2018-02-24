let Promise = require("bluebird");
let storageUtils = require("../utils");


class DMLInsertorUpdateImplError extends Error {
    constructor(message) {
        super(message);
        this.name = "dml.insertOrUpdate error";
    }
}



var impl = function(params, state) {
    return new Promise(function(resolve, reject) {
        storageUtils.access(state.client, params.collection, 'insert')
        .then(() => {
            var collection = sails.models[params.collection]
            if(params.value.id){
                collection
                .find({id:params.value.id})
                .then( res => {
                    if(res.length > 0){
                        resolve(collection.update({id:params.value.id}, params.value))
                    } else {
                        resolve(collection.create(params.value))            
                    }
                })
                .catch((e) => { reject(new DMLInsertorUpdateImplError(e.toString()))})    
            } else {
                resolve(collection.create(params.value))
            }
        })
        .catch((e) => { reject(new DMLInsertorUpdateImplError(e.toString()))})
    })
}

module.exports = {
    name: "dml.insertOrUpdate",

    synonims: {
        "dml.insertOrUpdate": "dml.insertOrUpdate",
        "dml.saveOrUpdate": "dml.insertOrUpdate",
        "dml.addOrUpdate": "dml.insertOrUpdate",
        "dml.putOrUpdate": "dml.insertOrUpdate",

    },

    "internal aliases": {
        "collection": "collection",
        "object": "collection",
        "entity": "collection",
        "into": "collection",
        "value": "value"
    },

    defaultProperty: {},

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            var model = command.settings.collection;
            if (!sails.models[model]) {
                reject(new DMLInsertorUpdateImplError("Entity collection '" + model + "' is not available"))
                return
            }
            if (typeof sails.models[model] != "object") {
                reject(new DMLInsertorUpdateImplError("Entity collection '" + model + "' is not available"))
                return
            }
            if (!command.settings.value) {
                reject(new DMLInsertorUpdateImplError("Value for '" + model + "' is not available"))
                return
            }

            // command.settings.value = (util.isArray(command.settings.value)) ? command.settings.value : [command.settings.values]

            impl(command.settings, state)
                .then(function(result) {
                    state.head = {
                        type: "json",
                        data: result
                    }
                    resolve(state);
                })
                .catch(function(e) {
                    reject(new DMLInsertorUpdateImplError(e.toString()))
                })
        })
    },

    help: {
        synopsis: "Save context into cache",
        name: {
            "default": "cache",
            synonims: ["cache", "save"]
        },
        "default param": "none",
        params: [],
        example: {
            description: "Save context into cache",
            code: "load(\n    ds:'47611d63-b230-11e6-8a1a-0f91ca29d77e_2016_02',\n    as:'json'\n)\nselect('$.metadata')\nextend()\ntranslate()\ncache()\nselect(\"$.data_id\")\n"
        }

    }
}