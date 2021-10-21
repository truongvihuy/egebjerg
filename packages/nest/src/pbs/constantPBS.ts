export const CREDITOR_REF = '114';
export const SYSTEM_IDENTIFICATION = 'BS';
export const SUB_SYSTEM_IDENTIFICATION = 'BS1';
export const DATA_DELIVERY_TYPE = '0601';
export const DATA_RECORD_TYPE = {
  'data_delivery_start': '002',
  'data_delivery_end': '992',
  'session_start': '012',
  'session_end': '092',
  'debtor_info': '022',
  'payment': '042',
  'text_to_debtor': '052',
  'separate_text_to_debtor_on_payment_slip': '062',
  'text_for_payment_slip': '052',
};
export const TRANSACTION_CODE = {
  'debtor_info': '0240',
  'payment_auto': '0280',
  'payment_slip': '0285',
  'text_to_debtor': '0241',
  'separate_text_to_debtor_on_payment_slip': '0241',
  'text_for_payment_slip': '0241',
};
export const SECTION_TYPE = {
  sesstion_start_auto_payment: {
    type: '012',
    sessionNumber: '0112'
  },
  sesstion_start_slip_payment: {
    type: '012',
    sessionNumber: '0215'
  },
  sesstion_end_auto_payment: {
    type: '092',
    sessionNumber: '0112'
  },
  sesstion_end_slip_payment: {
    type: '092',
    sessionNumber: '0215'
  },
  auto_payment: {
    type: '042',
    sessionNumber: '000',
    transactionCode: '0240'
  },
  slip_payment: {
    type: '042',
    sessionNumber: '000',
    transactionCode: {
      completed: '0297',
      charged_back: '0299',
    }
  },
};