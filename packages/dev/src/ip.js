import fetch from 'node-fetch';

/**
 * @returns {Promise<string|null>}
 */
export async function getLocalhostIP() {
  const response = await fetch('https://get.geojs.io/v1/ip.json');
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.ip;
}
