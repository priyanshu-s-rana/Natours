const nodemailer = require('nodemailer');
const pug = require('pug');
const html_to_text = require('html-to-text');

module.exports = class Email{
    constructor(user,url){
        this.to = user.email;
        this.first_name = user.name.split(' ')[0];
        this.url = url;
        this.from = `Priyanshu Rana <${process.env.EMAIL_FROM}>`;
    }

    new_transport(){
        // console.log(process.env.NODE_ENV);
        if(process.env.NODE_ENV === 'production'){

            return nodemailer.createTransport({
                host : process.env.POSTMARK_HOST,
                port : process.env.POSTMARK_PORT,
                secure : false,
                headers:{
                    'X-PM-Message-Stream': 'outbound'
                },
                auth : {
                    user: process.env.POSTMARK_USERNAME,
                    pass :process.env.POSTMARK_PASSWORD  // use  "pass" instead of "password"
                },
                // Activate in gamil " less secure app" option
            })
        }
        return nodemailer.createTransport({
            //service : 'Gmail', // For gmail.
            host : process.env.EMAIL_HOST,
            port : process.env.EMAIL_PORT,
            secure:false,
            auth : {
                user: process.env.EMAIL_USERNAME,
                pass :process.env.EMAIL_PASSWORD,  // use  "pass" instead of "password"
                
            },
            // Activate in gamil " less secure app" option
        })
    }

    async send(template,subject){
        // ! Tender HTML based on pug template 
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            first_name : this.first_name,
            url : this.url,
            subject
        })
        //! Define email options
        const mail_options = {
            from : this.from, // Sender's address
            to : this.to,
            subject ,
            html,
            text : html_to_text.convert(html),
        }
        //! Create a transport and send email
        await this.new_transport().sendMail(mail_options, (err, info) => {
            if (err) {
                return console.log(err);
            }
        })
        // console.log('e');
    }

    async send_welcome(){
        await this.send('welcome','Welcome to the natours family!');
    }

    async send_password_rest(){
        await this.send('password_reset','Your password reset token (valid for only 10 min')
    }
}

// const send_email = async options =>{
//     //! Creating a transporter

//     const transporter = nodemailer.createTransport({
//         //service : 'Gmail', // For gmail.
//         host : process.env.EMAIL_HOST,
//         port : process.env.EMAIL_PORT,
//         secure : false,
//         auth : {
//             user: process.env.EMAIL_USERNAME,
//             pass :process.env.EMAIL_PASSWORD  // use  "pass" instead of "password"
//         },
//         // Activate in gamil " less secure app" option
//     })
//     //! Define the email options
//     const mail_options = {
//         from : 'Priyanshu Rana <priyanshrana4@gmail.com>', // Sender's address
//         to : options.email,
//         subject : options.subject,
//         text : options.message
//         // HTML
//     }
//     //! Actually send the email
//     await transporter.sendMail(mail_options)
// }

// module.exports = send_email