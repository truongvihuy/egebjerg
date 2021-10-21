import { useState, } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar, GridNoRecords } from '@progress/kendo-react-grid';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { Upload } from '@progress/kendo-react-upload';
import { Button } from '@material-ui/core';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG } from 'app/constants';
import { process as processDataState } from "@progress/kendo-data-query";
import ProductDetail from './form/ProductDetail';
import { getPagingConfig } from 'app/helper/general.helper';
import { CustomPaging } from 'app/kendo/CustomCell';
import { useSelector } from 'react-redux';
import { useKeyListener } from 'app/shared-components/KeyListener';

const ProductImport = props => {
  const [dataState, setDataState] = useState({ skip: 0, take: getPagingConfig('product') });
  const [fileInput, setFileInput] = useState();
  const [data, setData] = useState(null);
  const [layout, setLayout] = useState(null);
  const storeList = useSelector(({ fuse }) => fuse.cache.storeList);
  const initData = () => {
    setData(null);
  };
  useKeyListener(1, initData);
  const add = dataItem => {
    axios
      .post(`/products`, {
        ...dataItem,
      })
      .then(response => {
        const newData = [...data];
        newData.unshift(response.data.data);
        setData(newData);
        props.closeDialog();
        props.showSuccessMessage();
        props.onSelectTab({ selected: 0 });
      })
      .catch(e => {
        props.showErrorMessage();
      });
  };

  const handleAdd = ({ dataItem }) => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      maxWidth: 'lg',
      children: (
        <ProductDetail
          dataItem={// collection: product
            {
              "item_number": [dataItem.varens_primære_dessinnummer],
              "brand_id": null,
              "category_id": [],
              "gallery": [],
              "status": 1,
              "is_frozen": false,
              "is_ecology": false,
              "is_coop_xtra": false,
              "description": "",
              "price": dataItem.salgspris_for_varen,
              "weight": 0,
              "unit": "",
              "name": dataItem.etiketlinje_1,
              "image": "",
              "slug": "",
              "total_bought": 0,
              "store_id_list": storeList.map(x => x._id),
              "store_price_list": storeList.reduce((acc, cur, i) => {
                if (acc.name) {
                  acc = { [acc._id]: 0 };
                }
                acc[cur._id] = 0;
                return acc;
              }),
              "just_backend": false,
              "tag_id_list": [],
            }}
          onSubmit={add}
          cancel={props.closeDialog}
          pagePermission={props.pagePermission}
        />
      ),
    });
  };

  const handleInputFile = async (files, form, call) => {
    setFileInput(files[0])
    return { uid: files[0].uid };

  };
  const handleRemoveFile = async (files, form, call) => {
    setFileInput(null);
    return { uid: files[0].uid };
  };
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

    let rows = rawData.split("\n");
    let newData = rows.map(x => {
      let splitList = x.split('¤');
      if (!layout) {
        setLayout(splitList.length == 14 ? 2 : 1);
      }
      let processed = {
        'kardex': splitList[0] ?? null,
        'sortimentsgruppe': splitList[1] ?? null,
        'varenr': splitList[2] ?? null,
        'etiketlinje_1': splitList[3] ?? null,
        'etiketlinje_2': splitList[4] ?? null,
        'salgspris_for_varen': splitList[5] ? +(splitList[5].replace(',', '.')) : null,
        'salgspris_for_eventuel_pantvare': splitList[6] ? +(splitList[6].replace(',', '.')) : null,
        'varens_tilgængelighed': splitList[7] ?? null,
        'kampagnetekst': splitList[8] ?? null,
        'varens_primære_dessinnummer': splitList[9] ?? null,
        'markedsføringsmetode_for_eventuel_kampagne': splitList[10] ?? null,
        'sortimentstype': splitList[11] ?? null,
        'EAN_kode': splitList[12] ?? null,
        'momskode': splitList[13] ?? null,
      }
      return processed;
    });
    setData(newData);
  }
  const onDataStateChange = e => {
    if (e.dataState.take !== dataState.take) {
      setPagingConfig('product', e.dataState.take);
    }
    setDataState(e.dataState);
  }
  const processData = e => {
    return processDataState(data, dataState);
  }
  const FileSelector = () => (<div className='flex'>
    <Upload
      withCredentials={false}
      multiple={false}
      saveUrl={handleInputFile}
      removeUrl={handleRemoveFile}
    />
    <Button color='primary' style={{ width: '50px', height: '50px', fontWeight: 500 }} onClick={processFile} disabled={!fileInput}>Process</Button>
  </div>);

  if (data == null) {
    return <FileSelector />;
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
        onRowDoubleClick={handleAdd}
      >
        <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
        <GridToolbar>
          <FileSelector />
        </GridToolbar>
        <Column field="varens_primære_dessinnummer" title="Produkt" width={100} />
        <Column field="etiketlinje_1" title="Navn" />
        <Column field="salgspris_for_varen" title="Pris" />
        <Column field="varens_tilgængelighed" title="Status" width={100} />
        {/* <Column field="kardex" title="kardex" />
        <Column field="sortimentsgruppe" title="sortimentsgruppe" />
        <Column field="varenr" title="varenr" />
        <Column field="etiketlinje_2" title="etiketlinje 2" width={200} />
        <Column field="salgspris_for_eventuel_pantvare" title="salgspris for eventuel pantvare" />
        <Column field="kampagnetekst" title="kampagnetekst" />
        <Column field="markedsføringsmetode_for_eventuel_kampagne" title="markedsføringsmetode for eventuel kampagne" />
        <Column field="sortimentstype" title="sortimentstype" />
        {layout && <>
          <Column field="EAN_kode" title="EAN kode" />
          <Column field="momskode" title="Momskode" />
        </>} */}
      </Grid>
    </div>
  </div>
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
      showSuccessMessage,
      openDialog,
      closeDialog
    },
    dispatch
  );
}
function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('product', auth.user),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProductImport);