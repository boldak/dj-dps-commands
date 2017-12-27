let util = require("util");
let Promise = require("bluebird");
let MD5 = require('object-hash').MD5;




module.exports =  {
    name: "cache.get",
    synonims: {
        "cache.get": "cache.get"
    },
    
    defaultProperty: {
      "cache.get": "id"  
    },

    execute: (command,  state) => {
        return new Promise(function(resolve, reject) {
            
            if(!command.settings.id && !command.settings.sid) reject(require('./error')("Cannot get cached data: id and sid indentity is undefined"))
            let filter = (command.settings.id) ? { id: command.settings.id } : {}
            filter = (filter.id) ? filter : {hash: MD5(command.settings.sid)}
            
            Cache.findOne(filter)
            .then((res) =>{
               if(!res) reject(new require('./error')(`Cached data for ${JSON.stringify(command.settings)} is undefined.`))
               
               state.head = {
                    data: res,
                    type:"json"
                }
                resolve(state)
            })
            .catch((e) => {reject(require('./error')(e.toString()))})
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