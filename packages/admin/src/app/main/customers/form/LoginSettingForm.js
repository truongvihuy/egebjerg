import { DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { CustomerInput } from 'app/kendo/CustomerInput';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import CustomDialog from 'app/shared-components/CustomDialog';
import { Grid, GridNoRecords, GridColumn as Column } from '@progress/kendo-react-grid';
import { MSG_NO_DATA, CUSTOMER_TYPE_MAP } from 'app/constants';
import { IconButton, Icon } from '@material-ui/core';
const schema = yup.object().shape({
  // username: yup.string().required(MSG_REQUIRED),
  // manage_by: yup.string().required(MSG_REQUIRED),
  // customer_list: yup.string().required(MSG_REQUIRED),
});

const ManageByComponent = propsCell => {
  return (
    <CustomerInput
      id="manage_by"
      label="Kunder"
      customerType={CUSTOMER_TYPE_MAP.admin}
      multiple
      value={propsCell.value}
      disableClearable={true}
      onChange={propsCell.onChange}
    />
  );
};

const CustomerListComponent = propsCell => {
  return <CustomerInput id="customer_list" multiple disableClearable={true} value={propsCell.value} label="Kundeliste" onChange={propsCell.onChange} />;
};

const LoginSettingForm = props => {
  let customer = { ...props.customer };
  let customerList = [];
  for (const key in props.customer.customer_list) {
    customerList.push(props.customer.customer_list[key]);
  }
  customer.customer_list = customerList.sort((a, b) => {
    return a.name < b.name ? -1 : a.name == b.name ? 0 : 1;
  });

  let manageByList = [];
  for (const key in props.customer.manage_by) {
    manageByList.push(props.customer.manage_by[key]);
  }
  customer.manage_by = manageByList.sort((a, b) => {
    return a.name < b.name ? -1 : a.name == b.name ? 0 : 1;
  });

  const { control, formState, handleSubmit, watch } = useForm({
    mode: 'onSubmit',
    defaultValues: customer,
    resolver: yupResolver(schema),
  });
  const [dialogState, setDialogState] = useState(null);

  const { isValid, dirtyFields, errors } = formState;
  const onSubmit = data => {
    if (data.type == CUSTOMER_TYPE_MAP.admin) {
      let newCustomerList = {};
      data.customer_list.forEach(x => {
        newCustomerList[x._id] = {
          _id: x._id,
          username: x.username,
          name: x.name,
          unsubcribe: x.unsubcribe ?? null,
        };
      });
      data.customer_list = newCustomerList;
    } else {
      let newManageByList = {};
      data.manage_by.forEach(x => {
        newManageByList[x._id] = {
          _id: x._id,
          username: x.username,
          name: x.name,
          unsubcribe: x.unsubcribe ?? null,
        };
      });
      data.manage_by = newManageByList;
    }
    props.onSubmit(data);
  };
  const handleConfirmAdd = ({ title, handleYes }) => {
    setDialogState({
      open: true,
      options: {
        children: <ConfirmDialog title={title} handleYes={handleYes} handleNo={() => setDialogState(null)} />,
      },
      closeDialog: () => {
        setDialogState(null);
      },
    });
  };
  return (
    <div>
      <CustomDialog {...dialogState} />
      <form style={{ width: '600px' }} onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
          Loginindstilling
        </DialogTitle>
        <DialogContent>
          {props.customer.type == CUSTOMER_TYPE_MAP.admin ? (
            <Controller
              name="customer_list"
              control={control}
              render={({ field }) => (
                <>
                  <CustomerListComponent
                    showErrorMessage={props.showErrorMessage}
                    value={field.value}
                    onChange={customerList => {
                      customerList = customerList.sort((a, b) => {
                        return a.name < b.name ? -1 : a.name == b.name ? 0 : 1;
                      });
                      let oldCustomerIdlist = field.value.map(x => x._id);
                      let newCustomer = customerList.find(x => !oldCustomerIdlist.includes(x._id));
                      if (newCustomer) {
                        let manageByMap = newCustomer.manage_by ?? {};
                        let manageByNameList = [];
                        for (const key in manageByMap) {
                          manageByNameList.push(manageByMap[key].name);
                        }
                        if (manageByNameList.length > 0) {
                          handleConfirmAdd({
                            title: `Customer is managed by ${manageByNameList.join(', ')}. Do you want to add?`,
                            handleYes: () => {
                              field.onChange(customerList);
                              setDialogState(null);
                            },
                          });
                        } else {
                          field.onChange(customerList);
                        }
                      } else {
                        field.onChange(customerList);
                      }
                    }}
                    type="customer_list"
                    id="customer_list"
                  />
                  <Grid data={field.value}>
                    <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
                    <Column field="_id" title="ID" width="100" />
                    <Column field="name" title="Navn" />
                    <Column
                      width="50"
                      cell={({ dataItem }) => {
                        return (
                          <td>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => {
                                let newValue = field.value.filter(x => x._id != dataItem._id);
                                field.onChange(newValue);
                              }}>
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </td>
                        );
                      }}
                    />
                  </Grid>
                </>
              )}
            />
          ) : null}
          {props.customer.type == CUSTOMER_TYPE_MAP.normal && (
            <Controller
              name="manage_by"
              control={control}
              render={({ field }) => (
                <>
                  <ManageByComponent
                    onChange={value => {
                      value = value.sort((a, b) => {
                        return a.name < b.name ? -1 : a.name == b.name ? 0 : 1;
                      });
                      field.onChange(value);
                    }}
                    value={field.value}
                    type="manage_by"
                    id="manage_by"
                  />
                  <Grid data={field.value}>
                    <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
                    <Column field="_id" title="ID" width="100" />
                    <Column field="name" title="Navn" />
                    <Column
                      width="50"
                      cell={({ dataItem }) => {
                        return (
                          <td>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => {
                                let newValue = field.value.filter(x => x._id != dataItem._id);
                                field.onChange(newValue);
                              }}>
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </td>
                        );
                      }}
                    />
                  </Grid>
                </>
              )}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.closeDialog()} color="secondary">
            Annuller
          </Button>
          {/* type=submit => onCLick submit form*/}
          <Button type="submit" color="primary">
            Gem
          </Button>
        </DialogActions>
      </form>
    </div>
  );
};
export default LoginSettingForm;
