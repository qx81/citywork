<template>
  <view class="publish-container">
    <view class="tab-bar">
      <view v-for="tab in tabs" :key="tab.value" :class="['tab-item', { active: activeTab === tab.value }]" @click="activeTab = tab.value">{{ tab.label }}</view>
    </view>

    <view class="form" v-if="activeTab === 'skill'">
      <input v-model="skill.title" class="input" placeholder="服务标题" />
      <textarea v-model="skill.description" class="textarea" placeholder="服务描述" />
      <input v-model="skill.price" type="digit" class="input" placeholder="价格" />
      <input v-model="skill.price_unit" class="input" placeholder="计价单位，如次/小时" />
      <input v-model="skill.area" class="input" placeholder="服务区域" />
      <input v-model="skill.available_time" class="input" placeholder="可服务时间" />
      <button class="submit-btn" @click="submitSkill">发布技能服务</button>
    </view>

    <view class="form" v-else-if="activeTab === 'second'">
      <input v-model="second.title" class="input" placeholder="商品标题" />
      <textarea v-model="second.description" class="textarea" placeholder="商品描述" />
      <input v-model="second.original_price" type="digit" class="input" placeholder="原价" />
      <input v-model="second.price" type="digit" class="input" placeholder="现价" />
      <input v-model="second.condition_level" class="input" placeholder="成色，如9成新" />
      <input v-model="second.pickup_address" class="input" placeholder="自提地址" />
      <input v-model="second.contact_phone" class="input" placeholder="联系电话" />
      <button class="submit-btn" @click="submitSecondHand">发布二手闲置</button>
    </view>

    <view class="form" v-else>
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
.publish-container{min-height:100vh;background:#f5f5f5;}.tab-bar{display:flex;background:#fff;margin-bottom:20rpx;}.tab-item{flex:1;text-align:center;padding:20rpx 0;color:#666;border-bottom:2rpx solid transparent;}.tab-item.active{color:#007aff;border-bottom-color:#007aff;}
.form{padding:20rpx;display:flex;flex-direction:column;gap:16rpx;}.input,.textarea{background:#fff;border-radius:10rpx;border:1rpx solid #eee;padding:18rpx;font-size:28rpx;}.textarea{min-height:160rpx;}
.submit-btn{margin-top:16rpx;background:#007aff;color:#fff;border-radius:10rpx;font-size:30rpx;}
</style>
