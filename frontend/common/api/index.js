import { BASE_URL, request } from '../utils/request';

const api = {
  homeSearch: (keyword) => request({ url: `/common/search?keyword=${encodeURIComponent(keyword)}` }),
  homeFeed: (params = {}) => {
    const { city = '', district = '' } = params;
    return request({ url: `/common/home?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}` });
  },
  nearby: (city) => request({ url: `/common/nearby?city=${encodeURIComponent(city)}` }),
  skillList: (sort = 'recommend') => request({ url: `/skill/list?sort=${encodeURIComponent(sort)}` }),
  skillDetail: (id) => request({ url: `/skill/detail/${id}` }),
  secondHandList: () => request({ url: '/secondHand/list' }),
  playList: (sort = 'time') => request({ url: `/play/list?sort=${encodeURIComponent(sort)}` }),
  businessList: () => request({ url: '/business/list' }),
  login: (data) => request({ url: '/user/login', method: 'POST', data }),
  profile: () => request({ url: '/user/profile', needAuth: true }),
  updateProfile: (data) => request({ url: '/user/profile', method: 'PUT', data, needAuth: true }),
  center: () => request({ url: '/user/center', needAuth: true }),
  logout: () => request({ url: '/user/logout', method: 'POST', needAuth: true }),
  orderList: (status) => request({ url: `/order/list${status !== undefined ? `?status=${status}` : ''}`, needAuth: true }),
  uploadAvatar: (filePath) => {
    const token = uni.getStorageSync('token');
    uni.showLoading({ title: '上传中' });
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${BASE_URL}/upload/avatar`,
        filePath,
        name: 'file',
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success: ({ data }) => {
          let parsed = {};
          try {
            parsed = typeof data === 'string' ? JSON.parse(data) : data;
          } catch (e) {
            uni.showToast({ title: '上传响应异常', icon: 'none' });
            reject(e);
            return;
          }

          if (parsed.code !== 200) {
            uni.showToast({ title: parsed.msg || '上传失败', icon: 'none' });
            reject(parsed);
            return;
          }

          const rawPath = parsed.data?.path || '';
          const normalizedPath = rawPath.replace(/\\/g, '/');
          const fullPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
          resolve(`${BASE_URL.replace('/api', '')}${fullPath}`);
        },
        fail: (err) => {
          uni.showToast({ title: '上传失败', icon: 'none' });
          reject(err);
        },
        complete: () => uni.hideLoading()
      });
    });
  }
};

export { api };
export default api;
