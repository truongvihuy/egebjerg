import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PBS } from './pbs.schema';
import { Transaction } from '../transaction/transaction.schema';
import { PBSDTO } from './pbs.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { getNow, getTodayLastMonth, convertUnixTime, formatCurrency } from '../helper/general.helper';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order/order.service';
import { CustomersService } from '../customers/customers.service';
import * as PBSconstant from './constantPBS';
import { NUMBER_ROW_PER_PAGE, TRANSACTION_TYPE, ORDER_STATUS } from '../config/constants';
import { SettingService } from '../setting/setting.service';
const collection = 'pbs';
const fs = require('fs');
const ENCODE_MODE = 'binary';
@Injectable()
export class PBSService extends BaseService {
  constructor(
    private customerService: CustomersService,
    private orderService: OrderService,
    private settingService: SettingService,
    counterService: CounterService,
    configService: ConfigService,
    @InjectModel('PBS') private readonly pbsModel: Model<PBS>,
    @InjectModel('Transaction') private readonly transactionModel: Model<Transaction>
  ) {
    super(counterService, configService);
  }

  async findAll(query: any): Promise<any> {
    let { limit = NUMBER_ROW_PER_PAGE, page = 1 } = query;
    limit = +limit; page = +page;

    let option: any = {
      sort: { _id: -1 },
      limit,
      skip: limit * (page - 1),
    };
    let pbsList = await this.pbsModel.find({}, { order_id_list: 0 }).sort(option.sort).skip(option.skip).limit(option.limit);
    if (page == 1) {
      return {
        pbs_list: pbsList,
        total: await this.pbsModel.estimatedDocumentCount()
      }
    } else {
      return {
        pbs_list: pbsList
      }
    }
  }
  async findByKey(key: string): Promise<PBS> {
    return this.pbsModel.findOne({ key }).exec();
  }

  async create(pbs: PBSDTO, currentUser) {
    const newItem = new this.pbsModel({
      ...pbs,
    });
    return this.save(newItem, collection);
  }

