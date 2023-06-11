const mongoose = require("mongoose");
const mongoose_paginate = require("mongoose-paginate-v2");

const userSchema = mongoose.Schema(
  {
    user_name: { type: String },
    user_email: { type: String, required: true },
    user_password: { type: String, required: true },
    user_role: { type: String },
    user_dob: { type: Date },
    user_phone_number: { type: String },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    image: { type: String },
  },
  { timeStamps: true }
);

userSchema.plugin(mongoose_paginate);

const userModel = new mongoose.model("user", userSchema);

module.exports = userModel;
