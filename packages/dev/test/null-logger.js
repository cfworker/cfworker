export class NullLogger {
  constructor() {}

  /**
   * @param {string} message
   */
  progress(message) {}

  /**
   * @param {any[]} args
   */
  log(...args) {}

  /**
   * @param {string} message
   */
  info(message) {}

  /**
   * @param {string} message
   * @param {number} [time]
   */
  success(message, time) {}

  /**
   * @param {string} message
   */
  warn(message) {}

  /**
   * @param {any} err
   */
  error(err) {}
}
