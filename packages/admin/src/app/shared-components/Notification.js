import { useState, useEffect } from 'react';
// prettier-ignore
import { IconButton, Icon, Badge, DialogTitle, DialogContent } from '@material-ui/core';
import axios from 'app/axios';
import NotificationList from './NotificationList';
import { useKeyListener } from 'app/shared-components/KeyListener';


export default function Notification({ onClick, openDialog, closeDialog, showSuccessMessage }) {
  const [data, setData] = useState([]);
  const initData = () => {
    axios
      .get(`/notifications`)
      .then(response => {
        setData(response.data.data);
      });
  }
  useKeyListener(null, initData)
  useEffect(() => {
    initData();
  }, []);


  const handleShowDialog = () => {
    openDialog({
      children: (
        <NotificationDialogComponent data={data} />
      ),
      onClose: () => {
        axios
          .get(`/notifications`)
          .then(response => {
            setData(response.data.data);
          }).then(closeDialog);
      }
    });
  }
  const NotificationDialogComponent = (props) => {
    const [dataTmp, setDataTmp] = useState(props.data);
    useEffect(() => {
      if (dataTmp == null || dataTmp.length == 0) {
        axios
          .get(`/notifications`)
          .then(response => {
            setDataTmp(response.data.data);
          });
      }
    }, []);
    return <>
      <DialogTitle className="text-center">Notification</DialogTitle>
      <DialogContent>
        <NotificationList type='dialog' data={dataTmp} setData={setDataTmp} closeDialog={closeDialog} showSuccessMessage={showSuccessMessage} />
      </DialogContent>
    </>
  }

  return (
    <div className="flex gap-3 ml-10 w-7/12">
      <div style={{ lineHeight: '48px', width: '40px' }}>
        <Badge badgeContent={data.length} color="error">
          <IconButton size="small" onClick={handleShowDialog}>
            <Icon fontSize="medium">notifications_none</Icon>
          </IconButton>
        </Badge>
      </div>
      <NotificationList data={data} setData={setData} closeDialog={closeDialog} showSuccessMessage={showSuccessMessage} />
    </div >
  );
}