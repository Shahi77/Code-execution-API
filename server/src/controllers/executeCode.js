const redisQueue = require("../service/redis");

const executeCode = async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code are required" });
  }

  try {
    // Add task to the Redis queue
    await redisQueue.addToQueue("code_execution_queue", { language, code });
    res.json({ message: "Your code has been queued for execution." });
  } catch (error) {
    console.error("Error adding to queue:", error.message);
    res
      .status(500)
      .json({ error: "Failed to queue the task", details: error.message });
  }
};
module.exports = { executeCode };
