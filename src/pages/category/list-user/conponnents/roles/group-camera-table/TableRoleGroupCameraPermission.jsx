import { STORAGE } from '@/constants/common';
import UserApi from '@/services/user/UserApi';
import { CloseOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-table';
import { Checkbox, Popconfirm, Space, Tooltip, Empty } from 'antd';
import { connect } from 'dva';
import { useEffect, useState } from 'react';
import { useIntl } from 'umi';
import AddCameraGroupPermission from './AddCameraGroupPermission';

function TableRoleGroupCameraPermission({
  id,
  dispatch,
  listCameraGroupPermission,
  listCameraGroupNotPermission,
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
      localStorage.setItem(STORAGE.ROLE_CODE_SELECTED, result?.payload?.uuid);
      dispatch({
        type: 'groupCameraPermissionInRole/fetchAllPermissionCameraGroups',
        payload: {
          code: result?.payload?.code,
        },
      });
    });
  }, []);

  async function onChange(e, name, cameraGroupId) {
    const data = {
      subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
      object: `cam_g@${cameraGroupId}`,
      action: name,
    };

    if (e.target.checked) {
      //dispatch
      dispatch({
        type: 'groupCameraPermissionInRole/setPermisionCameraGroups',
        payload: data,
      });

      return;
    }
    const dataRemove = {
      policies: [data],
    };
    //dispatch
    dispatch({
      type: 'groupCameraPermissionInRole/removePermisionCameraGroups',
      payload: dataRemove,
    });
  }

  const removeAllPermmisionInCameraGroups = async (record) => {
    const per = ['view_online', 'view_offline', 'setup_preset', 'ptz_control'];

    let data = [];

    for (let name of per) {
      if (record[name]) {
        data.push({
          subject: `role@${localStorage.getItem(STORAGE.ROLE_CODE_SELECTED)}`,
          object: `cam_g@${record.cam_group_uuid}`,
          action: name,
        });
      }
    }

    const dataRemove = {
      policies: data,
    };

    //dispatch
    dispatch({
      type: 'groupCameraPermissionInRole/removePermisionCameraGroups',
      payload: dataRemove,
    });
  };

  const renderCheckbox = (record, namePer) => {
    return (
      <Checkbox
        onChange={(e) => onChange(e, namePer, record.cam_group_uuid)}
        checked={!!record[namePer]}
        disabled={record.isDisableRow}
      />
    );
  };

  const columns = [
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.cameraGroup',
      }),
      dataIndex: 'cam_group_name',
      width: '15%',
    },

    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.view_online',
      }),
      dataIndex: 'view_online',
      render: (text, record) => {
        return <Space>{renderCheckbox(record, 'view_online')}</Space>;
      },
      width: '15%',
    },
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.view_offline',
      }),
      dataIndex: 'view_offline',
      render: (text, record) => {
        return <Space>{renderCheckbox(record, 'view_offline')}</Space>;
      },
      width: '15%',
    },
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.setup_preset',
      }),
      dataIndex: 'setup_preset',
      render: (text, record) => {
        return <Space>{renderCheckbox(record, 'setup_preset')}</Space>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.setting-user.list-user.ptz_control',
      }),
      dataIndex: 'ptz_control',
      render: (text, record) => {
        return <Space>{renderCheckbox(record, 'ptz_control')}</Space>;
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
                onConfirm={() => removeAllPermmisionInCameraGroups(record)}
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
        locale={{
          emptyText: <Empty description={intl.formatMessage({ id: 'view.ai_config.no_data' })} />,
        }}
        headerTitle={intl.formatMessage({
          id: 'pages.setting-user.list-user.permissionCameraGroups',
        })}
        recordCreatorProps={{
          creatorButtonText: intl.formatMessage({
            id: 'pages.setting-user.list-user.permissionCameraGroups',
          }),
          onClick: () => showDrawer(),
        }}
        rowKey="uuid"
        search={false}
        value={listCameraGroupPermission}
        columns={columns}
        // rowSelection={{}}
        options={false}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) =>
            `${intl.formatMessage({
              id: 'pages.setting-user.list-user.total',
            })} ${total}`,
          total: listCameraGroupPermission?.length,
          onChange: onPaginationChange,
          pageSize: 5,
          current: 1,
        }}
      />
      {openDrawer && (
        <AddCameraGroupPermission
          listCameraGroupNotPermission={listCameraGroupNotPermission}
          onClose={onClose}
          openDrawer={openDrawer}
        />
      )}
    </div>
  );
}

function mapStateToProps(state) {
  const { listCameraGroupPermission, metadata, listCameraGroupNotPermission } =
    state.groupCameraPermissionInRole;
  return {
    loading: state.loading.models.groupCameraPermissionInRole,
    listCameraGroupPermission,
    metadata,
    listCameraGroupNotPermission,
  };
}

export default connect(mapStateToProps)(TableRoleGroupCameraPermission);
