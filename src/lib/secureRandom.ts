/**
 * Secure random number generator utilities using the Web Crypto API.
 * This replaces Math.random() to provide cryptographically strong random values
 * and avoid bias in shuffling algorithms.
 */

// Ensure we have access to the crypto API
const getCrypto = () => {
  if (typeof crypto !== 'undefined') {
    return crypto;
  }
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  // Fallback for Node.js environments where global crypto might not be set (though it should be in Node 18+)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('node:crypto').webcrypto;
};

/**
 * Returns a cryptographically strong random number between 0 (inclusive) and 1 (exclusive).
 * Replacement for Math.random().
 */
export function secureRandom(): number {
  const array = new Uint32Array(1);
  getCrypto().getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/**
 * Returns a cryptographically strong random integer between min (inclusive) and max (exclusive).
 */
export function secureRandomInt(min: number, max: number): number {
  if (min >= max) return min;
  return Math.floor(secureRandom() * (max - min)) + min;
}

/**
 * Returns a random element from an array using secure randomness.
 */
export function pickRandom<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[secureRandomInt(0, array.length)];
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm and secure randomness.
 * This avoids the bias introduced by sort(() => Math.random() - 0.5).
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
