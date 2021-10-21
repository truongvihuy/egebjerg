import React, { useState, useEffect, useRef } from 'react';
import axios from 'app/axios';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { NumberFilterCell, GridToolbarCustom, CustomPaging, PriceCell, DateFilterCell } from 'app/kendo/CustomCell';
import { getPagePermission, PAGING_CONFIG } from 'app/constants';
import { Button, IconButton, Icon } from '@material-ui/core';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { filterBy } from '@progress/kendo-data-query';
import { withRouter } from 'react-router-dom';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useGridScrollTop } from 'app/shared-components/KeyListener';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import DescriptionPBS from './DescriptionPBS';
import { convertUnixTime, initDataState, parseUrlParams, changeUrlParamByDataState, DateDataState } from 'app/helper/general.helper';
import { DateRangePicker } from '@progress/kendo-react-dateinputs';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { startOfDay } from 'date-fns';

const statusMap = {
  1: 'Fil i udkast',
  2: 'Sent',
  3: 'Imported',
};

const moduleName = 'pbs';
const filterTypeList = {
  _id: 'number',
  date: 'date',
};

function PBSContent(props) {
  const query = parseUrlParams(props.location.search);
  const [pbsList, setPBSList] = useState([]);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  const total = useRef(0);
  const [dateRangePicker, setDateRangePicker] = useState({
    start: null,
    end: new Date(),
  });

  useGridScrollTop([dataState.skip]);

  const initData = () => {
    axios
      .get('/pbs', {
        params: {
          limit: dataState.take,
        },
      })
      .then(response => {
        total.current = response.data.data.total;
        if (response.data.data.pbs_list.length > 0) {
          let fromDate = new Date(response.data.data.pbs_list.sort((a, b) => b._id - a._id)[0].created_date * 1000);
          setDateRangePicker({
            ...dateRangePicker,
            start: fromDate,
          });
        }
        setPBSList(
          response.data.data.pbs_list.map(x => {
            return {
              ...x,
              date: startOfDay(new Date(x.created_date * 1000)),
            };
          }),
        );
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  };

  useKeyListener(2, initData);

  useEffect(() => {
    initData();
  }, []);


  useEffect(() => {
    const newDataState = initDataState(query, filterTypeList, moduleName)
    setDataState(newDataState);

    getData(newDataState);
  }, [props.location]);

  const getData = (tmpDataState = dataState) => {
    let params = {
      limit: tmpDataState.take,
    };
    params.page = 1 + tmpDataState.skip / tmpDataState.take;
    axios
      .get(`/pbs`, { params })
      .then(response => {
        const newData = response.data.data;
        if (typeof newData.total != 'undefined') {
          total.current = newData.total;
        }
        setPBSList(
          newData.pbs_list.map(x => {
            return {
              ...x,
              date: startOfDay(new Date(x.created_date * 1000)),
            };
          }),
        );
      })
      .catch(error => {
        props.showErrorMessage();
      });
  }

  const callGenerate = () => {
    let params = {};
    if (dateRangePicker.start) {
      params.from = Math.round(+dateRangePicker.start / 1000);
    }
    if (dateRangePicker.end) {
      params.to = Math.round(+dateRangePicker.end / 1000);
    }
    axios
      .post('/pbs/generate', params)
      .then(response => {
        let newPbsList = [...pbsList];
        newPbsList.unshift({
          ...response.data.data,
          date: startOfDay(new Date(response.data.data.created_date * 1000)),
        });
        setPBSList(newPbsList);
        props.showSuccessMessage();
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  };

  const handleGenerate = () => {
    props.openDialog({
      children: (
        <ConfirmDialog
          title={'Er du sikker på at eksportere filen?'}
          handleYes={() => {
            callGenerate();
            props.closeDialog();
          }}
          handleNo={props.closeDialog}
        />
      ),
    });
  };

  const handleDownload = fileName => {
    axios
      .get(`/pbs/download/${fileName}`)
      .then(response => {
        let filename = response.headers['content-disposition'].split('filename=')[1];
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  };
  const openHelp = e => {
    props.openDialog({
      children: <DescriptionPBS />,
      maxWidth: 'xl',
      fullWidth: true,
    });
  };

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState, filterTypeList);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const handleSendPbs = dataItem => {
    const handleYes = () =>
      axios
        .put(`/pbs/${dataItem._id}`, { status: 2 })
        .then(response => {
          setPBSList(
            pbsList.map(x => {
              if (x._id == response.data.data._id) {
                return {
                  ...response.data.data,
                  date: startOfDay(new Date(response.data.data.created_date * 1000))
                };
              }
              return x;
            }),
          );
          props.showSuccessMessage();
        })
        .catch(error => {
          props.showErrorMessage(error.message);
        });

    props.openDialog({
      children: (
        <ConfirmDialog
          title={'Send fil?'}
          handleYes={() => {
            handleYes();
            props.closeDialog();
          }}
          handleNo={props.closeDialog}
        />
      ),
    });
  };

  const handleDelete = dataItem => {
    const handleYes = () =>
      axios
        .delete(`/pbs/${dataItem._id}`)
        .then(response => {
          console.log(response);
          setPBSList(
            pbsList.filter(x => {
              return x._id != dataItem._id;
            }),
          );
          props.showSuccessMessage();
        })
        .catch(error => {
          props.showErrorMessage(error.message);
        });

    props.openDialog({
      children: (
        <ConfirmDialog
          title={'Slet?'}
          handleYes={() => {
            handleYes();
            props.closeDialog();
          }}
          handleNo={props.closeDialog}
        />
      ),
    });
  };

  if (!pbsList) {
    return <LoadingPanel />;
  } else {
    return (
      <>
        <Grid
          {...dataState}
          style={{
            height: 'calc(100vh - 160px)',
          }}
          data={filterBy(pbsList, dataState.filter)}
          filterable
          sortable
          total={total.current}
          pageable={PAGING_CONFIG}
          pager={CustomPaging}
          pager={CustomPaging}
          onDataStateChange={onDataStateChange}>
          <GridToolbar>
            <GridToolbarCustom
              dataState={dataState}
              onClearChange={onDataStateChange}
              leftComponent={
                <>
                  <DateRangePicker
                    value={dateRangePicker}
                    onChange={e => {
                      setDateRangePicker(e.value);
                    }}
                    startDateInputSettings={{ label: 'Fra dato', formatPlaceholder: { year: 'dag', month: 'måned', day: 'år' } }}
                    endDateInputSettings={{ label: 'Til dato', formatPlaceholder: { year: 'dag', month: 'måned', day: 'år' } }}
                  />
                  <Button onClick={handleGenerate} color="primary">
                    Generer PBS-fil
                  </Button>
                  <Button aria-describedby={'simple-popover'} color="primary" onClick={openHelp}>
                    ?
                  </Button>
                </>
              }
            />
          </GridToolbar>
          <Column field="_id" title="Nummer" width="100px" filterCell={NumberFilterCell} />
          <Column
            field="from"
            title="From"
            width="200px"
            filterable={false}
            cell={({ dataItem }) => <td>{convertUnixTime(dataItem.from, 'yyyy-MM-dd HH:mm:ss')}</td>}
          />
          <Column
            field="to"
            title="To"
            width="200px"
            filterable={false}
            cell={({ dataItem }) => <td>{convertUnixTime(dataItem.to, 'yyyy-MM-dd HH:mm:ss')}</td>}
          />
          <Column
            field="date"
            title="Dato"
            width="200px"
            filterCell={DateFilterCell}
            filter="date"
            cell={({ dataItem }) => <td className="datetime-cell">{convertUnixTime(dataItem.created_date, 'yyyy-MM-dd HH:mm:ss')}</td>}
          />
          <Column
            field="file"
            title="Fil"
            width="300px"
            filterable={false}
            cell={({ dataItem }) => (
              <td>
                <div className="can-click" onClick={() => handleDownload(dataItem.file)}>
                  {dataItem.file}
                </div>
              </td>
            )}
          />
          <Column field="amount" title="Belob" filterable={false} cell={propsCell => <PriceCell number={propsCell.dataItem.amount} />} />
          <Column field="status" title="Fil Status" filterable={false} cell={({ dataItem }) => <td>{statusMap[dataItem.status]}</td>} />
          <Column
            filterable={false}
            cell={({ dataItem }) => (
              <td>
                {dataItem.status == 1 && (
                  <IconButton
                    size="small"
                    onClick={e => {
                      handleSendPbs(dataItem);
                    }}
                    title="Send PBS-fil">
                    <Icon fontSize="small">check</Icon>
                  </IconButton>
                )}
                <a target='_blank' href={`/api/pbs/view/${dataItem.file}`}>
                  <IconButton
                    size="small"
                    title="Udsigt">
                    <Icon fontSize="small">visibility</Icon>
                  </IconButton>
                </a>
                <IconButton
                  size="small"
                  onClick={e => {
                    handleDelete(dataItem);
                  }}
                  title="Send PBS-fil">
                  <Icon fontSize="small" color="secondary">
                    delete
                  </Icon>
                </IconButton>
              </td>
            )}
          />
        </Grid>
      </>
    );
  }
}

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

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('pbs', auth.user),
    // user: auth.user
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PBSContent));
