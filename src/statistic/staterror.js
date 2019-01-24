let StatImplError = function(message) {
    this.message = message;
    this.name = "Statistic implementation error";
}

StatImplError.prototype = Object.create(Error.prototype);
StatImplError.prototype.constructor = StatImplError;

module.exports = StatImplError
