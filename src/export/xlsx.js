let XLSX = require("node-xlsx");
let util = require("util");
let query = require("dj-utils").query;
let plain = require("dj-utils").plain;
let mime = require('mime');
let convert = require("./xlsx-converter");
// let logger = require("../../../log").global;
let fs = require("fs");

let XLSXConverterError = function(message) {
    this.message = message;
    this.name = "XLSX converter error";
}
XLSXConverterError.prototype = Object.create(Error.prototype);
XLSXConverterError.prototype.constructor = XLSXConverterError;



let isWdcTable = data => data.header && data.body && data.metadata
let isWdcSource = data =>  (data.metadata && data.metadata.dataset && data.metadata.dimension && data.metadata.layout && data.data)
let exportWdcSource = data => convert(data)



let exportWdcTable = gen => {

    // logger.debug("EXPORT TABLE")

    let product = [{ name: "data", data: [] }, { name: "metadata", data: [] }];
    let dummyHeader = [];
    for (i in gen.body[0].metadata) { dummyHeader.push(null) }

    for (i in gen.header[0].metadata) {
        product[0].data
            .push(
                dummyHeader.concat(
                    new query()
                        .from(gen.header)
                        .map( item => item.metadata[i].label)
                        .get()
                )
            )
    }

    gen.body
        .map( item => item.metadata
                        .map( c => c.label )
                        .concat(item.value)
        )
        .forEach( item => { product[0].data.push(item) });

    product[1].data.push(["key", "value", "note"]);
    product[1].data.push(["type", gen.metadata.type, null]);
    product[1].data.push(["source", gen.metadata.source.dataset.id, gen.metadata.source.dataset.label]);

    gen.metadata.selection.forEach( item => {
        let s = "";
        let labels = [];
        if (item.IDList) {
            item.IDList.forEach( c => { labels.push(c.label) });
            s += item.IDList[0].dimensionLabel + " : " + labels.join(", ") + " as " + item.role;
        }
        s = ("") ? null : s;
        product[1].data.push(["selection", s, null]);
    });
    return product;
}

let exportArray = data => {

    let product = [{ name: "data", data: [] }]

    product[0].data.push(
        plain(data[0]).map( item => item.path )
    )

    data.forEach( row => {
        product[0].data.push( plain(row).map( item => item.value ) )
    })

    return product;
}

let exportObject = data => {

    data = plain(data);
    let product = [{ name: "data", data: [] }]
    product[0].data.push(["key", "value"])
    data.forEach(function(row) {
        product[0].data.push([row.path, row.value])
    })

    return product;
}





module.exports = function(data, params, locale, script, scriptContext) {

    try {
        if (isWdcSource(data)) {
            fs.writeFileSync("./.tmp/public/downloads/" + params.file, XLSX.build(exportWdcSource(data)));
            return { url: "/downloads/" + params.file }
        }
        if (isWdcTable(data)) {
            fs.writeFileSync("./.tmp/public/downloads/" + params.file, XLSX.build(exportWdcTable(data)));
            return { url: "/downloads/" + params.file }
        }
        if (util.isArray(data)) {
            fs.writeFileSync("./.tmp/public/downloads/" + params.file, XLSX.build(exportArray(data)));
            return { url: "/downloads/" + params.file }
        }
        if (util.isObject(data)) {
            fs.writeFileSync("./.tmp/public/downloads/" + params.file, XLSX.build(exportObject(data)));
            return { url: "/downloads/" + params.file }
        }
    } catch (e) {
        throw new XLSXConverterError(e.toString());
    }
    throw new XLSXConverterError("converter not found. Supported context types: dataset, table, array, object.");

}
