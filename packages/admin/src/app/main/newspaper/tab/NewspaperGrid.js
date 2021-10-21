import React, { useEffect } from 'react';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { process as processData } from '@progress/kendo-data-query';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { showErrorMessage } from 'app/store/fuse/messageSlice';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import NewspaperForm from './NewspaperForm';
import { ActiveCell, TextFilterCell, NumberFilterCell, ActiveFilterCell, GridToolbarCustom, DateFilterCell } from 'app/kendo/CustomCell';
import { getPagePermission } from 'app/constants';
import { changeUrlParamByDataState, convertUnixTime, initDataState, parseUrlParams } from 'app/helper/general.helper';

const initData = {
  name: '',
  total_page: 0,
  active: false,
  from: null,
  to: null,
};

const moduleName = 'newspaper';
const filterTypeList = {
  _id: 'number',
  name: 'text',
  from_date: 'date',
  to_date: 'date',
  active: 'boolean',
}

const NewspaperContent = (props) => {
  const query = parseUrlParams(props.location.search);
  const [dataState, setDataState] = React.useState(initDataState(query, filterTypeList));

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList);
    setDataState(newDataState);
  }, [props.location]);

  const add = dataItem => {
    props.onCreateNewspaper(dataItem);
  };

  const update = dataItem => {
    props.onChangeNewspaper(dataItem);
  };

  const remove = dataItem => {
    props.onDeleteNewspaper(dataItem);
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      fullWidth: true,
      maxWidth: 'md',
      children: <NewspaperForm
        dataItem={{ ...initData }}
        onSubmit={add}
        closeDialog={props.closeDialog}
        openDialog={props.openDialog}
        showErrorMessage={props.showErrorMessage}
      />
    })
  };

  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      fullWidth: true,
      maxWidth: 'md',
      children: <NewspaperForm
        dataItem={{ ...dataItem }}
        onSubmit={update}
        remove={remove}
        pagePermission={props.pagePermission}
        openDialog={props.openDialog}
        closeDialog={props.closeDialog}
        showErrorMessage={props.showErrorMessage}
      />,
    });
  };

  const changeOfferTab = dataItem => {
    props.onChangeTab(dataItem);
  };

  const processedData = React.useMemo(() => processData(props.newspaperList, dataState), [props.newspaperList, dataState]);

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState, filterTypeList);
  };

  return (
    <>
      <Grid
        className='container-default'
        data={processedData}
        filterable
        sortable
        {...dataState}
        onDataStateChange={onDataStateChange}
        onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}
      >
        <GridToolbar>
          <GridToolbarCustom
            dataState={dataState} onClearChange={(e) => setDataState(e.dataState)}
            insert={props.pagePermission.insert} handleAdd={handleAdd} />
        </GridToolbar>
        <Column field='_id' title='ID' filter='numeric' width='100' filterCell={NumberFilterCell} />
        <Column field='name' title='Navn' filterCell={TextFilterCell} />
        <Column field='total_page' title='Antal sider' filterable={false} />
        <Column field='from_date' title='Starttidspunkt' filterCell={DateFilterCell} filter='date' cell={({ dataItem }) => (
          <td className='datetime-cell'>
            {convertUnixTime(dataItem.from)}
          </td>
        )} />
        <Column field='to_date' title='Sluttidspunkt' filterCell={DateFilterCell} filter='date' cell={({ dataItem }) => (
          <td className='datetime-cell'>
            {convertUnixTime(dataItem.to)}
          </td>
        )} />
        <Column field='active' title='Aktiv' filter='boolean' cell={ActiveCell} filterCell={ActiveFilterCell} />
        <Column width='150' filterable={false} cell={({ dataItem }) => (
          <td>
            <IconButton onClick={() => changeOfferTab(dataItem)} title='Tilbud'>
              <Icon>local_offer</Icon>
            </IconButton>
          </td>
        )} />
      </Grid>
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog,
      showErrorMessage
    },
    dispatch
  );
}
function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('newspaper', auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewspaperContent));
