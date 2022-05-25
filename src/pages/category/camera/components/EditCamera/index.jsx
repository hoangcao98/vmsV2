/* eslint-disable react-hooks/exhaustive-deps */
import { connect } from 'dva';
import { useState, useEffect } from 'react';
import { StyledDrawer, StyledSpace, SpaceAddAvatar } from './style';
import {
  Space,
  Button,
  Card,
  Row,
  Col,
  Form,
  Input,
  Upload,
  Avatar,
  Select,
  Popconfirm,
} from 'antd';
import { useIntl } from 'umi';
import {
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  InboxOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import MapAddCamera from '../Map';
import { v4 as uuidV4 } from 'uuid';
import { clearData } from '@/utils';
import { filterOption, normalizeOptions } from '@/components/select/CustomSelect';
import { notify } from '@/components/Notify';
import AddressApi from '@/services/addressApi';
import VietMapApi from '@/services/vietmapApi';
import ExportEventFileApi from '@/services/exportEventFile';
import getBase64 from '@/utils/getBase64';
import { isEmpty } from 'lodash';
const { Dragger } = Upload;
const formItemLayout = {
  wrapperCol: { span: 24 },
  labelCol: { span: 5 },
};
const EditCamera = ({
  isEditDrawer,
  setIsEditDrawer,
  dispatch,
  selectedUuidEdit,
  selectedCamera,
  loading,
  cameraTypesOptions,
  groupCameraOptions,
  zonesOptions,
  adDivisionsOptions,
  vendorsOptions,
  tagsOptions,
  provincesOptions,
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFileName, setAvatarFileName] = useState('');
  const [districts, setDistrict] = useState([]);
  const [wards, setWard] = useState([]);
  const [resultSearchMap, setResultSearchMap] = useState(null);
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLng, setCurrentLng] = useState(null);
  const [defaultLongLat, setDefaultLongLat] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const vietmapApiKey = REACT_APP_VIETMAP_APIKEY;

  //Get data camera
  useEffect(() => {
    if (selectedUuidEdit !== '') {
      dispatch({
        type: 'camera/getCameraByUuid',
        payload: selectedUuidEdit,
      });
    }
  }, [dispatch, selectedUuidEdit]);
  // Fill data to form
  useEffect(() => {
    (async () => {
      if (!isEmpty(selectedCamera)) {
        setCurrentLat(selectedCamera?.lat_);
        setCurrentLng(selectedCamera?.long_);
        setAvatarFileName(selectedCamera?.avatarFileName);
        setDefaultLongLat([selectedCamera?.long_, selectedCamera?.lat_]);
        for (const key in selectedCamera) {
          form.setFieldsValue({ [key]: selectedCamera[key] });
        }
        const customTags = selectedCamera?.tags?.map((item) => {
          return {
            label: item.key,
            value: item.value[0],
          };
        });
        form.setFieldsValue({ tags: customTags });
        await ExportEventFileApi.getAvatar(selectedCamera?.avatarFileName).then((result) => {
          if (result) {
            let blob = new Blob([result], { type: 'octet/stream' });
            let url = window.URL.createObjectURL(blob);
            setAvatarUrl(url);
          } else {
            setAvatarUrl('');
          }
        });
      }
    })();
  }, [selectedCamera]);
  const onChangeCity = (cityId) => {
    form.setFieldsValue({ districtId: null, wardId: null });
    setWard([]);
    setDistrict([]);
    if (cityId) {
      AddressApi.getDistrictByProvinceId(cityId).then((res) => {
        setDistrict(res?.payload);
      });
    }
  };
  const onChangeDistrict = (districtId) => {
    form.setFieldsValue({ wardId: null });
    setWard([]);
    if (districtId) {
      AddressApi.getWardByDistrictId(districtId).then((res) => {
        setWard(res?.payload);
      });
    }
  };
  //upload avatar
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
    }
  };
  function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      notify('error', 'noti.ERROR', 'noti.upload_file_desc');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notify('error', 'noti.ERROR', 'noti.upload_file_desc');
    }
    return isJpgOrPng && isLt2M;
  }
  const uploadImage = async (options) => {
    const { file } = options;
    await ExportEventFileApi.uploadAvatar(uuidV4(), file).then((result) => {
      if (result && result.payload && result.payload.fileUploadInfoList.length > 0) {
        getBase64(file, (imageUrl) => {
          setAvatarUrl(imageUrl);
          let fileName = result.payload.fileUploadInfoList[0].name;
          setAvatarFileName(fileName);

          //phần này set vào state để push lên
        });
      }
    });
  };
  const onClose = () => {
    setIsEditDrawer(false);
    setAvatarUrl('');
    setAvatarFileName('');
    setResultSearchMap(null);
    setDistrict([]);
    setWard([]);
    setCurrentLat(null);
    setCurrentLng(null);
    form.resetFields();
    dispatch({
      type: 'camera/getOneCamera',
      payload: {
        selectedCamera: {},
      },
    });
    dispatch({
      type: 'camera/selectUuidEdit',
      payload: '',
    });
  };
  const DraggerProps = {
    name: 'avatar',
    accept: '.png,.jpeg,.jpg',
    listType: 'picture-card',
    beforeUpload: beforeUpload,
    customRequest: uploadImage,
    onChange: handleChange,
    showUploadList: false,
    multiple: false,
  };
  // submit form
  const handleSubmit = async (data) => {
    if (currentLat === null) {
      notify('error', 'noti.ERROR', 'noti.please_select_lnglat_camera');
    } else {
      const tags = data?.tags?.map((e) => {
        if (e?.value) {
          return tagsOptions?.find((tag) => tag.uuid === e?.value);
        } else {
          return tagsOptions?.find((tag) => tag.uuid === e);
        }
      });
      const customTags = tags?.map((item) => {
        const ct = {
          key: item?.key,
          value: [item?.uuid],
        };
        return ct;
      });
      const payload = {
        ...selectedCamera,
        ...data,
        avatarFileName: avatarFileName,
        lat_: currentLat,
        long_: currentLng,
        tags: customTags,
      };
      const clearPayload = clearData(payload);
      dispatch({
        type: 'camera/editCamera',
        payload: clearPayload,
        uuid: selectedUuidEdit,
      });
    }
  };
  //Search in map
  const handleSearchMap = async (value) => {
    const result = await VietMapApi.search(value, vietmapApiKey);
    setResultSearchMap(result);
  };
  //Select location in map
  const handleSelectMap = (lng, lat) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
  };
  //Delete camera
  const handleDeleteCamera = () => {
    dispatch({
      type: 'camera/deleteCamera',
      payload: selectedUuidEdit,
    });
  };
  return (
    <StyledDrawer
      openDrawer={isEditDrawer}
      onClose={onClose}
      width={'80%'}
      zIndex={1001}
      placement="right"
      extra={
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              form.submit();
            }}
          >
            <SaveOutlined />
            {intl.formatMessage({ id: 'view.map.button_save' })}
          </Button>
          <Popconfirm
            icon={<QuestionCircleOutlined />}
            title={intl.formatMessage(
              {
                id: 'noti.delete_camera',
              },
              {
                this: intl.formatMessage({ id: 'this' }),
                cam: intl.formatMessage({ id: 'camera' }),
              },
            )}
            onConfirm={handleDeleteCamera}
          >
            <Button type="primary" danger>
              <DeleteOutlined />
              {intl.formatMessage({ id: 'view.ai_events.delete' })}
            </Button>
          </Popconfirm>

          <Button onClick={onClose}>
            <CloseOutlined />
            {intl.formatMessage({ id: 'view.map.cancel' })}
          </Button>
        </Space>
      }
    >
      <Card
        title={intl.formatMessage({
          id: 'view.camera.edit_camera',
        })}
      >
        <Form
          className="bg-grey"
          form={form}
          {...formItemLayout}
          layout="horizontal"
          onFinish={handleSubmit}
        >
          <Row>
            <Col span={11}>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name={['code']}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 24 }}
                    label={intl.formatMessage(
                      { id: 'view.map.camera_id' },
                      {
                        cam: intl.formatMessage({
                          id: 'camera',
                        }),
                      },
                    )}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: 'view.map.required_field',
                        }),
                      },
                    ]}
                  >
                    <Input
                      maxLength={255}
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_enter_camera_id',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                          cam: intl.formatMessage({
                            id: 'camera',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          code: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          code: e.clipboardData.getData('text').trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 24 }}
                    name="name"
                    label={intl.formatMessage(
                      {
                        id: 'view.camera.camera_name',
                      },
                      {
                        cam: intl.formatMessage({
                          id: 'camera',
                        }),
                      },
                    )}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: 'view.map.required_field',
                        }),
                      },
                    ]}
                  >
                    <Input
                      maxLength={255}
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_enter_camera_name',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                          cam: intl.formatMessage({
                            id: 'camera',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          name: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          name: e.clipboardData.getData('text').trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <StyledSpace>
                    <Form.Item
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 24 }}
                      label={intl.formatMessage(
                        {
                          id: 'view.camera.group_camera',
                        },
                        {
                          cam: intl.formatMessage({
                            id: 'camera',
                          }),
                        },
                      )}
                      name={['cameraGroupUuid']}
                      rules={
                        [
                          // {
                          //   required: true,
                          //   message: intl.formatMessage({
                          //     id: 'view.map.required_field',
                          //   }),
                          // },
                        ]
                      }
                    >
                      <Select
                        showSearch
                        filterOption={filterOption}
                        options={normalizeOptions('name', 'uuid', groupCameraOptions)}
                        placeholder={intl.formatMessage(
                          {
                            id: 'view.camera.please_choose_group_camera',
                          },
                          {
                            cam: intl.formatMessage({
                              id: 'camera',
                            }),
                          },
                        )}
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      />
                    </Form.Item>
                    <Button
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => console.log('click')}
                    />
                  </StyledSpace>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <StyledSpace>
                    <Form.Item
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 24 }}
                      label={intl.formatMessage(
                        {
                          id: 'view.camera.camera_type',
                        },
                        {
                          cam: intl.formatMessage({
                            id: 'camera',
                          }),
                        },
                      )}
                      name={['cameraTypeUuid']}
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: 'view.map.required_field',
                          }),
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={filterOption}
                        options={normalizeOptions('name', 'uuid', cameraTypesOptions)}
                        placeholder={intl.formatMessage(
                          {
                            id: 'view.map.please_choose_camera_type',
                          },
                          {
                            cam: intl.formatMessage({
                              id: 'camera',
                            }),
                          },
                        )}
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      />
                    </Form.Item>
                    <Button
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => console.log('click')}
                    />
                  </StyledSpace>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <StyledSpace>
                    <Form.Item
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 24 }}
                      name={['vendorUuid']}
                      label={intl.formatMessage({
                        id: 'view.map.vendor',
                      })}
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: 'view.map.required_field',
                          }),
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={filterOption}
                        options={normalizeOptions('name', 'uuid', vendorsOptions)}
                        placeholder={intl.formatMessage({
                          id: 'view.map.choose_vendor',
                        })}
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      />
                    </Form.Item>
                    <Button
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => console.log('click')}
                    />
                  </StyledSpace>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 24 }}
                    label={intl.formatMessage({
                      id: 'view.map.port',
                    })}
                    name={['port']}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: 'view.map.required_field',
                        }),
                      },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          const data = getFieldValue(['port']);
                          const regex =
                            /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/;
                          if (data) {
                            if (isFinite(data) && regex.test(data)) {
                              return Promise.resolve();
                            } else {
                              return Promise.reject(
                                intl.formatMessage({
                                  id: 'view.storage.invalid_format',
                                }),
                              );
                            }
                          } else {
                            return Promise.resolve();
                          }
                        },
                      }),
                    ]}
                  >
                    <Input
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_enter_port',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          port: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          port: e.clipboardData.getData('text').trim(),
                        });
                      }}
                      maxLength={255}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 24 }}
                    label={intl.formatMessage({
                      id: 'view.map.original_url',
                    })}
                    name={['cameraUrl']}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: 'view.map.required_field',
                        }),
                      },
                    ]}
                  >
                    <Input
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_enter_original_url',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          cameraUrl: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          cameraUrl: e.clipboardData.getData('text').trim(),
                        });
                      }}
                      maxLength={2000}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 24 }}
                    label={intl.formatMessage({
                      id: 'view.map.map',
                    })}
                    name={['searchmap']}
                  >
                    <Input.Search
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_choose_location',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          searchmap: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          searchmap: e.clipboardData.getData('text').trim(),
                        });
                      }}
                      onSearch={(value) => handleSearchMap(value)}
                      maxLength={2000}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <MapAddCamera
                    resultSearchMap={resultSearchMap}
                    handleSelectMap={handleSelectMap}
                    defaultLongLat={defaultLongLat}
                    isEdit={true}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={11} offset={2}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 24 }}
                    name={['provinceId']}
                    label={intl.formatMessage({
                      id: 'view.map.province_id',
                    })}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: 'view.map.required_field',
                        }),
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      onChange={(cityId) => onChangeCity(cityId)}
                      filterOption={filterOption}
                      options={normalizeOptions('name', 'provinceId', provincesOptions)}
                      placeholder={intl.formatMessage({
                        id: 'view.map.province_id',
                      })}
                      allowClear
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 24 }}
                    name={['districtId']}
                    label={intl.formatMessage({
                      id: 'view.map.district_id',
                    })}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: 'view.map.required_field',
                        }),
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      onChange={(districtId) => onChangeDistrict(districtId)}
                      filterOption={filterOption}
                      options={normalizeOptions('name', 'districtId', districts)}
                      placeholder={intl.formatMessage({
                        id: 'view.map.district_id',
                      })}
                      allowClear
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 24 }}
                    name={['wardId']}
                    label={intl.formatMessage({
                      id: 'view.map.ward_id',
                    })}
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: `${intl.formatMessage({
                    //       id: 'view.map.required_field',
                    //     })}`,
                    //   },
                    // ]}
                  >
                    <Select
                      showSearch
                      filterOption={filterOption}
                      options={normalizeOptions('name', 'id', wards)}
                      placeholder={intl.formatMessage({
                        id: 'view.map.ward_id',
                      })}
                      allowClear
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 24 }}
                    name={['address']}
                    label={intl.formatMessage({
                      id: 'view.storage.street',
                    })}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: 'view.map.required_field',
                        }),
                      },
                    ]}
                  >
                    <Input
                      maxLength={255}
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_enter_street',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          address: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          address: e.clipboardData.getData('text').trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <StyledSpace>
                    <Form.Item
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 24 }}
                      label={intl.formatMessage({
                        id: 'view.map.zone',
                      })}
                      name={['zoneUuid']}
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: 'view.map.required_field',
                          }),
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={filterOption}
                        options={normalizeOptions('name', 'uuid', zonesOptions)}
                        placeholder={intl.formatMessage(
                          {
                            id: 'view.map.choose_zone',
                          },
                          {
                            plsEnter: intl.formatMessage({
                              id: 'please_enter',
                            }),
                          },
                        )}
                        allowClear
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      />
                    </Form.Item>
                    <Button
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => console.log('click')}
                    />
                  </StyledSpace>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <StyledSpace>
                    <Form.Item
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 24 }}
                      label={intl.formatMessage({
                        id: 'view.map.administrative_unit',
                      })}
                      name={['administrativeUnitUuid']}
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={filterOption}
                        options={normalizeOptions('name', 'uuid', adDivisionsOptions)}
                        placeholder={intl.formatMessage({
                          id: 'view.map.please_choose_administrative_unit',
                        })}
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      />
                    </Form.Item>
                    <Button
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => console.log('click')}
                    />
                  </StyledSpace>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 24 }}
                    label={intl.formatMessage({
                      id: 'view.map.hls_url',
                    })}
                    name={['hlsUrl']}
                  >
                    <Input
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_enter_hls_url',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          hlsUrl: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          hlsUrl: e.clipboardData.getData('text').trim(),
                        });
                      }}
                      maxLength={2000}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <StyledSpace>
                    <Form.Item
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 24 }}
                      label={intl.formatMessage(
                        {
                          id: 'view.category.tags',
                        },
                        {
                          cam: intl.formatMessage({ id: 'camera' }),
                        },
                      )}
                      name={['tags']}
                      rules={[]}
                    >
                      <Select
                        showSearch
                        filterOption={filterOption}
                        options={normalizeOptions('key', 'uuid', tagsOptions)}
                        placeholder={intl.formatMessage({
                          id: 'view.map.choose_tags',
                        })}
                        allowClear
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                        mode="multiple"
                      />
                    </Form.Item>
                    <Button
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => console.log('click')}
                    />
                  </StyledSpace>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 24 }}
                    label="IP"
                    name={['ip']}
                    rules={[
                      {
                        required: true,
                        message: `${intl.formatMessage({
                          id: 'view.map.required_field',
                        })}`,
                      },
                      {
                        pattern:
                          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                        message: `${intl.formatMessage({
                          id: 'view.map.ip_error',
                        })}`,
                      },
                    ]}
                  >
                    <Input
                      placeholder={intl.formatMessage(
                        {
                          id: 'view.map.please_enter_ip',
                        },
                        {
                          plsEnter: intl.formatMessage({
                            id: 'please_enter',
                          }),
                        },
                      )}
                      onBlur={(e) => {
                        form.setFieldsValue({
                          ip: e.target.value.trim(),
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        form.setFieldsValue({
                          ip: e.clipboardData.getData('text').trim(),
                        });
                      }}
                      maxLength={2000}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name={['avatarUser']}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 14 }}
                    label={intl.formatMessage({
                      id: 'view.map.add_image',
                    })}
                  >
                    <SpaceAddAvatar>
                      {avatarUrl !== '' && (
                        <div className=" d-flex justify-content-center">
                          <Avatar
                            icon={<UserOutlined />}
                            src={avatarUrl}
                            className="avatarUser"
                            size={{
                              xs: 14,
                              sm: 22,
                              md: 30,
                              lg: 44,
                              xl: 60,
                              xxl: 100,
                            }}
                          />
                        </div>
                      )}
                      <Dragger {...DraggerProps}>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          {intl.formatMessage({
                            id: 'view.map.dragger_title',
                          })}
                        </p>
                        <p className="ant-upload-hint">
                          {intl.formatMessage({
                            id: 'view.map.dragger_sub_title',
                          })}
                        </p>
                      </Dragger>
                    </SpaceAddAvatar>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card>
    </StyledDrawer>
  );
};
function mapStateToProps(state) {
  const { selectedUuidEdit, selectedCamera } = state.camera;
  const {
    cameraTypesOptions,
    groupCameraOptions,
    zonesOptions,
    adDivisionsOptions,
    vendorsOptions,
    tagsOptions,
    provincesOptions,
  } = state.globalstore;
  return {
    loading: state.loading.models.camera,
    selectedUuidEdit,
    selectedCamera,
    cameraTypesOptions,
    groupCameraOptions,
    zonesOptions,
    adDivisionsOptions,
    vendorsOptions,
    tagsOptions,
    provincesOptions,
  };
}
export default connect(mapStateToProps)(EditCamera);
