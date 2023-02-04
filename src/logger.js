const APP_PREFIX = '[FILE UPLOADER]';

class Logger {
  constructor(isDebug = false) {
    this.isDebug = isDebug;
  }

  debug(...msg) {
    if (this.isDebug) {
      this.console('debug', '[Debug]', ...msg);
    }
  }

  log(...msgs) {
    this.console('log', '[Log]', ...msgs);
  }

  error(...msgs) {
    this.console('error', '[Error]', ...msgs);
  }

  console(method, ...args) {
    console[method](APP_PREFIX, ...args);
  }
}

module.exports = {
  Logger,
};
