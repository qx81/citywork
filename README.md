# 同城生活轻服务平台

## 项目简介
同城生活轻服务平台是一个基于 uniapp + Vue3 + Node.js + MySQL 的前后端分离项目，专注于提供同城技能服务、二手闲置、线下约玩等功能。

## 技术栈
- 前端：uniapp + Vue3（setup语法糖/Composition API）
- 后端：Node.js + Express + MySQL
- 数据库：MySQL

## 核心功能
- 技能服务：用户发布摄影/家教等技能（标价），支持下单、接单、完成服务、评价
- 二手闲置：发布二手书/数码等（图文+价格），仅支持自提，无物流模块
- 线下约玩：发布打球/桌游等约玩信息（时间/地点/AA预算），支持报名、取消
- 本地商家推荐：用户发布饭店/奶茶店推荐（地址/评分），无入驻审核，直接展示

## 项目结构

### 后端结构
```
├── app.js              # 后端主文件
├── package.json        # 项目依赖
├── src/
│   ├── api/            # 接口模块
│   │   ├── user.js     # 用户接口
│   │   ├── skill.js    # 技能服务接口
│   │   ├── secondHand.js # 二手闲置接口
│   │   ├── playTogether.js # 约玩接口
│   │   └── order.js    # 订单接口
│   └── config/
│       └── db.js       # 数据库连接模块
└── city_life_platform.sql # 数据库SQL文件
```

### 前端结构
```
├── frontend/
│   ├── pages/
│   │   ├── login/      # 登录页面
│   │   ├── publish/    # 发布页面
│   │   ├── order/      # 订单相关页面
│   │   └── user/       # 个人中心页面
│   ├── common/         # 公共组件
│   └── utils/
│       └── request.js  # 网络请求封装
```

## 数据库配置

### 数据库连接信息
- 主机：localhost
- 端口：3306
- 用户名：root
- 密码：123456
- 数据库名：city_life_platform

### 数据库导入步骤
1. 打开MySQL客户端（如Navicat、MySQL Workbench等）
2. 创建数据库：`CREATE DATABASE city_life_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
3. 选择数据库：`USE city_life_platform;
4. 导入SQL文件：执行 `city_life_platform.sql` 文件中的所有SQL语句

## 后端启动步骤
1. 安装依赖：`npm install`
2. 启动服务器：`npm start` 或 `npm run dev`（开发模式）
3. 服务器运行在：`http://localhost:3000`

## 前端运行步骤
1. 打开HBuilderX
2. 导入前端项目（选择 `frontend` 目录）
3. 运行到微信小程序：点击工具栏的「运行」->「运行到小程序模拟器」->「微信开发者工具」
4. 微信开发者工具会自动打开并加载项目

## 接口文档

### 1. 用户接口

| 接口路径 | 方法 | 功能 | 请求参数 | 成功返回结构 |
|---------|------|------|---------|------------|
| `/api/user/register` | POST | 用户注册 | `username`, `phone`, `password` | `{code: 200, msg: '注册成功', data: {id, username, phone}}` |
| `/api/user/login` | POST | 用户登录 | `phone`, `password` | `{code: 200, msg: '登录成功', data: {id, username, phone, avatar, address}}` |
| `/api/user/info/:id` | GET | 获取用户信息 | `id` (路径参数) | `{code: 200, msg: '获取成功', data: {id, username, phone, avatar, address}}` |
| `/api/user/update/:id` | PUT | 更新用户信息 | `id` (路径参数), `username`, `avatar`, `address` | `{code: 200, msg: '更新成功', data: null}` |

### 2. 技能服务接口

| 接口路径 | 方法 | 功能 | 请求参数 | 成功返回结构 |
|---------|------|------|---------|------------|
| `/api/skill/create` | POST | 发布技能服务 | `user_id`, `title`, `description`, `price`, `category`, `images` | `{code: 200, msg: '发布成功', data: {id}}` |
| `/api/skill/list` | GET | 获取技能服务列表 | `category` (可选), `page`, `pageSize` | `{code: 200, msg: '获取成功', data: {list: [...], total}}` |
| `/api/skill/detail/:id` | GET | 获取技能服务详情 | `id` (路径参数) | `{code: 200, msg: '获取成功', data: {...}}` |
| `/api/skill/update/:id` | PUT | 更新技能服务 | `id` (路径参数), `title`, `description`, `price`, `category`, `images`, `status` | `{code: 200, msg: '更新成功', data: null}` |
| `/api/skill/delete/:id` | DELETE | 删除技能服务 | `id` (路径参数) | `{code: 200, msg: '删除成功', data: null}` |

### 3. 二手闲置接口

