<template>
  <view class="publish-container">
    <view class="header">
      <text class="title">发布</text>
      <text @click="handleBack" class="back">返回</text>
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
    
    <!-- 技能服务 -->
    <view v-if="activeTab === 'skill'" class="form">
      <view class="form-item">
        <text class="label">标题</text>
        <input v-model="skillForm.title" placeholder="请输入技能标题" class="input" />
      </view>
      <view class="form-item">
        <text class="label">描述</text>
        <textarea v-model="skillForm.description" placeholder="请输入技能描述" class="textarea" />
      </view>
      <view class="form-item">
        <text class="label">价格</text>
        <input type="number" v-model="skillForm.price" placeholder="请输入价格" class="input" />
      </view>
      <view class="form-item">
        <text class="label">分类</text>
        <picker :range="skillCategories" v-model="skillForm.categoryIndex" class="picker">
          <view class="picker-text">{{ skillCategories[skillForm.categoryIndex] }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">图片</text>
        <view class="uploader">
          <view class="upload-btn" @click="chooseImage('skill')">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片</text>
          </view>
          <view v-for="(img, index) in skillForm.images" :key="index" class="image-item">
            <image :src="img" class="image" />
            <text class="delete-icon" @click="deleteImage('skill', index)">×</text>
          </view>
        </view>
      </view>
      <button @click="publishSkill" class="submit-btn">发布</button>
    </view>
    
    <!-- 二手闲置 -->
    <view v-if="activeTab === 'secondHand'" class="form">
      <view class="form-item">
        <text class="label">标题</text>
        <input v-model="secondHandForm.title" placeholder="请输入物品标题" class="input" />
      </view>
      <view class="form-item">
        <text class="label">描述</text>
        <textarea v-model="secondHandForm.description" placeholder="请输入物品描述" class="textarea" />
      </view>
      <view class="form-item">
        <text class="label">价格</text>
        <input type="number" v-model="secondHandForm.price" placeholder="请输入价格" class="input" />
      </view>
      <view class="form-item">
        <text class="label">分类</text>
        <picker :range="secondHandCategories" v-model="secondHandForm.categoryIndex" class="picker">
          <view class="picker-text">{{ secondHandCategories[secondHandForm.categoryIndex] }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">图片</text>
        <view class="uploader">
          <view class="upload-btn" @click="chooseImage('secondHand')">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片</text>
          </view>
          <view v-for="(img, index) in secondHandForm.images" :key="index" class="image-item">
            <image :src="img" class="image" />
            <text class="delete-icon" @click="deleteImage('secondHand', index)">×</text>
          </view>
        </view>
      </view>
      <view class="form-item">
        <text class="label">自提地址</text>
        <input v-model="secondHandForm.pickup_address" placeholder="请输入自提地址" class="input" />
      </view>
      <button @click="publishSecondHand" class="submit-btn">发布</button>
    </view>
    
    <!-- 约玩 -->
    <view v-if="activeTab === 'playTogether'" class="form">
      <view class="form-item">
        <text class="label">标题</text>
        <input v-model="playForm.title" placeholder="请输入约玩标题" class="input" />
      </view>
      <view class="form-item">
        <text class="label">描述</text>
        <textarea v-model="playForm.description" placeholder="请输入约玩描述" class="textarea" />
      </view>
      <view class="form-item">
        <text class="label">时间</text>
        <picker mode="datetime" v-model="playForm.time" class="picker">
          <view class="picker-text">{{ formatDate(playForm.time) }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">地点</text>
        <input v-model="playForm.location" placeholder="请输入约玩地点" class="input" />
      </view>
      <view class="form-item">
        <text class="label">AA预算</text>
        <input type="number" v-model="playForm.budget" placeholder="请输入AA预算" class="input" />
      </view>
      <view class="form-item">
        <text class="label">最大人数</text>
        <input type="number" v-model="playForm.max_people" placeholder="请输入最大人数" class="input" />
      </view>
      <button @click="publishPlayTogether" class="submit-btn">发布</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const activeTab = ref('skill');
const tabs = [
  { label: '技能服务', value: 'skill' },
  { label: '二手闲置', value: 'secondHand' },
  { label: '约玩', value: 'playTogether' }
];

// 技能服务表单
const skillForm = ref({
  title: '',
  description: '',
  price: '',
  categoryIndex: 0,
  images: []
});

const skillCategories = ['摄影', '家教', '设计', '维修', '其他'];

// 二手闲置表单
const secondHandForm = ref({
  title: '',
  description: '',
  price: '',
  categoryIndex: 0,
  images: [],
  pickup_address: ''
});

const secondHandCategories = ['数码', '图书', '服装', '家具', '其他'];

// 约玩表单
const playForm = ref({
  title: '',
  description: '',
  time: new Date().getTime(),
  location: '',
  budget: '',
  max_people: ''
});

const handleBack = () => {
  uni.navigateBack();
};

const chooseImage = (type) => {
  uni.chooseImage({
    count: 9,
    success: (res) => {
      if (type === 'skill') {
        skillForm.value.images = [...skillForm.value.images, ...res.tempFilePaths];
      } else if (type === 'secondHand') {
        secondHandForm.value.images = [...secondHandForm.value.images, ...res.tempFilePaths];
      }
    }
  });
};

const deleteImage = (type, index) => {
  if (type === 'skill') {
    skillForm.value.images.splice(index, 1);
  } else if (type === 'secondHand') {
    secondHandForm.value.images.splice(index, 1);
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const publishSkill = async () => {
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  
  try {
    await request.post('/skill/create', {
      user_id: userInfo.id,
      title: skillForm.value.title,
      description: skillForm.value.description,
      price: skillForm.value.price,
      category: skillCategories[skillForm.value.categoryIndex],
      images: skillForm.value.images.join(',')
    });
    uni.showToast({ title: '发布成功', icon: 'success' });
    uni.navigateBack();
  } catch (error) {
    console.error('发布失败:', error);
  }
};

const publishSecondHand = async () => {
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  
  try {
    await request.post('/secondHand/create', {
      user_id: userInfo.id,
      title: secondHandForm.value.title,
      description: secondHandForm.value.description,
      price: secondHandForm.value.price,
      category: secondHandCategories[secondHandForm.value.categoryIndex],
      images: secondHandForm.value.images.join(','),
      pickup_address: secondHandForm.value.pickup_address
    });
    uni.showToast({ title: '发布成功', icon: 'success' });
    uni.navigateBack();
  } catch (error) {
    console.error('发布失败:', error);
  }
};

const publishPlayTogether = async () => {
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  
  try {
    await request.post('/playTogether/create', {
      user_id: userInfo.id,
      title: playForm.value.title,
      description: playForm.value.description,
      time: new Date(playForm.value.time).toISOString(),
      location: playForm.value.location,
      budget: playForm.value.budget,
      max_people: playForm.value.max_people
    });
    uni.showToast({ title: '发布成功', icon: 'success' });
    uni.navigateBack();
  } catch (error) {
    console.error('发布失败:', error);
  }
};
</script>

<style scoped>
.publish-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.back {
  font-size: 28rpx;
  color: #007aff;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
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

.form {
  padding: 20rpx;
  background-color: #fff;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #333;
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

.textarea {
  width: 100%;
  height: 160rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  resize: none;
}

.picker {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.picker-text {
  font-size: 28rpx;
  color: #666;
}

.uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-btn {
  width: 120rpx;
  height: 120rpx;
  border: 1rpx dashed #ddd;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-icon {
  font-size: 48rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 20rpx;
  color: #999;
}

.image-item {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
}

.delete-icon {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  width: 30rpx;
  height: 30rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
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
  margin-top: 40rpx;
}
</style>