const { Router } = require("express");
const {
  executeCode,
  getExecutionResult,
} = require("../controllers/executeCode");

const dockerRouter = Router();
dockerRouter.post("/execute", executeCode);
dockerRouter.get("/result/:taskId", getExecutionResult);

module.exports = dockerRouter;
