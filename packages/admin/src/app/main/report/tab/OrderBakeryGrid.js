import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { getPagePermission, MSG_NO_DATA } from 'app/constants';
import { withRouter } from 'react-router';
import axios from 'app/axios';
import { endOfDay, startOfDay } from 'date-fns';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { Link } from '@material-ui/core';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { Grid, GridNoRecords, GridColumn as Column } from '@progress/kendo-react-grid';
import { ItemNumberCell, PriceCell } from 'app/kendo/CustomCell';
import ImagePopOver from 'app/shared-components/ImagePopOver';


const OrderDetailList = props => {
  return (
    <section>
      <Grid
        data={props.dataItem.order_list}
      >
        <Column
          field='_id'
          title='ID'
          width='150'
          cell={propsCell => {
            return (
              <td>
                <Link href={`/order?id=${propsCell.dataItem._id}`} target='_blank' rel='noopener'>
                  {propsCell.dataItem._id}
                </Link>
              </td>
            );
          }}
        />
        <Column
          field='customer_name'
          title='Kunder'
          cell={propsCell => {
            return (
              <td>
                <Link href={`/customer?id=${propsCell.dataItem.customer_id}`} target='_blank' rel='noopener'>
                  {propsCell.dataItem.customer_name}
                </Link>
              </td>
            );
          }}
        />
        <Column
          field='address_info.address'
          title='Adresse'
          width='250'
        />
        <Column
          field='address_info.zip_code'
          title='Postnumre'
          width='200'
        />

      </Grid>
    </section>
  )
};

function OrderBakeryGrid(props) {
  const [date, setDate] = useState(new Date());
  const [orderBakery, setOrderBakery] = useState(null);

  const getOrderBakery = () => {
    if (date) {
      let params = {
        from_date: startOfDay(date) / 1000 | 0,
        to_date: endOfDay(date) / 1000 | 0,
      }
      axios.get(`/reports/order-bakery`, { params })
        .then(response => {
          setOrderBakery(response.data.data);
        }).catch(e => { });
    }
  }

  useKeyListener(null, getOrderBakery);

  useEffect(() => {
    getOrderBakery();
  }, [date]);

  const handleChangeRangePicker = (e) => {
    setDate(e.value);
  }

  return (
    <div style={{ height: 'calc(100vh - 165px)', }}>
      <div className='flex'>
        <div>
          <div>Dato</div>
          <DatePicker value={date} //className='mt-10'
            onChange={(e) => handleChangeRangePicker(e)} />
        </div>
      </div>
      {!orderBakery ? <LoadingPanel /> : (
        <Grid
          style={{ height: 'calc(100vh - 195px)', overflow: 'auto', marginTop: 8 }}
          data={orderBakery}
          detail={({ dataItem }) => {
            return <OrderDetailList dataItem={dataItem} />
          }}
        >
          <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
          <Column
            field='item_number'
            title='Varenr.'
            width='85'
            filterable={false}
            cell={ItemNumberCell}
          />
          <Column
            field='image'
            title='Billede'
            width='80'
            filterable={false}
            cell={propsCell => {
              return (
                <td>
                  <ImagePopOver src={propsCell.dataItem.image} ignoreCache={true} />
                </td>
              );
            }}
          />
          <Column
            field='name'
            title='Navn'
            cell={propsCell => {
              return (
                <td>
                  <Link href={`/product?id=${propsCell.dataItem._id}`} target='_blank' rel='noopener'>
                    {propsCell.dataItem.name}
                  </Link>
                </td>
              );
            }}
          />
          <Column
            field='price'
            title='Pris'
            width='100'
            cell={propsCell => <PriceCell number={propsCell.dataItem.price} displayCurrency={false} />}
          />
          <Column
            field='quantity'
            title='Antal'
            width='100'
          />
          <Column
            field='total'
            title='Total'
            width='100'
            cell={propsCell => <PriceCell number={propsCell.dataItem.total} displayCurrency={false} />}
          />
        </Grid>
      )}
    </div>

  )
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(
//     {
//       closeDialog,
//       openDialog,
//     },
//     dispatch,
//   );
// }
function mapStateToProps({ auth }) {
  return {
    user: auth.user,
    pagePermission: getPagePermission('report', auth.user),
  };
}
export default withRouter(connect(mapStateToProps, null)(OrderBakeryGrid));
