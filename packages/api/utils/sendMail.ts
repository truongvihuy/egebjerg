import config from '../config/config';
import axios from 'axios';
import { getDb, insertOne } from '../helper/db.helper';
var nodemailer = require('nodemailer');
const configEmail = config.configEmail;
const fs = require('fs');

let configTransporter: any = {
  auth: {
    user: configEmail.email,
    pass: configEmail.password
  }
};
if (configEmail.email.includes('@gmail.com')) {
  configTransporter = {
    ...configTransporter,
    service: 'gmail'
  };
} else if (configEmail?.smtpHost) {
  configTransporter = {
    ...configTransporter,
    host: configEmail.smtpHost,
    port: configEmail.smtpPort,
    secure: configEmail.smtpSecure ?? false,
  };
}
const transporter = nodemailer.createTransport(configTransporter);

export const sendMail = async (mail:any): Promise<boolean> => {
  try {
    let result = await insertOne({
     ...mail,
      is_sent: false,
    }, 'mail_queue');
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}