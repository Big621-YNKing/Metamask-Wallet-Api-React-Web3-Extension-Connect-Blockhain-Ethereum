/**
 * MetaMask write helpers.
 *
 * The swaps subgraph used by queries.js is read-only, so sending and
 * receiving ETH must be performed through the injected wallet provider.
 */

function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not available');
  }

  return window.ethereum;
}

function toHexValue(value) {
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value;
  }

  if (typeof value === 'bigint') {
    return `0x${value.toString(16)}`;
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const amount = BigInt(value);
    return `0x${amount.toString(16)}`;
  }

  throw new TypeError('Transaction value must be a wei amount or hexadecimal string');
}

/**
 * Write and submit a transaction through MetaMask.
 * @param {{to: string, value?: string|number|bigint, data?: string}} transaction
 * @returns {Promise<string>} The submitted transaction hash.
 */
export async function writeTransaction({ to, value = 0, data } = {}) {
  if (!to) {
    throw new Error('A destination address is required');
  }

  const provider = getProvider();
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  const from = accounts?.[0];

  if (!from) {
    throw new Error('No MetaMask account is connected');
  }

  const params = {
    from,
    to,
    value: toHexValue(value),
  };

  if (data) {
    params.data = data;
  }

  return provider.request({
    method: 'eth_sendTransaction',
    params: [params],
  });
}

/**
 * Send ETH to an address. `value` is specified in wei.
 * @returns {Promise<string>} The submitted transaction hash.
 */
export async function sendTransaction(to, value, data) {
  return writeTransaction({ to, value, data });
}

/**
 * Return the connected address that can be used to receive funds.
 * @returns {Promise<string>} The wallet receive address.
 */
export async function receive() {
  const provider = getProvider();
  const accounts = await provider.request({ method: 'eth_requestAccounts' });

  if (!accounts?.[0]) {
    throw new Error('No MetaMask account is connected');
  }

  return accounts[0];
}

/**
 * Alias with a descriptive name for callers that prefer it.
 */
export const getReceiveAddress = receive;
