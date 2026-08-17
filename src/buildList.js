const { version } = require("../package.json");
const bearnetworkchain = require("./tokens/bearnetworkchain.json");

module.exports = function buildList() {
  const parsed = version.split(".");
  const bnesList = {
    name: "BearNetworkChain Official",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    logoURI: "ipfs://QmQqhH28QpUrreoRw5Gj8YShzdHxxVGMjfVrx3TqJNLSLv",
    keywords: ["bearnetworkchain", "bnes", "default"],
    tokens: [...bearnetworkchain]
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };
  return bnesList;
};
