<template>
  <view class="login-container">
    <view class="login-box">
      <view class="title">同城生活</view>
      <view class="subtitle">轻服务平台</view>
      
      <view class="form">
        <view class="form-item">
          <input type="number" v-model="phone" placeholder="请输入手机号" class="input" />
        </view>
        <view class="form-item">
          <input type="password" v-model="password" placeholder="请输入密码" class="input" />
        </view>
        <view class="form-item" v-if="isRegister">
          <input type="text" v-model="username" placeholder="请输入用户名" class="input" />
        </view>
        
        <button @click="handleSubmit" class="submit-btn">{{ isRegister ? '注册' : '登录' }}</button>
        
        <view class="switch">
          {{ isRegister ? '已有账号？' : '没有账号？' }}
          <text @click="isRegister = !isRegister" class="switch-text">{{ isRegister ? '去登录' : '去注册' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import request from '../../utils/request';

const phone = ref('');
const password = ref('');
const username = ref('');
const isRegister = ref(false);

const handleSubmit = async () => {
  // 表单验证
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }
  if (isRegister.value && !username.value) {
    uni.showToast({ title: '请输入用户名', icon: 'none' });
    return;
  }
  
  try {
    let result;
    if (isRegister.value) {
      // 注册
      result = await request.post('/user/register', {
        username: username.value,
        phone: phone.value,
        password: password.value
      });
      uni.showToast({ title: '注册成功', icon: 'success' });
      // 注册成功后自动登录
      await handleLogin();
    } else {
      // 登录
      await handleLogin();
    }
  } catch (error) {
    console.error('操作失败:', error);
  }
};

const handleLogin = async () => {
  try {
    const result = await request.post('/user/login', {
      phone: phone.value,
      password: password.value
    });
    // 保存用户信息到本地存储
    uni.setStorageSync('userInfo', result);
    uni.showToast({ title: '登录成功', icon: 'success' });
    // 跳转到首页
    uni.switchTab({ url: '/pages/user/user' });
  } catch (error) {
    console.error('登录失败:', error);
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 90%;
  max-width: 400rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10rpx;
  color: #333;
}

.subtitle {
  font-size: 24rpx;
  text-align: center;
  margin-bottom: 40rpx;
  color: #666;
}

.form {
  width: 100%;
}

.form-item {
  margin-bottom: 30rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.switch {
  margin-top: 30rpx;
  text-align: center;
  font-size: 24rpx;
  color: #666;
}

.switch-text {
  color: #007aff;
  margin-left: 10rpx;
}
</style>