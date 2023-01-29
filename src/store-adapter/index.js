const { AdapterError } = require('../errors');
const { GDriveAdapter } = require('./store-adapter/gdrive');

class StoreAdapter {
  static async createAdapter(options) {
    if (options.gdrive) {
      return GDriveAdapter.createAdapter();
    }

    throw new AdapterError('You have to choose one of adapters');
  }
}

module.exports = {
  StoreAdapter,
};
