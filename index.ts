import express from "express";
import { PORT } from "./src/config";
import { createApp } from "./src/createApp";

const app: express.Express = createApp();

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[server]: middlegrade-server is running at http://localhost:${PORT}`);
  });
}

export default app;
