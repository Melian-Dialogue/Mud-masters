import User from "../model/User.js";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from 'dotenv'
import Payment from "../model/Payment.js";

let currentSite = "";
dotenv.config({path: "../.env"});

const signup = async (req, res, next) => {
  const { username, email, password, project, site, plan } = req.body;
  currentSite = site;
  let requests = 0

  try {
    const hash = await bcrypt.hash(password, 10);

    try {
      const user = new User({ username, email, password: hash, project, plan, requests });
      user.generateVerificationHash();
      await user.save();

      const verificationLink = `${req.protocol}://${req.get(
        "host"
      )}/verify?hash=${user.verificationHash}`;
      sendVerificationEmail(user.email, verificationLink);

      res.status(200).json({ user });
    } catch (error) {
      // Check if the error is a duplicate key error (E11000)
      if (error.code === 11000 && error.keyPattern.username) {
        res.status(400).json({ message: "Username already exists" });
      } else if (error.code === 11000 && error.keyPattern.email) {
        res.status(400).json({ message: "Email already exists" });
      } else {
        // If it's a different error, pass it to the error handler
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};

const sendVerificationEmail = (to, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // your email address
      pass: process.env.PASS, // your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "Email Verification",
    // html: `<div style="padding: 30px; background-color: #3758F9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    //     <p style="fontSize: 28px; color: #fff;"><a style="color: #fff; textDecoration: underline" href="${link}">LOGIN WITH THIS LINK TO VERIFY YOUR EMAIL</a></p>
    //  </div>`,
    html:`<!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="utf-8"> <!-- utf-8 works for most cases -->
        <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
        <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
        <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
    
        <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
    
        <!-- CSS Reset : BEGIN -->
        <style>
    
            /* What it does: Remove spaces around the email design added by some email clients. */
            /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
            html,
    body {
        margin: 0 auto !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        background: #f1f1f1;
    }
    
    /* What it does: Stops email clients resizing small text. */
    * {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
    }
    
    /* What it does: Centers email on Android 4.4 */
    div[style*="margin: 16px 0"] {
        margin: 0 !important;
    }
    
    /* What it does: Stops Outlook from adding extra spacing to tables. */
    table,
    td {
        mso-table-lspace: 0pt !important;
        mso-table-rspace: 0pt !important;
    }
    
    /* What it does: Fixes webkit padding issue. */
    table {
        border-spacing: 0 !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        margin: 0 auto !important;
    }
    
    /* What it does: Uses a better rendering method when resizing images in IE. */
    img {
        -ms-interpolation-mode:bicubic;
    }
    
    /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
    a {
        text-decoration: none;
    }
    
    /* What it does: A work-around for email clients meddling in triggered links. */
    *[x-apple-data-detectors],  /* iOS */
    .unstyle-auto-detected-links *,
    .aBn {
        border-bottom: 0 !important;
        cursor: default !important;
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }
    
    /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
    .a6S {
        display: none !important;
        opacity: 0.01 !important;
    }
    
    /* What it does: Prevents Gmail from changing the text color in conversation threads. */
    .im {
        color: inherit !important;
    }
    
    /* If the above doesn't work, add a .g-img class to any image in question. */
    img.g-img + div {
        display: none !important;
    }
    
    /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
    /* Create one of these media queries for each additional viewport size you'd like to fix */
    
    /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
    @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
        u ~ div .email-container {
            min-width: 320px !important;
        }
    }
    /* iPhone 6, 6S, 7, 8, and X */
    @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
        u ~ div .email-container {
            min-width: 375px !important;
        }
    }
    /* iPhone 6+, 7+, and 8+ */
    @media only screen and (min-device-width: 414px) {
        u ~ div .email-container {
            min-width: 414px !important;
        }
    }
    
        </style>
    
        <!-- CSS Reset : END -->
    
        <!-- Progressive Enhancements : BEGIN -->
        <style>
    
          .primary{
      background: #30e3ca;
    }
    .bg_white{
      background: #ffffff;
    }
    .bg_light{
      background: #fafafa;
    }
    .bg_black{
      background: #000000;
    }
    .bg_dark{
      background: rgba(0,0,0,.8);
    }
    .email-section{
      padding:2.5em;
    }
    
    /*BUTTON*/
    .btn{
      padding: 10px 15px;
      display: inline-block;
    }
    .btn.btn-primary{
      border-radius: 5px;
      background: #30e3ca;
      color: #ffffff;
    }
    .btn.btn-white{
      border-radius: 5px;
      background: #ffffff;
      color: #000000;
    }
    .btn.btn-white-outline{
      border-radius: 5px;
      background: transparent;
      border: 1px solid #fff;
      color: #fff;
    }
    .btn.btn-black-outline{
      border-radius: 0px;
      background: transparent;
      border: 2px solid #000;
      color: #000;
      font-weight: 700;
    }
    
    h1,h2,h3,h4,h5,h6{
      font-family: 'Lato', sans-serif;
      color: #000000;
      margin-top: 0;
      font-weight: 400;
    }
    
    body{
      font-family: 'Lato', sans-serif;
      font-weight: 400;
      font-size: 15px;
      line-height: 1.8;
      color: rgba(0,0,0,.4);
    }
    
    a{
      color: #30e3ca;
    }
    
    table{
    }
    /*LOGO*/
    
    .logo h1{
      margin: 0;
    }
    .logo h1 a{
      color: #30e3ca;
      font-size: 24px;
      font-weight: 700;
      font-family: 'Lato', sans-serif;
    }
    
    /*HERO*/
    .hero{
      position: relative;
      z-index: 0;
    }
    
    .hero .text{
      color: rgba(0,0,0,.3);
    }
    .hero .text h2{
      color: #000;
      font-size: 40px;
      margin-bottom: 0;
      font-weight: 400;
      line-height: 1.4;
    }
    .hero .text h3{
      font-size: 24px;
      font-weight: 300;
    }
    .hero .text h2 span{
      font-weight: 600;
      color: #30e3ca;
    }
    
    
    /*HEADING SECTION*/
    .heading-section{
    }
    .heading-section h2{
      color: #000000;
      font-size: 28px;
      margin-top: 0;
      line-height: 1.4;
      font-weight: 400;
    }
    .heading-section .subheading{
      margin-bottom: 20px !important;
      display: inline-block;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(0,0,0,.4);
      position: relative;
    }
    .heading-section .subheading::after{
      position: absolute;
      left: 0;
      right: 0;
      bottom: -10px;
      content: '';
      width: 100%;
      height: 2px;
      background: #30e3ca;
      margin: 0 auto;
    }
    
    .heading-section-white{
      color: rgba(255,255,255,.8);
    }
    .heading-section-white h2{
      font-family: 
      line-height: 1;
      padding-bottom: 0;
    }
    .heading-section-white h2{
      color: #ffffff;
    }
    .heading-section-white .subheading{
      margin-bottom: 0;
      display: inline-block;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,.4);
    }
    
    
    ul.social{
      padding: 0;
    }
    ul.social li{
      display: inline-block;
      margin-right: 10px;
    }
    
    /*FOOTER*/
    
    .footer{
      border-top: 1px solid rgba(0,0,0,.05);
      color: rgba(0,0,0,.5);
    }
    .footer .heading{
      color: #000;
      font-size: 20px;
    }
    .footer ul{
      margin: 0;
      padding: 0;
    }
    .footer ul li{
      list-style: none;
      margin-bottom: 10px;
    }
    .footer ul li a{
      color: rgba(0,0,0,1);
    }
    
    
    @media screen and (max-width: 500px) {
    
    
    }
    
    
        </style>
    
    
    </head>
    
    <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
      <center style="width: 100%; background-color: #f1f1f1;">
        <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
          <!-- BEGIN BODY -->
          <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
            <tr>
              <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="logo" style="text-align: center;">
                      <h1><a href="#">e-Verify</a></h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr><!-- end tr -->
            <tr>
              <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
                <img src="https://raw.githubusercontent.com/ColorlibHQ/email-templates/master/10/images/email.png" alt="" style="width: 300px; max-width: 600px; height: auto; margin: auto; display: block;">
              </td>
            </tr><!-- end tr -->
            <tr>
              <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                <table>
                  <tr>
                    <td>
                      <div class="text" style="padding: 0 2.5em; text-align: center;">
                        <h2>Please verify your email</h2>
                        <h3>Amazing deals, updates, interesting news right in your inbox</h3>
                        <p><a href="${link}" class="btn btn-primary">Yes! Subscribe Me</a></p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr><!-- end tr -->
          <!-- 1 Column Text + Button : END -->
          </table>
          
        </div>
      </center>
    </body>
    </html>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};


// AuthController.js
const verifyEmail = async (req, res) => {
  const { hash } = req.query;

  try {
    const user = await User.findOne({ verificationHash: hash });

    // if (!user) {
    //   res.status(400).json({ message: "Invalid verification link" });
    // } else {
      
    // }
    user.verified = true;
    user.verificationHash = "";
    await user.save();

    res.redirect(303, `${currentSite}/signin.html`);
  } catch (error) {
    console.log(error);
    res.send(`<p style="fontSize: 28px; color: red;">INVALID VERIFICATION ID</p>`)
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
    } else {
      const result = await bcrypt.compare(password, user.password);

      if (result) {
        const verificationCode = generateVerificationCode();
        user.loginVerificationCode = verificationCode;
        await user.save();

        // You can customize the message and method of sending the code (e.g., SMS)
        sendVerificationCode(user.email, verificationCode);

        res
          .status(200)
          .json({ success: "Verification code sent successfully" });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generateVerificationCode = () => {
  // Generate a random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationCode = (to, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // your email address
      pass: process.env.PASS, // your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "2FA AUTHENTICATION CODE",
    html: `<div style="padding: 30px; background-color: #3758F9; box-shadow: 0 4px 8px #3758F9; text-align: center;">
        <p style="color: white; font-size: 28px;">${to}: ${code}</p>
     </div>`,
  };
  

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  console.log(`Verification code sent to ${to}: ${code}`);
};

// AuthController.js
const verifyLoginCode = async (req, res) => {
  const { username, code } = req.body;

  try {
    const user = await User.findOne({
      username: username,
      loginVerificationCode: code,
    });
    console.log(user);

    if (!user) {
      res.status(401).json({ message: "Invalid verification code" });
    } else {
      // Reset the verification code after successful verification
      user.loginVerificationCode = "";
      await user.save();

      const token = Jwt.sign({ id: user.id }, "secret_jwt", {
        expiresIn: "30d",
      });
      // check payment
      const payment = await Payment.findOne({user_id: user.user_id});

      res
        .status(200)
        .json(
          { 
            success: "Login success", 
            token: token, 
            user: user,
            plan: user.plan,
            paid: payment?.paid ? true: false
          }
          );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = Jwt.verify(token, "secret_jwt");
    const userId = decoded.id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ user: user });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid token" });
  }
};
const updateRequests = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = Jwt.verify(token, "secret_jwt");
    const userId = decoded.id;

    const user = await User.findById(userId);

    user.requests -= 1
    await user.save()
    res.status(200).json({ i: "incremented request"})
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export { login, signup, getUserDetails, verifyEmail, verifyLoginCode, updateRequests };
