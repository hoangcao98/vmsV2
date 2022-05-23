import EventAiAPI from '@/services/storage-api/eventAI-api';

export const initSearchEventsAI = {
  startRecordTime: -1,
  endRecordTime: -1,
  address: '',
  provinceId: '',
  districtId: '',
  wardId: '',
  administrativeUnitUuid: '',
  fileType: 0,
  cameraGroupUuid: '',
  cameraUuid: '',
  type: -1,
  eventUuid: '',
  searchType: '',
  searchValue: '',
  eventType: '',
  status: '',
};

export default {
  namespace: 'eventAI',
  state: {
    list: [],
    metadata: {
      page: 1,
      size: 10,
      total: 0,
      ...initSearchEventsAI,
    },
  },

  reducers: {
    save(state, { payload: { data: list, metadata } }) {
      return { ...state, list, metadata: { ...state.metadata, ...metadata } };
    },

    saveSearchParam(state, { payload }) {
      return { ...state, metadata: { ...state.metadata, ...payload } };
    },
  },

  effects: {
    *fetchAllEventsAI({ payload }, { call, put }) {
      try {
        const response = yield call(EventAiAPI.getAllEvents, payload);
        yield put({
          type: 'save',
          payload: {
            data: response.payload,
            metadata: response.metadata,
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
};
