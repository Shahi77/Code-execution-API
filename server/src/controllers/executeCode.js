const redisQueue = require("../service/redis");
const { v4: uuidv4 } = require("uuid");

const executeCode = async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code are required" });
  }

  try {
    const taskId = uuidv4();
    await redisQueue.addToQueue("code_execution:queue", {
      language,
      code,
      taskId,
    });

    res.json({ message: "Code execution started", taskId });
  } catch (error) {
    console.error("Error adding to queue:", error.message);
    res
      .status(500)
      .json({ error: "Failed to queue the task", details: error.message });
  }
};
const getExecutionResult = async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).json({ error: "Task ID is required" });
  }

  try {
    const resultKey = `execution_result:${taskId}`;
    const output = await redisQueue.redisClient.get(resultKey);

    if (!output) {
      return res.json({
        status: "pending",
        message: "Execution in progress or no result found.",
      });
    }

    res.json({ status: "completed", output });
  } catch (error) {
    console.error("Error fetching execution result:", error.message);
    res.status(500).json({
      error: "Failed to fetch execution result",
      details: error.message,
    });
  }
};
module.exports = { executeCode, getExecutionResult };
