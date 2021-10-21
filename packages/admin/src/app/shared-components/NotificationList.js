import React from 'react';
import { Icon, IconButton, Tooltip, withStyles } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import history from '@history';
import { Alert } from '@material-ui/lab';
import axios from 'app/axios';
import { NOTIFICATION_STATUS } from 'app/constants';
import { convertUnixTime } from 'app/helper/general.helper';

const StyledAlert = withStyles({
  root: {
    padding: '0 16px',
  },
  message: {
    padding: '4px 0',
    lineHeight: '26px',
  },
})(Alert);

export default function NotificationList({ type = 'normal', data = [], setData, closeDialog, showSuccessMessage, disabled }) {
  const handleNotiItem = (orderId, goToOrder = true) => {
    if (goToOrder) {
      history.push({
        pathname: `/order`,
        search: `?_id=${orderId}`,
      });
    } else {
      let newData = data.filter(x => {
        return x._id !== orderId;
      });
      setData(newData);
    }
    if (closeDialog) {
      closeDialog();
    }
  };
  const handleUpdateNoti = (data, setData, _id, status) => {
    axios.put(`/notifications/${_id}`, { status }).then(response => {
      let newData = [];
      if (status == NOTIFICATION_STATUS.solved) {
        newData = data.filter(noti => noti._id != _id);
      } else {
        newData = data.map(noti => {
          if (noti._id == response.data.data._id) {
            return response.data.data;
          }
          return noti;
        });
      }
      showSuccessMessage();
      setData(newData);
    });
  };

  let tmpStoreId = null;
  return (
    <div className={`${type == 'normal' ? 'max-h-48' : ''}  overflow-auto ml-10 w-12/12`} style={{ minWidth: '500px' }}>
      {data.map(item => {
        let storeNameComponent = null;
        if (item.store && tmpStoreId !== item.store_id) {
          tmpStoreId = item.store_id;
          storeNameComponent = (
            <Typography className="py-4 mt-8" color="textSecondary">
              {item.store.name}
            </Typography>
          );
        }
        return (
          <React.Fragment key={item._id}>
            {storeNameComponent}
            <StyledAlert
              color={item.status == NOTIFICATION_STATUS.solved ? 'success' : item.status == NOTIFICATION_STATUS.processing ? 'warning' : 'error'}
              className="cursor-pointer"
              severity="info"
              onClick={e => {
                if (e.target.id == 'processing' || e.target.id == 'solved') {
                  return;
                }
                if (!['solved'].includes(e.target.id)) {
                  handleNotiItem(item.order_id);
                }
              }}
              action={
                <>
                  <Tooltip
                    title={
                      <div style={{ width: '1200px', fontSize: '11px' }}>
                        <p>Behandlet af {item.user_update?.name ?? item.user_create?.name ?? 'System'}</p>
                        <p>På {convertUnixTime(item.user_update?.date ?? item.user_create?.date)}</p>
                      </div>
                    }>
                    <div>
                      <IconButton
                        id="processing"
                        title="processing"
                        size="small"
                        onClick={e => {
                          handleUpdateNoti(data, setData, item._id, NOTIFICATION_STATUS.processing);
                        }}
                        disabled={item.status != NOTIFICATION_STATUS.new || disabled}>
                        <Icon id="processing">{item.status === NOTIFICATION_STATUS.new ? 'hourglass_empty' : 'cached'}</Icon>
                      </IconButton>
                    </div>
                  </Tooltip>
                  {!disabled && item.status != NOTIFICATION_STATUS.solved && (
                    <IconButton
                      id="solved"
                      title="solved"
                      size="small"
                      onClick={e => {
                        handleUpdateNoti(data, setData, item._id, NOTIFICATION_STATUS.solved);
                      }}>
                      <Icon id="solved">check</Icon>
                    </IconButton>
                  )}
                </>
              }>
              {item.message}
            </StyledAlert>
          </React.Fragment>
        )
      })}
    </div>
  );
}
