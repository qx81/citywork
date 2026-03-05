import { request } from '../utils/request';

export const api = {
  homeSearch: (keyword) => request({ url: `/common/search?keyword=${encodeURIComponent(keyword)}` }),
  nearby: (city) => request({ url: `/common/nearby?city=${encodeURIComponent(city)}` }),
  login: (data) => request({ url: '/user/login', method: 'POST', data }),
  profile: () => request({ url: '/user/profile', needAuth: true }),
  center: () => request({ url: '/user/center', needAuth: true }),
  logout: () => request({ url: '/user/logout', method: 'POST', needAuth: true }),
  orderList: (status) => request({ url: `/order/list${status !== undefined ? `?status=${status}` : ''}`, needAuth: true })
};
