const nodemailer = require("nodemailer");
const sendEmailCode = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: "mohamedaboelyazid123@gmail.com",
      pass: "szxqdjshhnvtqzaj",
    },
  });

  await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  });
};

module.exports = sendEmailCode;
