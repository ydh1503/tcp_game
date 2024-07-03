import { loadGameAssets } from './assets.js';

const initServer = async () => {
  try {
    await loadGameAssets();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

export default initServer;
