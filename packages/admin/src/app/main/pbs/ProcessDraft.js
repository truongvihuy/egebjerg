import React, { useRef, useEffect, useState, useCallback } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { filterBy } from '@progress/kendo-data-query';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { Upload } from '@progress/kendo-react-upload';
import { Button } from '@material-ui/core';
import { process as processDataState } from "@progress/kendo-data-query";
import { convertUnixTime, getPagingConfig, setPagingConfig } from 'app/helper/general.helper';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom, CustomPaging, PriceCell } from 'app/kendo/CustomCell';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import { useGridScrollTop } from 'app/shared-components/KeyListener';
import { PAGING_CONFIG } from 'app/constants';
const ProcessDraft = props => {
  const [dataState, setDataState] = useState({ skip: 0, take: getPagingConfig('pbs') });
  const [fileInput, setFileInput] = useState();
  const [data, setData] = useState([]);

  useGridScrollTop([dataState.skip]);


  const handleInputFile = async (files, form, call) => {
    setFileInput(files[0])
    return { uid: files[0].uid };

  };
  const handleRemoveFile = async (files, form, call) => {
    setFileInput(null);
    return { uid: files[0].uid };
  };
  useEffect(() => {
    processFile();
  }, [fileInput])
  const processFile = async () => {
    // console.log(fileInput);
    if (!fileInput) {
      return;
    }
    let rawFile = fileInput.getRawFile();
    let rawData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        resolve(event.target.result);
      };
      reader.onerror = err => {
        reject(err);
      };
      reader.readAsText(rawFile, 'ISO-8859-4');
    });
    let pbsCustomerNumberList = [];

    let rows = rawData.split("\n");
    rows = rows.slice(2, rows.length - 3);
    rows = rows.map((x, i) => {
      let match = /BS\d{37}(\d{5})\d{2}0{7}(\d{5})(\d{1})(\d{13})(\d{3})\s+0+(\d{6})(\d{6})(\d{13})/.exec(x);
      if (!pbsCustomerNumberList.includes(match[1])) {
        pbsCustomerNumberList.push(match[1]);
      }
      return {
        _id: i + 1,
        pbs_customer_number: parseInt(match[1]),
        amount: parseFloat(match[4]) / 100,
        pbs_id: parseInt(match[5]),
        date: (+ new Date(`20${match[6].substring(4, 6)}-${match[6].substring(2, 4)}-${match[6].substring(0, 2)}`))
      }
    });
    let responseCustomer = await axios.get('/customers', {
      params: {
        pbs_customer_number_list: pbsCustomerNumberList.join(','),
        limit: pbsCustomerNumberList.length
      }
    });
    let customerPBSMap = {};
    responseCustomer.data.data.customer_list.forEach(x => {
      customerPBSMap[x.pbs_customer_number] = x;
    });
    rows = rows.map(x => {
      return {
        ...x,
        credit_limit: customerPBSMap[x.pbs_customer_number].credit_limit,
        name: customerPBSMap[x.pbs_customer_number].name,
      }
    })
    setData(rows);

  }
  const onDataStateChange = e => {
    if (e.dataState.take !== dataState.take) {
      setPagingConfig('pbs', e.dataState.take);
    }
    setDataState(e.dataState);
  }
  const processData = e => {
    let dataTmp = processDataState(data, dataState);
    return {
      ...dataTmp,
      data: dataTmp.data.map(x => {
        return {
          ...x,
          after: (x.credit_limit ?? 0) - (x.amount ?? 0)
        }
      })
    }
  }
  const sendProcess = () => {
    let dataSend = data.map(x => {
      delete x._id;
      return x;
    });
    axios.put('/pbs/submit', dataSend).then(response => {
      console.log(response);
    });
  }
  const handleSendProcess = () => {
    props.openDialog({
      children: <ConfirmDialog title={'Are u sure Submit?'} text={''} handleYes={sendProcess} handleNo={props.closeDialog} />
    })
  }
  const confirmDelete = (dataItem) => {
    props.openDialog({
      children: <ConfirmDialog title={'Are u sure delete?'} text={'All data will loss'} handleYes={() => {
        setData(data.filter(x => x._id !== dataItem._id));
        props.closeDialog();
      }} handleNo={props.closeDialog} />
    })
  }
  return <div>
    <div>
      <Grid
        style={{
          height: 'calc(100vh - 165px)',
        }}
        data={processData()}
        {...dataState}
        onDataStateChange={onDataStateChange}
        pageable={PAGING_CONFIG}
        pager={CustomPaging}
        sortable={true}
        filterable={true}
        onRowDoubleClick={e => {
          setData(data.map(x => {
            if (x._id === e.dataItem._id) {
              return {
                ...x,
                inEdit: true
              }
            }
            return { ...x, inEdit: false };
          }))
        }}
        editField='inEdit'
        onItemChange={e => {
          setData(data.map(x => {
            if (x._id === e.dataItem._id) {
              return {
                ...x,
                [e.field]: e.value
              }
            }
            return x;
          }))
        }}
      >
        <GridToolbar>
          <GridToolbarCustom
            dataState={dataState} onClearChange={onDataStateChange}
            leftComponent={
              <>
                <Upload
                  withCredentials={false}
                  multiple={false}
                  saveUrl={handleInputFile}
                  removeUrl={handleRemoveFile}
                />
                <Button color='primary' style={{ width: '150px', height: '50px', fontWeight: 500 }} onClick={processFile} disabled={!fileInput}>Load data(reload)</Button>
                {fileInput && <div style={{ margin: 'auto 0' }}>{fileInput.name}</div>}
                <Button color='primary' style={{ width: '100px', height: '50px', fontWeight: 500 }} onClick={handleSendProcess} disabled={data.length === 0} >Process</Button>
              </>
            }
          />
        </GridToolbar>
        <Column field="_id" title="Nummer" width={100} filterCell={NumberFilterCell} editable={false} />
        <Column field="date" title="Dato" width={200} filter='date' cell={({ dataItem }) => {
          return (
            <td className='datetime-cell'>
              {convertUnixTime(dataItem.created_date / 1000)}
            </td>
          )
        }} />
        <Column field="name" title="Navn" width={300} filterCell={TextFilterCell} />
        <Column field="pbs_customer_number" title="Kundenummer" filterCell={TextFilterCell} />
        <Column field="credit_limit" title="tidigere konto" filterCell={NumberFilterCell} cell={propsCell => <PriceCell number={propsCell.dataItem.credit_limit} />} />
        <Column field="amount" title="Importbelob" filterCell={NumberFilterCell} editor='numeric' />
        <Column field="after" title="Efter importkonto" filterCell={NumberFilterCell} cell={propsCell => <PriceCell number={propsCell.dataItem.after} />} />
        <Column title="Action" cell={propsCell => {
          return <td>
            <Button color="secondary" onClick={() => confirmDelete(propsCell.dataItem)} >Slet</Button>
          </td>;
        }} />
      </Grid>
    </div>
  </div >
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
      showSuccessMessage,
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}

export default connect(null, mapDispatchToProps)(ProcessDraft);