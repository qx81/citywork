<template>
  <view class="order-list-container">
    <view class="header">
      <text class="title">我的订单</text>
    </view>
    
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @click="activeTab = tab.value; getOrders()"
      >
        {{ tab.label }}
      </view>
    </view>
    
    <view class="order-list">
      <view v-if="orders.length === 0" class="empty">
        <text>暂无订单</text>
      </view>
      <view v-else v-for="order in orders" :key="order.id" class="order-item">
        <view class="order-header">
          <text class="order-id">订单号: {{ order.id }}</text>
          <text :class="['order-status', getStatusClass(order.status)]">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="order-content">
          <text class="service-type">{{ order.service_type === 1 ? '技能服务' : '二手闲置' }}</text>
          <text class="price">¥{{ order.price }}</text>
        </view>
        <view class="order-footer">
          <text class="create-time">{{ formatDate(order.created_at) }}</text>
          <view class="order-actions">
            <button v-if="order.status === 0" @click="handlePay(order.id)" class="action-btn pay-btn">去支付</button>
            <button v-if="order.status === 1" @click="handleProcess(order.id)" class="action-btn process-btn">开始处理</button>
            <button v-if="order.status === 2" @click="handleComplete(order.id)" class="action-btn complete-btn">确认完成</button>
            <button @click="handleDetail(order.id)" class="action-btn detail-btn">查看详情</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const activeTab = ref('-1'); // -1: 全部, 0: 待支付, 1: 已支付, 2: 待完成, 3: 已完成
const orders = ref([]);

const tabs = [
  { label: '全部', value: '-1' },
  { label: '待支付', value: '0' },
  { label: '已支付', value: '1' },
  { label: '待完成', value: '2' },
  { label: '已完成', value: '3' }
];

const getOrders = async () => {
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  
  try {
    const status = activeTab.value === '-1' ? undefined : activeTab.value;
    const result = await request.get(`/order/list/${userInfo.id}`, { status });
    orders.value = result.list;
  } catch (error) {
    console.error('获取订单列表失败:', error);
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 0: return '待支付';
    case 1: return '已支付';
    case 2: return '待完成';
    case 3: return '已完成';
    default: return '未知状态';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-pending';
    case 1: return 'status-paid';
    case 2: return 'status-processing';
    case 3: return 'status-completed';
    default: return '';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const handlePay = async (orderId) => {
  try {
    await request.post(`/order/pay/${orderId}`);
    uni.showToast({ title: '支付成功', icon: 'success' });
    getOrders();
  } catch (error) {
    console.error('支付失败:', error);
  }
};

const handleProcess = async (orderId) => {
  try {
    await request.post(`/order/process/${orderId}`);
    uni.showToast({ title: '订单已开始处理', icon: 'success' });
    getOrders();
  } catch (error) {
    console.error('更新订单状态失败:', error);
  }
};

const handleComplete = async (orderId) => {
  try {
    await request.post(`/order/complete/${orderId}`);
    uni.showToast({ title: '订单已完成', icon: 'success' });
    getOrders();
  } catch (error) {
    console.error('更新订单状态失败:', error);
  }
};

const handleDetail = (orderId) => {
  uni.navigateTo({ url: `/pages/order/orderDetail?id=${orderId}` });
};

onMounted(() => {
  getOrders();
});
</script>

<style scoped>
.order-list-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  margin-bottom: 20rpx;
  overflow-x: auto;
}

.tab-item {
  flex: 1;
  min-width: 120rpx;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-bottom: 2rpx solid transparent;
}

.tab-item.active {
  color: #007aff;
  border-bottom-color: #007aff;
}

.order-list {
  padding: 0 20rpx;
}

.empty {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.order-id {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  font-weight: bold;
}

.status-pending {
  color: #ff9500;
}

.status-paid {
  color: #007aff;
}

.status-processing {
  color: #34c759;
}

.status-completed {
  color: #999;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.service-type {
  font-size: 28rpx;
  color: #333;
}

.price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff3b30;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-time {
  font-size: 24rpx;
  color: #999;
}

.order-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  border-radius: 5rpx;
  border: 1rpx solid #ddd;
  background-color: #fff;
}

.pay-btn {
  color: #fff;
  background-color: #ff3b30;
  border-color: #ff3b30;
}

.process-btn {
  color: #007aff;
  border-color: #007aff;
}

.complete-btn {
  color: #34c759;
  border-color: #34c759;
}

.detail-btn {
  color: #666;
}
</style>