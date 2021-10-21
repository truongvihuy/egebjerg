import { useEffect, useState } from 'react';
import axios from 'app/axios';
import type from 'typeface-ubuntu/files/ubuntu-latin-400.woff';
import { PDFViewer, Document, View, Text, StyleSheet, Page, Image, Font } from '@react-pdf/renderer';
import { Checkbox } from 'app/pdf/checkbox';
import { Barcode } from 'app/pdf/barcode';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { PAYMENT_METHOD } from 'app/constants';
import { formatNumber, convertUnixTime } from 'app/helper/general.helper';
import { merge } from 'lodash';

Font.register({
  family: 'ubuntu',
  fonts: [
    {
      src: type
    },
  ]
})

const border = '1 solid gray';
const styles = StyleSheet.create({
  body: {
    fontFamily: 'ubuntu',
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontSize: 10,
  },
  table: {
    marginBottom: 10,
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 2,
  },
  rowNoMargin: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  rowBorderBottom: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderBottom: border,
    paddingBottom: 4,
    marginBottom: 4,
  },
  col1: {
    width: '8.333%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col2: {
    width: '16.667%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col3: {
    width: '25%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col4: {
    width: '33.333%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col5: {
    width: '41.667%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col6: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col7: {
    width: '58.333%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col8: {
    width: '66.667%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col9: {
    width: '75%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col10: {
    width: '83.333%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 2,
  },
  col11: {
    width: '91.667%',
    display: 'flex',
    paddingRight: 2,
    flexDirection: 'column',
  },
  col12: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 2,
  },
  rowInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderLeft: border,
  },
  colLabel: {
    width: '33.333%',
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 4px 2px 4px',
    borderTop: border,
    borderRight: border,
  },
  colInfo: {
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 4px 2px 4px',
    borderTop: border,
    borderRight: border,
  },
  colItemNumber: {
    padding: 4,
    width: '10%',
    display: 'flex',
    flexDirection: 'column',
  },
  colName: {
    padding: 4,
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
  },
  colQuantity: {
    padding: 4,
    width: '7%',
    display: 'flex',
    flexDirection: 'column',
  },

  headerInfo: {
    fontSize: 11,
    fontWeight: 'extrabold',
    borderBottom: border,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    textAlign: 'center'
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 11,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: -10,
    paddingLeft: 60,
  },
  logo: {
    width: '70%',
  },
  barcode: {
    width: 100,
    margin: 8,
  }
});