| 接口路径 | 方法 | 功能 | 请求参数 | 成功返回结构 |
|---------|------|------|---------|------------|
| `/api/secondHand/create` | POST | 发布二手闲置 | `user_id`, `title`, `description`, `price`, `category`, `images`, `pickup_address` | `{code: 200, msg: '发布成功', data: {id}}` |
| `/api/secondHand/list` | GET | 获取二手闲置列表 | `category` (可选), `page`, `pageSize` | `{code: 200, msg: '获取成功', data: {list: [...], total}}` |
| `/api/secondHand/detail/:id` | GET | 获取二手闲置详情 | `id` (路径参数) | `{code: 200, msg: '获取成功', data: {...}}` |
| `/api/secondHand/update/:id` | PUT | 更新二手闲置 | `id` (路径参数), `title`, `description`, `price`, `category`, `images`, `pickup_address`, `status` | `{code: 200, msg: '更新成功', data: null}` |
| `/api/secondHand/delete/:id` | DELETE | 删除二手闲置 | `id` (路径参数) | `{code: 200, msg: '删除成功', data: null}` |

### 4. 约玩接口

| 接口路径 | 方法 | 功能 | 请求参数 | 成功返回结构 |
|---------|------|------|---------|------------|
| `/api/playTogether/create` | POST | 发布约玩 | `user_id`, `title`, `description`, `time`, `location`, `budget`, `max_people` | `{code: 200, msg: '发布成功', data: {id}}` |
| `/api/playTogether/list` | GET | 获取约玩列表 | `page`, `pageSize` | `{code: 200, msg: '获取成功', data: {list: [...], total}}` |
| `/api/playTogether/detail/:id` | GET | 获取约玩详情 | `id` (路径参数) | `{code: 200, msg: '获取成功', data: {...}}` |
| `/api/playTogether/join/:id` | POST | 报名约玩 | `id` (路径参数) | `{code: 200, msg: '报名成功', data: null}` |
| `/api/playTogether/cancel/:id` | POST | 取消报名 | `id` (路径参数) | `{code: 200, msg: '取消报名成功', data: null}` |
| `/api/playTogether/update/:id` | PUT | 更新约玩 | `id` (路径参数), `title`, `description`, `time`, `location`, `budget`, `max_people`, `status` | `{code: 200, msg: '更新成功', data: null}` |
| `/api/playTogether/delete/:id` | DELETE | 删除约玩 | `id` (路径参数) | `{code: 200, msg: '删除成功', data: null}` |

### 5. 订单接口

| 接口路径 | 方法 | 功能 | 请求参数 | 成功返回结构 |
|---------|------|------|---------|------------|
| `/api/order/create` | POST | 创建订单 | `user_id`, `service_id`, `service_type`, `price`, `address`, `remark` | `{code: 200, msg: '订单创建成功', data: {order_id}}` |
| `/api/order/list/:user_id` | GET | 获取用户订单列表 | `user_id` (路径参数), `status` (可选), `page`, `pageSize` | `{code: 200, msg: '获取成功', data: {list: [...], total}}` |
| `/api/order/detail/:id` | GET | 获取订单详情 | `id` (路径参数) | `{code: 200, msg: '获取成功', data: {...}}` |
| `/api/order/pay/:id` | POST | 模拟支付 | `id` (路径参数) | `{code: 200, msg: '支付成功', data: null}` |
| `/api/order/process/:id` | POST | 更新订单状态为待完成 | `id` (路径参数) | `{code: 200, msg: '订单已开始处理', data: null}` |
| `/api/order/complete/:id` | POST | 更新订单状态为已完成 | `id` (路径参数) | `{code: 200, msg: '订单已完成', data: null}` |

## 核心知识点

### 1. Vue3 响应式
- 使用 `ref` 和 `reactive` 创建响应式数据
- 使用 `setup` 语法糖简化组件结构
- 使用 `onMounted` 等生命周期钩子函数

### 2. MySQL 增删改查
- 使用 `mysql2/promise` 实现异步数据库操作
- 编写 SQL 语句实现数据的增删改查
- 使用参数化查询防止 SQL 注入

### 3. 订单状态流转
- 订单状态：待支付（0）→ 已支付（1）→ 待完成（2）→ 已完成（3）
- 状态流转校验，确保订单只能按照规定的流程进行状态更新
- 模拟支付接口，修改订单状态为已支付

### 4. 微信小程序适配
- 使用 rpx 单位实现响应式布局
- 调用微信小程序 API 获取位置信息
- 适配微信小程序的生命周期和组件

## 注意事项
1. 本项目使用的是模拟支付，实际生产环境需要对接真实的支付接口
2. 二手商品仅支持自提，无物流模块
3. 商家推荐无需审核，直接展示
4. 数据库连接信息需要根据实际情况修改
5. 前端项目需要在 HBuilderX 中运行
