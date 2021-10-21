import React from 'react';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { CustomerInfo, Price, ProductCart, ReplacementGoods, PaymentMethod, MemberShipNumber, Store, NoteOrder, AdminComment, OverweightRate } from 'app/shared-components/OrderInfo';
import { connect } from 'react-redux';
import { USER_GROUP_ADMIN } from 'app/constants';
import { orderBy } from 'lodash';

const OrderDetail = ({ dataItem, onChangeTab, className, onUpdateOverweightRate, user }) => {
  let productList;
  if (dataItem?.product_list) {
    productList = orderBy(dataItem?.product_list, 'position');
  }
  return !dataItem ? (
    <LoadingPanel />
  ) : (
    <div className={`${className}`}>
      <IconButton title='Back' onClick={() => onChangeTab()}>
        <Icon fontSize='small'>arrow_back</Icon>
      </IconButton>
      <div className='delivery-info'>
        <CustomerInfo dataItem={dataItem} disabled />
        {user.user_group_id === USER_GROUP_ADMIN && <OverweightRate value={dataItem.overweight_rate} dataItem={dataItem} onChange={onUpdateOverweightRate} />}
        <Price dataItem={dataItem} />
      </div>
      <ProductCart productList={productList} disabled />
      <div className='container-info-order'>
        <div className='info-order'>
          <ReplacementGoods value={dataItem.replacement_goods} disabled />
          <AdminComment value={dataItem.admin_comment} disabled />
        </div>
        <div className='info-order'>
          <MemberShipNumber value={dataItem.membership_number} disabled />
          <Store value={dataItem.store} disabled />
        </div>
        <div className='note'>
          <NoteOrder value={dataItem.note} disabled />
        </div>
      </div>
    </div >
  );
};

function mapStateToProps({ auth }) {
  return {
    user: auth.user,
  };
}
export default connect(mapStateToProps, null)(OrderDetail);