import React from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { OFFER_TYPE_CONFIG } from 'app/constants';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import OfferForm from './OfferForm';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import { ProductActiveCell, PriceCell, ItemNumberCell } from 'app/kendo/CustomCell';
import { getPagePermission } from 'app/constants';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';

const expandField = 'expanded';

export const DetailProductList = props => {
  return (
    <section>
      <Grid
        data={props.dataItem.product_list} className={props.className ?? 'product-offer'}
        onRowDoubleClick={() => {
          props.onRowDoubleClick && props.onRowDoubleClick({ dataItem: props.dataItem })
        }}
      >
        <Column field="item_number" title="Varenr." width="75" cell={ItemNumberCell} />
        <Column
          field="image"
          title="Billede"
          width="80"
          cell={propsCell => (
            <td >
              <ImagePopOver src={propsCell.dataItem.image} />
            </td>
          )}
        />
        <Column field="name" title="Navn" />
        <Column field="price" title="Pris" width="100" cell={propsCell => <PriceCell number={propsCell.dataItem.price} />} />
        <Column field="active" title="Aktiv" width="95" filter="boolean" cell={ProductActiveCell} />
        {props.onRemove && (
          <Column
            width="60"
            cell={({ dataItem }) => (
              <td>
                <IconButton type="button" className="k-grid-remove-command" onClick={() => props.onRemove(dataItem)} title="Slet">
                  <Icon color="secondary">delete</Icon>
                </IconButton>
              </td>
            )}
          />
        )}
      </Grid>
    </section>
  );
};

const OfferGrid = props => {
  const [shortened, setShortened] = React.useState([]);

  React.useEffect(() => {
    setShortened([]);
  }, [props.offerList]);

  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      fullWidth: true,
      maxWidth: 'md',
      children: <OfferForm dataItem={{ ...dataItem }} onSubmit={update} remove={remove} closeDialog={props.closeDialog} openDialog={props.openDialog} />,
    });
  };

  const remove = dataItem => {
    props.onDeleteOffer(dataItem);
  };

  const update = dataItem => {
    props.onChangeOffer(dataItem);
  };

  const confirmDeleteOffer = (dataItem) => {
    props.openDialog({
      children: (
        <ConfirmDialog
          title={`${`Vil du slette tilbud ${dataItem._id}?`}`}
          handleNo={() => props.closeDialog()}
          handleYes={() => {
            props.onDeleteOffer(dataItem);
            props.closeDialog();
          }}
        />
      )
    });
  }
  const confirmDeleteProductOffer = (offer, product) => {
    props.openDialog({
      children: (
        <ConfirmDialog
          title={`${`Vil du slette produkt ${product.name} i tilbud ${offer._id}?`}`}
          handleNo={() => props.closeDialog()}
          handleYes={() => {
            offer.product_list = offer.product_list.filter(x => x._id != product._id);
            offer.product_id_list = offer.product_id_list.filter(x => x != product._id);
            props.onChangeOffer(offer);
            props.closeDialog();
          }}
        />
      )
    });
  }

  const onExpandChange = event => {
    let newShortened = [];
    if (event.value) {
      newShortened = shortened.filter(e => event.dataItem._id !== e);
    } else {
      newShortened = [...shortened, event.dataItem._id];
    }
    setShortened(newShortened);
  };

  const data = React.useMemo(() => {
    return (props.offerList ?? []).map(e => (!shortened.includes(e._id) ? { ...e, [expandField]: true } : e));
  }, [props.offerList, shortened]);

  return (
    <Grid
      style={props.style}
      expandField={expandField}
      data={data}
      detail={({ dataItem }) => {
        return <DetailProductList dataItem={dataItem} onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)} onRemove={(product) => { confirmDeleteProductOffer(dataItem, product) }} />
      }}
      onExpandChange={onExpandChange}
      onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}>
      <Column field="_id" title="ID" width="140" />
      <Column field="type" title="Tilbud" cell={({ dataItem }) => <td>{OFFER_TYPE_CONFIG[dataItem.type].name}</td>} />
      <Column field="sale_price" title="Udsalgspris" cell={propsCell => <PriceCell number={propsCell.dataItem.sale_price} />} />
      <Column field="quantity" title="Antal" />
      {/* <Column field="active" title="Aktiv" width="140" cell={ActiveCell} /> */}
      <Column
        width="60"
        cell={({ dataItem }) => (
          <td>
            <IconButton type="button" className="k-grid-remove-command" onClick={() => { confirmDeleteOffer(dataItem) }} title="Slet">
              <Icon color="secondary">delete</Icon>
            </IconButton>
          </td>
        )}
      />
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

export default connect(mapStateToProps, mapDispatchToProps)(OfferGrid);
