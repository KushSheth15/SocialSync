import * as dotenv from 'dotenv';
dotenv.config();

import {server} from './app';
import logger from './logger';
import db from './sequelize-client';

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await db.sequelize.sync({ force: false });
    logger.info('Database Connected Successfully ✌');

    server.listen(PORT, () => {
      logger.info(`Server is running at http://localhost:${PORT} 🚀 `);
    });
  } catch (error) {
    logger.error('Unable to start server : ', error);
  }
};

startServer();
