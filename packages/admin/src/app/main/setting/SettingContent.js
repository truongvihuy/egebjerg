import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import SettingForm from './SettingForm';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import axios from 'app/axios';
import { getPagePermission, MSG_NO_DATA } from 'app/constants';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import MailContent from '../mail/MailContent';
import { parseUrlParams } from 'app/helper/general.helper';
import { withRouter } from 'react-router-dom';
import { useKeyListener } from 'app/shared-components/KeyListener';

const SettingContent = props => {
  const query = parseUrlParams(props.location.search);
  const [selected, setSelected] = useState(query.tab ? +query.tab : 0);
  const [settingList, setSettingList] = useState(null);
  const isDirty = useRef(false);
  const initData = () => {
    axios
      .get('/settings')
      .then(response => {
        setSettingList(response.data.data.filter(x => (x.key != 'pbs_settings')));
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  };
  useKeyListener(null, initData);
  const handleChangeSelected = ({ selected }) => {
    if (isDirty.current) {
      props.openDialog({
        children: <ConfirmDialog title={'Are u sure change tab?'} text={'All data will loss'} handleYes={() => { setSelected(selected); props.closeDialog() }} handleNo={props.closeDialog} />
      })
    } else {
      props.history.push({
        pathname: `/setting`,
        search: `?tab=${selected}`
      });
      setSelected(selected);
    }
  }
  useEffect(() => {
    initData();
  }, []);
  if (settingList) {
    return (
      <TabStrip tabContentStyle={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }} selected={selected} onSelect={handleChangeSelected}>
        <TabStripTab title='Generel Indstilling'>
          <SettingForm ref={isDirty} {...props} settingList={settingList} setSettingList={setSettingList} />
        </TabStripTab>
        <TabStripTab title='E-mail'>
          <MailContent />
        </TabStripTab>
      </TabStrip>
    );
  }

  return null;
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
    pagePermission: getPagePermission('setting', auth.user),
    // user: auth.user
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SettingContent));
