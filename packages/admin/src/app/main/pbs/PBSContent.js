import { useEffect, useState, useRef } from 'react';
import PBSForm from './PBSForm';
import PBSAccountStatusGrid from './PBSAccountStatusGrid';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import axios from 'app/axios';
import { getPagePermission } from 'app/constants';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import PBSGenerate from './PBSGenerate';
import ProcessDraft from './ProcessDraft';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { withRouter } from 'react-router';
import { parseUrlParams } from 'app/helper/general.helper';

const PBSContent = props => {
  const query = parseUrlParams(props.location.search);
  const [selected, setSelected] = useState(query.id ? 0 : (query.tab ? +query.tab : 0));
  const [settingList, setSettingList] = useState(null);
  const isDirty = useRef(false);

  const onSelectTab = (selected) => {
    props.history.push(`${props.location.pathname}?tab=${selected}`)
    setSelected(selected);
  };

  const initData = () => {
    axios
      .get('/settings')
      .then(response => {
        setSettingList(response.data.data);
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  };
  useKeyListener(null, initData);
  const handleChangeSelected = ({ selected }) => {
    if (isDirty.current) {
      props.openDialog({
        children: <ConfirmDialog title={'Are u sure change tab?'} text={'All data will loss'} handleYes={() => { onSelectTab(selected); props.closeDialog() }} handleNo={props.closeDialog} />
      })
    } else {
      onSelectTab(selected);
    }
  }
  useEffect(() => {
    initData();
  }, []);
  if (settingList) {
    return (
      <TabStrip tabContentStyle={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }} selected={selected} onSelect={handleChangeSelected}>
        <TabStripTab title='Generate'>
          <PBSGenerate />
        </TabStripTab>
        <TabStripTab title='Vis kladde'>
          <ProcessDraft />
        </TabStripTab>
        <TabStripTab title='Indstilling'>
          <PBSForm ref={isDirty} closeDialog={props.closeDialog} openDialog={props.openDialog} cancel={() => { console.log('cancel') }} onSubmit={(e) => { console.log(e) }} dataItem={settingList.find(x => x.key == 'pbs_settings')} settingList={settingList} setSettingList={setSettingList} />
        </TabStripTab>
        <TabStripTab title='Account Status'>
          <PBSAccountStatusGrid />
        </TabStripTab>
      </TabStrip>
    );
  }

  return <LoadingPanel />
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
