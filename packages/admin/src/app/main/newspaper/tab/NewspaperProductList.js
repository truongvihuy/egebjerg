import { useState, useEffect, useCallback } from 'react';
import axios from 'app/axios';
import { GridNoRecords, Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG, OFFER_TYPE_CONFIG, OFFER_TYPE } from 'app/constants';
import { process as processDataState } from '@progress/kendo-data-query';
import {
  TextFilterCell,
  NumberFilterCell,
  PriceCell,
  ProductActiveCell,
  CustomPaging,
  DropdownFilterCell,
  GridToolbarCustom,
  StatusFilterCell,
} from 'app/kendo/CustomCell';
import { useGridScrollTop } from 'app/shared-components/KeyListener';
import { withRouter } from 'react-router';
import { initDataState, parseUrlParams, changeUrlParamByDataState } from 'app/helper/general.helper';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import { formatCurrency } from 'app/helper/general.helper';
import OfferForm from './OfferForm';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';

const moduleName = 'product';
const filterTypeList = {
  _id: 'number',
  offer_id: 'number',
  name: 'text',
  offer_type: 'number',
  status: 'number',
}

const NewspaperProductList = props => {
  const query = parseUrlParams(props.location.search);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  useGridScrollTop([dataState.skip]);
  const newspaperList = props.newspaperList;
  const [data, setData] = useState([]);
  const [selectedNewspaper, setSelectedNewspaper] = useState(newspaperList ? newspaperList[0] : null);
  const [offerMap, setOfferMap] = useState({});

  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      fullWidth: true,
      maxWidth: 'md',
      children: <OfferForm dataItem={{ ...dataItem }} {...props} />,
    });
  };

  useEffect(() => {
    let params = {};
    let offer_id_list = [];
    if (selectedNewspaper) {
      offer_id_list = selectedNewspaper.offer_list.offer_id_list.flat(Infinity);
      params = { _id: offer_id_list };
    }
    axios.get(`/offers`, { params }).then(response => {
      let productList = [];
      let newOfferMap = {};
      response.data.data.forEach(offer => {
        let newspaper = selectedNewspaper ?? newspaperList.find(x => x._id == offer.newspaper_id);
        newOfferMap[offer._id] = offer;
        let offerType = offer.type;
        let productOfferList = offer.product_list.map(x => {
          let productProcessed = { ...x };
          productProcessed.newspaper_name = newspaper.name;
          productProcessed.offer_type = offerType;
          productProcessed.sale_price = offer.sale_price ?? null;
          productProcessed.quantity = offer.quantity ?? null;
          productProcessed.offer_id = offer._id;
          if (offer.type == OFFER_TYPE.MEMBER) {
            productProcessed.membership = true;
          }
          return productProcessed;
        });
        productList = productList.concat(productOfferList);
      });
      setOfferMap(newOfferMap);
      setData(productList);
    });
  }, [selectedNewspaper]);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);
  }, [props.location]);

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, 'newspaper', e.dataState, filterTypeList, { tab: 2 });
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const NewspaperFilterCell = useCallback(propFilter => {
    return (
      <DropdownFilterCell
        id="type-filter"
        value={selectedNewspaper._id}
        onChange={e => {
          if (e.value) {
            let newSelectedNewspaper = newspaperList.find(x => x._id == e.value);
            setSelectedNewspaper(newSelectedNewspaper);
          }
        }}
        data={newspaperList}
      />
    );
  }, []);

  const OfferTypeFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="type-filter" {...propFilter} data={Object.values(OFFER_TYPE_CONFIG)} />;
  }, []);
  const processData = e => {
    return processDataState(data, dataState);
  };
  return (
    <Grid
      style={{
        height: 'calc(100vh - 150px)',
      }}
      data={processData()}
      onRowDoubleClick={({ dataItem }) => {
        handleUpdate(offerMap[dataItem.offer_id]);
      }}
      pageable={PAGING_CONFIG}
      pager={CustomPaging}
      {...dataState}
      total={data.length}
      onDataStateChange={onDataStateChange}
      filterable={true}>
      <GridToolbar>
        <GridToolbarCustom dataState={dataState} onClearChange={onDataStateChange} />
      </GridToolbar>
      {/* <GridToolbar>
      <ComboBox
        data={newspaperList} textField={textField}
        value={selectedNewspaper} onChange={onChangeSelect} />
      {selectedNewspaper && <span>{convertUnixTime(selectedNewspaper.from)} {'->'} {convertUnixTime(selectedNewspaper.to)}</span>}
    </GridToolbar> */}
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="_id" title="ID" width="150" filterCell={NumberFilterCell} />
      <Column field="offer_id" title="Tilbud ID" width="150" filterCell={NumberFilterCell} />
      <Column field="newspaper_name" title="Newspaper name" width="150" filterCell={NewspaperFilterCell} />
      <Column
        field="image"
        title="Billede"
        width="80"
        filterable={false}
        cell={propsCell => {
          return (
            <td>
              <ImagePopOver src={propsCell.dataItem.image} />
            </td>
          );
        }}
      />
      <Column field="name" title="Producent" filterCell={TextFilterCell} />
      <Column
        field="offer_type"
        title="Tilbud"
        filterCell={OfferTypeFilterCell}
        cell={({ dataItem }) => <td>{OFFER_TYPE_CONFIG[dataItem.offer_type].name}</td>}
      />
      <Column field="price" title="Pris" width="150" cell={propsCell => <PriceCell number={propsCell.dataItem.price} />} filterable={false} />
      <Column
        title="Tilbudsbeskrivelse"
        width="300"
        filterable={false}
        cell={propsCell => {
          return (
            <td>
              {propsCell.dataItem.sale_price && <div>Udsalgspris {formatCurrency(propsCell.dataItem.sale_price)}</div>}
              {propsCell.dataItem.quantity ? <div>Antal {propsCell.dataItem.quantity}</div> : null}
              {propsCell.dataItem.membership ? <div>Medlemskab</div> : null}
            </td>
          );
        }}
      />
      <Column field="status" title="Aktiv" filter="boolean" cell={ProductActiveCell} filterCell={StatusFilterCell} />
    </Grid>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}
function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('newspaper', auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewspaperProductList));
