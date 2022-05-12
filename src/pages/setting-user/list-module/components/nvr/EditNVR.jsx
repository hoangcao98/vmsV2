import MSFormItem from '@/components/Form/Item';
import { Button, Col, Form, Input, Row } from 'antd';
import React from 'react';

const { TextArea } = Input;

const EditNVR = ({ selectedNVREdit, onClose, dispatch }) => {
  const [form] = Form.useForm();
  const handleSubmit = (value) => {
    dispatch({
      type: 'nvr/editNVR',
      nvrId: selectedNVREdit.uuid,
      payload: value,
    });
    onClose();
  };

  return (
    <div>
      <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={selectedNVREdit}>
        <Row gutter={16}>
          <Col span={24}>
            <MSFormItem
              label="Tên NVR"
              type="input"
              name="name"
              minLength={5}
              maxLength={255}
              required={true}
            >
              <Input />
            </MSFormItem>
          </Col>
          <Col span={24}>
            <MSFormItem
              label="Ghi chú"
              type="input"
              name="note"
              minLength={5}
              maxLength={255}
              required={true}
            >
              <TextArea rows={2} />
            </MSFormItem>
          </Col>
          <Col span={24}>
            <MSFormItem
              label="Mô tả"
              type="input"
              name="description"
              minLength={5}
              maxLength={255}
              required={true}
            >
              <TextArea rows={2} />
            </MSFormItem>
          </Col>
        </Row>
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
          <Button onClick={onClose} type="danger">
            Hủy
          </Button>
          <Button htmlType="submit" type="ghost">
            Sửa
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditNVR;
