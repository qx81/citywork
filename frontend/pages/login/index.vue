<template>
  <view class="login-container">
    <view class="login-box">
      <view class="title">同城生活</view>
      <view class="subtitle">手机号登录 / 注册</view>

      <view class="form-item">
        <input type="number" v-model="phone" maxlength="11" placeholder="请输入手机号" class="input" />
      </view>
      <view class="form-item">
        <input type="password" v-model="password" placeholder="请输入密码(至少6位)" class="input" />
      </view>
      <view class="form-item" v-if="isRegister">
        <input type="text" v-model="username" placeholder="请输入用户名" class="input" />
      </view>
      <view class="form-item" v-if="isRegister">
        <input type="text" v-model="code" placeholder="请输入验证码(123456)" class="input" />
      </view>

      <button @click="handleSubmit" :disabled="loading" class="submit-btn">{{ isRegister ? '注册并登录' : '登录' }}</button>

      <view class="switch">
        {{ isRegister ? '已有账号？' : '没有账号？' }}
        <text @click="isRegister = !isRegister" class="switch-text">{{ isRegister ? '去登录' : '去注册' }}</text>
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
const code = ref('123456');
const isRegister = ref(false);
const loading = ref(false);

const isPhoneValid = (value) => /^1\d{10}$/.test(value);

const handleSubmit = async () => {
  if (!isPhoneValid(phone.value)) return uni.showToast({ title: '请输入正确手机号', icon: 'none' });
  if (!password.value || password.value.length < 6) return uni.showToast({ title: '密码至少6位', icon: 'none' });
  if (isRegister.value && !username.value.trim()) return uni.showToast({ title: '请输入用户名', icon: 'none' });
  if (isRegister.value && code.value !== '123456') return uni.showToast({ title: '验证码错误', icon: 'none' });

  loading.value = true;
  try {
    if (isRegister.value) {
      await request.post('/user/register', {
        username: username.value.trim(),
        phone: phone.value,
        password: password.value,
        code: code.value
      });
      uni.showToast({ title: '注册成功', icon: 'success' });
    }

    const loginRes = await request.post('/user/login', {
      phone: phone.value,
      password: password.value
    });

    uni.setStorageSync('token', loginRes.token);
    uni.setStorageSync('userInfo', loginRes.user);
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/mine/index' }), 300);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container { display:flex; justify-content:center; align-items:center; height:100vh; background:#f5f5f5; }
.login-box { width:88%; background:#fff; border-radius:20rpx; padding:56rpx 40rpx; box-shadow:0 0 20rpx rgba(0,0,0,.08); }
.title { font-size:38rpx; font-weight:700; text-align:center; color:#333; }
.subtitle { font-size:24rpx; text-align:center; margin:14rpx 0 40rpx; color:#666; }
.form-item { margin-bottom:24rpx; }
.input { width:100%; height:82rpx; border:1rpx solid #ddd; border-radius:10rpx; padding:0 20rpx; font-size:28rpx; box-sizing:border-box; }
.submit-btn { width:100%; height:82rpx; background:#007aff; color:#fff; border-radius:10rpx; font-size:30rpx; margin-top:8rpx; }
.submit-btn[disabled] { opacity:.6; }
.switch { margin-top:28rpx; text-align:center; font-size:24rpx; color:#666; }
.switch-text { color:#007aff; margin-left:10rpx; }
</style>
