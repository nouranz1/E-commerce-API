const nodemailer = require("nodemailer");

// Nodemailer
const sendEmail = async (options) => {
  // 1- Create transporter (services that will send email like "gmail", "Mailgun", "mailtrap"m "sendGrid")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //if secure false => port = 587, if true port = 465
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2- define email options (like from, to, Subject, email content)
  const mailOpts = {
    from: `E-shop App ${process.env.EMAIL_USER}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3- Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