const column = [
  {
    title: <Text style={{ textAlign: 'right', paddingRight: 8 }}>Antal</Text>,
    cell: (dataItem) => <Text style={{ fontSize: 20, textAlign: 'right', paddingRight: 8 }}>{dataItem.quantity}</Text>,
    width: styles.col1,
  },
  {
    title: 'Produkt',
    cell: (dataItem) => <Text >{dataItem.name}</Text>,
    width: styles.col4,
  },
  {
    title: 'Kommentar',
    cell: (dataItem) => <Text>{dataItem.note}</Text>,
    width: styles.col2,
  },
  {
    title: 'Enhed/Stregkode',
    cell: (dataItem) => <View>
      <Text>{dataItem.unit}</Text>
      <Text style={{ marginTop: '10px' }}>{dataItem.barcode}</Text>
    </View>,
    width: styles.col2,
  },
  {
    title: <Text style={{ textAlign: 'right' }}>Varenr</Text>,
    cell: (dataItem) => <Text style={{ textAlign: 'right' }}>{dataItem.item_number?.[0] ?? ''}</Text>,
    width: styles.col1,
  },
  {
    title: <Text style={{ textAlign: 'right' }}>Pris</Text>,
    cell: (dataItem) => <Text style={{ textAlign: 'right' }}>{formatNumber(dataItem.price, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</Text>,
    width: styles.col1,
  },
  {
    title: <Text style={{ textAlign: 'right' }}>Total</Text>,
    cell: (dataItem) => <Text style={{ textAlign: 'right' }}>{formatNumber(dataItem.price * dataItem.quantity, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</Text>,
    width: styles.col1,
  },
];


const columnDiscount = [
  {
    width: styles.col1,
  },
  {
    cell: (dataItem) => <Text>Rabat på {dataItem.name}</Text>,
    width: styles.col6,
  },
  {
    cell: (dataItem) => <Text style={{ textAlign: 'right' }}>{dataItem.discount_quantity}</Text>,
    width: styles.col2,
  },
  {
    cell: (dataItem) => <Text style={{ textAlign: 'right' }}>{formatNumber(-dataItem.discount, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</Text>,
    width: styles.col3,
  }
];

const TemplateOrderDetail = ({ dataItem, style }) => {
  const [orderInfo, setOrderInfo] = useState({});
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { order, customer } = orderInfo;

  const getOrder = (_id) => {
    axios.get(`/orders/${_id}/print`)
      .then(({ data }) => {
        setOrderInfo(data.data);
      });
  };

  const getSetting = () => {
    axios.get(`/settings`)
      .then(({ data }) => {
        setSettings(data.data);
      });
  };

  useEffect(() => {
    getOrder(dataItem._id);
    getSetting();
  }, []);

  const ReplacementGoods = ({ type, checked, styleRow = styles.row, styleCols = [styles.col6, styles.col1], borderCheckbox = true }) => {
    let title = '';
    switch (type) {
      case 'milk_and_bread': {
        const setting = settings.find(e => e.key === 'replacement_milk_and_bread_info_text');
        title = setting?.name;
        break;
      }
      case 'promotion': {
        const setting = settings.find(e => e.key === 'replacement_promotional_goods_info_text');
        title = setting?.name;
        break;
      }
      case 'ordinary': {
        const setting = settings.find(e => e.key === 'replacement_normal_goods_info_text');
        title = setting?.name;
        break;
      }
    }
    const value = checked !== undefined ? checked : (typeof order.replacement_goods === 'object' ? (order.replacement_goods?.[type] ?? false) : false);

    return (
      <View style={styleRow}>
        <Text style={styleCols[0]}>{title}</Text>
        <View style={styleCols[1]}>
          <Checkbox checked={value} border={borderCheckbox} />
        </View>
      </View>
    );
  }

  return (
    <>
      {loading && <LoadingPanel width={'100%'} />}
      {order && (
        <PDFViewer style={style}>
          <Document onRender={() => setLoading(false)}>
            <Page style={styles.body}>
              <View style={styles.row}>
                <View style={styles.col6}>
                  <Text style={styles.headerInfo}>Kunde</Text>
                  <View style={styles.table}>
                    <View style={styles.rowInfo}>
                      <Text style={styles.colLabel}>Navn</Text>
                      <Text style={styles.colInfo}>{order.customer_name}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.colLabel}>Adresse</Text>
                      <Text style={styles.colInfo}>{order.address_info?.address}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.colLabel}>Postnr. / by</Text>
                      <Text style={styles.colInfo}>{order.address_info?.zip_code} {order.address_info?.city}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.colLabel}>Telefon</Text>
                      <View style={styles.colInfo}>
                        {order.phone?.map((phone, index) => (<Text key={index} >{phone}</Text>))}
                      </View>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.colLabel}>Kundenr.</Text>
                      <View style={styles.colInfo}>
                        <Barcode style={styles.barcode} barcode={order.store_customer_number} />
                      </View>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={merge({ borderBottom: border }, styles.colLabel)}>Medlemskort stregkodenr.</Text>
                      <View style={merge({ borderBottom: border }, styles.colInfo)}>
                        <Barcode style={styles.barcode} barcode={order.membership_number} />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.col6}>
                  <View>
                    <Text style={styles.headerInfo}>Brugs</Text>
                    <View style={styles.table}>
                      <View style={styles.rowInfo}>
                        <Text style={merge({ borderBottom: border }, styles.colLabel)}>Navn</Text>
                        <Text style={merge({ borderBottom: border }, styles.colInfo)}>{order.store?.name}</Text>
                      </View>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.headerInfo}>Bestillings oplysninger</Text>
                    <View style={styles.table}>
                      <View style={styles.rowInfo}>
                        <Text style={styles.colLabel}>Ordre nr.</Text>
                        <Text style={styles.colInfo}>{order._id}</Text>
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.colLabel}>Oprettet</Text>
                        <Text style={styles.colInfo}>{convertUnixTime(order.created_date)}</Text>
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.colLabel}>Oprettet af</Text>
                        <Text style={styles.colInfo}>{order.order_by?.name}</Text>
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={merge({ borderBottom: border }, styles.colLabel)}>Kørenr.</Text>
                        <Text style={merge({ borderBottom: border }, styles.colInfo)}>{order.shipping_code}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.table}>
                <ReplacementGoods type='ordinary' borderCheckbox={false}
                  styleRow={styles.rowInfo}
                  styleCols={[
                    merge({}, styles.col6, { padding: 4, borderTop: border, borderRight: border }),
                    merge({}, styles.col1, { padding: 4, borderTop: border, borderRight: border, width: 20 }),
                  ]} />
                <ReplacementGoods type='milk_and_bread' borderCheckbox={false}
                  styleRow={styles.rowInfo}
                  styleCols={[
                    merge({}, styles.col6, { padding: 4, borderTop: border, borderRight: border }),
                    merge({}, styles.col1, { padding: 4, borderTop: border, borderRight: border, width: 20 }),
                  ]} />
                <ReplacementGoods type='promotion' borderCheckbox={false}
                  styleRow={styles.rowInfo}
                  styleCols={[
                    merge({}, styles.col6, { padding: 4, borderTop: border, borderRight: border, borderBottom: border, }),
                    merge({}, styles.col1, { padding: 4, borderTop: border, borderRight: border, borderBottom: border, width: 20 }),
                  ]} />
              </View>
              {order.admin_comment ? (
                <View style={styles.table}>
                  <Text style={{ border, padding: 4 }}>{order.admin_comment}</Text>
                </View>
              ) : null}
              {order.note ? (
                <View style={styles.table}>
                  <Text style={{ border, padding: 4 }}>{order.note}</Text>
                </View>
              ) : null}
              <View style={styles.table}>
                <Text>Betalingsmetode: {PAYMENT_METHOD[order.payment_method]?.label ?? order.payment_method}</Text>
              </View>
              <Text style={styles.title}>VISITATION</Text>
              <Text style={styles.headerInfo}>Bestilling</Text>

              <View style={styles.table}>
                <View style={styles.rowBorderBottom}>
                  {column.map((col, i) => (
                    <View key={i} style={{ ...col.width, fontWeight: 'ultrabold' }}>{typeof col.title === 'string' ? <Text>{col.title}</Text> : col.title}</View>
                  ))}
                </View>
                {order.product_list.map((item, index) => {
                  const haveDiscount = item.discount_quantity > 0;
                  return (
                    <View key={index}>
                      <View style={merge({}, haveDiscount ? styles.row : styles.rowBorderBottom, { paddingBottom: 20 })}>
                        {column.map((col, i) => (
                          <View key={i} style={col.width}>{col.cell ? col.cell(item) : null}</View>
                        ))}
                      </View>
                      {haveDiscount && (
                        <View style={merge({}, styles.rowBorderBottom, { paddingBottom: 20 })}>
                          {columnDiscount.map((col, i) => (
                            <View key={i} style={col.width}>{col.cell ? col.cell(item) : null}</View>
                          ))}
                        </View>
                      )}
                    </View>
                  )
                })}
              </View>

              <Text style={{ ...styles.title, marginBottom: 20 }} break>EGEBJERG KØBMANDSGÅRD A/S</Text>
              <View styles={{ ...styles.table }}>
                <View style={merge({}, styles.rowNoMargin, { border: border, })}>
                  <Text style={merge({}, styles.colItemNumber, { borderRight: border })}>Varenr</Text>
                  <Text style={merge({}, styles.colName, { borderRight: border })}>Navn</Text>
                  <Text style={merge({}, styles.colQuantity, { borderRight: border })}>Antal</Text>
                  <Text style={merge({}, styles.colItemNumber, { borderRight: border })}>Varenr</Text>
                  <Text style={merge({}, styles.colName, { borderRight: border })}>Navn</Text>
                  <Text style={styles.colQuantity}>Antal</Text>
                </View>
                {new Array(20).fill(0).map((_, index) => (
                  <View key={index} style={merge({}, styles.rowNoMargin, { borderLeft: border, borderBottom: border, borderRight: border })}>
                    <Text style={merge({}, styles.colItemNumber, { borderRight: border, color: '#fff' })}>a</Text>
                    <Text style={merge({}, styles.colName, { borderRight: border, color: '#fff' })}>a</Text>
                    <Text style={merge({}, styles.colQuantity, { borderRight: border, color: '#fff' })}>a</Text>
                    <Text style={merge({}, styles.colItemNumber, { borderRight: border, color: '#fff' })}>a</Text>
                    <Text style={merge({}, styles.colName, { borderRight: border, color: '#fff' })}>a</Text>
                    <Text style={merge({}, styles.colQuantity, { color: '#fff' })}>a</Text>
                  </View>
                ))}
              </View>

              <View style={{ ...styles.row, marginTop: 20, marginBottom: 20 }}>
                <View style={styles.col6}>
                  <Text>{customer.name}</Text>
                  <Text>{customer.address}</Text>
                  <Text>{customer.zip_code.zip_code} {customer.zip_code.city_name}</Text>
                  <Text>Telefon: {customer.phone?.map((phone, index) => `${phone} ${customer.phone.length - 1 !== index ? ',' : ''}`)}</Text>
                </View>
                <View style={styles.col6}>
                  <Text>Kommune: {customer.zip_code.municipality_name}</Text>
                  <Text style={{ paddingBottom: 20, paddingTop: 20, borderBottom: border }}>Hjælpers navn:</Text>
                  <Text style={{ paddingBottom: 20, paddingTop: 20, borderBottom: border }}>Hjælpers tlf.nr.:</Text>
                </View>
              </View>
              <View style={{ ...styles.row }}>
                <View style={styles.col6}>
                  <Text style={styles.row}>Sæt kryds i rubrik:</Text>
                  <ReplacementGoods type='ordinary' checked={false} styleCols={[styles.col10, styles.col2]} />
                  <ReplacementGoods type='milk_and_bread' checked={false} styleCols={[styles.col10, styles.col2]} />
                  <ReplacementGoods type='promotion' checked={false} styleCols={[styles.col10, styles.col2]} />
                </View>
                <View style={{ ...styles.col6, paddingTop: 20 }}>
                  <View style={styles.logoWrapper}>
                    <Image style={styles.logo} src='/assets/images/logos/logo-outline-black.png' />
                  </View>
                  <Text style={styles.row}>Fax indkøbsliste til: 5991 4647</Text>
                  <Text style={styles.row}>Ved evt. spørgsmål - ring til 7025 8888</Text>
                  <Text style={styles.row}>E-mail: info@egebjergkobmandsgaard.dk</Text>
                </View>
              </View>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                `${pageNumber} / ${totalPages}`
              )} fixed />
            </Page>
          </Document>
        </PDFViewer>)
      }
    </>
  );
};

export default TemplateOrderDetail;