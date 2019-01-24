let util = require("util");
let _ = require("lodash-node");

let TransposeImplError = function(message) {
    this.message = message;
    this.name = "Command 'collection.map' implementation error";
}
TransposeImplError.prototype = Object.create(Error.prototype);
TransposeImplError.prototype.constructor = TransposeImplError;


module.exports = {
    name: "matrix.transpose",
    
    synonims: {
        "matrix.transpose": "matrix.transpose",
        "m.transpose": "matrix.transpose"    
    },

    "internal aliases": {},

    defaultProperty: {},

    execute: function(command, state, config) {
        
        if (!util.isArray(state.head.data)) 
            throw new TransposeImplError("Incompatible context type: '" + (typeof state.head.data)+".")
        
        if (state.head.data.length == 0) 
            throw new TransposeImplError("Cannot transpose empty matrix.")
        
        
        if (state.head.data.filter( r => !util.isArray(r)).length > 0) 
            throw new TransposeImplError("Incompatible rows type.")
        
        try {

            let res = [];

            state.head.data[0].forEach( (r, index) => {
                res.push(state.head.data.map(item => item[index]))
            })




            state.head = {
                data: res,
                type: "json"
            }

        } catch (e) {
            throw new TransposeImplError(e.toString())
        }

        return state;
    },

    help: {
        synopsis: "Build groups from context via javascript callback",

        name: {
            "default": "group",
            synonims: []
        },
        input:["json"],
        output:"json",
        "default param": "mapper",

        params: [{
            name: "transform",
            synopsis: "javascript callback function(item){<return {key, value}>} via bindable (required)",
            type:["bindable"],
            synonims: [],
            "default value": "none"
        }],

        example: {
            description: "Build list of tags",
            code:   "<?javascript\r\n   \r\n   $context.mapper = function(d){\r\n       return {\r\n           key:d, \r\n           value:d\r\n           \r\n       }\r\n   };\r\n   \r\n   $context.transform = function(d){\r\n        return {\r\n            key:d.key, \r\n            count: d.values.length\r\n        }\r\n   };\r\n   \r\n   $context.criteria = function(a,b){\r\n       return b.count-a.count\r\n   };\r\n   \r\n?>\r\n\r\nmeta('$..dataset.topics.*')\r\n\r\ngroup({{mapper}})\r\nmap({{transform}})\r\nsort({{criteria}})\r\n\r\nextend()\r\ntranslate()\r\n"

        }
    }
}
