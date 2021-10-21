import { useEffect, useState } from 'react';
import { CustomerInput } from 'app/kendo/CustomerInput';
import { Checkbox, Switch } from '@material-ui/core';
import { PAYMENT_METHOD, getPagePermission } from 'app/constants';
import CommandInForm from 'app/kendo/CommandInForm';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import axios from 'app/axios';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { useKeyListener } from 'app/shared-components/KeyListener';

const CustomerMerge = props => {
  const [customerRoot, setCustomerRoot] = useState(null);
  const [customerReplace, setCustomerReplace] = useState(null);
  const [replaceFieldList, setReplaceFieldList] = useState([]);

  const initData = () => {
    setCustomerRoot(null);
    setCustomerReplace(null);
    setReplaceFieldList([]);
  };
  useKeyListener(null, initData);

  const ReplacementGoodsComponent = value => {
    return (
      <span className="flex justify-around">
        <span>
          <p>alm. varer</p>
          <Switch disabled={true} color="primary" name="ordinary" checked={value?.ordinary ?? false} />
        </span>
        {value?.ordinary ? null : (
          <span>
            <p>mælk og brød</p>
            <Switch disabled={true} ccolor="primary" name="milk_and_bread" checked={value?.milk_and_bread ?? false} />
          </span>
        )}

        <span>
          <p>tilbudsvarer</p>
          <Switch disabled={true} ccolor="primary" name="promotion" checked={value?.promotion ?? false} />
        </span>
      </span>
    );
  };
  const BillingComponent = value => {
    const [zipCode, setZipCode] = useState(null);
    useEffect(() => {
      if (value?.zip_code_id) {
        axios
          .get(`/zip-codes/${value.zip_code_id}`, {
          })
          .then(response => {
            setZipCode(response.data.data);
          })
      }
    }, []);
    return (
      <div>
        <div className='flex'>
          <div style={{ width: '70px' }}>Navn:</div>
          <div>{value?.name ?? ''}</div>
        </div>
        <div className='flex'>
          <div style={{ width: '70px' }}>Address:</div>
          <div>{value?.address ?? ''}</div>
        </div>
        <div className='flex'>
          <div style={{ width: '70px' }}>By:</div>
          <div>{value?.city_name ?? ''}</div>
        </div>
        <div className='flex'>
          <div style={{ width: '70px' }}>Postnr.:</div>
          <div>{zipCode?.zip_code ?? ''}</div>
        </div>
      </div>
    )
  }
  const handleChangeReplace = (field) => {
    if (replaceFieldList.includes(field)) {
      setReplaceFieldList(replaceFieldList.filter(x => x != field));
    } else {
      setReplaceFieldList([...replaceFieldList, field]);
    }
  }
  const update = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }
    delete dataItem.customer_list;
    delete dataItem.manage_by;
    delete dataItem.username;
    delete dataItem.password;

    axios
      .put(`/customers/${dataItem._id}`, dataItem)
      .then(response => {
        setCustomerRoot(dataItem);
        setCustomerReplace(null);
        setReplaceFieldList([]);
        props.showSuccessMessage();
      })
      .catch(error => { });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (customerRoot && customerReplace && replaceFieldList.length > 0) {
      let dataItem = { ...customerRoot };
      replaceFieldList.forEach(field => {
        if (field == 'zip_code_id' || field == 'store_id') {
          let fieldExtend = field.replace('_id', '');
          dataItem[fieldExtend] = customerReplace[fieldExtend];
        }
        dataItem[field] = customerReplace[field];
      })
      update(dataItem);
    } else {
      props.showErrorMessage('Vælg venligst kunde og erstat feltet')
    }
  }
  return <div style={{
    maxHeight: 'calc(100vh - 150px)',
    overflow: 'auto'
  }}>
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th style={{ width: '20%' }}>Flette Kunder</th>
          <th style={{ width: '40%' }}>
            <div style={{ width: '80%' }}>
              <CustomerInput
                label="Kunder original"
                value={customerRoot}
                onChange={setCustomerRoot}
              />
            </div>
          </th>
          <th style={{ width: '40%' }}>
            <div style={{ width: '80%' }}>
              <CustomerInput
                label="Kunder udskiftning"
                value={customerReplace}
                onChange={setCustomerReplace}
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {customerRoot || customerReplace ? (
          <>
            <tr>
              <td>Navn</td>
              <td>{customerRoot?.name ? customerRoot['name'] : 'Empty'}</td>
              <td style={{ width: '1%' }}><Checkbox color='primary' checked={replaceFieldList.includes('name')} onClick={() => handleChangeReplace('name')} />{customerReplace?.name ? customerReplace['name'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Brugernavn</td>
              <td>{customerRoot ? customerRoot['username'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('username')} onClick={() => handleChangeReplace('username')} />{customerReplace ? customerReplace['username'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>{customerRoot ? customerRoot['address'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('address')} onClick={() => handleChangeReplace('address')} />{customerReplace ? customerReplace['address'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Postnr.</td>
              <td>{customerRoot ? customerRoot.zip_code.zip_code : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('zip_code_id')} onClick={() => handleChangeReplace('zip_code_id')} />{customerReplace ? customerReplace.zip_code.zip_code : 'Empty'}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{customerRoot ? customerRoot['email'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('email')} onClick={() => handleChangeReplace('email')} />{customerReplace ? customerReplace['email'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Telefon</td>
              <td>{customerRoot?.phone ? JSON.stringify(customerRoot['phone']) : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('phone')} onClick={() => handleChangeReplace('phone')} />{customerReplace?.phone ? JSON.stringify(customerReplace['phone']) : 'Empty'}</td>
            </tr>
            <tr>
              <td>Medlemskort</td>
              <td>{customerRoot ? customerRoot['membership_number'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('membership_number')} onClick={() => handleChangeReplace('membership_number')} />{customerReplace ? customerReplace['membership_number'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Butik</td>
              <td>{customerRoot ? customerRoot.store.name : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('store_id')} onClick={() => handleChangeReplace('store_id')} />{customerReplace ? customerReplace.store.name : 'Empty'}</td>
            </tr>
            <tr>
              <td>Betalingsmetode</td>
              <td>{customerRoot ? PAYMENT_METHOD[customerRoot['payment_method']]?.label ?? 'Empty' : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('payment_method')} onClick={() => handleChangeReplace('payment_method')} />{customerReplace ? PAYMENT_METHOD[customerReplace['payment_method']]?.label ?? 'Empty' : 'Empty'}</td>
            </tr>
            <tr>
              <td>PBS kundenummer</td>
              <td>{customerRoot ? customerRoot['pbs_customer_number'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('pbs_customer_number')} onClick={() => handleChangeReplace('pbs_customer_number')} />{customerReplace ? customerReplace['pbs_customer_number'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Butik kundenummer</td>
              <td>{customerRoot ? customerRoot['store_customer_number'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('store_customer_number')} onClick={() => handleChangeReplace('store_customer_number')} />{customerReplace ? customerReplace['store_customer_number'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Ønsker du erstatningsvarer</td>
              <td>
                <div className='flex'>
                  {customerRoot ? ReplacementGoodsComponent(customerRoot['replacement_goods']) : 'Empty'}
                </div>
              </td>
              <td>
                <div className='flex'>
                  <Checkbox color='primary' checked={replaceFieldList.includes('replacement_goods')} onClick={() => handleChangeReplace('replacement_goods')} />
                  {customerReplace ? ReplacementGoodsComponent(customerReplace['replacement_goods']) : 'Empty'}
                </div>
              </td>
            </tr>
            <tr>
              <td>Kredit grænse</td>
              <td>{customerRoot ? customerRoot['credit_limit'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('credit_limit')} onClick={() => handleChangeReplace('credit_limit')} />{customerReplace ? customerReplace['credit_limit'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Leveringsgebyr</td>
              <td>{customerRoot ? customerRoot['delivery_fee'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('delivery_fee')} onClick={() => handleChangeReplace('delivery_fee')} />{customerReplace ? customerReplace['delivery_fee'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Administrator kommentar</td>
              <td>{customerRoot ? customerRoot['admin_comment'] : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('admin_comment')} onClick={() => handleChangeReplace('admin_comment')} />{customerReplace ? customerReplace['admin_comment'] : 'Empty'}</td>
            </tr>
            <tr>
              <td>Aktiv</td>
              <td>{customerRoot ? <Checkbox color='primary' disabled={true} checked={customerRoot['active']} /> : 'Empty'}</td>
              <td><Checkbox color='primary' checked={replaceFieldList.includes('active')} onClick={() => handleChangeReplace('active')} />{customerReplace ? <Checkbox color='primary' disabled={true} checked={customerReplace['active']} /> : 'Empty'}</td>
            </tr>
            <tr>
              <td>Tilføj pårørende som betalingsmodtager</td>
              <td>
                <div className='flex'>
                  {customerRoot ? <BillingComponent {...customerRoot['billing']} /> : 'Empty'}
                </div>
              </td>
              <td>
                <div className='flex'>
                  <Checkbox color='primary' checked={replaceFieldList.includes('billing')} onClick={() => handleChangeReplace('billing')} />
                  {customerReplace ? <BillingComponent {...customerReplace['billing']} /> : 'Empty'}
                </div>
                {customerReplace && <form onSubmit={handleSubmit}>
                  <CommandInForm dataItem={{ _id: null }} closeDialog={() => { setReplaceFieldList([]) }} />
                </form>}
              </td>
            </tr>
          </>
        ) : null}
      </tbody>
    </table >
  </div>
}

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

export default connect(mapStateToProps, mapDispatchToProps)(CustomerMerge);
