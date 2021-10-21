import React from 'react';
import axios from 'app/axios';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import ImageNewspaper from './ImageNewspaper';
import OfferGrid from './OfferGrid';
import { parseUrlParams } from 'app/helper/general.helper';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { showSuccessMessage } from 'app/store/fuse/messageSlice';
import OfferForm from './OfferForm';
import { withRouter } from 'react-router-dom';
import { getPagePermission } from 'app/constants';
import { convertUnixTime } from 'app/helper/general.helper';

const textField = 'name';

const initData = {
  type: 1,
  sale_price: 0,
  quantity: 0,
  active: true,
  product_id_list: [],
  product_list: [],
};

const NewspaperOfferList = (props) => {
  const [newspaperList, setNewspaperList] = React.useState([]);
  const [selectedNewspaper, setSelectedNewspaper] = React.useState(null);
  const [offerList, setOfferList] = React.useState([]);
  const [page, setPage] = React.useState(0);

  const getOffer = (newspaper) => {
    setSelectedNewspaper(newspaper ?? null);
    if (!newspaper) {
      setOfferList([]);
      return;
    }
    let offer_id_list = newspaper.offer_list.offer_id_list.flat(Infinity);
    if (offer_id_list.length) {
      axios.get(`/offers`, { params: { _id: offer_id_list } })
        .then(response => {
          const offerList = response.data.data;
          let offerListInPage = newspaper.offer_list.offer_id_list.map(offerIdListInPage => {
            let offerListInPage = [];
            offerIdListInPage.forEach(offerId => {
              let offer = offerList.find(e => e._id === offerId);
              if (offer) {
                offerListInPage.unshift(offer)
              }
            });
            return offerListInPage;
          });
          setOfferList(offerListInPage);
        });
    } else {
      setOfferList(newspaper.offer_list.offer_id_list);
    }
  }

  React.useEffect(() => {
    const newData = props.newspaperList.filter(e => e.active);
    setNewspaperList(newData);
    if (!selectedNewspaper && newData.length) {
      setPage(0);
      const query = parseUrlParams(props.location.search);
      let newspaper;
      if (query.newspaper_id) {
        newspaper = props.newspaperList.find(e => e._id == query.newspaper_id);
      }
      newspaper = newspaper ?? newData[0];
      getOffer(newspaper);
    }
  }, [props.newspaperList]);

  const onChangeSelect = (event) => {
    setPage(0);
    props.history.push({
      pathname: props.location.pathname,
      search: `?tab=1&newspaper_id=${event.value._id}`,
    });
    getOffer(event.value);
  };

  const onChangePage = (e) => {
    setPage(e);
  };

  const add = (offerData) => {
    let data = {
      type: offerData.type,
      sale_price: offerData.sale_price,
      quantity: offerData.quantity,
      product_id_list: offerData.product_id_list,
      newspaper_id: selectedNewspaper._id,
      newspaper_page: page,
    };
    axios.post(`offers`, data)
      .then(response => {
        offerData._id = response.data.data._id;

        let newOfferList = [...offerList];
        offerData = processProductList(offerData);
        newOfferList[page] = [offerData, ...newOfferList[page]];
        setOfferList(newOfferList);

        props.closeDialog();
        props.showSuccessMessage();

        let newspaper = { ...selectedNewspaper };
        newspaper.offer_list.offer_id_list[page].push(offerData._id);
        props.onChangeNewspaper(newspaper);
      })
      .catch(e => {
      });
  };

  const processProductList = (offer) => {
    for (let i = 0; i < offer.product_list.length; ++i) {
      if (offer.product_list[i].status < 2) {
        offer.product_list[i].status += 2;
      }
    }

    return offer;
  }

  const update = offerData => {
    let data = {
      type: offerData.type,
      sale_price: offerData.sale_price,
      quantity: offerData.quantity,
      product_id_list: offerData.product_id_list,
      newspaper_id: selectedNewspaper._id,
      newspaper_page: page,
    };
    axios.put(`offers/${offerData._id}`, data)
      .then(response => {
        let newOfferList = [...offerList];
        offerData = processProductList(offerData);

        newOfferList[page] = newOfferList[page].map(offer => offerData._id === offer._id ? offerData : offer);
        setOfferList(newOfferList);

        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(e => {
      });

  };

  const remove = dataItem => {
    let data = {
      newspaper_id: selectedNewspaper._id,
      newspaper_page: page,
    };
    axios.delete(`offers/${dataItem._id}`, { data })
      .then(response => {
        let newOfferList = [...offerList];
        newOfferList[page] = newOfferList[page].filter(e => dataItem._id !== e._id);
        setOfferList(newOfferList);

        props.closeDialog();
        props.showSuccessMessage();

        let newspaper = { ...selectedNewspaper };
        newspaper.offer_list.offer_id_list[page] = newspaper.offer_list.offer_id_list[page].filter(e => e != dataItem._id);
        props.onChangeNewspaper(newspaper);
      }).catch(e => {
        props.closeDialog();
      });
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      fullWidth: true,
      maxWidth: 'md',
      children: <OfferForm
        dataItem={{ ...initData }}
        onSubmit={add}
        closeDialog={props.closeDialog}
        showSuccessMessage={props.showSuccessMessage}
      />,
    });
  }

  return (
    <div>
      <div className='row-newspaper'>
        <div className='two-cols-newspaper two-cols-newspaper_1st-col'>
          <ImageNewspaper newspaper={selectedNewspaper} page={page} onChangePage={onChangePage} />
        </div>
        <div className='two-cols-newspaper two-cols-newspaper_2rd-col'>
          <div className='toolbar-newspaper'>
            <ComboBox
              data={newspaperList} textField={textField}
              value={selectedNewspaper} onChange={onChangeSelect} />
            {selectedNewspaper && <span>{convertUnixTime(selectedNewspaper.from)} {'->'} {convertUnixTime(selectedNewspaper.to)}</span>}
            {selectedNewspaper && props.pagePermission.insert ? (
              <IconButton id="add-button" type='button' size='small' onClick={handleAdd} color='primary' disabled={!selectedNewspaper?.active}>
                <Icon>add</Icon>
              </IconButton>
            ) : null}
          </div>
          <OfferGrid style={{ marginTop: '10px', maxHeight: 'calc(100vh - 220px)' }} offerList={offerList[page] ?? []} onChangeOffer={update} onDeleteOffer={remove} />
        </div>
      </div>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog,
      showSuccessMessage,
    },
    dispatch
  );
}
function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('newspaper', auth.user),
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewspaperOfferList));