require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const v1Router = require("./routes/version1Routes");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());

app.use("/v1", v1Router);
// Start worker
require("./controllers/codeController"); // This will start the worker automatically
const init = async () => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

init();
