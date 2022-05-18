import { STORAGE } from '@/constants/common';
import UserApi from '@/services/user/UserApi';
import { CloseOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-table';
import { Checkbox, Popconfirm, Space, Tooltip } from 'antd';
import { connect } from 'dva';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'umi';
import AddCameraPermission from './AddCameraPermission';

function TableRoleCameraPermission({
  id,
  dispatch,
  listCameraPermission,
  listCameraNotPermission,
  loading,
}) {
  const intl = useIntl();

  const [openDrawer, setOpenDrawer] = useState(false);

  const showDrawer = () => {
    setOpenDrawer(true);
  };
  const onClose = () => {
    setOpenDrawer(false);
  };

  useEffect(() => {
    UserApi.getRoleByUuid(id).then(async (result) => {
      localStorage.setItem(STORAGE.ROLE_CODE_SELECTED, result?.payload?.code);
      localStorage.setItem(STORAGE.ROLE_UUID_SELECTED, result?.payload?.uuid);

      dispatch({
        type: 'cameraPermissionInRole/fetchAllPermissionCamera',
        payload: {
          code: result?.payload?.code,
        },
      });
    });
  }, []);

  async function onChange(e, name, cameraGroupId) {
    const data = {
      subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
      object: `cam@${cameraGroupId}`,
      action: name,
    };
    if (e.target.checked) {
      //dispatch
      dispatch({
        type: 'cameraPermissionInRole/setPermisionCamera',
        payload: data,
      });

      return;
    }
    const dataRemove = {
      policies: [data],
    };
    //dispatch
    dispatch({
      type: 'cameraPermissionInRole/removePermisionCamera',
      payload: dataRemove,
    });
  }

  const removeAllPermmisionInCamera = async (record) => {
    if (
      record?.view_online &&
      !record?.view_offline &&
      !record?.setup_preset &&
      !record?.ptz_control
    ) {
      const data = [];
      data.push({
        subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
        object: `cam@${record.cam_uuid}`,
        action: 'view_online',
      });

      const dataRemove = {
        policies: data,
      };

      //dispatch
      dispatch({
        type: 'cameraPermissionInRole/removePermisionCamera',
        payload: dataRemove,
      });

      return;
    }

    const data = [];
    if (record?.view_online) {
      data.push({
        subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
        object: `cam@${record.cam_uuid}`,
        action: 'view_online',
      });
    }
    if (record?.view_offline) {
      data.push({
        subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
        object: `cam@${record.cam_uuid}`,
        action: 'view_offline',
      });
    }
    if (record?.setup_preset) {
      data.push({
        subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
        object: `cam@${record.cam_uuid}`,
        action: 'setup_preset',
      });
    }
    if (record?.ptz_control) {
      data.push({
        subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
        object: `cam@${record.cam_uuid}`,
        action: 'ptz_control',
      });
    }
    const dataRemove = {
      policies: data,
    };

    //dispatch
    dispatch({
      type: 'cameraPermissionInRole/removePermisionCamera',
      payload: dataRemove,
    });
  };

  const viewOnline = (record) => {
    let defaultChecked = true;

    if (record.view_online === undefined) {
      defaultChecked = false;
    }

    return (
      <Checkbox
        onChange={(e) => onChange(e, 'view_online', record.cam_uuid)}
        checked={defaultChecked}
        disabled={record.isDisableRow}
      />
    );
  };

  const viewOffline = (record) => {
    let defaultChecked = true;

    if (record.view_offline === undefined) {
      defaultChecked = false;
    }

    return (
      <Checkbox
        onChange={(e) => onChange(e, 'view_offline', record.cam_uuid)}
        checked={defaultChecked}
        disabled={record.isDisableRow}
      />
    );
  };
  const setupPreset = (record) => {
    let defaultChecked = true;

    if (record.setup_preset === undefined) {
      defaultChecked = false;
    }

    return (
      <Checkbox
        onChange={(e) => onChange(e, 'setup_preset', record.cam_uuid)}
        checked={defaultChecked}
        disabled={record.isDisableRow}
      />
    );
  };

  const ptzControl = (record) => {
    let defaultChecked = true;

    if (record.ptz_control === undefined) {
      defaultChecked = false;
    }

    return (
      <Checkbox
        onChange={(e) => onChange(e, 'ptz_control', record.cam_uuid)}
        checked={defaultChecked}
        disabled={record.isDisableRow}
      />
    );
  };

  const columns = [
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.camera',
      }),
      dataIndex: 'cam_name',
      width: '15%',
    },

    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.view_online',
      }),
      dataIndex: 'view_online',
      render: (text, record) => {
        return <Space>{viewOnline(record)}</Space>;
      },
      width: '15%',
    },
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.view_offline',
      }),
      dataIndex: 'view_offline',
      render: (text, record) => {
        return <Space>{viewOffline(record)}</Space>;
      },
      width: '15%',
    },
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.setup_preset',
      }),
      dataIndex: 'setup_preset',
      render: (text, record) => {
        return <Space>{setupPreset(record)}</Space>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.ptz_control',
      }),
      dataIndex: 'ptz_control',
      render: (text, record) => {
        return <Space>{ptzControl(record)}</Space>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.option',
      }),
      fixed: 'right',
      width: '15%',
      render: (text, record) => {
        return (
          <Space>
            {!record.isDisableRow && (
              <Popconfirm
                title={intl.formatMessage({
                  id: 'pages.setting-user.list-user.delete-confirm',
                })}
                onConfirm={() => removeAllPermmisionInCamera(record)}
                cancelText="Cancel"
                okText="Ok"
              >
                <Tooltip
                  placement="top"
                  title={intl.formatMessage({
                    id: 'pages.setting-user.list-user.delete',
                  })}
                  arrowPointAtCenter={true}
                >
                  <CloseOutlined />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];
  const onPaginationChange = (page, size) => {};

  return (
    <div>
      {' '}
      <EditableProTable
        loading={loading}
        headerTitle={intl.formatMessage({
          id: 'pages.setting-user.list-user.permissionCamera',
        })}
        rowKey="uuid"
        search={false}
        value={listCameraPermission}
        columns={columns}
        // rowSelection={{}}
        options={false}
        recordCreatorProps={{
          creatorButtonText: intl.formatMessage({
            id: 'pages.setting-user.list-user.permissionCamera',
          }),
          onClick: () => showDrawer(),
        }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) =>
            `${intl.formatMessage({
              id: 'pages.setting-user.list-user.total',
            })} ${total}`,
          total: listCameraPermission?.length,
          onChange: onPaginationChange,
          pageSize: 5,
          current: 1,
        }}
      />
      {openDrawer && (
        <AddCameraPermission
          listCameraNotPermission={listCameraNotPermission}
          onClose={onClose}
          openDrawer={openDrawer}
        />
      )}
    </div>
  );
}

function mapStateToProps(state) {
  const { listCameraPermission, metadata, listCameraNotPermission } = state.cameraPermissionInRole;
  return {
    loading: state.loading.models.cameraPermissionInRole,
    listCameraPermission,
    metadata,
    listCameraNotPermission,
  };
}

export default connect(mapStateToProps)(TableRoleCameraPermission);
