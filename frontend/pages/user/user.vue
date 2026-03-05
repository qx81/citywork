<template>
  <view class="user-container">
    <view class="user-info" @click="handleEditInfo">
      <image :src="userInfo.avatar || '/static/avatar.png'" class="avatar" />
      <view class="info">
        <text class="username">{{ userInfo.username || '未登录' }}</text>
        <text class="phone">{{ userInfo.phone || '' }}</text>
      </view>
      <text class="arrow">></text>
    </view>
    
    <view class="menu">
      <view class="menu-item" @click="navigateTo('/pages/publish/publish')">
        <text class="menu-icon">+</text>
        <text class="menu-text">发布</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/order/orderList')">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="handleLocation">
        <text class="menu-icon">📍</text>
        <text class="menu-text">同城位置</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="handleAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">></text>
      </view>
    </view>
    
    <view class="logout" v-if="userInfo.id" @click="handleLogout">
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const userInfo = ref({});

const loadUserInfo = async () => {
  const storedUserInfo = uni.getStorageSync('userInfo');
  if (storedUserInfo) {
    userInfo.value = storedUserInfo;
  }
};

const handleEditInfo = () => {
  if (!userInfo.value.id) {
    uni.navigateTo({ url: '/pages/login/login' });
    return;
  }
  // 这里可以跳转到编辑个人信息页面
  uni.showToast({ title: '编辑个人信息功能待实现', icon: 'none' });
};

const navigateTo = (url) => {
  if (!userInfo.value.id) {
    uni.navigateTo({ url: '/pages/login/login' });
    return;
  }
  uni.navigateTo({ url });
};

const handleLocation = () => {
  // 请求位置授权
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      uni.showToast({ title: '位置获取成功', icon: 'success' });
      console.log('位置信息:', res);
    },
    fail: (err) => {
      uni.showToast({ title: '位置获取失败', icon: 'none' });
      console.error('位置获取失败:', err);
    }
  });
};

const handleAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: `同城生活轻服务平台
版本：1.0.0
专注于提供同城技能服务、二手闲置、线下约玩等功能`,
    showCancel: false
  });
};

const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('userInfo');
        userInfo.value = {};
        uni.showToast({ title: '已退出登录', icon: 'success' });
      }
    }
  });
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.user-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 40rpx 20rpx;
  background-color: #007aff;
  color: #fff;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.info {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.phone {
  font-size: 24rpx;
  opacity: 0.8;
}

.arrow {
  font-size: 32rpx;
  opacity: 0.8;
}

.menu {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #999;
}

.logout {
  margin: 40rpx 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  text-align: center;
}

.logout-text {
  font-size: 28rpx;
  color: #ff3b30;
}
</style>
