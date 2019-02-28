const mailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const schema = mailer.createTransport({
    host: "s1.ct8.pl",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: "live-text@Dagonin.ct8.pl",
        pass: "Hasło123"
    }
});
// verify connection configuration
schema.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

let send = function (header, body, cb) {
    let read = fs.readFileSync(path.resolve('./') + '/maile/index.html').toString();
    read = read.replace(/{{{header}}}/gi, header);
    read = read.replace(/{{{body}}}/gi, body);
    var message = {
        from: "Live-Text <live-text@Dagonin.ct8.pl>",
        to: "dagonins@gmail.com",
        subject: "live-text",
        text: "Plaintext version of the message",
        html: read
    };
    schema.sendMail(message, (err)=>{
        if(err){
           return cb(err);
        }else{
            return cb(null);
        }
    })
}
module.exports = {mail:send}