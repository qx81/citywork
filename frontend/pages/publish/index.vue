<template>
  <view class="publish-page">
    <view class="hero-card">
      <text class="hero-title">发布本地生活服务</text>
      <text class="hero-subtitle">技能、闲置、约玩，一次发布快速触达同城用户</text>
    </view>

    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="form-card" v-if="activeTab === 'skill'">
      <input v-model="skill.title" class="input" placeholder="服务标题" />
      <textarea v-model="skill.description" class="textarea" placeholder="服务描述" />
      <input v-model="skill.price" type="digit" class="input" placeholder="价格" />
      <input v-model="skill.price_unit" class="input" placeholder="计价单位，如次/小时" />
      <input v-model="skill.area" class="input" placeholder="服务区域" />
      <input v-model="skill.available_time" class="input" placeholder="可服务时间" />
      <button class="submit-btn" @click="submitSkill">发布技能服务</button>
    </view>

    <view class="form-card" v-else-if="activeTab === 'second'">
      <input v-model="second.title" class="input" placeholder="商品标题" />
      <textarea v-model="second.description" class="textarea" placeholder="商品描述" />
      <input v-model="second.original_price" type="digit" class="input" placeholder="原价" />
      <input v-model="second.price" type="digit" class="input" placeholder="现价" />
      <input v-model="second.condition_level" class="input" placeholder="成色，如9成新" />
      <input v-model="second.pickup_address" class="input" placeholder="自提地址" />
      <input v-model="second.contact_phone" class="input" placeholder="联系电话" />
      <button class="submit-btn" @click="submitSecondHand">发布二手闲置</button>
    </view>

    <view class="form-card" v-else>
      <input v-model="play.title" class="input" placeholder="约玩标题" />
      <input v-model="play.play_type" class="input" placeholder="约玩类型，如羽毛球" />
      <input v-model="play.play_time" class="input" placeholder="时间，如 2026-01-01 19:00" />
      <input v-model="play.location" class="input" placeholder="地点" />
      <input v-model="play.budget" type="digit" class="input" placeholder="AA预算" />
      <input v-model="play.max_people" type="number" class="input" placeholder="最大人数" />
      <textarea v-model="play.description" class="textarea" placeholder="活动描述" />
      <button class="submit-btn" @click="submitPlay">发布约玩</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import request from '../../utils/request';

const tabs = [
  { label: '技能服务', value: 'skill' },
  { label: '二手闲置', value: 'second' },
  { label: '约玩活动', value: 'play' }
];
const activeTab = ref('skill');

const skill = ref({ title: '', description: '', price: '', price_unit: '次', area: '', available_time: '' });
const second = ref({ title: '', description: '', original_price: '', price: '', condition_level: '', pickup_address: '', contact_phone: '' });
const play = ref({ title: '', play_type: '', play_time: '', location: '', budget: '', max_people: '', description: '' });

const ensureLogin = () => {
  const token = uni.getStorageSync('token');
  if (token) return true;
  uni.showToast({ title: '请先登录', icon: 'none' });
  setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 300);
  return false;
};

const submitSkill = async () => {
  if (!ensureLogin()) return;
  if (!skill.value.title || !skill.value.price) return uni.showToast({ title: '请完善标题和价格', icon: 'none' });
  await request.post('/skill/create', { ...skill.value, category: '通用技能' });
  uni.showToast({ title: '发布成功', icon: 'success' });
};

const submitSecondHand = async () => {
  if (!ensureLogin()) return;
  if (!second.value.title || !second.value.price || !second.value.pickup_address) return uni.showToast({ title: '请完善必填项', icon: 'none' });
  await request.post('/secondHand/create', second.value);
  uni.showToast({ title: '发布成功', icon: 'success' });
};

const submitPlay = async () => {
  if (!ensureLogin()) return;
  if (!play.value.title || !play.value.play_type || !play.value.play_time) return uni.showToast({ title: '请完善标题/类型/时间', icon: 'none' });
  await request.post('/play/create', play.value);
  uni.showToast({ title: '发布成功', icon: 'success' });
};
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: #f2f4f7;
  padding: 24rpx;
  box-sizing: border-box;
}

.hero-card {
  background: linear-gradient(140deg, #fdfefe, #f7f9fc);
  border-radius: 32rpx;
  padding: 28rpx 26rpx;
  box-shadow: 0 10rpx 30rpx rgba(31, 42, 61, 0.06);
  margin-bottom: 20rpx;
}

.hero-title {
  display: block;
  font-size: 34rpx;
  color: #1f2a3d;
  font-weight: 700;
}

.hero-subtitle {
  display: block;
  margin-top: 10rpx;
  color: #7b8797;
  font-size: 24rpx;
  line-height: 1.55;
}

.tab-bar {
  display: flex;
  gap: 12rpx;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 10rpx;
  box-shadow: 0 10rpx 28rpx rgba(38, 67, 120, 0.08);
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  color: #68758a;
  border-radius: 18rpx;
  font-size: 25rpx;
  font-weight: 600;
}

.tab-item.active {
  color: #2f7eff;
  background: #eef4ff;
}

.form-card {
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 14rpx 34rpx rgba(26, 58, 120, 0.08);
  padding: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.input,
.textarea {
  background: #f7f9fc;
  border-radius: 22rpx;
  border: 1rpx solid #e8edf5;
  padding: 20rpx;
  font-size: 27rpx;
  color: #24334a;
}

.textarea {
  min-height: 170rpx;
}

.submit-btn {
  margin-top: 8rpx;
  background: linear-gradient(135deg, #4b8dff, #2f7eff);
  color: #fff;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 10rpx 24rpx rgba(47, 126, 255, 0.28);
}
</style>
