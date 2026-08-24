import { PORT } from "./src/config";
import { createApp } from "./src/app";

const app = createApp();

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[server]: middlegrade-server is running at http://localhost:${PORT}`);
  });
}

export default app;
