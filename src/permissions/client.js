var Promise = require("bluebird");


var ClientError = function(message) {
    this.message = message;
    this.name = "Command 'cache' implementation error";
}
ClientError.prototype = Object.create(Error.prototype);
ClientError.prototype.constructor = ClientError;



var prepareCachedResult = function(d){
  d = (util.isArray(d))? d[0] : d;
  d = d || {};
  return {
    data: d.value,
    data_id: d.id,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  }
}

var impl = function(data, params){
	return new Promise(function(resolve,reject){
		Cache
          .save("process",params.script,data,{})
          .then(function(result){
            resolve(prepareCachedResult(result))
          })
          .catch(function(e){
            reject(new CacheImplError(e.toString()))
          })
	})
}

module.exports =  {
    name: "client",
    synonims: {
        "client": "client"
    },
    
    defaultProperty: {},

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            let data = {
                                    
                client: (state.client)
                    ? {
                        user: state.client.user || "undefined",
                        app: state.client.app || "undefined"
                    }
                    : "undefined"
            }
            state.head = {
                        type: "json",
                        data: data
                    }
            resolve(state)
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