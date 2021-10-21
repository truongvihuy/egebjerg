import { getNow, convertUnixTime } from '../helper/general.helper';
import { createPDF } from './pdf.helper';
import { docPackingSlip } from '../template/template-packing-slip';

export const processMail = async (mail, { customer, customerHomeHelper, order, store, settings }, shopDomain) => {
  let mailList: any[] = [{
    subject: null,
    content: {
      text: null,
      isHTML: null,
      html: null,
    },
    emailTo: null,
  }];
  let mapReplace: any = {};
  let mailContent = mail.content;
  let mailSubject = mail.subject;
  switch (mail.key) {
    case 'unsubcribe':
      mapReplace = {
        '{{homeHelperName}}': `${customerHomeHelper.username} - ${customerHomeHelper.name}`,
        '{{customerUserName}}': customer.username,
        '{{customerName}}': customer.name,
        '{{customerAddress}}': customer.address,
        '{{customerZipCode}}': customer.zip_code.zip_code,
        '{{customerCity}}': customer.zip_code.city_name,
        '{{customerStoreName}}': customer.store.name,
        '{{date}}': convertUnixTime(getNow()),
      };
      break;
    case 'created_order':
      mapReplace = {
        '{{customerName}}': customer.name,
        '{{orderSession}}': `${shopDomain}/view-order?code=${order.session}`,
      };
      mailList[0].emailTo = [customer.email];
      mailList.push({
        subject: 'Butikken du lige har bestilt',
        content: {
          attachments: [{
            path: await createPDF(docPackingSlip(order, customer, settings)),
          }],
        },
        emailTo: store.email,
      });
      break;
    default: return null;
  }
  for (const key in mapReplace) {
    let value = mapReplace[key];
    mailContent = mailContent.split(key).join(value);
    mailSubject = mailSubject.split(key).join(value);
  }
  mailList[0].subject = mailSubject;
  mailList[0].content.html = mailContent;
  mailList[0].content.isHTML = true;
  return mailList;
};
