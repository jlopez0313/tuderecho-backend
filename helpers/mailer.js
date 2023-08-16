const nodemailer = require('nodemailer');

const sendEmail = (to, subject, text = '', html = '') => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'jonn0313@gmail.com',
            pass: 'dfufpnaztidjqean'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: 'jonn0313@gmail.com',
        to: to,
        subject: subject,
        text: text,
        html: html
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Error sending Email: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendEmail
}