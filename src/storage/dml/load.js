var iconv = require('iconv-lite');
// iconv.extendNodeEncodings();


var Promise = require("bluebird");
// var Cache = require("../Cache");
// var logger = require("dj-utils").log.global;
// var I18N = require("dj-utils").i18n;
var jp = require("jsonpath");
var http = require('request-promise');
var js = require("dj-dps-commands/src/javascript/eval").implementation;
var set = require("dj-dps-commands/src/var/set").implementation;
var getProperty = require("dj-utils").getProperty;
var parseQuery = require("dj-utils").reference.parse;


var SourceImplError = function(message) {
    this.message = message;
    this.name = "Command 'source' implementation error";
}
SourceImplError.prototype = Object.create(Error.prototype);
SourceImplError.prototype.constructor = SourceImplError;


// var parseQuery = (str) => {

//     let filterRE        = /(?!\(){([\S\s]*)}(?=\))/gi;
//     let collectionRE    = /([a-zA-Z_]+[a-zA-Z_0-9]*)(?=\?)/gi;
//     let pathRE          = /(?!}\.)([a-zA-Z_0-9\[\]][a-zA-Z_0-9\[\]\.]*)$/gi; 

//     let collection = str.match(collectionRE);
//     if (collection == null) throw new SourceImplError('Collection or filter cannot be recognized');

//     let filter = str.match(filterRE);
//     if (filter == null) throw new SourceImplError('Collection or filter cannot be recognized');


//     let path = str.match(pathRE);
    
//     return {
//         collection: collection[0],
//         filter: filter[0],
//         path: (path) ? path[0] : null
//     } 

// }

// var getByQuery = (query,encode) => {
//     let q = parseQuery(query);

//     try{
        
//         // eval("var filterObject = "+q.filter);
//         return new Promise(function(resolve,reject){
//             if(!sails.models[q.collection])
//                 reject(new SourceImplError("Entity collection '" + q.collection + "' is not available"))
//             if(typeof sails.models[q.collection] != "object")
//                 reject(new SourceImplError("Entity collection '" + q.collection + "' is not available"))
//             sails.models[q.collection].find(q.filter)
//                 .then((founded) =>{
//                     try{
//                         if(founded.length == 0) reject (new SourceImplError("Object not found"))
//                         if(founded.length > 1) reject (new SourceImplError("Find more than one object"))
//                         resolve(getProperty(founded[0], q.path))    
//                     }catch (e) {
//                         reject (new SourceImplError(e.toString()))
//                     }
//                 })
//         })


//     } catch (e) {
//         throw new SourceImplError(e)
//     }

// }


// var getDataset = function(id, locale) {
//     return new Promise(function(resolve, reject) {
//         Dataset.findOne({ "dataset/id": id, "commit/HEAD": true })
//             .then(function(dataset) {
//                 if (!dataset) {
//                     reject(new SourceImplError("Dataset not found"))
//                 }
//                 Dictionary.find({})
//                     .then(function(json) {
//                         i18n = new I18N(json);
//                         dataset.data = i18n.translate(dataset.data, locale);
//                         dataset.metadata = i18n.translate(dataset.metadata, locale);

//                         for (i in dataset.metadata.dimension) {
//                             dataset.metadata.dimension[i].values =
//                                 i18n.translate(dataset.metadata.dimension[i].values, locale)
//                             dataset.metadata.dimension[i].label = i18n.translate(dataset.metadata.dimension[i].label, locale);
//                         }
//                         resolve(dataset)
//                     })
//                     .catch(function(e) { reject(new SourceImplError(e.toString())) })
//             })
//             .catch(function(e) {
//                 reject(new SourceImplError(e.toString()))
//             })
//     })
// }

// var getCache = function(id) {
//     return new Promise(function(resolve, reject) {
//         Cache
//             .getById(id)
//             .then(function(cached) {
//                 if(!cached)
//                     throw new SourceImplError("Cannot get data by id: "+id+" "+error)
//                 resolve(cached.value)
//             })
//             .catch(function(error){
//                 reject(new SourceImplError("Cannot get data by id: "+id+" "+error))
//             })
//     })
// }

