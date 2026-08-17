# BearNetworkChain Token List

Official token list for BearNetworkChain (BNES), used by MetaMask and other wallets.

## NPM versioning

This package follows [Semantic Versioning](https://semver.org/):

- **Major** (`1.x.x`): Incremented when tokens are removed or contract addresses are changed
- **Minor** (`x.1.x`): Incremented when new tokens are added
- **Patch** (`x.x.1`): Incremented for metadata updates (logos, names, symbols, decimals)

When merging a PR that changes `src/tokens/bearnetworkchain.json`, also bump the `version` in `package.json` accordingly.

## CI/CD verification

Every PR and push to this repository runs automated checks:

1. **Schema validation** - Ensures the token list matches the JSON schema
2. **Uniqueness checks** - No duplicate addresses, symbols, or names
3. **Checksum validation** - All addresses are valid checksummed Ethereum addresses
4. **On-chain verification** - Each token is verified against the BearNetworkChain RPC:
   - Contract code exists at the address
   - `symbol()` returns the expected symbol
   - `decimals()` returns the expected decimals
   - `name()` returns the expected name

### Required GitHub secret

The on-chain verification step requires the `BNES_RPC_URL` secret to be set in the repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
Name: BNES_RPC_URL
Value: https://bnes-proxy.bearnetworkchain.workers.dev/
```

If the secret is not set, the on-chain verification step will fail.

## Usage

```json
{
  "name": "BearNetworkChain Tokens",
  "url": "https://raw.githubusercontent.com/BearNetwork-BRNKC/bnes-token-list/main/build/bnes-token-list.json"
}
```

## Logo guidelines

Token logos are stored in this repository under `src/logos/` and served via GitHub raw URLs.

### Directory structure

```
src/logos/
├── 0x1234...abcd.png
├── 0x5678...efgh.svg
└── ...
```

### Naming convention

- File name must be the **checksummed contract address** in lowercase
- Example: `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png`

### Technical requirements

- **Format**: PNG or SVG
- **Recommended size**: 128x128 px or 256x256 px
- **File size**: Under 100KB
- **Background**: Transparent or solid color
- **Style**: Square aspect ratio, recognizable at small sizes

### How to reference

In `src/tokens/bearnetworkchain.json`, use the GitHub raw URL:

```json
{
  "chainId": 641230,
  "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "name": "Token Name",
  "symbol": "SYMBOL",
  "decimals": 18,
  "logoURI": "https://raw.githubusercontent.com/BearNetwork-BRNKC/bnes-token-list/main/src/logos/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
}
```

### Submitting a logo

1. Add your logo file to `src/logos/` following the naming convention above
2. Reference it in the token entry using the format shown
3. Ensure the image meets the technical requirements
4. Submit a PR with both the logo file and the `bearnetworkchain.json` update

### Alternative: external logo URLs

You may also provide an externally hosted logo URL if you cannot submit to this repository:

```json
{
  "logoURI": "https://your-project.com/logo.png"
}
```

**Note**: External URLs must be permanently accessible and CORS-compatible. GitHub raw URLs are preferred for stability.

## Adding a token

To request adding a token to this list, [file an issue](https://github.com/BearNetwork-BRNKC/bnes-token-list/issues/new?assignees=&labels=token+request&template=token-request.md&title=Add+%7BTOKEN_SYMBOL%7D%3A+%7BTOKEN_NAME%7D).

### Required information

Please provide the following information for your token:

- **Token Name** - The full name of the token (e.g. `BearNetworkChain`)
- **Token Symbol** - The token symbol (e.g. `BRNKC`)
- **Contract Address** - The ERC20 contract address on BearNetworkChain (chain ID `641230`)
- **Decimals** - The number of decimals the token uses (e.g. `18`)
- **Logo URI** - A URL to the token's logo image (recommended: 128x128 PNG/SVG, hosted on GitHub or a stable CDN)
- **Official Homepage** - Link to the token's official website
- **CoinGecko / CoinMarketCap** - Link to the token's page (if available)

### Token entry format

All tokens are maintained in a single file:

```
src/tokens/bearnetworkchain.json
```

This is the canonical source for the BNES token list. The build script (`src/buildList.js`) reads this file and generates the final `build/bnes-token-list.json`.

Each token entry must follow this format:

```json
{
  "chainId": 641230,
  "address": "0x...",
  "name": "Token Name",
  "symbol": "SYMBOL",
  "decimals": 18,
  "logoURI": "https://example.com/logo.png"
}
```

**Field requirements:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chainId` | integer | Yes | Must be `641230` (BearNetworkChain) |
| `address` | string | Yes | ERC20 contract address, checksummed, `0x` + 40 hex chars |
| `name` | string | Yes | Full token name, max 64 chars |
| `symbol` | string | Yes | Token symbol, max 16 chars |
| `decimals` | integer | Yes | Between 0 and 255 |
| `logoURI` | string | No | URL to token logo image |

**Validation rules:**
- No duplicate `address` within the same `chainId`
- No duplicate `symbol` within the same `chainId`
- No duplicate `name` within the same `chainId`
- `address` must be a valid checksummed Ethereum address

### Review process

1. Submit a PR or issue with the required information above.
2. The team reviews the submission for legitimacy and accuracy.
3. Approved tokens are merged and published automatically.

### Disclaimer

Filing an issue or PR does not guarantee addition to this token list. We do not review token addition requests in any particular order, and we do not guarantee that we will review your request.
