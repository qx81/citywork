const BASE_URL = 'http://localhost:3000/api';

export function request({ url, method = 'GET', data = {}, needAuth = false }) {
  const token = uni.getStorageSync('token');
  uni.showLoading({ title: '加载中' });
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: needAuth ? { Authorization: `Bearer ${token}` } : {},
      success: ({ data: res }) => {
        if (res.code === 200) return resolve(res.data);
        if (res.code === 401) uni.navigateTo({ url: '/pages/login/index' });
        uni.showToast({ title: res.msg || '请求失败', icon: 'none' });
        reject(res);
      },
      fail: reject,
      complete: () => uni.hideLoading()
    });
  });
}
