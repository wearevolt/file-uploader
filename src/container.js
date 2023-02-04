const values = {};

module.exports = {
  register(name, object) {
    values[name] = object;
  },
  resolve(name) {
    return values[name];
  },
};