var getUrl = function(url,encode) {
    return new Promise(function(resolve, reject) {
        try {
            encode = encode || "utf8";
            if(['win1251','utf8'].indexOf(encode)<0){
                reject(new SourceImplError("Encoding "+ encode+" not recognized. Use 'win1251' or 'utf8'"))
                
            }else{

                var options = {
                    // localAddress: url,
                    uri: url,
                    method: "get",
                    encoding: encode
                }

                http(options)
                    .then(function(result) {
                       resolve(result)
                    })
                    .catch(function(e) {
                        reject(new SourceImplError(e.toString()))
                    })
            }
                    
        } catch(e) {
            reject(new SourceImplError(e.toString()))
        }    
    })
}


var impl = function(params) {
    // if (params.query){
    //     return getByQuery(params.query, params.encode)
    // }

    // if (params.dataset) {
    //     return getDataset(params.dataset, params.locale)
    // }

    // if (params.cache) {
    //     return getCache(params.cache)
    // }

    if (params.url) {
        return getUrl(params.url, params.encode)
    }

    throw new SourceImplError("Data not found");
}

module.exports = {
    name: "dml.load",

    synonims: {
        // "source": "source",
        // "src": "source",
        "dml.load": "dml.load"
        
    },

    "internal aliases": {
        // "dataset":  "dataset",
        // "ds":       "dataset",
        
        // "cache":    "cache",

        "url":      "url",
        "uri":      "url",
        "href":     "url",

        "as":       "as",
        "type":     "as",
        "cast":     "as",

        // "query":    "query",
        // "from":     "query",
        // "ref":      "query",

        "to":       "var",
        "var":      "var",
        "into":     "var",

        "encode":       "encode",
        "encoding":     "encode"
    },

    defaultProperty: {
        "dml.load" : "url"
    },

    execute: function(command, state) {
       return new Promise(function(resolve, reject) {
            state.locale = (state.locale) ? state.locale : "en";
            command.settings.locale = state.locale;
            command.settings.as = command.settings.as || "string"
            impl(command.settings)
                .then(function(result) {
                    if (command.settings.as == "json") {
                        
                        if (util.isString(result)) {
                            result = JSON.stringify(result)
                            result = JSON.parse(result)
                        }
                        
                        state.head = {
                            type: "json",
                            data: result
                        }
                        if (command.settings.var) {
                            state = set(command.settings.var, '', state)
                        }
                        resolve(state);
                    } else if (command.settings.as == "javascript") {
                        if (util.isString(result)) {
                            state.head = {
                                type: typeof result,
                                data: result
                            };
                            state = js(state);
                            if (command.settings.var) {
                                state = set(command.settings.var, '', state)
                            }

                            resolve(state)
                        }
                    } else {
                        state.head = {
                            type: command.settings.as,
                            data: result
                        }
                        if (command.settings.var) {
                            state = set(command.settings.var, '', state)
                        }
                        resolve(state);
                    }
                })
                .catch(function(e) {
                    reject(e)
                })
        })
    },

    help: {
        synopsis: "Get data from source. Available sources: dataset, cached data, external url",
        name: {
            "default": "source",
            synonims: ["source", "src"]
        },
        "default param": "None. Shuld be assigned one from: 'dataset', 'cache', 'url'",

        input: ["any"],
        output: "type of fetched data",

        params: [{
            name: "dataset",
            synopsis: "UUID for dataset (optional). Use command 'meta()' for find datasets.",
            type: ["dataset UUID"],
            synonims: ["dataset", "ds"],
            "default value": "undefined"
        }, {
            name: "cache",
            synopsis: "UUID for cached data (optional). Use command 'cache()' for cache context. ",
            type: ["cached data UUID"],
            synonims: [],
            "default value": "undefined"
        }, {
            name: "url",
            synopsis: "Url for data (optional). You can process external data via url.",
            type: ["url"],
            synonims: ["url", "uri", "ref"],
            "default value": "undefined"
        }],
        example: {
            description: "Get data from various sources",
            code: "load(\n    ds:'47611d63-b230-11e6-8a1a-0f91ca29d77e_2016_02',\n    as:'dataset')\n\nload(\n    cache:'5855481930d9ae60277a474a',\n    as:'table'\n)\n\nimport(\n    url:'http://127.0.0.1:8080/api/resource/scripting-js.js',\n    as:'javascript'\n)\n\nload(\n    url:'http://127.0.0.1:8080/api/resource/scripting-csv.csv',\n    as:'csv'\n)\n\nload(\n    url:'http://127.0.0.1:8080/api/resource/scripting-xml.xml',\n    as:'xml'\n)\n\nload(\n    url:'http://127.0.0.1:8088',\n    as:'html'\n)\n"

        }

    }
}
