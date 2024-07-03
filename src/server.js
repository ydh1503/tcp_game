import net from 'net';
import initServer from './init/index.js';
import { config } from './config/config.js';
import { onConnection } from './events/onConnection.js';

// const PORT = 5555;

const server = net.createServer(onConnection);

initServer()
  .then(() => {
    server.listen(config.server.port, config.server.host, () => {
      console.log(`Echo server listening on port ${config.server.port}`);
      console.log(server.address());
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
