const { Router } = require("express");
const dockerRouter = require("./executeRoutes");

const v1Router = Router();
v1Router.use("/docker", dockerRouter);

module.exports = v1Router;
