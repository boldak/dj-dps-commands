
class CacheImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "cache error";
  }
}

module.exports = (message) => new CacheImplError(message)