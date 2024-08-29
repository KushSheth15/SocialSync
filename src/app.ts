/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as dotenv from 'dotenv';
import express from 'express';

import localizationMiddleware from './middlewares/localization';
import router from './routes/index.routes';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/v1',router);

app.use(localizationMiddleware);

app.use((err: any, req: any, res: any, next: any) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  } else {
    res.status(500).json({
      message: 'Internal Server Error',
      code: 500,
    });
  }
});

export default app;
