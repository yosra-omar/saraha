import app from "./app.bootstrap.js";
import { checkConnectionDB } from "./DB/connectionDB.js";
import { connectRedis } from "./DB/redis.connection.js";

const bootstrap = async () => {
  await checkConnectionDB();
  await connectRedis();

  return app;
};

export default await bootstrap();