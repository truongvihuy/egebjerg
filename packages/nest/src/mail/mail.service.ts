import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mail } from './mail.schema';
import { MailDTO } from './mail.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { ConfigService } from '@nestjs/config';
import BaseService from '../helper/base.service';
import { MAIL_ID } from '../config/constants';
const nodemailer = require('nodemailer');
const fs = require('fs');

const collection = 'mail';

type ContentMail = {
  text?: string,
  isHTML?: boolean,
  html?: string,
  attachments?: any[],
}

const intlCurrency = new Intl.NumberFormat('da-Dk');
@Injectable()
export class MailService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    @InjectModel('Mail') public readonly mailModel: Model<Mail>
  ) {
    super(counterService, configService);
  }

  async findAll(): Promise<Mail[]> {
    return this.mailModel.find().sort({ _id: 1 }).exec();
  }

  async findOne(condition) {
    return this.mailModel.findOne(condition).exec();
  }

  async create(mail: MailDTO) {
    let instruction = mail.content.match(/\{\{([^}]+)\}\}/g);
    if (instruction) {
      instruction = instruction.map(x => x.substring(1, x.length - 1));
    }
    const newItem = new this.mailModel({
      ...mail,
      instruction: instruction ?? []
    });
    return this.save(newItem, collection);
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let oldMail: any = await this.mailModel.findOne({ _id });
    if (oldMail) {
      return this.updateById(_id, data, this.mailModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async sendOrderMail(order: any, emailTo: [string] = null): Promise<boolean> {
    try {
      let mailTemplateOrder = await this.findOne({ _id: MAIL_ID.orderIsCreated });
      if (mailTemplateOrder) {
        let html = mailTemplateOrder.content;
        html = html.replace(/{{customerUserName}}/g, order.customer_name);
        html = html.replace(/{{orderSession}}/g, `${this.configService.get('shopDomain')}/view-order?code=${order.session}`);

        return await this.sendMail(mailTemplateOrder.subject, { html }, emailTo);
      }
    } catch (e) {
      console.log(e);
      this.logError(e, 'mail', __filename);
      return false;
    }
  }

  async sendMail(subject: string, contentMail: ContentMail, emailTo: string[] | string = null): Promise<boolean> {
    let configEmail = this.configService.get<any>('mail');
    const assetPath = this.configService.get<any>('assetsPath');
    if (!emailTo) {
      emailTo = configEmail.emailDefaultReceive;
    }
    let emailToString = typeof emailTo !== 'string' ? emailTo.join(', ') : emailTo;
    let mailOptions: any = {
      from: configEmail.email,
      to: emailToString,
      subject: subject ?? '',
    };
    if (contentMail.html || contentMail.isHTML) {
      let template = fs.readFileSync(`${assetPath}/mailTemplate.html`).toString();
      template = template.replace(/{{logoSrc}}/g, `https://s3.amazonaws.com/redqteam.com/pickbazar/hersheys_kisses.jpg`);

      if (contentMail.html) {
        template = template.replace(/{{message}}/g, contentMail.html);
      } else {
        template = template.replace(/{{message}}/g, contentMail.text);
      }
      mailOptions.html = template;
    } else {
      mailOptions.text = contentMail.text;
    }
    if (contentMail.attachments) {
      mailOptions.attachments = contentMail.attachments;
    }
    try {
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
      let res = await transporter.sendMail(mailOptions);
      return true;
    } catch (e) {
      console.log(e);
      this.logError(e, 'mail', __filename);
      return false;
    }
  }
}
