if (!Headers.prototype.forEach) {
  Headers.prototype.forEach = function(this: Headers, callback) {
    new Map((this as any) as Iterable<[string, string]>).forEach((v, k) =>
      callback(v, k, this)
    );
  };
}
