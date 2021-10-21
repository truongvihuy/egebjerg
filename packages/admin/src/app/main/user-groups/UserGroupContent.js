import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, makeStyles, Button } from '@material-ui/core/';
import axios from 'app/axios';

import { AUTH_PERMISSION, getPagePermission, MSG_CONFIRM_DELETE_USER_GROUP } from 'app/constants';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import navigationConfig from '../../fuse-configs/navigationConfig';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import LoadingPanel from 'app/kendo/LoadingPanel';
import UserGroupForm from './UserGroupForm';
import UserGroupPermissionGrid from './UserGroupPermissionGrid';

import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import { useKeyListener } from 'app/shared-components/KeyListener';
const INIT_USER_GROUP_LIST = [1, 2, 3];
const useStyles = makeStyles({
  layoutRoot: {}
});

let userGroupTemplate = {
  name: '',
  permission: {}
};

function UserGroupContent(props) {
  const classes = useStyles();
  const [userGroupList, setUserGroupList] = useState([]);
  const [userGroupActive, setUserGroupActive] = useState(null);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const initData = () => {
    (async () => {
      axios
        .get(`/user-groups`, {})
        .then(response => {
          const userGroupListResponse = response.data.data;
          userGroupListResponse.map(x => {
            const resultPermission = x.permission;
            for (const key in resultPermission) {
              resultPermission[key] = parseInt(resultPermission[key], 2);
            }
            return {
              ...x,
              permission: resultPermission
            };
          });
          setUserGroupList(userGroupListResponse);
          setUserGroupActive({ ...userGroupListResponse[0], processedPermission: processPermission(userGroupListResponse[0]) });
        })
        .catch(error => {
          props.showErrorMessage(error.message);
          console.error(error);
        });
    })();
  };
  useKeyListener(null, initData);

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => setLoadingPanel(false), 300);
    return () => {
      clearTimeout(timer);
    };
  }, [userGroupActive]);

  const add = newUserGroup => {
    axios
      .post(`/user-groups`, { ...newUserGroup })
      .then(response => {
        newUserGroup = response.data.data;
        for (const key in newUserGroup.permission) {
          newUserGroup.permission[key] = parseInt(newUserGroup.permission[key], 2);
        }
        let newUserGroupList = [...userGroupList];
        newUserGroupList.push(newUserGroup);
        setUserGroupList(newUserGroupList);

        onClickUserGroup(response.data.data);
        props.showSuccessMessage();
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  };

  const update = (userGroupUpdate = null) => {
    setLoadingPanel(true);
    let processedPermission = processPermissionToSend(userGroupActive.processedPermission);
    const userGroup = {
      ...(userGroupUpdate ?? userGroupActive),
      permission: processedPermission
    };
    axios
      .put(`/user-groups/${userGroup._id}`, { ...userGroup })
      .then(response => {
        setUserGroupList(
          userGroupList.map(userGr => {
            if (userGr._id === userGroup._id) {
              for (const key in processedPermission) {
                processedPermission[key] = parseInt(processedPermission[key], 2);
              }
              return {
                ...userGroup,
                permission: processedPermission
              };
            }
            return userGr;
          })
        );
        setUserGroupActive(userGroup);
        setIsDataChanged(false);
        setLoadingPanel(false);
        props.showSuccessMessage();
      })
      .catch(error => {
        props.showErrorMessage(error.message);
      });
  };

  const remove = () => {
    if (INIT_USER_GROUP_LIST.includes(userGroupActive._id)) {
      return;
    }
    const nextStep = () => {
      axios
        .delete(`/user-groups/${userGroupActive._id}`, {})
        .then(response => {
          let newUserGroupList = userGroupList;
          newUserGroupList = newUserGroupList.filter(userGroup => {
            return userGroupActive._id !== userGroup._id;
          });
          setUserGroupList(newUserGroupList);
          if (userGroupList.length > 0) {
            let processedPermission = processPermission(userGroupList[0]);
            setUserGroupActive({ ...userGroupList[0], processedPermission });
          } else {
            setUserGroupActive(null);
          }
          setIsDataChanged(false);

          props.showSuccessMessage();
        })
        .catch(error => {
          props.showErrorMessage(error.message);
        });
    };
    handleRemove(MSG_CONFIRM_DELETE_USER_GROUP, nextStep);
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      children: (
        <UserGroupForm
          closeDialog={props.closeDialog}
          dataItem={userGroupTemplate}
          userGroupList={userGroupList}
          onSubmit={e => {
            setLoadingPanel(true);
            add(e);
            props.closeDialog();
          }}
          cancel={props.closeDialog}
        />
      )
    });
  };

  const handleUpdate = (userGroup = null) => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      children: (
        <UserGroupForm
          closeDialog={props.closeDialog}
          dataItem={userGroup}
          onSubmit={e => {
            update(e);
            props.closeDialog();
          }}
          cancel={props.closeDialog}
        />
      )
    });
  };

  const handleRemove = (message, onSubmit) => {
    if (!props.pagePermission.delete) {
      return;
    }

    props.openDialog({
      children: (
        <ConfirmDialog
          title={message}
          handleNo={props.closeDialog}
          handleYes={() => {
            onSubmit();
            props.closeDialog();
          }}
        />
      )
    });
  };

  const processPermission = userGroup => {
    const result = [];

    const processNavigationConfig = (navConfig, space = '') => {
      // loop through every object in the array
      for (const nav of navConfig) {
        // if (props.user.user_group_id === 1 || props.user.permission[x.id] && ((AUTH_PERMISSION.access & props.user.permission[x.id]) === AUTH_PERMISSION.access)) {
        const permission = userGroup ? userGroup.permission[nav.id] ?? null : null;
        if (permission) {
          const processedPermission = {};
          for (const [k, v] of Object.entries(AUTH_PERMISSION)) {
            if (k !== 'access' && (nav.type === 'group' || nav.type === 'collapse')) {
              processedPermission[k] = null;
            } else {
              processedPermission[k] = (permission & v) === v;
            }
          }
          result.push({
            key: nav.id,
            title: `${space}${nav.translate}`,
            type: nav.type,
            ...processedPermission
          });
        } else {
          if (nav.type === 'group' || nav.type === 'collapse') {
            result.push({
              key: nav.id,
              title: `${space}${nav.translate}`,
              type: nav.type,
              access: false,
              get: null,
              insert: null,
              update: null,
              delete: null
            });
          } else {
            result.push({
              key: nav.id,
              title: `${space}${nav.translate}`,
              type: nav.type,
              access: false,
              get: false,
              insert: false,
              update: false,
              delete: false
            });
          }
        }
        if (!(nav.id in userGroupTemplate.permission)) {
          userGroupTemplate.permission[nav.id] = '0';
        }
        // }
        // see if there is a children node
        if (nav.children) {
          // run this function recursively on the children array
          processNavigationConfig(nav.children, `${space}\u00A0\u00A0\u00A0\u00A0`);
        }
      }
    };
    processNavigationConfig(navigationConfig);
    return result;
  };

  const processPermissionToSend = permissionView => {
    const newPermission = {};
    permissionView.forEach(permission => {
      let permissionResult = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const key in permission) {
        if (typeof AUTH_PERMISSION[key] !== 'undefined') {
          permissionResult += permission[key] ? AUTH_PERMISSION[key] : 0;
        }
      }
      newPermission[permission.key] = permissionResult.toString(2);
    });
    return newPermission;
  };

  const handleChangePermission = (table, permission, newFlag = false) => {
    let newData = userGroupActive.processedPermission.map(x => {
      if (x.key === table) {
        if (permission !== 'all') {
          return {
            ...x,
            [permission]: !x[permission]
          };
        } else {
          // All
          let defaultValue = x.type === 'group' || x.type === 'collapse' ? null : newFlag;
          return {
            ...x,
            access: newFlag,
            get: defaultValue,
            insert: defaultValue,
            update: defaultValue,
            delete: defaultValue
          };
        }
      }
      return x;
    });
    setIsDataChanged(true);
    setUserGroupActive({ ...userGroupActive, processedPermission: newData });
  };

  const changeUserGroup = userGroup => {
    setLoadingPanel(true);
    setUserGroupActive({ ...userGroup, processedPermission: processPermission(userGroup) });
    setIsDataChanged(false);
  };

  const onClickUserGroup = userGroup => {
    if (loadingPanel) {
      return;
    }

    if (isDataChanged) {
      props.openDialog({
        children: (
          <ConfirmDialog
            title="Vil du gemme ændrede data?" //Save changed data?
            handleNo={() => {
              setIsDataChanged(false);
              changeUserGroup(userGroup);
              props.closeDialog();
            }}
            handleYes={() => {
              update();
              props.closeDialog();
            }}
          />
        )
      });
    } else {
      changeUserGroup(userGroup);
    }
  };

  if (userGroupList.length == 0) {
    return <LoadingPanel />;
  } else {
    return (
      <div className="flex">
        <div
          className="p-24"
          style={{
            width: '250px',
            borderRight: 'solid 1px rgb(0,0,0,0.12)'
          }}>
          <h4>Grupper</h4>
          <div>
            <List dense>
              {userGroupList.map(x => (
                <ListItem alignItems="flex-start" key={x._id} button selected={x._id === userGroupActive?._id} onClick={() => onClickUserGroup(x)}>
                  <ListItemText primary={x.name} />
                </ListItem>
              ))}
              {props.pagePermission.insert ? (
                <Button
                  id="add-button"
                  className="mt-20"
                  variant="contained"
                  color="primary"
                  disabled={props.pagePermission.insert === false}
                  onClick={() => handleAdd()}>
                  +
                </Button>
              ) : null}
            </List>
          </div>
        </div>

        <div className="p-24 pt-14" style={{ width: 760 }}>
          <div className="flex justify-between">
            <h4 className="mt-10">Rettigheder</h4>
            {/* Permision */}
            {userGroupActive !== null ? (
              <div>
                {props.pagePermission.update ? (
                  <IconButton
                    title="Rediger navn"
                    className="float-right"
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdate(userGroupActive)}>
                    <Icon>edit</Icon>
                  </IconButton>
                ) : null}
                {props.pagePermission.delete && !INIT_USER_GROUP_LIST.includes(userGroupActive._id) ? (
                  <IconButton
                    className="float-right"
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setLoadingPanel(true);
                      remove();
                      setLoadingPanel(false);
                    }}>
                    <Icon>delete</Icon>
                  </IconButton>
                ) : null}
              </div>
            ) : null}
          </div>
          <br />
          {loadingPanel ? <LoadingPanel width="1250px" /> : null}
          <UserGroupPermissionGrid
            permissionList={userGroupActive?.processedPermission}
            onChange={handleChangePermission}
            disabled={!props.pagePermission.update}
          />
          {props.pagePermission.update ? (
            <div
              className="flex justify-around pt-20"
              style={{
                width: 710,
                display: 'flex',
                justifyContent: 'space-around'
              }}>
              <Button
                variant="contained"
                color="default"
                onClick={() => onClickUserGroup(userGroupList.find(x => x._id === userGroupActive._id))}
                disabled={!isDataChanged}>
                Nulstil
              </Button>
              <Button variant="contained" color="primary" onClick={() => update()} disabled={!isDataChanged}>
                Gem
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

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
    pagePermission: getPagePermission('user_group', auth.user),
    user: auth.user
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupContent);
