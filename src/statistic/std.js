let STAT = require("../lib/stat")
let util = require("util");
let s_util = require("./utils");
let StatImplError = require("./staterror");



module.exports = {
    name: "stat.std",

    synonims: {
        "stat.std": "stat.std",
        "s.std": "stat.std"
    },

    "internal aliases":{
        "mapper": "mapper",
        "by": "mapper",
        "for": "mapper"
    },

    defaultProperty: {
        "stat.std": "mapper",
        "s.std": "mapper"
    },

    execute: function(command, state, config) {

        try {
            
            command.settings.mapper = (command.settings.mapper) ? command.settings.mapper : []        
            command.settings.mapper = (util.isArray(command.settings.mapper)) ? command.settings.mapper : [command.settings.mapper];

            command.settings.mapper = command.settings.mapper.map( f => ({ 
                    field: f,
                    values: s_util.array2floats(state.head.data.map( v => v[f]))
                })
            )
            
            let res = {
                statistic:"std"
            }

            command.settings.mapper.forEach( f => {
                res[f.field] = STAT.std(f.values)
            })
            
           state.head = {
                type: "json",
                data: res
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

