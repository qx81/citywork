// 网络请求封装
const baseUrl = 'http://localhost:3000/api';

// 请求拦截器
function requestInterceptor(config) {
  // 从本地存储获取token
  const token = uni.getStorageSync('token');
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
}

// 响应拦截器
function responseInterceptor(response) {
  if (response.statusCode === 200) {
    // 统一处理接口返回格式
    if (response.data.code === 200) {
      return response.data.data;
    } else {
      // 显示错误信息
      uni.showToast({
        title: response.data.msg,
        icon: 'none'
      });
      return Promise.reject(response.data.msg);
    }
  } else {
    // 网络错误
    uni.showToast({
      title: '网络请求失败',
      icon: 'none'
    });
    return Promise.reject('网络请求失败');
  }
}

// 封装uni.request
export default {
  // GET请求
  get(url, data = {}) {
    return new Promise((resolve, reject) => {
      const config = {
        url: baseUrl + url,
        method: 'GET',
        data,
        header: {
          'Content-Type': 'application/json'
        }
      };
      
      // 请求拦截
      const interceptedConfig = requestInterceptor(config);
      
      uni.request({
        ...interceptedConfig,
        success: (response) => {
          try {
            const result = responseInterceptor(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          });
          reject(error);
        }
      });
    });
  },
  
  // POST请求
  post(url, data = {}) {
    return new Promise((resolve, reject) => {
      const config = {
        url: baseUrl + url,
        method: 'POST',
        data,
        header: {
          'Content-Type': 'application/json'
        }
      };
      
      // 请求拦截
      const interceptedConfig = requestInterceptor(config);
      
      uni.request({
        ...interceptedConfig,
        success: (response) => {
          try {
            const result = responseInterceptor(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          });
          reject(error);
        }
      });
    });
  },
  
  // PUT请求
  put(url, data = {}) {
    return new Promise((resolve, reject) => {
      const config = {
        url: baseUrl + url,
        method: 'PUT',
        data,
        header: {
          'Content-Type': 'application/json'
        }
      };
      
      // 请求拦截
      const interceptedConfig = requestInterceptor(config);
      
      uni.request({
        ...interceptedConfig,
        success: (response) => {
          try {
            const result = responseInterceptor(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          });
          reject(error);
        }
      });
    });
  },
  
  // DELETE请求
  delete(url, data = {}) {
    return new Promise((resolve, reject) => {
      const config = {
        url: baseUrl + url,
        method: 'DELETE',
        data,
        header: {
          'Content-Type': 'application/json'
        }
      };
      
      // 请求拦截
      const interceptedConfig = requestInterceptor(config);
      
      uni.request({
        ...interceptedConfig,
        success: (response) => {
          try {
            const result = responseInterceptor(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          });
          reject(error);
        }
      });
    });
  }
};