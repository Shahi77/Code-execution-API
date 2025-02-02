const Redis = require("ioredis");

class RedisQueue {
  constructor() {
    this.redisClient = new Redis(); // for adding tasks
    this.consumerClient = new Redis(); //for consuming tasks
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
