import { useState } from 'react';
import { process } from '@progress/kendo-data-query';
import { Grid, GridNoRecords, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { MSG_NO_DATA } from 'app/constants';
import { PriceCell, WeightCell } from 'app/kendo/CustomCell';
import { formatCurrency } from 'app/helper/general.helper';


function OverweightRow(props) {
  const [dataState, setDataState] = useState({ skip: 0 });

  const onStateChange = e => {
    let newStateChange = {
      ...dataState,
      ...(e.dataState ?? e.page)
    };
    setDataState(newStateChange);
  };

  return (
    <Grid
      style={{ marginTop: 8 }}
      data={process(props.report.report_list.slice(0) ?? [], dataState)}
      sortable
      {...dataState}
      onDataStateChange={onStateChange}
    >
      <GridToolbar>
        <div className='flex flex-col'>
          <div>Usage: {props.report?.store_name}</div>
          <div>Number of orders with overweight: {props.report?.overweight_order_quantity}</div>
          <div>Number of orders overweight fees: {props.report?.overweight_fee_quantity}</div>
          <div>Total overweight fee: {formatCurrency(props.report?.total_overweight_fee)}</div>
        </div>
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column
        field='_id'
        title='Kommune'
        width="400"
        cell={({ dataItem }) => <td>{dataItem.municipality.name}</td>}
      />
      <Column
        field='order_total'
        title='Total order total'
        filterable={false}
        cell={({ dataItem }) => <PriceCell number={dataItem.order_total} />}

      />
      <Column
        field='order_quantity'
        title='number of orders'
        filterable={false}
      />
      <Column
        field='overweight_order_quantity'
        title='number of orders with overweigth'
        filterable={false}
      />
      <Column
        field='total_weight'
        title='Total weight'
        filterable={false}
        cell={({ dataItem }) => <WeightCell number={dataItem.total_weight} />}
      />
      <Column
        field='total_overweight'
        title='Total overweight'
        filterable={false}
        cell={({ dataItem }) => <WeightCell number={dataItem.total_overweight} />}
      />
      <Column
        field='overweight_fee_quantity'
        title='number of overweight fee'
        filterable={false}
      />
      <Column
        field='total_overweight_fee'
        title='total overweight fee'
        filterable={false}
        cell={({ dataItem }) => <PriceCell number={dataItem.total_overweight_fee} />}
      />
    </Grid>
  )
}

export default OverweightRow;
