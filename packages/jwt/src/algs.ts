export const algToHash: Record<string, string> = {
  RS256: 'SHA-256',
  RS384: 'SHA-384',
  RS512: 'SHA-512'
};

export const algs = Object.keys(algToHash);
