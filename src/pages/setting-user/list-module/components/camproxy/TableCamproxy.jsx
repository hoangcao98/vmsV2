import MSCustomizeDrawer from '@/components/Drawer';
import MSForm from '@/components/Form';
import { EditOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Col, Form, Input, Row, Space, Tag, Tooltip } from 'antd';
import { connect } from 'dva';
import { useState } from 'react';

const TableCamproxy = ({ dispatch, list, metadata }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [form] = Form.useForm();
  const showDrawer = () => {
    setOpenDrawer(true);
  };
  const onClose = () => {
    setOpenDrawer(false);
  };

  const handleSubmit = () => {
    const a = form.getFieldsValue(true);

    return false;
  };

  const renderTag = (cellValue) => {
    return (
      <Tag color={cellValue === 'UP' ? '#1380FF' : '#FF4646'} style={{ color: '#ffffff' }}>
        {cellValue === 'UP' ? `Đang hoạt động` : `Dừng hoạt động`}
      </Tag>
    );
  };
  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên Camproxy',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: renderTag,
    },
    {
      title: 'Thao tác',
      render: (text, record) => {
        return (
          <Space>
            <Tooltip placement="rightTop" title="Chỉnh sửa">
              <EditOutlined style={{ fontSize: '16px', color: '#6E6B7B' }} onClick={showDrawer} />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <ProTable
        headerTitle="Danh sách Camproxy"
        rowKey="id"
        search={false}
        dataSource={list}
        columns={columns}
        options={false}
        toolbar={{
          multipleLine: true,
          search: {
            onSearch: (value) => {
              alert(value);
            },
          },
        }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} Camproxy`,
          total: metadata?.total,
          pageSize: metadata?.size,
          current: metadata?.page,
        }}
      />
      {openDrawer && (
        <MSCustomizeDrawer
          openDrawer={openDrawer}
          onClose={onClose}
          width={800}
          zIndex={1001}
          title="Test"
          placement="right"
          extra={
            <Space>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" onClick={onClose}>
                OK
              </Button>
            </Space>
          }
        >
          <div>
            <MSForm layout="vertical" form={form} onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col span={24}>
                  <MSForm.Item
                    label="Username"
                    type="input"
                    name="name"
                    minLength={5}
                    maxLength={255}
                    required={true}
                  >
                    <Input />
                  </MSForm.Item>
                </Col>
              </Row>
            </MSForm>
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
              }}
            >
              <Button type="danger">Hủy</Button>
              <Button htmlType="submit" onClick={handleSubmit} type="ghost">
                Sửa
              </Button>
            </div>
          </div>
        </MSCustomizeDrawer>
      )}
    </>
  );
};

function mapStateToProps(state) {
  const { list, metadata } = state.camproxy;
  return {
    loading: state.loading.models.camproxy,
    list,
    metadata,
  };
}
export default connect(mapStateToProps)(TableCamproxy);
