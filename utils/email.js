const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    //1. Create a transporter
    const transpoter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: proccess.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD,
        },
        //Activate in gmail "less secure app" option
    });

    //2. Define the email options
    const mailOptions = {
        from: 'Oshioke Salaki <salaki1902@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };
    //3. acctually send the email with nodemailer
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;