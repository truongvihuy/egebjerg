import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'app/axios';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import LoadingPanel from 'app/kendo/LoadingPanel';
// prettier-ignore
import { getPagePermission } from 'app/constants';
import CustomerForm from './CustomerForm';
import { handleGoBack } from 'app/helper/general.helper';
const CustomerDetail = props => {
  const [storeList, setStoreList] = useState();
  const [item, setItem] = useState(props.item ?? null);

  useEffect(() => {
    (async () => {
      if (item === null) {
        if (!props.pagePermission.update) {
          handleGoBack(props.history, 'customer');
        }

        await axios
          .get(`/customers/${props.editId}`, {})
          .then(response => {
            let itemResponse = response.data.data;
            //itemResponse.customer_list default is object, not array
            let customerList = [];
            for (const key in itemResponse.customer_list) {
              customerList.push(itemResponse.customer_list[key]);
            }
            itemResponse.customer_list = customerList;
            setItem(itemResponse);
          })
          .catch(error => {
            handleGoBack(props.history, 'customer');
            throw error;
          });
      }
      if (!storeList) {
        await axios
          .get(`/stores`, {
            params: {
              field: 'name,_id,zip_code_id,zip_code_info,municipality_list,payment',
            },
          })
          .then(response => {
            setStoreList(response.data.data);
          })
          .catch(error => {
            handleGoBack(props.history, 'customer');
          });
      }
    })();
  }, []);
  if (item && storeList) {
    return <CustomerForm item={item} cancel={props.cancel} onSubmit={props.onSubmit} editId={props.editId} customerList={props.customerList} setCustomerList={props.setCustomerList} />
  } else {
    return <LoadingPanel />;
  }
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showSuccessMessage,
      showErrorMessage,
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('customer', auth.user),
    user: auth.user,
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomerDetail));
