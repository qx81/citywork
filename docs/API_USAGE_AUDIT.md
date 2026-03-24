# 接口梳理（按模块）

> 统计口径：基于当前仓库代码静态扫描（`app.js`、`src/routes/*.js`、`frontend/pages/**/*.vue`、`frontend/common/api/index.js`、`frontend/utils/request.js`）。

## 一、后端当前已实现接口（按模块）

- 服务端口：`3000`（`PORT = process.env.PORT || 3000`）
- 统一前缀：`/api`

### 0) 基础能力
- `GET /api/test`
- `POST /api/upload/avatar`
- `GET /uploads/*`（静态文件）

### 1) 用户模块（`/api/user`）
- `POST /register`
- `POST /login`
- `GET /profile`
- `GET /center`
- `POST /logout`
- `PUT /profile`
- `PUT /password`

### 2) 技能模块（`/api/skill`）
- `POST /create`
- `GET /list`
- `GET /detail/:id`

### 3) 二手模块（`/api/secondHand`）
- `POST /create`
- `GET /list`

### 4) 约玩模块（`/api/play`）
- `POST /create`
- `POST /join/:id`
- `GET /list`

### 5) 商家模块（`/api/business`）
- `POST /create`
- `POST /like/:id`
- `GET /list`

### 6) 订单模块（`/api/order`）
- `POST /create`
- `POST /pay/:id`
- `POST /cancel/:id`
- `POST /complete/:id`
- `GET /list`

### 7) 收藏模块（`/api/collection`）
- `POST /add`
- `DELETE /remove`
- `GET /list`

### 8) 通用模块（`/api/common`）
- `GET /search`
- `GET /home`
- `GET /nearby`
- `GET /message`

---

## 二、前端“页面 -> 接口”调用清单（按页面模块）

## A. 首页与发现

### `pages/index/index.vue`
- `GET /api/common/home`
- `GET /api/user/profile`（已登录时用于补齐城市）

### `pages/search/index.vue`
- 暂无接口调用（仅静态占位页）

### `pages/nearby/index.vue`
- 暂无接口调用（仅静态占位页）

### `pages/message/index.vue`
- 暂无接口调用（仅静态占位页）

## B. 内容浏览

### `pages/skill/index.vue`
- `GET /api/skill/list`

### `pages/skill/detail.vue`
- `GET /api/skill/detail/:id`

### `pages/secondHand/index.vue`
- `GET /api/secondHand/list`

### `pages/play/index.vue`
- `GET /api/play/list`

### `pages/business/index.vue`
- `GET /api/business/list`

## C. 账号与个人中心

### `pages/login/index.vue`
- `POST /api/user/register`
- `POST /api/user/login`

### `pages/login/login.vue`
- `POST /api/user/register`
- `POST /api/user/login`

### `pages/mine/index.vue`
- `GET /api/user/center`
- `POST /api/user/logout`

### `pages/profile/index.vue`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `POST /api/upload/avatar`

### `pages/user/user.vue`
- 暂无接口调用（导航页）

## D. 发布与交易

### `pages/publish/index.vue`
- `POST /api/skill/create`
- `POST /api/secondHand/create`
- `POST /api/play/create`

### `pages/publish/publish.vue`
- `POST /api/skill/create`
- `POST /api/secondHand/create`
- `POST /api/play/create`

## E. 订单

### `pages/order/index.vue`
- `GET /api/order/list`
- `POST /api/order/pay/:id`
- `POST /api/order/cancel/:id`
- `POST /api/order/complete/:id`

### `pages/order/orderList.vue`
- `GET /api/order/list`
- `POST /api/order/pay/:id`
- `POST /api/order/cancel/:id`
- `POST /api/order/complete/:id`

### `pages/order/orderDetail.vue`
- `GET /api/order/detail/:id`（后端未实现）
- `POST /api/order/pay/:id`
- `POST /api/order/process/:id`（后端未实现）
- `POST /api/order/complete/:id`

## F. 收藏

### `pages/collection/index.vue`
- 暂无接口调用（仅静态占位页）

---

## 三、后端已实现但前端未调用接口（按模块）

### 基础能力
- `GET /api/test`

### 用户模块
- `PUT /api/user/password`

### 约玩模块
- `POST /api/play/join/:id`

### 商家模块
- `POST /api/business/create`
- `POST /api/business/like/:id`

### 订单模块
- `POST /api/order/create`

### 收藏模块
- `POST /api/collection/add`
- `DELETE /api/collection/remove`
- `GET /api/collection/list`

### 通用模块
- `GET /api/common/search`
- `GET /api/common/nearby`
- `GET /api/common/message`

---

## 四、前端调用了但后端未实现接口（按模块）

### 订单模块
- `GET /api/order/detail/:id`
  - 调用页面：`pages/order/orderDetail.vue`
- `POST /api/order/process/:id`
  - 调用页面：`pages/order/orderDetail.vue`

---

## 五、页面无接口调用汇总（便于后续补齐）

- `pages/search/index.vue`
- `pages/nearby/index.vue`
- `pages/message/index.vue`
- `pages/collection/index.vue`
- `pages/user/user.vue`

---

## 六、结论（可直接做排期）

1. **优先修正前后端不一致**：先补后端 `order/detail` 与 `order/process`，或前端改为现有接口。
2. **再补齐空页面接口**：`search / nearby / message / collection` 页面当前均未接入真实数据。
3. **最后清理重复页面**：`login/index.vue` 与 `login/login.vue`、`publish/index.vue` 与 `publish/publish.vue`、`order/index.vue` 与 `order/orderList.vue` 功能高度重合，可收敛。
