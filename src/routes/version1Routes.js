const { Router } = require("express");
const dockerRouter = require("./dockerRoutes");

const v1Router = Router();
v1Router.use("/docker", dockerRouter);

module.exports = v1Router;
