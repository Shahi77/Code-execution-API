const Redis = require("ioredis");

class RedisQueue {
  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL); // for adding tasks
    this.consumerClient = new Redis(process.env.REDIS_URL); // for consuming tasks

    this.redisClient.on("connect", () => {
      console.log("Redis connected (redisClient)");
    });

    this.consumerClient.on("connect", () => {
      console.log("Redis connected (consumerClient)");
    });

    this.redisClient.on("error", (err) => {
      console.error("Redis error (redisClient):", err);
    });

    this.consumerClient.on("error", (err) => {
      console.error("Redis error (consumerClient):", err);
    });
  }

  async addToQueue(key, value) {
    await this.redisClient.lpush(key, JSON.stringify(value));
  }

  async consumeFromQueue(key) {
    const value = await this.consumerClient.brpop(key, 0); //Blocks until a job is available
    if (!value) return null;

    const [, job] = value; // brpop returns [key, value]
    return JSON.parse(job);
  }
}

module.exports = new RedisQueue();
