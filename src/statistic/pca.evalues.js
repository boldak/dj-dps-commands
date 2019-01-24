let STAT = require("../lib/stat")
let util = require("util");
let s_util = require("./utils");
let StatImplError = require("./staterror");
let pca = require("../lib/pca").pca;


module.exports = {
    name: "stat.pca.eigenValues",

    synonims: {
        "stat.pca.eigenValues": "stat.pca.eigenValues",
        "s.pca.eigenValues": "stat.pca.eigenValues",
        "stat.pca.eValues": "stat.pca.eigenValues",
        "s.pca.eValues": "stat.pca.eigenValues",
        "stat.pca.evalues": "stat.pca.eigenValues",
        "s.pca.evalues": "stat.pca.eigenValues",
        "stat.pca.values": "stat.pca.eigenValues",
        "s.pca.values": "stat.pca.eigenValues"
    },

    "internal aliases":{
        "mapper": "mapper",
        "by": "mapper",
        "named": "named",
        "name": "named",
        "return": "named"
    },

    defaultProperty: {},

    execute: function(command, state, config) {

        
        if(!command.settings.mapper)
            throw new StatImplError("PCA mapper not defined")
        
        let mapper = command.settings.mapper;

        let attr_names = [];

        if(!util.isFunction(mapper)){
            attr_names = (util.isArray( mapper)) ? mapper : [ mapper ]
            mapper = item => attr_names.map( d => item[d])                
        }

        command.settings.named = command.settings.named || "pc"
        

        try {
            
            let res =  
                pca(
                    s_util.matrix2floats(
                        state.head.data.map(mapper)
                    )
                ).eigenValues.map( ( r, index ) => r[index] )

            let out = [];
            res.forEach( v => { out = out.concat(v)})    
            
            state.head = {
                type: "json",
                data: out
            }

        } catch (e) {
            throw new StatImplError(e.toString())
        }
        return state;
    },

    help: {
        synopsis: "Add rank",

        name: {
            "default": "rank",
            synonims: []
        },
        input:["table"],
        output:"table",
        "default param": "indexes",
        params: [{
            name: "direction",
            synopsis: "Direction of iteration (optional)",
            type:["Rows", "row", "Columns", "col"],
            synonims: ["direction", "dir", "for"],
            "default value": "Columns"
        }, {
            name: "indexes",
            synopsis: "Array of 0-based indexes of items that will be ranked (optional)",
            type:["array of numbers"],
            synonims: ["indexes", "items"],
            "default value": []
        }, {
            name: "asc",
            synopsis: "Define order (optional)",
            type:["A-Z", "az", "direct", "Z-A", "za", "inverse"],
            synonims: ["order", "as"],
            "default value": "A-Z"
        }],
        example: {
            description: "Rank first column values",
            code:   "load(\r\n    ds:'47611d63-b230-11e6-8a1a-0f91ca29d77e_2016_02',\r\n    as:\"dataset\"\r\n)\r\nproj([\r\n  { dim:'time', role:'row', items:[] },\r\n  { dim:'indicator', role:'col', items:[] }\r\n])\r\n\r\nrank(for:\"col\",items:[0],as:\"az\")\r\n\r\norder(by:0, as:\"az\")\r\n\r\n"
        }
    }
}

