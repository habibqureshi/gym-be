const express = require("express");
const { authorizer } = require("./middleware/Auth/authorizer.js");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(require("cors")());
app.use(require("morgan")("dev"));
app.use(require("body-parser").json());
app.use(authorizer);
app.use("/api", require("./routes"));
app.get("/test", (req, res) => {
  res.status(200).send("Application Started");
});
app.use("*", (req, res, next) => {
  try {
    return res.status(404).json({
      message: "Invalid Route",
    });
  } catch (error) {
    next(error);
  }
});
app.use(require("./utils/error/errorHandler.js"));

app.listen(process.env.PORT, () => {
  console.log("Server Listening ", process.env.PORT);
});
