import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'app/axios';
import * as yup from 'yup';
import { useCallback, useState, useEffect } from 'react';
import { Grid, GridNoRecords, GridColumn as Column } from '@progress/kendo-react-grid';
import { DialogContent, DialogTitle, IconButton, Icon, TextField, Tooltip, Link } from '@material-ui/core';
import { MSG_REQUIRED, MSG_NO_DATA, TRANSACTION_TYPE } from 'app/constants';
import { convertUnixTime, formatCurrency } from 'app/helper/general.helper';
import NumberTextField from 'app/shared-components/NumberTextField';
import LoadingPanel from 'app/kendo/LoadingPanel';
const NUMBER_TRANSACTION_PER_PAGE = 5;
const schema = yup.object().shape({
  new_transaction_list: yup.array().required(MSG_REQUIRED),
});
const schemaTransaction = yup.object().shape({
  amount: yup.number().required(MSG_REQUIRED),
  pbs_id: yup.number(MSG_REQUIRED).nullable(),
  customer_id: yup.number(MSG_REQUIRED)
});

const CustomerWalletForm = props => {
  let customer = {
    ...props.customer,
    new_transaction_list: [],
  };
  const { control, formState, handleSubmit, watch, setValue } = useForm({
    mode: 'onSubmit',
    defaultValues: customer,
    resolver: yupResolver(schema),
  });
  const [dialogState, setDialogState] = useState(null);

  const { isValid, dirtyFields, errors } = formState;
  let watchFields = watch(['normal_wallet_amount', 'fee_wallet_amount']);
  const [pbsSetting, setPbsSetting] = useState(null);
  useEffect(() => {
    axios
      .get('/settings')
      .then(response => {
        setPbsSetting(response.data.data.find(x => x.key == 'pbs_settings'));
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  }, []);

  const TransactionComponent = useCallback(
    propsCell => {
      const [transactionList, setTransactionList] = useState([]);
      const { formState, control, handleSubmit, reset } = useForm({
        mode: 'onSubmit',
        defaultValues: {
          pbs_id: null,
          amount: propsCell.type == TRANSACTION_TYPE.fee ? pbsSetting.value.fee.value : 0,
          type: propsCell.type,
          description: '',
          customer_id: customer._id,
        },
        resolver: yupResolver(schemaTransaction),
      });
      const { isValid, dirtyFields, errors } = formState;
      const [totalTransaction, setTotalTransaction] = useState(0);
      const [dataStateTransactionList, setDataStateTransactionList] = useState({ skip: 0, take: NUMBER_TRANSACTION_PER_PAGE });
      useEffect(() => {
        axios
          .get(`/customers/${customer._id}/transactions/${propsCell.type}`, {
            params: {
              page: dataStateTransactionList.skip / NUMBER_TRANSACTION_PER_PAGE + 1,
            },
          })
          .then(response => {
            setTransactionList(response.data.data.transaction_list);
            if (response.data.data.total) {
              setTotalTransaction(response.data.data.total);
            }
          })
          .catch(e => { });
      }, [dataStateTransactionList]);
      const handleAdd = (transaction) => {
        axios.put(`/customers/${customer._id}/wallet`, { new_transaction_list: [transaction] }).then(response => {
          let newTxList = [
            {
              ...transaction,
              data: Date.now() / 1000,
            },
            ...transactionList,
          ];
          if (dataStateTransactionList.skip == 0) {
            setTransactionList(newTxList);
          }
          propsCell.onChange(newTxList);
          reset({
            pbs_id: null,
            amount: propsCell.type == TRANSACTION_TYPE.fee ? pbsSetting.value.fee.value : 0,
            type: propsCell.type,
            description: '',
            customer_id: customer._id,
          });
          props.showSuccessMessage();
        });
      };
      return (
        <form onSubmit={handleSubmit(handleAdd)} noValidate autoComplete="off">
          <div className="ml-50">
            <div>
              {propsCell.type == TRANSACTION_TYPE.fee ? (
                <div className="flex">
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) =>
                      <NumberTextField
                        {...field}
                        disabled={propsCell.type == 1}
                        style={{ width: 200 }}
                        label="Amount"
                        id="amount"
                        error={!!errors.amount}
                        helperText={errors?.amount?.message}
                      />}
                  />
                  <Controller
                    name="pbs_id"
                    control={control}
                    render={({ field }) =>
                      <NumberTextField
                        {...field}
                        style={{ width: 200 }}
                        label="Pbs Id"
                        id="pbs_id"
                        error={!!errors.pbs_id}
                        helperText={errors?.pbs_id?.message}
                      />}
                  />
                </div>
              ) : (
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) =>
                    <NumberTextField
                      {...field}
                      disabled={propsCell.type == 1}
                      style={{ width: 200 }}
                      label="Amount"
                      id="amount"
                      error={!!errors.amount}
                      helperText={errors?.amount?.message}
                    />}
                />
              )}
              <div className="flex">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    < TextField
                      {...field}
                      style={{ marginTop: '20px', width: '100%' }}
                      placeholder="Descrtiption"
                      id="description"
                      error={!!errors.description}
                      helperText={errors?.description?.message}
                    />
                  )}
                />
                <IconButton style={{ width: 40, height: 40, top: '20px' }} type="submit" color="primary">
                  <Icon>add</Icon>
                </IconButton>
              </div>
            </div>
            <div style={{ width: '100%', marginTop: '10px' }}>
              <Grid
                style={{ height: '260px' }}
                data={transactionList}
                pageable={true}
                total={totalTransaction}
                {...dataStateTransactionList}
                onDataStateChange={e => {
                  setDataStateTransactionList(e.dataState);
                }}>
                <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
                <Column field="date" title="Dato" width="150" cell={({ dataItem }) => <td>{convertUnixTime(dataItem.date)}</td>} />
                {propsCell.type == TRANSACTION_TYPE.fee && (
                  <Column
                    field="pbs_id"
                    title="Pbs Id"
                    width="150"
                    cell={({ dataItem }) => {
                      return (
                        <td>
                          <Link href={`/pbs?_id=${dataItem.pbs_id}`} target="_blank" rel="noopener" color="default">
                            {dataItem.pbs_id}
                          </Link>
                        </td>
                      );
                    }}
                  />
                )}
                <Column
                  field="description"
                  title="Description"
                  cell={({ dataItem }) => (
                    <Tooltip title={dataItem.description} placement="right">
                      <td style={{ whiteSpace: 'nowrap' }}>{dataItem.description}</td>
                    </Tooltip>
                  )}
                />
                <Column field="amount" title="Amount" cell={({ dataItem }) => <td>{formatCurrency(dataItem.amount, true)}</td>} />
              </Grid>
            </div>
          </div>
        </form>
      );
    },
    [pbsSetting],
  );

  if (pbsSetting == null) {
    return <LoadingPanel />;
  }
  return (
    <div style={{ width: '1200px' }}>
      <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
        Update wallet
      </DialogTitle>
      <DialogContent>
        <Controller
          name="new_transaction_list"
          control={control}
          render={({ field }) => {
            return (
              <div className='flex justify-around' >
                <div className='w-6/12'>
                  <h3 className="mt-10">Fee wallet: {watchFields[1]}</h3>
                  <TransactionComponent
                    value={field.value}
                    onChange={newTxList => {
                      field.onChange(newTxList);
                      setValue('fee_wallet_amount', (watchFields[1] ?? 0) + newTxList[0].amount);
                    }}
                    type={TRANSACTION_TYPE.fee}
                  />
                </div>
                <div className='w-5/12'>
                  <h3 className="mt-10">Normal wallet: {watchFields[0]}</h3>
                  <TransactionComponent
                    value={field.value}
                    onChange={newTxList => {
                      field.onChange(newTxList);
                      setValue('normal_wallet_amount', (watchFields[0] ?? 0) + newTxList[0].amount);
                    }}
                    type={TRANSACTION_TYPE.normal}
                  />
                </div>
              </div>
            );
          }}
        />
      </DialogContent>
    </div>
  );
};
export default CustomerWalletForm;
