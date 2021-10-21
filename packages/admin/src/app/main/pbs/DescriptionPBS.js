import React, { useState, useEffect } from 'react';
import { Tooltip, Button } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';
const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 1000,
    fontSize: theme.typography.pxToRem(18),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const SystemIdentification = ({ index = 1 }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. System Identification</b>
          <br />
          ---
          <br />
          Default value = BS
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601</i> (Page 10-11/46)
          <br />
        </>
      }>
      <div className="pbs-description text-green-800">BS</div>
    </HtmlTooltip>
  );
};
const DataRecordType = ({ index = 2, value, title }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>
            {index}. Data Record Type: {value} = {title}
          </b>
          <br />
          ---
          <br />
          Data Record Type
          <br />
          &nbsp;&nbsp;&nbsp;Data delivery start: 002
          <br />
          &nbsp;&nbsp;&nbsp;Session start: 012
          <br />
          &nbsp;&nbsp;&nbsp;Debtor’s name and address: 022
          <br />
          &nbsp;&nbsp;&nbsp;Debtor’s postcode and country: 022
          <br />
          &nbsp;&nbsp;&nbsp;Optional functionality, including additional debtor information: 022
          <br />
          &nbsp;&nbsp;&nbsp;Payment date and numOfChar: 042
          <br />
          &nbsp;&nbsp;&nbsp;Text to debtor: 052
          <br />
          &nbsp;&nbsp;&nbsp;Text for payment slip: 052
          <br />
          &nbsp;&nbsp;&nbsp;Separate text to debtor on payment slip: 062
          <br />
          &nbsp;&nbsp;&nbsp;Session end: 092
          <br />
          &nbsp;&nbsp;&nbsp;Payment: 042
          <br />
          &nbsp;&nbsp;&nbsp;Data delivery end: 992
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601</i> (Page 9/46)
          <br />
        </>
      }>
      <div className="pbs-description text-green-800">{value}</div>
    </HtmlTooltip>
  );
};

const TransactionCode = ({ index = 4, value, title }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>
            {index}. Transaction Code: {value} = {title}
          </b>
          <br />
          ---
          <br />
          Debtor’s name information: 0240
          <br />
          Debtor’s postcode and country: 0240
          <br />
          Optional functionality, including additional debtor information: 0240
          <br />
          Collection information: 0280
          <br />
          Collection information: 0285
          <br />
          Text line for debtor’s information: 0241
          <br />
          Separate text line on payment slip for debtor’s information: 0241
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601</i> (Page 9/46)
          <br />
        </>
      }>
      <div className="pbs-description text-green-800">{value}</div>
    </HtmlTooltip>
  );
};

const PBSNumber = ({ index = 3 }) => {
  return (
    <HtmlTooltip title={`${index}. PBS number (Get from PBS setting)`}>
      <div className="pbs-description text-green-800">05726204</div>
    </HtmlTooltip>
  );
};
const DebtorGroupNumber = ({ index = 6 }) => {
  return (
    <HtmlTooltip title={`${index}. Debtor group number (Get from PBS setting)`}>
      <div className="pbs-description text-green-800">00001</div>
    </HtmlTooltip>
  );
};

const Subsystem = ({ index = 4 }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. Subsystem</b>
          <br />
          ---
          <br />
          Default value = BS1
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601 (Page 10/46)</i>
        </>
      }>
      <div className="pbs-description text-green-800">BS1</div>
    </HtmlTooltip>
  );
};
const DataDeliveryType = ({ index = 5 }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. Data Delivery Type (0601 = Collection data)</b>
          <br />
          ---
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601 (Page 10/46)</i>
        </>
      }>
      <div className="pbs-description text-green-800">0601</div>
    </HtmlTooltip>
  );
};
const DataSupplierNumber = ({ index }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. CVR no. of the Data Supplier (Get from PBS setting)</b>
          <br />
          ---
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601 (Page 10/46)</i>
          <br />
        </>
      }>
      <div className="pbs-description text-green-800">31873258</div>
    </HtmlTooltip>
  );
};
const BlankSpace = ({ index, numOfChar, title }) => {
  let space = '';
  for (var i = 0; i < numOfChar; i++) {
    space += '\u00A0';
  }
  return (
    <HtmlTooltip title={`${index}. ${title ? title : 'Blank positions in the field'} - ${numOfChar} characters`}>
      <div className="pbs-description bg-gray-200">{space}</div>
    </HtmlTooltip>
  );
};

