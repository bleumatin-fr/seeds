import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

const transporter = nodemailer.createTransport(process.env.MAIL_URL);

export const send = async (options: Mail.Options) => {
  if (!process.env.MAIL_URL) {
    console.log('SENDING EMAILS IS DISABLED');
    console.log(options);
    return;
  }
  await transporter.sendMail(options);
};
