const Redis = require("ioredis");

class RedisQueue {
  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
    }); // for adding tasks
    this.consumerClient = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
    }); //for consuming tasks
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
