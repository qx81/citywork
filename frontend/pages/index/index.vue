<template>
  <view class="page">
    <view class="top-wrap">
      <view class="safe-top" />
      <view class="top-bar">
        <view class="location" @click="pickCity">{{ cityText }}</view>
        <view class="notify" @click="goMessage">🔔</view>
      </view>
      <view class="search-box" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索技能/二手/约玩/商家</text>
      </view>
    </view>

    <swiper class="banner" autoplay circular indicator-dots indicator-color="rgba(255,255,255,0.6)" indicator-active-color="#fff">
      <swiper-item v-for="item in banners" :key="item.id">
        <view class="banner-item" :style="{ background: item.bg }">
          <text class="banner-title">{{ item.title }}</text>
          <text class="banner-sub">{{ item.subtitle }}</text>
          <text class="banner-btn">{{ item.button }}</text>
        </view>
      </swiper-item>
    </swiper>

    <view class="section card-grid">
      <view class="grid-item" v-for="entry in quickEntries" :key="entry.key" :class="entry.key" @click="goFeature(entry)">
        <text class="grid-icon">{{ entry.icon }}</text>
        <text class="grid-title">{{ entry.title }}</text>
        <text class="grid-desc">{{ entry.desc }}</text>
      </view>
    </view>

    <scroll-view class="category-scroll" scroll-x>
      <view class="category-row">
        <view
          v-for="category in categories"
          :key="category"
          class="category-pill"
          :class="{ active: category === activeCategory }"
          @click="activeCategory = category"
        >
          {{ category }}
        </view>
      </view>
    </scroll-view>

    <view class="section">
      <view class="section-title">为你推荐</view>
      <view v-for="item in filteredFeed" :key="item.id" class="feed-card" @click="goDetail(item)">
        <image class="feed-cover" :src="resolveCover(item)" mode="aspectFill" />
        <view class="feed-main">
          <view class="feed-head">
            <text class="feed-tag">{{ typeLabel[item.type] || item.type }}</text>
            <text class="feed-meta">{{ item.meta }}</text>
          </view>
          <text class="feed-title">{{ item.title }}</text>
          <text class="feed-sub">{{ item.tag }}</text>
          <view class="feed-foot">
            <text class="feed-price">{{ item.priceText }}</text>
            <text class="feed-location">{{ item.distanceText }} · {{ item.location }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section near-section">
      <view class="section-row">
        <text class="section-title">附近优质服务</text>
        <text class="more" @click="goNearby">查看更多</text>
      </view>
      <view class="near-list">
        <view class="near-card" v-for="item in nearbyServices" :key="item.id" @click="goNearby">
          <text class="near-title">{{ item.title }}</text>
          <text class="near-desc">{{ item.desc }}</text>
          <text class="near-distance">{{ item.distanceText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { api } from '../../common/api';

const cityText = ref('未填写地区');
const activeCategory = ref('推荐');
const feedList = ref([]);
const nearbyServices = ref([]);

const typeLabel = {
  skill: '技能服务',
  second: '二手闲置',
  play: '线下约玩',
  shop: '商家推荐'
};

const coverMap = {
  skill: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  second: 'https://images.unsplash.com/photo-1526178613658-3f1622045557?auto=format&fit=crop&w=600&q=80',
  play: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80',
  shop: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
};

const banners = [
  { id: 1, title: '新人专享福利', subtitle: '同城服务首单立减 20 元', button: '立即领取', bg: 'linear-gradient(135deg,#4c8dff,#76b6ff)' },
  { id: 2, title: '本周热门活动', subtitle: '线下桌游/运动局等你参与', button: '查看活动', bg: 'linear-gradient(135deg,#59b6ff,#4fd6c8)' },
  { id: 3, title: '商家入驻计划', subtitle: '本地优质门店获取更多曝光', button: '我要入驻', bg: 'linear-gradient(135deg,#7c92ff,#8f7dff)' }
];

const quickEntries = [
  { key: 'skill', title: '技能服务', desc: '上门维修、家政、摄影', icon: '🧰', url: '/pages/skill/index' },
  { key: 'second', title: '二手闲置', desc: '数码、家具、日用品', icon: '♻️', url: '/pages/secondHand/index' },
  { key: 'play', title: '线下约玩', desc: '运动、桌游、聚会', icon: '🎯', url: '/pages/play/index' },
  { key: 'shop', title: '商家推荐', desc: '美食、洗护、维修', icon: '🏪', url: '/pages/business/index' }
];

const categories = ['推荐', '附近', '热门', '家政', '摄影', '数码', '宠物', '美食', '维修'];

const filteredFeed = computed(() => {
  if (activeCategory.value === '推荐') return feedList.value;
  if (activeCategory.value === '附近') {
    return feedList.value.filter((item) => item.distanceText.includes('km') || item.distanceText.includes('同城'));
  }
  if (activeCategory.value === '热门') {
    return feedList.value.slice(0, 6);
  }
  return feedList.value.filter((item) => item.tag.includes(activeCategory.value) || item.title.includes(activeCategory.value));
});

const resolveCover = (item) => item.image || coverMap[item.type] || coverMap.skill;

const goSearch = () => uni.navigateTo({ url: '/pages/search/index' });
const goMessage = () => uni.navigateTo({ url: '/pages/message/index' });
const goNearby = () => uni.switchTab({ url: '/pages/nearby/index' });
const pickCity = () => uni.showToast({ title: '定位功能开发中', icon: 'none' });
const goFeature = (entry) => uni.navigateTo({ url: entry.url });

const goDetail = (item) => {
  const map = {
    skill: '/pages/skill/index',
    second: '/pages/secondHand/index',
    play: '/pages/play/index',
    shop: '/pages/business/index'
  };
  uni.navigateTo({ url: map[item.type] || '/pages/search/index' });
};

const getUserRegion = async () => {
  const cached = uni.getStorageSync('userInfo') || {};
  let city = String(cached.city || '').trim();
  const address = String(cached.address || '').trim();

  if (!city && uni.getStorageSync('token')) {
    try {
      const profile = await api.profile();
      city = String(profile.city || '').trim();
      if (profile && Object.keys(profile).length) {
        uni.setStorageSync('userInfo', { ...cached, ...profile });
      }
    } catch (e) {
      // 未登录或资料获取失败时使用缓存兜底
    }
  }

  if (!city) return '未填写地区';
  if (address && address.includes(city)) return address;
  return city;
};

onMounted(async () => {
  const region = await getUserRegion();
  cityText.value = region;

  try {
    const data = await api.homeFeed({ city: region === '未填写地区' ? '' : region, district: '' });
    feedList.value = data.feed || [];
    nearbyServices.value = data.nearbyServices || [];
  } catch (e) {
    feedList.value = [];
    nearbyServices.value = [];
  }
});
</script>

<style scoped>
.page { background: #f3f6fb; min-height: 100vh; padding-bottom: 32rpx; }
.top-wrap { background: linear-gradient(180deg, #2f7eff 0%, #4b97ff 100%); border-bottom-left-radius: 30rpx; border-bottom-right-radius: 30rpx; padding: 0 24rpx 24rpx; box-shadow: 0 10rpx 30rpx rgba(47,126,255,.2); }
.safe-top { height: var(--status-bar-height); }
.top-bar { display: flex; justify-content: space-between; align-items: center; color: #fff; margin-bottom: 20rpx; }
.location { font-size: 30rpx; font-weight: 600; }
.notify { font-size: 34rpx; }
.search-box { background: #fff; border-radius: 999rpx; padding: 18rpx 24rpx; display: flex; align-items: center; }
.search-icon { margin-right: 12rpx; }
.search-placeholder { color: #9ba4b2; font-size: 26rpx; }
.banner { height: 220rpx; margin: 20rpx 24rpx; }
.banner-item { border-radius: 20rpx; height: 100%; padding: 28rpx; color: #fff; display: flex; flex-direction: column; justify-content: center; }
.banner-title { font-size: 34rpx; font-weight: 700; }
.banner-sub { font-size: 24rpx; opacity: .95; margin-top: 8rpx; }
.banner-btn { margin-top: 20rpx; display: inline-block; background: rgba(255,255,255,.24); padding: 10rpx 20rpx; border-radius: 999rpx; font-size: 22rpx; width: fit-content; }
.section { margin: 0 24rpx 20rpx; }
.card-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16rpx; }
.grid-item { background: #fff; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,.05); }
.grid-icon { font-size: 42rpx; }
.grid-title { display: block; font-size: 30rpx; font-weight: 600; margin-top: 6rpx; color: #1f2a3d; }
.grid-desc { color: #6f7c8f; font-size: 22rpx; margin-top: 8rpx; display: block; }
.category-scroll { white-space: nowrap; margin: 12rpx 24rpx 20rpx; }
.category-row { display: inline-flex; gap: 14rpx; }
.category-pill { padding: 12rpx 24rpx; background: #fff; color: #5e6b80; border-radius: 999rpx; font-size: 24rpx; }
.category-pill.active { background: #2f7eff; color: #fff; }
.section-title { font-size: 32rpx; font-weight: 700; color: #1f2a3d; margin-bottom: 14rpx; display: block; }
.feed-card { background: #fff; border-radius: 20rpx; overflow: hidden; margin-bottom: 16rpx; box-shadow: 0 8rpx 24rpx rgba(24,42,79,.07); }
.feed-cover { width: 100%; height: 220rpx; background: #e8edf7; }
.feed-main { padding: 20rpx; }
.feed-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.feed-tag { background: #edf3ff; color: #2f7eff; border-radius: 999rpx; font-size: 20rpx; padding: 6rpx 16rpx; }
.feed-meta { color: #99a3b4; font-size: 20rpx; }
.feed-title { font-size: 30rpx; font-weight: 600; color: #1f2a3d; display: block; }
.feed-sub { font-size: 24rpx; color: #5f6d83; margin-top: 6rpx; display: block; }
.feed-foot { margin-top: 14rpx; display: flex; justify-content: space-between; align-items: center; }
.feed-price { color: #ff6a4d; font-weight: 700; font-size: 30rpx; }
.feed-location { color: #7d8798; font-size: 22rpx; margin-left: 16rpx; flex: 1; text-align: right; }
.section-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.more { font-size: 24rpx; color: #2f7eff; }
.near-list { display: grid; grid-template-columns: repeat(2,1fr); gap: 14rpx; }
.near-card { background: #fff; border-radius: 16rpx; padding: 18rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,.04); }
.near-title { color: #1f2a3d; font-size: 26rpx; font-weight: 600; display: block; }
.near-desc { color: #778398; font-size: 22rpx; margin: 6rpx 0 10rpx; display: block; }
.near-distance { color: #2f7eff; font-size: 22rpx; }
</style>
