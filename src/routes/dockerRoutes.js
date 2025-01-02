const { Router } = require("express");
const { executeCode } = require("../controllers/dockerController");

const dockerRouter = Router();
dockerRouter.post("/execute", executeCode);

module.exports = dockerRouter;
