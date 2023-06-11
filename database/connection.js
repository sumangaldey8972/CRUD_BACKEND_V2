const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/config.env" });
const mongo_Url = process.env.MONGO_URL;

// connec to the database
const connect = async () => {
  return await mongoose
    .connect(mongo_Url)
    .then(() => console.log("DATABASE CONNECTED"))
    .catch((error) =>
      console.log("error while connection to the database", error)
    );
};

module.exports = connect;
