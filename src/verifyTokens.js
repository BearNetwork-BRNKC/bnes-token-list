const fs = require('fs');
const https = require('https');

const RPC_URL = process.env.BNES_RPC_URL || 'https://bnes-proxy.bearnetworkchain.workers.dev/';
const TOKENS_FILE = './src/tokens/bearnetworkchain.json';

function rpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1
    });

    const url = new URL(RPC_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname || '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`${method} error: ${parsed.error.message} (code ${parsed.error.code})`));
          } else {
            resolve(parsed.result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse RPC response: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`RPC request failed: ${err.message}`)));
    req.write(body);
    req.end();
  });
}

function decodeString(hex) {
  if (!hex || hex === '0x') return null;
  const data = hex.slice(2);
  if (data.length < 128) return null;
  const offset = parseInt(data.slice(0, 64), 16);
  if (offset !== 64) return null;
  const length = parseInt(data.slice(64, 128), 16);
  if (length <= 0 || length > 256) return null;
  const stringHex = data.slice(128, 128 + length * 2);
  try {
    return Buffer.from(stringHex, 'hex').toString('utf-8');
  } catch {
    return null;
  }
}

async function verifyToken(token) {
  const { address, symbol, name, decimals } = token;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid address format: ${address}`);
  }

  const code = await rpcCall('eth_getCode', [address, 'latest']);
  if (!code || code === '0x' || code === '0x0') {
    throw new Error(`No contract deployed at ${address}`);
  }

  const symbolEncoded = '0x95d89b41';
  const symbolResult = await rpcCall('eth_call', [{ to: address, data: symbolEncoded }, 'latest']);
  if (!symbolResult || symbolResult === '0x') {
    throw new Error(`symbol() reverted or returned empty for ${address}`);
  }
  const symbolDecoded = decodeString(symbolResult);
  if (!symbolDecoded || symbolDecoded.toLowerCase() !== symbol.toLowerCase()) {
    throw new Error(`symbol mismatch: expected ${symbol}, got ${symbolDecoded || 'null'}`);
  }

  const decimalsEncoded = '0x313ce567';
  const decimalsResult = await rpcCall('eth_call', [{ to: address, data: decimalsEncoded }, 'latest']);
  if (!decimalsResult || decimalsResult === '0x') {
    throw new Error(`decimals() reverted or returned empty for ${address}`);
  }
  const decimalsDecoded = parseInt(decimalsResult, 16);
  if (decimalsDecoded !== decimals) {
    throw new Error(`decimals mismatch: expected ${decimals}, got ${decimalsDecoded}`);
  }

  const nameEncoded = '0x06fdde03';
  const nameResult = await rpcCall('eth_call', [{ to: address, data: nameEncoded }, 'latest']);
  if (!nameResult || nameResult === '0x') {
    throw new Error(`name() reverted or returned empty for ${address}`);
  }
  const nameDecoded = decodeString(nameResult);
  if (!nameDecoded || nameDecoded.toLowerCase() !== name.toLowerCase()) {
    throw new Error(`name mismatch: expected ${name}, got ${nameDecoded || 'null'}`);
  }
}

async function main() {
  const raw = fs.readFileSync(TOKENS_FILE, 'utf8');
  const tokens = JSON.parse(raw);

  if (!Array.isArray(tokens)) {
    console.error('Token list must be an array');
    process.exit(1);
  }

  if (tokens.length === 0) {
    console.log('Token list is empty, nothing to verify');
    process.exit(0);
  }

  console.log(`Verifying ${tokens.length} token(s) on ${RPC_URL}...`);

  for (const token of tokens) {
    console.log(`Checking ${token.symbol} (${token.address})...`);
    try {
      await verifyToken(token);
      console.log(`  ✓ ${token.symbol} verified`);
    } catch (err) {
      console.error(`  ✗ ${token.symbol} failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('All tokens verified successfully');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
