const withPWA = require('next-pwa');

const nextConfig = {
  reactStrictMode: true,
  pwa: {
    dest: 'public',
  },
  devIndicators: {
    autoPrerender: true,
  },
  webpackDevMiddleware: (config) => {
    // Solve compiling problem via vagrant
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 800, // delay before rebuilding
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/Lounge',
        destination: '/lounge',
      },
      {
        source: '/Token/:id',
        destination: '/token/:id',
      },
      {
        source: '/Token',
        destination: '/token/1',
      },
      {
        source: '/dashboard',
        destination: '/Dashboard',
      },

    ]
  },
  images: {
    domains: ['ipfs.io'],
  },
  env: {
    INFURA_API: process.env.INFURA_API,
    BRAND_NAME: process.env.BRAND_NAME,
    RAREPRESS: process.env.RAREPRESS,
    RAREPRESS_VERSION: process.env.RAREPRESS_VERSION,
    WALLET_ADDRESS: process.env.WALLET_ADDRESS,
    NEXT_PUBLIC_GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
    ADSENSE_KEY: process.env.ADSENSE_KEY,
    LAZY_NFT_KEY: process.env.LAZY_NFT_KEY,
    SECRETKEY: process.env.SECRETKEY,
    ETHERSCAN_API: process.env.ETHERSCAN_API,
    NOMICS_KEYS: process.env.NOMICS_KEYS,
    API_URL: process.env.API_URL,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    POLYGON_KEY: process.env.POLYGON_KEY,
    DEFENDER_KEY: process.env.DEFENDER_KEY,
    DEFENDER_PRIV: process.env.DEFENDER_PRIV
  },
};
module.exports = withPWA(nextConfig);