  async update(_id, data, currentUser) {
    let pbsSetting: any = (await this.settingService.getPbsSetting()).value;
    const now = getNow();
    if (!!data._id) {
      delete data._id;
    }
    let oldPBS: any = await this.pbsModel.findOne({ _id });
    if (oldPBS) {
      if (data.status == 2) {
        await this.orderService.orderModel.updateMany({ _id: { $in: oldPBS.order_id_list } }, {
          $set: {
            close_status: true
          }
        })
        await this.customerService.customersModel.updateMany({ _id: { $in: oldPBS.customer_id_list }, fee_wallet_amount: { $ne: null } }, {
          $inc: {
            fee_wallet_amount: -pbsSetting.fee.value
          }
        });
        await this.customerService.customersModel.updateMany({ _id: { $in: oldPBS.customer_id_list }, fee_wallet_amount: null }, {
          $set: {
            fee_wallet_amount: -pbsSetting.fee.value
          }
        });
        for (let i = 0; i < oldPBS.customer_id_list.length; i++) {
          const customerId = oldPBS.customer_id_list[i];
          let modelTracsaction = new this.transactionModel({
            amount: -pbsSetting.fee.value,
            customer_id: customerId,
            type: TRANSACTION_TYPE.fee,
            date: now,
            pbs_id: _id
          });

          await this.save(modelTracsaction, 'transaction');
        }
      }
      return this.updateById(_id, {
        ...oldPBS._doc,
        ...data,
        date_update: getNow(),
        user_update_id: currentUser._id,
      }, this.pbsModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async delete(_id: number) {
    const assetPath = this.configService.get<any>('assetsPath');
    let pbs = await this.pbsModel.findOne({ _id }, { file: 1 });
    if (pbs) {
      const filePath = `${assetPath}/pbs_log/${pbs.file}`;
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        this.logError(e, 'pbs', __filename);
        throw new BadRequestException('Kan ikke slette filen');
      }
    }
    return this.remove(_id, this.pbsModel, collection);
  }

  async generate(data) {
    const now = getNow();
    const assetPath = this.configService.get<any>('assetsPath');
    let pbsSetting: any = (await this.settingService.getPbsSetting()).value;
    let from = data.from ?? null;
    let to = data.to ?? getNow();
    let date = convertUnixTime(to, 'ddMMyyyy');
    let orderIdList: any = {};
    if (from == null) {
      let lastPbs = (await this.pbsModel.find({}, {}, { sort: { _id: -1 } }))[0];
      if (lastPbs) {
        from = lastPbs.date
      } else {
        from = getTodayLastMonth();
      }
    }
    let customerList = await this.orderService.orderModel.aggregate([
      {
        $match: {
          payment_method: 'PBS',
          date: { $gte: from, $lte: to },
          close_status: { $ne: true },
          status: {
            $in: [ORDER_STATUS.packed, ORDER_STATUS.packedPaymentIssue]
          }
        }
      },
      {
        $sort: {
          date: 1
        }
      },
      {
        $group: {
          _id: '$customer_id',
          order_list: {
            $push: '$$ROOT'
          },
          total: {
            $sum: { $ifNull: ['$amount_claim', '$amount'] }
          }
        }
      },
      {
        $lookup: {
          from: 'customer',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $set: {
          customer: {
            $first: '$customer',
          }
        }
      },
      {
        $lookup: {
          from: 'zip_code',
          localField: 'customer.zip_code_id',
          foreignField: '_id',
          as: 'zip_code'
        }
      },
      {
        $set: {
          zip_code: {
            $first: '$zip_code'
          }
        }
      },
    ]);
    let amount = 0;
    let pbsFee = formatCurrency(pbsSetting.fee.value);

    let fileName = convertUnixTime(now, 'yyyyMMddHHmmss') + '.txt';

    const newItem = new this.pbsModel({
      from: from,
      to: to,
      date: now,
      file: fileName,
      amount,
      status: 1,
      order_id_list: orderIdList,
    });
    let resultPBS = await this.save(newItem, collection);

    let contentResult = `${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.data_delivery_start}${pbsSetting.data_supplier_cvr_number.value}${PBSconstant.SUB_SYSTEM_IDENTIFICATION}${PBSconstant.DATA_DELIVERY_TYPE}0000000001${this.generateBlankPosition(19)}${date}${this.generateBlankPosition(71)}`;
    contentResult += `\n${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.session_start}${pbsSetting.pbs_number.value}${PBSconstant.SECTION_TYPE.sesstion_start_auto_payment.sessionNumber}${this.generateBlankPosition(5)}${pbsSetting.debtors_group_number.value}${this.contentWithFiller('', 15)}${this.generateBlankPosition(4)}${date}${this.generateBlankPosition(4)}${this.generateBlankPosition(10)}${this.generateBlankPosition(60)}`;
    for (let i = 0; i < customerList.length; i++) {
      let contentCustomer = '';
      let customer = customerList[i];
      if (typeof customer.customer == 'undefined') {
        continue;
      }
      let customerNormalWalletAmount = null;
      if (customer.customer.normal_wallet_amount) {
        customerNormalWalletAmount = customer.customer.normal_wallet_amount;
      }
      //customer info
      let codeOrder = `${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.debtor_info}${pbsSetting.pbs_number.value}${PBSconstant.SECTION_TYPE.auto_payment.transactionCode}00000${pbsSetting.debtors_group_number.value}0000000000${this.contentWithFiller(customer.customer.pbs_customer_number, 5, 'R', '0')}000000000`;
      contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, '00001') + this.contentWithFiller(customer.customer.name, 77);
      contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, '00002') + this.contentWithFiller(customer.customer.address, 35) + this.generateBlankPosition(42);
      contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, '00003') + this.contentWithFiller(customer.zip_code?.city_name ?? '', 35) + this.generateBlankPosition(42);
      contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, '00009') + this.generateBlankPosition(15) + `${customer.zip_code?.zip_code ?? ''}DK ` + this.generateBlankPosition(55);
      contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, '00010').substring(0, codeOrder.length - 9) + this.generateBlankPosition(40) + '000000000001' + this.generateBlankPosition(34);
      let totalAmount = Math.round(customer.total * 100).toString();
      //payment
      codeOrder = this.replaceDataRecordNumber(codeOrder, '00000', PBSconstant.DATA_RECORD_TYPE.payment, PBSconstant.TRANSACTION_CODE.payment_auto);
      contentCustomer += "\n" + codeOrder + `${date}0${this.contentWithFiller(totalAmount, 13, 'R', '0')}${this.contentWithFiller(resultPBS._id, 30)}000000000000000${this.generateBlankPosition(10)}`;
      //sumary
      codeOrder = this.replaceDataRecordNumber(codeOrder, '00001', PBSconstant.DATA_RECORD_TYPE.text_to_debtor, PBSconstant.TRANSACTION_CODE.text_to_debtor);
      contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, '00001') + ` ${this.contentWithFiller(`Kundenummer : ${customer.customer.name}`, 60)}` + this.generateBlankPosition(16);
      contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, '00002') + ` ${this.contentWithFiller('Dato', 30)}${this.contentWithFiller('Beløb', 24)}${this.contentWithFiller('Total', 22)}`;
      let count = 3;
      let orderIdListCustomer = [];
      for (let j = 0; j < customer.order_list.length; j++) {
        let order = customer.order_list[j];
        if (customerNormalWalletAmount > 0) {
          let result = await this.insertTransaction(customer.customer._id, -(order.amount_claim ?? order.amount), TRANSACTION_TYPE.normal, resultPBS._id);
          if (result) {
            await this.orderService.orderModel.updateOne({ _id: order._id }, {
              $set: {
                close_status: true
              }
            });
            customerNormalWalletAmount -= order.amount_claim ?? order.amount;
            continue;
          }
        }
        orderIdListCustomer.push(order._id);
        count = 3 + j;
        let subTotal = formatCurrency(order.subtotal);
        let total = formatCurrency(order.amount_claim ?? order.amount);
        while (subTotal.length < 26) {
          subTotal = ' ' + subTotal;
        }
        while (total.length < 24) {
          total = ' ' + total;
        }

        contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, count) + ` ${convertUnixTime(order.created_date, 'dd.MM.yyyy')}${subTotal}${total}${this.generateBlankPosition(16)}`;
      }
      if (orderIdListCustomer.length == 0) {
        continue;
      } else {
        orderIdList[customer.customer._id] = orderIdListCustomer;
        contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, ++count) + ` Administrationsgebyr           ${pbsFee}                   ${pbsFee}${this.generateBlankPosition(16)}`;
        contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, ++count) + this.generateBlankPosition(77);
        contentCustomer += "\n" + this.replaceDataRecordNumber(codeOrder, ++count) + ` Total${this.contentWithFiller(formatCurrency(customer.total), 55, 'R', ' ')}${this.generateBlankPosition(16)}`;
        contentResult += contentCustomer;
        amount += customer.total;
      }
    }

    let countPaymentRow: any = contentResult.split(`${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.payment}`).length.toString();
    // countPaymentRow = '00000000000'.substring(0, 11 - countPaymentRow.toString().length) + countPaymentRow.toString();
    let countTextToDebtorRow: any = contentResult.split(`${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.text_to_debtor}`).length.toString();
    // countTextToDebtorRow = '000000000000000'.substring(0, 15 - countTextToDebtorRow.toString().length) + countTextToDebtorRow.toString();
    let countDebtorInfoRow: any = contentResult.split(`${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.debtor_info}`).length.toString();
    // countDebtorInfoRow = '00000000000'.substring(0, 11 - countDebtorInfoRow.toString().length) + countDebtorInfoRow.toString();
    let amountText = formatCurrency(amount).replace(',', '');
    // amountText = '000000000000000'.substring(0, 15 - amountText.length) + amountText;

    contentResult += "\n" + `${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.session_end}${pbsSetting.pbs_number.value}${PBSconstant.SECTION_TYPE.sesstion_end_auto_payment.sessionNumber}00000${pbsSetting.debtors_group_number.value}    ${this.contentWithFiller(countPaymentRow, 11, 'R', '0')}${this.contentWithFiller(amountText, 15, 'R', '0')}${this.contentWithFiller(countTextToDebtorRow, 15, 'R', '0')}               ${this.contentWithFiller(countDebtorInfoRow, 15, 'R', '0')}${this.generateBlankPosition(26)}`;
    contentResult += "\n" + `${PBSconstant.SYSTEM_IDENTIFICATION}${PBSconstant.DATA_RECORD_TYPE.data_delivery_end}${pbsSetting.data_supplier_cvr_number.value}BS1060100000000001${this.contentWithFiller(countPaymentRow, 11, 'R', '0')}${this.contentWithFiller(amountText, 15, 'R', '0')}${this.contentWithFiller(countTextToDebtorRow, 15, 'R', '0')}${this.generateBlankPosition(17, '0')}${this.contentWithFiller(countDebtorInfoRow, 13, 'R', '0')}00000000000000000000000000`;


    fs.writeFileSync(`${assetPath}/pbs_log/${fileName}`, contentResult, ENCODE_MODE);

    resultPBS = await this.updateById(resultPBS._id, {
      $set: {
        order_id_list: orderIdList,
      },
    }, this.pbsModel);

    return resultPBS;
  }

  replaceDataRecordNumber(code, recordNumber, recordType = null, txCode = null) {
    if (typeof recordNumber == 'string') {
      code = code.substring(0, 17) + recordNumber + code.substring(22, code.length);
    } else if (typeof recordNumber == 'number') {
      code = code.substring(0, 22 - recordNumber.toString().length) + recordNumber + code.substring(22, code.length);
    }
    if (recordType) {
      code = code.substring(0, 2) + recordType + code.substring(5, code.length);
    }
    if (txCode) {
      code = code.substring(0, 13) + txCode + code.substring(17, code.length);
    }
    return code;
  }

  generateBlankPosition(length, char = ' ') {
    return Array(length).fill(char).join('');
  }

  contentWithFiller(content: any = '', numOfChar = 1, align = 'L', filter = ' ') {
    content = content.toString();
    if (align == 'L') {
      while (content.length < numOfChar) {
        content += filter;
      }
    } else {
      while (content.length < numOfChar) {
        content = filter + content;
      }
    }
    return content;
  }

  async download(fileName, res) {
    const assetPath = this.configService.get<any>('assetsPath');
    const filePath = `${assetPath}/pbs_log/${fileName}`;
    if (fs.existsSync(filePath)) {
      res.headers({
        ...res.getHeaders(),
        'Content-type': "application/octet-stream",
        'Content-disposition': `attachment; filename=${fileName}`
      });
      res.send(fs.readFileSync(filePath, ENCODE_MODE).toString())
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async viewPbs(fileName, res) {
    const assetPath = this.configService.get<any>('assetsPath');
    const filePath = `${assetPath}/pbs_log/${fileName}`;
    if (fs.existsSync(filePath)) {
      res.headers({
        ...res.getHeaders(),
        'Content-type': "text/plain",
      });
      res.send(fs.readFileSync(filePath, ENCODE_MODE).toString())
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async insertTransaction(customerId, amount, type, pbsId = null) {
    let now = getNow();
    const newTransaction = new this.transactionModel({
      amount,
      type,
      customer_id: customerId,
      date: now,
      pbs_id: pbsId
    });
    try {
      await this.save(newTransaction, 'transaction');
    } catch (e) {
      return false;
    }
    return true;
  }

  async submit(dataSubmitList) {
    let pbs = null
    let orderCloseIdList = [];
    for (let i = 0; i < dataSubmitList.length; i++) {
      let dataSubmit = dataSubmitList[i];
      let amountAdd = dataSubmit.amount;

      let customer = await this.customerService.findOneByCondition({ pbs_customer_number: dataSubmit.pbs_customer_number }, { _id: 1, normal_wallet_amount: 1 }, { lean: true });
      if (pbs == null || pbs._id != dataSubmit.pbs_id) {
        pbs = await this.pbsModel.findOne({ _id: dataSubmit.pbs_id }, { order_id_list: 1 }, { lean: true });
      }
      let orderIdList = pbs.order_id_list[customer._id];
      let orderList = await this.orderService.orderModel.find({ _id: { $in: orderIdList } }, { amount_claim: 1, amount: 1, close_status: 1 }, { lean: true });
      for (let j = 0; j < orderList.length; j++) {
        let order = orderList[j];
        let realAmount = (order.amount_claim ?? order.amount);
        if (amountAdd >= realAmount) {
          amountAdd -= realAmount;
          orderCloseIdList.push(order._id);
          await this.insertTransaction(customer._id, realAmount, TRANSACTION_TYPE.normal, pbs._id);
        } else {
          break;
        }
      }
      if (amountAdd > 0) {
        await this.insertTransaction(customer._id, amountAdd, TRANSACTION_TYPE.normal, pbs._id);
        await this.customerService.customersModel.updateOne({ _id: customer._id }, {
          $set: {
            normal_wallet_amount: customer.normal_wallet_amount ?? 0 + amountAdd
          }
        });
      }
    }
    await this.orderService.orderModel.updateMany({ _id: { $in: orderCloseIdList } }, {
      $set: {
        close_status: true
      }
    });

    return 'hello'
  }
}
