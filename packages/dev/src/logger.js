import chalk from 'chalk';
import ora from 'ora';

/**
 * @typedef {object} Logger
 * @property {(...args: any[]) => void} log
 * @property {(message: string) => void} info
 * @property {(message: string) => void} progress
 * @property {(message: string, time?: number) => void} success
 * @property {(message: string) => void} warn
 * @property {(err: any) => void} error
 */

export class ConsoleLogger {
  constructor() {
    this.spinner = ora();
  }

  /**
   * @param {string} message
   */
  progress(message) {
    if (this.spinner.isSpinning) {
      this.spinner.text = message;
    } else {
      this.spinner.start(message);
    }
  }

  /**
   * @param {any[]} args
   */
  log(...args) {
    if (this.spinner.isSpinning) {
      this.spinner.stop();
    }
    console.log(...args);
  }

  /**
   * @param {string} message
   */
  info(message) {
    this.spinner.info(message);
  }

  /**
   * @param {string} message
   * @param {number} [time]
   */
  success(message, time) {
    if (time) {
      message = `${message} ${chalk.gray(`(${prettifyTime(time)})`)}`;
    }
    this.spinner.succeed(message);
  }

  /**
   * @param {string} message
   */
  warn(message) {
    this.spinner.warn(message);
  }

  /**
   * @param {any} err
   */
  error(err) {
    const message = (err || 'Unknown error').toString();
    this.spinner.fail(message);
  }
}

/**
 * The current logger.
 * @type {Logger}
 */
export let logger = new ConsoleLogger();

/**
 * Set the logger implementation.
 * @param {Logger} value
 */
export function setLogger(value) {
  logger = value;
}

/**
 * @param {number} time
 */
export function prettifyTime(time) {
  return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`;
}
