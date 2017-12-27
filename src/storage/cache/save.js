let util = require("util");
let Promise = require("bluebird");
let MD5 = require('object-hash').MD5;




module.exports =  {
    name: "cache.save",
    synonims: {
        "cache.save": "cache.save"
    },
    
    defaultProperty: {
      "cache.save": "data"  
    },

    execute: (command,  state) => {
        return new Promise(function(resolve, reject) {
            
            command.settings.identity = command.settings.sid || state.instance.script();
            command.settings.data = command.settings.data || state.head.data;
            command.settings.data = (util.isArray(command.settings.data) && command.settings.data.length == 0) ? {} : command.settings.data;
            
            Cache.findOne({hash:MD5(command.settings.identity)})
                .then( (res) => {
                    if (res){
                        Cache.update(
                            {hash:MD5(command.settings.identity)},
                            {
                                value: command.settings.data,
                                hash : MD5(command.settings.identity)
                            }
                        ).then((res) => {
                            state.head = {
                                data: res,
                                type:"json"
                            }
                            resolve(state)
                        })
                        .catch((e) => {reject(require('./error')(e.toString()))})
                    }else{
                        Cache.create(
                            {
                                value: command.settings.data,
                                hash : MD5(command.settings.identity)
                            }
                        ).then((res) => {
                            state.head = {
                                data: res,
                                type:"json"
                            }
                            resolve(state)
                        })
                        .catch((e) => {reject(require('./error')(e.toString()))})                      
                    }   
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