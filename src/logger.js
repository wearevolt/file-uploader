class Logger {
  constructor(isDebug = false) {
    this.isDebug = isDebug;
  }

  debug(...msg) {
    if (this.isDebug) {
      console.debug('[Debug]', ...msg);
    }
  }

  log(...msgs) {
    console.log('[Log]', ...msgs);
  }

  error(...msgs) {
    console.error('[Error]', ...msgs);
  }
}
