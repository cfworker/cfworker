/** @type {ProxyHandler<any>} */
export const scopeGuard = {
  has: (obj, propertyKey) => {
    return propertyKey in obj;
  },
  get: (obj, propertyKey) => {
    if (obj.hasOwnProperty(propertyKey)) {
      return obj[propertyKey];
    }
    const error = new ReferenceError(
      `${propertyKey.toString()} is not defined`
    );
    Error.captureStackTrace(error, scopeGuard.get);
    throw error;
  },
  set: (obj, propertyKey, value) => {
    return (obj[propertyKey] = value);
  },
  deleteProperty: () => {
    throw new Error('"deleteProperty" not implemented');
  },
  ownKeys: () => {
    throw new Error('"ownKeys" not implemented');
  },
  defineProperty: () => {
    throw new Error('"defineProperty" not implemented');
  },
  getOwnPropertyDescriptor: (...args) => {
    console.log('getOwnPropertyDescriptor', ...args);
    throw new Error('"getOwnPropertyDescriptor" not implemented');
  }
};
