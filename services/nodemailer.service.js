const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anitadey9735@gmail.com",
    pass: "scqecyzveaagxpxr",
  },
});

exports.sendMail = (newUser) => {
  try {
    console.log("mail", newUser);
  } catch (error) {}
};