const ZeroFiller = ({ index = 8, numOfChar = 9, title = 'Filler', redContent = false }) => {
  let filler = '';
  for (var i = 0; i < numOfChar; i++) {
    filler += '0';
  }
  return (
    <HtmlTooltip title={`${index}. ${title}`}>
      <div className={redContent ? 'pbs-description text-red-800' : 'pbs-description text-green-800'}>{filler}</div>
    </HtmlTooltip>
  );
};
const ContentWithSpace = ({ index = 9, value, numOfChar, title, redContent = false, align = 'L' }) => {
  let space = '';
  let numOfSpace = numOfChar - value.length;
  for (var i = 0; i < numOfSpace; i++) {
    space += '\u00A0';
  }
  return (
    <HtmlTooltip title={`${index}. ${title} - ${numOfChar} characters`}>
      <div className="pbs-description flex">
        {align == 'R' && <div className="bg-gray-200">{space}</div>}
        <div className={redContent ? 'text-red-800' : 'text-green-800'}>{value}</div>
        {align == 'L' && <div className="bg-gray-200">{space}</div>}
      </div>
    </HtmlTooltip>
  );
};
const DeliveryCreationDate = ({ index }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. Delivery creation date</b>
          <br />
          ---
          <br />
          Field = 000000 or delivery creation date
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601 (Page 10/46)</i>
        </>
      }>
      <div className="pbs-description text-green-800">000000</div>
    </HtmlTooltip>
  );
};
const SectionNumber = ({ index = 4 }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. Section number</b>
          <br />
          ---
          <br />
          &nbsp;&nbsp;&nbsp;Section number 0112 = Collections
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601 (Page 12/46)</i>
        </>
      }>
      <div className="pbs-description text-green-800">0112</div>
    </HtmlTooltip>
  );
};
const DataRecordNumber = ({ index = 5, value = '00000', title = 'Debtor’s name information' }) => {
  if (typeof value == 'number') {
    value = value.toString();
    while (value.length < 5) {
      value = '0' + value;
    }
  }
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. Data record number: {value} = {title}</b>
          <br />
          &nbsp;&nbsp;&nbsp;00001–00005: Debtor’s name information
          <br />
          &nbsp;&nbsp;&nbsp;00001–05000 possible consecutive text records per payment
          <br />
          &nbsp;&nbsp;&nbsp;00009: Postcode and country
          <br />
          &nbsp;&nbsp;&nbsp;00010: Optional functionality, including additional debtor information
          <br />
          &nbsp;&nbsp;&nbsp;00000: Collection information
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601 (Page 9/46)</i>
        </>
      }>
      <div className="pbs-description text-green-800">{value}</div>
    </HtmlTooltip>
  );
};
const CustomerNumber = ({ index = 7 }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <b>{index}. Debtor’s customer number with creditor</b>
          <br />
          15 characters. The customer number may be right-aligned with leading zeros or left-aligned with trailing spaces
          <br />
          <br />
          Document <i>BS_vejledning_DL_0601 (Page 14-15/46)</i>
        </>
      }>
      <div className="pbs-description text-green-800">000000000011007</div>
    </HtmlTooltip>
  );
};
const GreenContent = ({ index = 7, value, title }) => {
  return (
    <HtmlTooltip title={`${index}. ${title}`}>
      <div className="pbs-description text-green-800">{value}</div>
    </HtmlTooltip>
  );
};

