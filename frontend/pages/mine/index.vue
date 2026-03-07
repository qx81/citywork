<template>
  <view class="page">
    <view class="profile-card" @click="openProfile">
      <view class="avatar-wrap">
        <view v-if="avatarLoading" class="avatar-skeleton" />
        <image
          v-show="!avatarLoading"
          class="avatar"
          :src="displayUser.avatar || '/static/avatar.png'"
          mode="aspectFill"
          @load="avatarLoading = false"
          @error="avatarLoading = false"
        />
      </view>
      <view class="profile-text">
        <text class="name">{{ displayUser.username || '未登录用户' }}</text>
        <text class="city">{{ displayUser.city || '未设置城市' }}</text>
      </view>
    </view>

    <view class="stats-row">
      <view class="stat-item" v-for="item in statsList" :key="item.key">
        <text class="stat-num">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="entry-grid" v-if="showEntries">
      <view class="entry-item" v-for="entry in entries" :key="entry.name" @click="goEntry(entry)">
        <text class="entry-icon">{{ entry.icon }}</text>
        <text class="entry-name">{{ entry.name }}</text>
      </view>
    </view>

    <view class="entry-skeleton" v-else>
      <view class="entry-skeleton-item" v-for="i in 6" :key="i" />
    </view>

    <button class="logout-btn" hover-class="logout-btn-hover" @click="handleLogout">退出登录</button>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import * as apiModule from '../../common/api';

const apiService = apiModule?.api || apiModule?.default || apiModule;

const emptyStats = { orderCount: 0, collectionCount: 0, skillCount: 0 };
const getCachedUser = () => uni.getStorageSync('userInfo') || {};
const getDefaultCenterData = () => ({ user: { username: '', city: '', avatar: '', ...getCachedUser() }, stats: { ...emptyStats } });

const centerData = ref(getDefaultCenterData());
const avatarLoading = ref(true);
const showEntries = ref(false);

const displayUser = computed(() => centerData.value.user || {});

const statsList = computed(() => [
  { key: 'orderCount', label: '我的订单', value: centerData.value.stats?.orderCount || 0 },
  { key: 'collectionCount', label: '我的收藏', value: centerData.value.stats?.collectionCount || 0 },
  { key: 'skillCount', label: '我的技能', value: centerData.value.stats?.skillCount || 0 }
]);

const entries = [
  { name: '我的订单', icon: '◫', url: '/pages/order/orderList' },
  { name: '我的收藏', icon: '♡', url: '/pages/collection/index' },
  { name: '发布技能', icon: '✎', url: '/pages/publish/publish' },
  { name: '二手交易', icon: '⇄', url: '/pages/secondHand/index' },
  { name: '我的钱包', icon: '◍', url: '' },
  { name: '设置', icon: '☰', url: '/pages/profile/index' }
];

const loadCenter = async () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    centerData.value = getDefaultCenterData();
    avatarLoading.value = false;
    return;
  }

  avatarLoading.value = true;
  const centerFn = typeof apiService?.center === 'function' ? apiService.center : null;
  if (!centerFn) {
    uni.showToast({ title: '个人中心接口不可用', icon: 'none' });
    avatarLoading.value = false;
    return;
  }

  try {
    const data = await centerFn();
    centerData.value = {
      user: { ...getDefaultCenterData().user, ...(data?.user || {}) },
      stats: { ...emptyStats, ...(data?.stats || {}) }
    };
    uni.setStorageSync('userInfo', centerData.value.user || {});
  } catch (e) {
    centerData.value = getDefaultCenterData();
  }
};

const ensureLogin = () => {
  const token = uni.getStorageSync('token');
  if (token) return true;
  uni.navigateTo({ url: '/pages/login/index' });
  return false;
};

const openProfile = () => {
  if (!ensureLogin()) return;
  uni.navigateTo({ url: '/pages/profile/index' });
};

const goEntry = (entry) => {
  if (!ensureLogin()) return;
  if (!entry.url) {
    uni.showToast({ title: '功能开发中', icon: 'none' });
    return;
  }
  uni.navigateTo({ url: entry.url });
};

const handleLogout = () => {
  if (!ensureLogin()) return;
  uni.showModal({
    title: '退出登录',
    content: '确认退出当前账号吗？',
    success: async ({ confirm }) => {
      if (!confirm) return;
      try {
        await apiService.logout();
      } catch (e) {
        // 接口异常时仍允许前端退出
      }
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.reLaunch({ url: '/pages/login/index' });
    }
  });
};

onMounted(() => {
  setTimeout(() => {
    showEntries.value = true;
  }, 220);
});

onShow(() => {
  loadCenter();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 1rem 0.9rem 1.2rem;
  background: #ffffff;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 0.9rem;
  background: #f5f7fa;
  border-radius: 0.9rem;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.profile-card:active {
  transform: scale(0.98);
  background-color: #e8eef6;
}

.avatar-wrap,
.avatar,
.avatar-skeleton {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.avatar {
  display: block;
}

.avatar-skeleton {
  background: linear-gradient(90deg, #eef1f6 25%, #f8f9fc 37%, #eef1f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
}

.profile-text {
  margin-left: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333333;
}

.city {
  font-size: 0.82rem;
  color: #999999;
}

.stats-row {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.stat-item {
  background: #f5f7fa;
  border-radius: 0.7rem;
  text-align: center;
  padding: 0.72rem 0;
}

.stat-num {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a6fa5;
}

.stat-label {
  margin-top: 0.2rem;
  display: block;
  font-size: 0.78rem;
  color: #999999;
}

.entry-grid,
.entry-skeleton {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.entry-item,
.entry-skeleton-item {
  border-radius: 0.75rem;
  background: #f5f7fa;
  min-height: 4rem;
}

.entry-item {
  padding: 0.7rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: none;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.entry-item:active {
  transform: scale(0.98);
  background: #e3ebf7;
}

.entry-icon {
  font-size: 1.1rem;
  color: #4a6fa5;
  line-height: 1;
}

.entry-name {
  margin-top: 0.45rem;
  font-size: 0.88rem;
  color: #333333;
}

.entry-skeleton-item {
  background: linear-gradient(90deg, #eef1f6 25%, #f8f9fc 37%, #eef1f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
}

.logout-btn {
  margin-top: 1.25rem;
  width: 100%;
  height: 2.8rem;
  line-height: 2.8rem;
  border: none;
  border-radius: 0.75rem;
  background: #f5f7fa;
  color: #999999;
  font-size: 0.95rem;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.logout-btn::after {
  border: none;
}

.logout-btn:active,
.logout-btn-hover {
  background: #ea4f4f;
  color: #ffffff;
  transform: scale(0.99);
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
