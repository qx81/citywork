# 前端字段 vs SQL 字段核对（页面维度）

## 1. 统计范围与口径

- 前端页面：`frontend/pages/**/*.vue`（含列表、详情、发布、个人中心、订单）。
- SQL：`city_life_platform.sql` 中所有建表字段。
- 仅统计“业务数据字段”（如 `title`、`price`、`username`），不统计 UI 状态字段（如 `loading`、`activeTab`）与方法名。
- 将前端字段按业务实体归类后，与 SQL 表字段做集合对比。

---

## 2. 前端使用字段总览（按实体）

### 2.1 用户（`user`）

前端使用到：

- `id`
- `username`
- `phone`
- `avatar`
- `address`
- `bio`
- `city`

结论：以上字段 **SQL 均存在**。

### 2.2 技能服务（`skill_service`）

前端使用到：

- `id`
- `title`
- `description`
- `category`
- `price`
- `price_unit`
- `service_area`
- `service_time`
- `created_at`
- `is_recommend`

前端发布页提交（技能）还使用了：

- `area`
- `available_time`

结论：

- 上面第一组字段在 SQL 中都存在。
- `area`、`available_time` 在 `skill_service` 表 **不存在**（语义上对应 SQL 的 `service_area`、`service_time`）。

### 2.3 二手闲置（`second_hand`）

前端使用到：

- `id`
- `title`
- `description`
- `original_price`
- `price`
- `condition_level`
- `pickup_address`
- `contact_phone`
- `created_at`

前端详情页额外使用：

- `status_text`

结论：

- 除 `status_text` 外，其余字段 SQL 均存在。
- `status_text` 在 `second_hand` 表 **不存在**（应为前端/接口派生显示字段）。

### 2.4 约玩（`play_together`）

前端使用到：

- `id`
- `title`
- `play_type`
- `play_time`
- `location`
- `budget`
- `max_people`
- `current_people`
- `description`

结论：以上字段 **SQL 均存在**。

### 2.5 商家（`local_business`）

前端使用到：

- `id`
- `name`
- `address`
- `score`
- `recommend_reason`
- `avg_cost`
- `likes`

前端商家详情页还使用：

- `contact_phone`
- `open_time`

结论：

- 第一组字段 SQL 均存在。
- `contact_phone`、`open_time` 在 `local_business` 表 **不存在**。

### 2.6 订单（`order`）

前端使用到：

- `id`
- `order_no`
- `content_type`
- `amount`
- `status`
- `service_time`
- `remark`
- `created_at`

前端订单详情页还使用：

- `service_type`
- `price`
- `address`

结论：

- 第一组中，除 `created_at`（存在）外，其余字段 SQL 均存在。
- `service_type`、`price`、`address` 在 `order` 表 **不存在**（`price` 语义上接近 `amount`）。

### 2.7 收藏（`collection`）

页面中未发现直接渲染 `collection` 表字段（收藏页面当前为静态占位）。

---

## 3. “前端用了但 SQL 没有”的字段（重点）

按实体分类：

- `skill_service` 相关：`area`、`available_time`
- `second_hand` 相关：`status_text`
- `local_business` 相关：`contact_phone`、`open_time`
- `order` 相关：`service_type`、`price`、`address`

> 备注：其中部分字段可能是接口聚合/转换后的展示字段，但在当前 SQL 建表中没有同名列。

---

## 4. “SQL 有但前端未使用”的字段

### 4.1 `user`

- `password`
- `created_at`
- `updated_at`

### 4.2 `skill_service`

- `user_id`
- `images`
- `status`
- `updated_at`

### 4.3 `second_hand`

- `user_id`
- `images`
- `is_recommend`
- `status`
- `updated_at`

### 4.4 `play_together`

- `user_id`
- `distance_km`
- `status`
- `created_at`
- `updated_at`

### 4.5 `local_business`

- `user_id`
- `images`
- `is_recommend`
- `created_at`
- `updated_at`

### 4.6 `order`

- `user_id`
- `content_id`
- `updated_at`

### 4.7 `collection`

- `id`
- `user_id`
- `content_id`
- `content_type`
- `created_at`

---

## 5. 建议（可落地）

1. **优先修正命名不一致**：发布技能接口字段 `area/available_time` 与库字段 `service_area/service_time` 不一致，建议统一。
2. **区分“存储字段 vs 展示字段”**：如 `status_text`、`price`（订单详情）建议在接口文档明确标注为“派生字段”。
3. **商家详情字段补齐策略二选一**：
   - 方案 A：在 `local_business` 表新增 `contact_phone`、`open_time`；
   - 方案 B：前端去掉这两个字段或改为固定文案。
4. **无用字段治理**：如 `images`、`status`、`updated_at` 多表未在前端消费，可确认是否后续要接入，否则可降低维护成本（文档标注即可，不建议直接删库字段）。

---

## 6. 字段影响分级（展示影响 vs 功能影响）

以下仅针对“前端用了但 SQL 没有”的字段：

### 6.1 主要是**文字/展示层**影响（弱功能影响）

- `status_text`（`second_hand` 详情）
  - 作用：状态文案展示（如“可交易/已售出”）。
  - 影响：即使缺失，主体流程通常仍可继续（可回退到默认文案）。

- `open_time`（`business` 详情）
  - 作用：营业时间展示。
  - 影响：缺失会影响信息完整性与用户决策，但不直接阻断下单/跳转等主流程。

### 6.2 会影响**实际功能/业务流程**（强功能影响）

- `area`、`available_time`（技能发布）
  - 作用：发布时提交服务区域/可服务时间。
  - 影响：与库字段 `service_area`、`service_time` 命名不一致，可能导致后端落库失败或数据丢失，直接影响发布结果与后续检索。

- `contact_phone`（商家详情）
  - 作用：页面“联系商家”能力依赖联系方式。
  - 影响：缺失会导致联系链路不可用或只能降级为固定提示。

- `service_type`、`price`、`address`（订单详情）
  - 作用：订单详情核心信息（服务类型、金额、地址）。
  - 影响：若接口不返回可用字段映射，订单详情页会出现关键信息缺失/显示错误，影响支付后履约与确认。

### 6.3 综合优先级建议（按修复先后）

1. **P0（先修）**：`area`、`available_time`、`service_type`、`price`、`address`、`contact_phone`
2. **P1（次修）**：`open_time`
3. **P2（可后置）**：`status_text`（可先做前端兜底文案）
