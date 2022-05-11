export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/Login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        name: 'register',
        icon: 'smile',
        path: '/user/register',
        component: './user/register',
      },
      {
        component: '404',
      },
    ],
  },
  {
    path: '/list',
    icon: 'table',
    name: 'list',
    routes: [
      // {
      //   path: '/list',
      //   redirect: '/list/table-list',
      // },
      {
        name: 'Danh sách camera',
        icon: 'table',
        path: '/list/camera-list',
        component: './list/camera-list',
      },
    ],
  },
  {
    name: 'exception',
    icon: 'warning',
    path: '/exception',
    hideInMenu: true,
    routes: [
      {
        name: '403',
        icon: 'smile',
        path: '/exception/403',
        component: './exception/403',
      },
      {
        name: '404',
        icon: 'smile',
        path: '/exception/404',
        component: './exception/404',
      },
      {
        name: '500',
        icon: 'smile',
        path: '/exception/500',
        component: './exception/500',
      },
    ],
  },
  {
    name: 'report',
    icon: 'highlight',
    path: '/report',
    routes: [
      {
        name: 'flow',
        icon: 'smile',
        path: '/report',
        component: './report',
      },
    ],
  },
  {
    path: '/setting-user',
    name: 'Cài đặt',
    icon: 'setting',
    routes: [
      // {
      //   path: '/setting-user',
      //   redirect: '/setting-user/list-user',
      // },
      {
        name: 'Danh sách user',
        icon: 'smile',
        path: '/setting-user/list-user',
        component: './setting-user/list-user',
      },
      {
        name: 'Danh sách Module',
        icon: 'smile',
        path: '/setting-user/list-module',
        component: './setting-user/list-module',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/analysis',
  },
  {
    component: '404',
  },
];
