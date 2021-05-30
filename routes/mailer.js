const router = require("express").Router();

var nodemailer = require('nodemailer');

// router.post("/", (req,res)=>{
const mailer = (req,res)=> {
    console.log("inside mailer")
        
    const {email, password} = req.body;
        const transporter = nodemailer.createTransport({
            port: 465,               // true for 465, false for other ports
            host: "smtp.gmail.com",
            auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASS,
                },
            secure: true,
            });
                
        const OTP = Math.round(Math.random()*(999999 - 100000) + 100000);

        const mailData = {
            from: `${email}`,  // sender address
                to: `${email}`,   // list of receivers
                subject: 'Verify your account',
                html: `<b>OTP : ${OTP} </b>`
                        
            };

            req.session.email = email
            req.session.password = password
            req.session.otp = OTP;

            transporter.sendMail(mailData, function (err, info) {
                if(err)
                    console.log(err)
                else
                    console.log("emailEr",info);
                 res.json({"Message from Server":"Please check OTP sent to the email above",info,"email":email})
                });
}

module.exports = mailer
// module.exports = router