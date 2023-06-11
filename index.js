const express = require("express");
const connect = require("./database/connection");
const router = require("./routes/user.routes");
const cors = require("cors");
const PORT = process.env.PORT;
const app = express();
const fileupload = require("express-fileupload");
app.use(fileupload());
app.use(cors());

app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
  res.send("Welcome to CRUD application");
});

app.listen(PORT, async () => {
  await connect();
  console.log(`server started and listening on ${PORT}`);
});
