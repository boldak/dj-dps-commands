
let Promise = require("bluebird");
let util = require("util");
let storageUtils = require("../utils");

class DMLUpdateImplError extends Error {
    constructor(message) {
        super(message);
        this.name = "dml.update error";
    }
}



var impl = (params, state)  => {
	return new Promise( (resolve, reject) => {
        storageUtils.access(state.client, params.collection, 'update' )
            .then(() => {
                let collection = sails.models[params.collection]
                let filterDB = (util.isFunction(params.where)) ? {} : params.where;
                let filterC = (util.isFunction(params.where)) ? params.where : ((item) => true);
                    collection
                        .find(filterDB)
                        .then((founded) => {
                            Promise.all(
                                founded
                                    .filter(filterC)
                                    .map((item,index) => collection.update({id:item.id}, params.as(item,index)))
                            )
                            .then((res) => {
                                resolve(res)
                            })
                            .catch((e) => {reject(new DMLUpdateImplError(e.toString()))})
                        })
                        .catch((e) => {reject(new DMLUpdateImplError(e.toString()))})
            })
            .catch((e) => {reject(new DMLUpdateImplError(e.toString()))})
  	})
}

module.exports =  {
    name: "dml.update",
    synonims: {
        "dml.update": "dml.update"
    },

    "internal aliases":{
        "collection": "collection",
        "object": "collection",
        "entity":"collection",
        "from": "collection",
        "for": "collection",
        "where":"where",
        "set":"as",
        "as":"as"
    },
    
    defaultProperty: {},

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            if(!command.settings.collection){
                reject(new DMLUpdateImplError("Entity collection is undefined"))
                return
            }
            if (!sails.models[command.settings.collection]) {
                reject(new DMLUpdateImplError("Entity collection '" + command.settings.collection + "' is not available"))
                return
            }
            if (typeof sails.models[command.settings.collection] != "object") {
                reject(new DMLUpdateImplError("Entity collection '" + command.settings.collection + "' is not available"))
                return
            }
            
            command.settings.where = command.settings.where || {}

            command.settings.as = command.settings.as || ((item,index) => item); 

            impl(command.settings, state)
                .then(function(result) {
                    state.head = {
                        type: "json",
                        data: result
                    }
                    resolve(state);
                })
                .catch(function(e) {
                    reject(new DMLUpdateImplError(e.toString()))
                })
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