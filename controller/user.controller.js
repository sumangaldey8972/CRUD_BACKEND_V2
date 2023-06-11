const { uploadFile } = require("../function/upload");
const userModel = require("../models/users.model");
const jwt = require("jsonwebtoken");

let token_secret_key = process.env.TOKEN_SECRET_KEY;

// create user by admin or manager
exports.create_user = async (req, res) => {
  try {
    let value = JSON.parse(req.body.data);
    let is_existing_user = await userModel.findOne({
      user_email: value.user_email,
    });
    if (is_existing_user) {
      return res
        .status(409)
        .send({ status: false, message: "email already exist" });
    } else {
      const url = await uploadFile(req.files.image.data);
      const { token } = req.headers;
      let check_user_role = await new Promise((resolve, reject) => {
        jwt.verify(token, token_secret_key, (error, decoded) => {
          if (error) {
            reject({ status: false, error: error });
          } else {
            resolve({ status: true, decoded: decoded });
          }
        });
      });
      if (check_user_role.status) {
        const data = {
          user_name: value.user_name,
          user_email: value.user_email,
          user_password: value.user_password,
          user_role: value.user_role,
          user_dob: value.user_dob,
          user_phone_number: value.user_phone_number,
          manager: check_user_role.decoded.id,
          image: url,
        };
        const response = await userModel.create(data);
        
        return res.status(200).send({
          status: true,
          message: `new ${value.user_role} added successfully`,
        });
      } else {
        return res.status(500).send({ status: false, message: "Token Expire" });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error" });
  }
};

// login function
exports.authenticate_user = async (req, res) => {
  try {
    let { user_name, user_password } = req.body;
    let is_user = await userModel.findOne({ user_name });
    if (!is_user) {
      return res
        .status(404)
        .send({ status: false, message: "user not found!" });
    } else if (is_user.user_password != user_password) {
      return res
        .status(401)
        .send({ status: false, message: "password do not match" });
    } else if (is_user.user_role == "user") {
      return res.status(401).send({
        status: false,
        message: "you are not allowed perform any operations",
      });
    } else {
      const jwt_token = jwt.sign(
        {
          id: is_user._id,
          user_name: is_user.user_name,
          role: is_user.user_role,
        },
        token_secret_key,
        {
          expiresIn: "120 min",
        }
      );
      return res.status(200).send({
        status: true,
        message: "login successfull!",
        token: jwt_token,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "server error while login" });
  }
};

// get user list by admin or manager , admin can only see the user which is added by the manager
exports.user_list = async (req, res) => {
  try {
    let { token } = req.headers;
    let { id } = req.query;
    let check_user_role = jwt.verify(token, token_secret_key);
    if (check_user_role.role == "admin") {
      if (id) {
        let data = await userModel.find({ manager: id });
        return res
          .status(200)
          .send({ status: true, message: "Manager user Lists", body: data });
      } else {
        let data = await userModel.find({ user_role: "manager" });
        return res
          .status(200)
          .send({ status: true, message: "Manager Lists this", body: data });
      }
    } else if (check_user_role.role == "manager") {
      let data = await userModel.find({ manager: check_user_role.id });
      return res
        .status(200)
        .send({ status: true, message: "Users Lists", body: data });
    } else {
      return res.status(401).send({
        status: true,
        message: "you can not have access to perform this operation",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: "server error while getting user lists",
    });
  }
};

// edit the user by admin or manager
exports.edit_user = async (req, res) => {
  try {
    const value = JSON.parse(req.body.data);
    let { token } = req.headers;
    let check_user_role = jwt.verify(token, token_secret_key);
    let find_user_by_id = await userModel.findOne({ _id: req.params.id });
    if (!find_user_by_id) {
      return res.status(409).send({ status: false, message: "user not found" });
    } else if (
      find_user_by_id.user_role == "manager" &&
      check_user_role.role == "admin"
    ) {
      let url;
      if (req.files) {
        url = await uploadFile(req.files.image.data);
      } else {
        url = value.image;
      }
      let updated_user = await userModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            user_name: value.user_name,
            user_role: value.user_role,
            user_email: value.user_email,
            user_dob: value.user_dob,
            user_password: value.user_password,
            user_phone_number: value.user_phone_number,
            image: url,
          },
        },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "updated successfully the manager",
        data: updated_user,
      });
    } else if (
      find_user_by_id.user_role == "user" &&
      check_user_role.role == "manager"
    ) {
      let url;
      if (req.files) {
        url = await uploadFile(req.files.image.data);
      } else {
        url = value.image;
      }
      let updated_user = await userModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            user_name: value.user_name,
            user_role: value.user_role,
            user_email: value.user_email,
            user_dob: value.user_dob,
            user_password: value.user_password,
            user_phone_number: value.user_phone_number,
            image: url,
          },
        },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "updated successfully the user",
        data: updated_user,
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

// get user by id for getting the particular user which going to be edited
exports.get_user_by_id = async (req, res) => {
  try {
    let { id } = req.params;
    let manager_data = await userModel.findOne({ _id: id });
    return res.status(200).send({ status: true, body: manager_data });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Server error while editing the user",
    });
  }
};

// delete user by admin or manager
exports.delete_user = async (req, res) => {
  try {
    let { token } = req.headers;
    let { id } = req.params;
    let check_user_role = jwt.verify(token, token_secret_key);
    let find_user_by_id = await userModel.findOne({ _id: id });

    if (!find_user_by_id) {
      return res.status(409).send({ status: false, message: "user not found" });
    } else if (
      find_user_by_id.user_role == "manager" &&
      check_user_role.role == "admin"
    ) {
      let deleted_user = await userModel.deleteOne({ _id: id });
      return res.status(200).send({
        status: true,
        message: "user Deleted !",
        deleted_user: deleted_user,
      });
    } else if (
      find_user_by_id.user_role == "user" &&
      check_user_role.role == "manager"
    ) {
      let deleted_user = await userModel.deleteOne({ _id: id });
      return res.status(200).send({
        status: true,
        message: "user Deleted !",
        deleted_user: deleted_user,
      });
    } else {
      return res.status(409).send({
        status: false,
        message: `you can not delete ${find_user_by_id.user_role}`,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "server while deleting user" });
  }
};