const DescriptionPBS = props => {
  return (
    <div style={{ height: '600px', padding: '20px', fontSize: '18px', fontWeight: '500', fontFamily: 'Courier new' }}>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="002" title="Data delivery start" />
        <DataSupplierNumber />
        <Subsystem />
        <DataDeliveryType />
        <HtmlTooltip
          title={
            <>
              <b>6. Data Supplier reference</b>
              <br />
              ---
              <br />
              Serial number as chosen. Reference for this delivery with the Data Supplier.
              <br />
              (?) No idea about the value is 0000000001
              <br />
              <br />
              Document <i>BS_vejledning_DL_0601 (Page 10/46)</i>
            </>
          }>
          <div className="pbs-titleription text-red-800">0000000001</div>
        </HtmlTooltip>
        <BlankSpace index="7" numOfChar="19" />
        <DeliveryCreationDate index="8" />
        <BlankSpace index="9" numOfChar="73" />
        <div style={{ fontSize: '16px' }}>&nbsp;&nbsp;&nbsp;Page 10 - 11</div>
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="012" title="Session start" />
        <PBSNumber />
        <SectionNumber />
        <BlankSpace index="5" numOfChar="5" />
        <DebtorGroupNumber index="6" />
        <BlankSpace index="7" numOfChar="15" title="Creditor’s identification with the Data Supplier, if present" />
        <BlankSpace index="8" numOfChar="4" title="Filler" />
        <HtmlTooltip title="9. Date - 00000000 or delivery creation date">
          <div className="pbs-description text-green-800">00000000</div>
        </HtmlTooltip>
        <BlankSpace index="10" numOfChar="4" title="Filler" />
        <BlankSpace index="11" numOfChar="10" title="Filler" />
        <BlankSpace index="11" numOfChar="60" title="Main text line on payment pre- notification" />
        <div style={{ fontSize: '16px' }}>&nbsp;&nbsp;&nbsp;Page 12 - 13</div>
      </div>
      <br />
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="022" title="Debtor name and address information" />
        <PBSNumber />
        <TransactionCode value="0240" title="Debtor’s name and address" />
        <DataRecordNumber value="00001" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller />
        <ContentWithSpace value="Benny Finn Olsen" numOfChar="35" title="Customer name" />
        <BlankSpace index="10" numOfChar="42" title="Filler" />
        <div style={{ fontSize: '16px' }}>&nbsp;&nbsp;&nbsp;Page 14 - 15</div>
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="022" title="Debtor name and address information" />
        <PBSNumber />
        <TransactionCode value="0240" title="Debtor’s name and address" />
        <DataRecordNumber value="00002" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller />
        <ContentWithSpace value="Hanerupvej 1 F" numOfChar="35" title="Customer address" />
        <BlankSpace index="10" numOfChar="42" title="Filler" />
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="022" title="Debtor name and address information" />
        <PBSNumber />
        <TransactionCode value="0240" title="Debtor’s name and address" />
        <DataRecordNumber value="00003" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller />
        <ContentWithSpace value="Regstrup" numOfChar="35" title="Customer city name" />
        <BlankSpace index="10" numOfChar="42" title="Filler" />
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="022" title="Debtor name and address information" />
        <PBSNumber />
        <TransactionCode value="0240" title="Debtor’s name and address" />
        <DataRecordNumber value="00009" title="Postcode and country" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller />
        <BlankSpace index="9" numOfChar="15" />
        <HtmlTooltip title="10. Zip code">
          <div className="pbs-description text-green-800">4420</div>
        </HtmlTooltip>
        <ContentWithSpace index="11" value="DK" numOfChar="3" title="Country" />
        <BlankSpace index="12" numOfChar="55" title="Filler" />
        <div style={{ fontSize: '16px' }}>&nbsp;&nbsp;&nbsp;Page 16 - 17</div>
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="042" title="Payment date and numOfChar" />
        <PBSNumber />
        <TransactionCode value="0240" title="Debtor’s name and address" />
        <DataRecordNumber value="00010" title="Additional debtor information" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <BlankSpace index="9" numOfChar="40" />
        <ZeroFiller index="10" numOfChar="10" title="CPR number, CVR number or 0000000000" />
        <GreenContent index="11" value="0" title="Selection of dispatch speed: 1 = fast delivery" />
        <GreenContent index="12" value="1" title="The payment slip must always be printed and sent in paper format 1 = Yes" />
        <BlankSpace index="12" numOfChar="34" title="Filler" />
        <div style={{ fontSize: '16px' }}>&nbsp;&nbsp;&nbsp;Page 18 - 19</div>
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="042" title="Payment date and numOfChar" />
        <PBSNumber />
        <TransactionCode value="0240" title="Debtor’s name and address" />
        <DataRecordNumber value="00000" title="Collection information" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller />
        <GreenContent index="9" value="01072021" title="Payment date (ddmmyyyy)" />
        <HtmlTooltip
          title={
            <>
              <b>10. Sign code - 1 character</b>
              0 = No
              <br />
              1 = Collection
              <br />
              2 = Disbursement
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">1</div>
        </HtmlTooltip>
        <HtmlTooltip title="11. numOfChar in ore (øre) without sign - 13 characters">
          <div className="pbs-description text-green-800">0000000136805</div>
        </HtmlTooltip>
        <ContentWithSpace index="12" numOfChar="30" title="Creditor’s reference for the payment (maybe increment+...)" value="114" redContent="true" />
        <BlankSpace index="13" numOfChar="2" title="Filler" />
        <ZeroFiller index="14" numOfChar="15" title="Payment identification for the OCR line" redContent="true" />
        <BlankSpace index="15" numOfChar="8" title="Filler" />
        <div style={{ fontSize: '16px' }}>&nbsp;&nbsp;&nbsp;Page 20 - 21</div>
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="052" title="Text line information" />
        <PBSNumber />
        <TransactionCode value="0241" title="Text to debtor" />
        <DataRecordNumber value="00001" title="Text records per payment" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller index="8" title="Mandate number. Creditors who use Betalingsservice as a total solution must enter 000000000 in the field." />
        <BlankSpace index="9" numOfChar="1" title="Filler" />
        <ContentWithSpace index="10" value="Kundenummer : Benny Finn Olsen" numOfChar="60" />
        <BlankSpace index="11" numOfChar="16" title="Filler" />
        <div style={{ fontSize: '16px' }}>&nbsp;&nbsp;&nbsp;Page 21 - 22</div>
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="052" title="Text line information" />
        <PBSNumber />
        <TransactionCode value="0241" title="Text to debtor" />
        <DataRecordNumber value="00002" title="Text records per payment" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller index="8" title="Mandate number. Creditors who use Betalingsservice as a total solution must enter 000000000 in the field." />
        <BlankSpace index="9" numOfChar="1" title="Filler" />
        <ContentWithSpace index="10" value="Dato" numOfChar="30" />
        <ContentWithSpace index="10" value="Beløb" numOfChar="24" />
        <ContentWithSpace index="10" value="Total" numOfChar="22" />
      </div>
      {[
        {
          date: '03.06.2021',
          subtotal: '404,20',
          total: '404,20',
        },
        {
          date: '27.05.2021',
          subtotal: '329,35',
          total: '329,35',
        },
        {
          date: '10.06.2021',
          subtotal: '456,40',
          total: '456,40',
        },
        {
          date: '17.06.2021',
          subtotal: '160,60',
          total: '160,60',
        },
      ].map((x, i) => {
        return (
          <div key={i} className="flex">
            <SystemIdentification />
            <DataRecordType value="052" title="Text line information" />
            <PBSNumber />
            <TransactionCode value="0241" title="Text to debtor" />
            <DataRecordNumber value={i + 3} title="Text records per payment" />
            <DebtorGroupNumber />
            <CustomerNumber />
            <ZeroFiller index="8" title="Mandate number. Creditors who use Betalingsservice as a total solution must enter 000000000 in the field." />
            <BlankSpace index="9" numOfChar="1" title="Filler" />
            <ContentWithSpace index="10" title="Order date" value={x.created_date} numOfChar="10" />
            <ContentWithSpace index="11" title="Order sub total amount" value={x.subtotal} numOfChar="26" align='R' />
            <ContentWithSpace index="12" title="Order total amount" value={x.total} numOfChar="24" align='R' />
            <BlankSpace index="13" numOfChar="16" title="Filler" />
          </div>
        );
      })}
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="052" title="Text line information" />
        <PBSNumber />
        <TransactionCode value="0241" title="Text to debtor" />
        <DataRecordNumber value='00007' title="Text records per payment" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller index="8" title="Mandate number. Creditors who use Betalingsservice as a total solution must enter 000000000 in the field." />
        <BlankSpace index="9" numOfChar="1" title="Filler" />
        <ContentWithSpace index="10" title="Administration fee title" value='Administrationsgebyr' numOfChar="30" />
        <ContentWithSpace index="11" title="Adminstration fee sub total amount" value='17,50' numOfChar="6" align='R' />
        <ContentWithSpace index="12" title="Adminstration fee total amount" value='17,50' numOfChar="24" align='R' />
        <BlankSpace index="13" numOfChar="16" title="Filler" />
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="052" title="Text line information" />
        <PBSNumber />
        <TransactionCode value="0241" title="Text to debtor" />
        <DataRecordNumber value='00007' title="Text records per payment" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller index="8" title="Mandate number. Creditors who use Betalingsservice as a total solution must enter 000000000 in the field." />
        <BlankSpace index="9" numOfChar="1" title="Filler" />
        <BlankSpace index="10" numOfChar="76" title="Filler" />
      </div>
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="052" title="Text line information" />
        <PBSNumber />
        <TransactionCode value="0241" title="Text to debtor" />
        <DataRecordNumber value='00007' title="Text records per payment" />
        <DebtorGroupNumber />
        <CustomerNumber />
        <ZeroFiller index="8" title="Mandate number. Creditors who use Betalingsservice as a total solution must enter 000000000 in the field." />
        <BlankSpace index="9" numOfChar="1" title="Filler" />
        <ContentWithSpace index="10" title="Total title" value='Total' numOfChar="5" />
        <ContentWithSpace index="11" title="Total amount" value='1368,05' numOfChar="55" align='R' />
        <BlankSpace index="10" numOfChar="16" title="Filler" />
      </div>

      <br />
      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="092" title="Text line information" />
        <PBSNumber />
        <TransactionCode value="0112" title="Automated payment end" />
        <DataRecordNumber value='00000' title="section end" />
        <DebtorGroupNumber />
        <BlankSpace index='7' numOfChar="4" title="Filler" />
        <HtmlTooltip
          title={
            <>
              <h2 style={{ color: 'green' }}>Number of BS042 prefix</h2>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">00000001322</div>
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <>
              <h2>Net numOfChar in ore (øre), without sign of prefixed record type 042 in the section</h2>
              <div className="pbs-description">
                Note: The field is a nonsense total put together from numOfChars from field 16, the numOfChar actually paid in (position 116–128) in type
                042 records. Any rejections, chargebacks etc. are therefore not deducted. The status of an individual payment can be read from the
                transaction code in field 4 (pos. 014-017).
              </div>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">000000168969114</div>
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <>
              <h2 style={{ color: 'green' }}>Number of BS052 prefix</h2>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">000000000011330</div>
        </HtmlTooltip>
        <BlankSpace index='10' numOfChar="15" title="Filler" />
        <HtmlTooltip
          title={
            <>
              <h2 style={{ color: 'green' }}>Number of BS022 prefix</h2>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">000000000006610</div>
        </HtmlTooltip>
        <BlankSpace index='12' numOfChar="26" title="Filler" />
      </div>

      <div className="flex">
        <SystemIdentification />
        <DataRecordType value="092" title="Text line information" />
        <DataSupplierNumber index='3' />
        <Subsystem index='4' />
        <HtmlTooltip
          title={
            <>
              <h2 style={{ color: 'green' }}>System type</h2>
            </>
          }>
          <div className="pbs-description text-green-800">0601</div>
        </HtmlTooltip>
        <ContentWithSpace index='6' value='00000000001' redContent={true} numOfChar='11' />
        <HtmlTooltip
          title={
            <>
              <h2 style={{ color: 'green' }}>Number of BS042 prefix</h2>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">00000001322</div>
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <>
              <h2>Net numOfChar in ore (øre), without sign of prefixed record type 042 in the section</h2>
              <div className="pbs-description">
                Note: The field is a nonsense total put together from numOfChars from field 16, the numOfChar actually paid in (position 116–128) in type
                042 records. Any rejections, chargebacks etc. are therefore not deducted. The status of an individual payment can be read from the
                transaction code in field 4 (pos. 014-017).
              </div>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">000000168969114</div>
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <>
              <h2 style={{ color: 'green' }}>Number of BS052 prefix</h2>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">000000000011330</div>
        </HtmlTooltip>
        <BlankSpace index='10' numOfChar="17" title="Filler" />
        <HtmlTooltip
          title={
            <>
              <h2 style={{ color: 'green' }}>Number of BS022 prefix</h2>
              Document BS_vejledning_DL_0601 (18/46)
              <br />
            </>
          }>
          <div className="pbs-description text-green-800">0000000006610</div>
        </HtmlTooltip>
        <ZeroFiller index="12" numOfChar="26" />
      </div>
    </div >
  );
};
export default DescriptionPBS;
