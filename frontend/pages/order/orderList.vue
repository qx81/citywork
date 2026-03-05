<template>
  <view class="order-list-container">
    <view class="header"><text class="title">订单中心</text></view>

    <view class="tab-bar">
      <view v-for="tab in tabs" :key="tab.value" :class="['tab-item', { active: activeTab === tab.value }]" @click="switchTab(tab.value)">{{ tab.label }}</view>
    </view>

    <view class="order-list">
      <view v-if="orders.length === 0" class="empty">暂无订单</view>
      <view v-else v-for="order in orders" :key="order.id" class="order-item">
        <view class="row"><text>订单号：{{ order.order_no }}</text><text :class="['status', statusClass(order.status)]">{{ statusText(order.status) }}</text></view>
        <view class="row"><text>{{ contentTypeText(order.content_type) }}</text><text class="price">¥{{ order.amount }}</text></view>
        <view class="muted">服务时间：{{ formatTime(order.service_time) }}</view>
        <view class="muted" v-if="order.remark">备注：{{ order.remark }}</view>
        <view class="actions">
          <button v-if="order.status === 0" @click="pay(order.id)" class="btn red">支付</button>
          <button v-if="[0,1,2].includes(order.status)" @click="cancel(order.id)" class="btn">取消</button>
          <button v-if="order.status === 2" @click="complete(order.id)" class="btn green">确认完成</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const activeTab = ref(-1);
const orders = ref([]);
const tabs = [
  { label: '全部', value: -1 },
  { label: '待支付', value: 0 },
  { label: '已支付', value: 1 },
  { label: '待完成', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
];

const fetchOrders = async () => {
  const status = activeTab.value === -1 ? undefined : activeTab.value;
  const result = await request.get('/order/list', status === undefined ? {} : { status });
  orders.value = result || [];
};

const ensureLogin = () => {
  const token = uni.getStorageSync('token');
  if (token) return true;
  uni.showToast({ title: '请先登录', icon: 'none' });
  setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 300);
  return false;
};

const switchTab = (value) => {
  activeTab.value = value;
  if (ensureLogin()) fetchOrders();
};

const pay = async (id) => { await request.post(`/order/pay/${id}`); await fetchOrders(); };
const cancel = async (id) => { await request.post(`/order/cancel/${id}`); await fetchOrders(); };
const complete = async (id) => { await request.post(`/order/complete/${id}`); await fetchOrders(); };

const statusText = (status) => ['待支付', '已支付', '待完成', '已完成', '已取消'][status] || '未知';
const statusClass = (status) => ['pending', 'paid', 'processing', 'completed', 'canceled'][status] || '';
const contentTypeText = (type) => ({ skill: '技能服务', second_hand: '二手闲置', play: '约玩活动' }[type] || type || '未知内容');
const formatTime = (value) => value ? new Date(value).toLocaleString() : '未指定';

onMounted(() => ensureLogin() && fetchOrders());
</script>

<style scoped>
.order-list-container{min-height:100vh;background:#f5f5f5;}.header{padding:20rpx;background:#fff;}.title{font-size:32rpx;font-weight:700;}
.tab-bar{display:flex;overflow-x:auto;background:#fff;margin-bottom:20rpx;}.tab-item{padding:20rpx 24rpx;color:#666;white-space:nowrap;border-bottom:2rpx solid transparent;}.tab-item.active{color:#007aff;border-bottom-color:#007aff;}
.order-list{padding:0 20rpx 20rpx;}.empty{text-align:center;color:#999;padding:120rpx 0;}
.order-item{background:#fff;border-radius:12rpx;padding:20rpx;margin-bottom:16rpx;}.row{display:flex;justify-content:space-between;margin-bottom:10rpx;font-size:26rpx;}.price{color:#ff3b30;font-weight:700;}.muted{font-size:24rpx;color:#888;margin-bottom:8rpx;}
.actions{display:flex;justify-content:flex-end;gap:10rpx;margin-top:10rpx;}.btn{font-size:24rpx;border:1rpx solid #ddd;background:#fff;padding:8rpx 20rpx;border-radius:8rpx;}.btn.red{background:#ff3b30;color:#fff;border-color:#ff3b30;}.btn.green{border-color:#34c759;color:#34c759;}
.status.pending{color:#ff9500;}.status.paid{color:#007aff;}.status.processing{color:#34c759;}.status.completed,.status.canceled{color:#999;}
</style>
