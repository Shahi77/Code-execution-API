const { Router } = require("express");
const { executeCode } = require("../controllers/executeCode");

const dockerRouter = Router();
dockerRouter.post("/execute", executeCode);

module.exports = dockerRouter;
