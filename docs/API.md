# 同城生活轻服务平台接口文档（增强版）

统一返回：`{ code, msg, data }`；`200成功/401未登录/403权限不足/500服务器错误`。

## 用户模块
| 接口 | 方法 | 权限 | 参数 | 说明 |
|---|---|---|---|---|
| /api/user/register | POST | 否 | username, phone, password, code | 注册，验证码固定123456 |
| /api/user/login | POST | 否 | phone, password | 登录获取JWT |
| /api/user/profile | GET | 是 | - | 获取个人信息 |
| /api/user/profile | PUT | 是 | username/avatar/address/bio | 编辑信息 |
| /api/user/password | PUT | 是 | oldPassword/newPassword | 修改密码 |

## 内容模块
| 接口 | 方法 | 权限 | 参数 |
|---|---|---|---|
| /api/skill/create | POST | 是 | title/description/price/price_unit/area/available_time/images/category |
| /api/skill/list | GET | 否 | sort(recommend/latest/price) |
| /api/secondHand/create | POST | 是 | title/description/original_price/price/condition_level/pickup_address/contact_phone/images |
| /api/secondHand/detail/:id | GET | 否 | id路径参数 |
| /api/play/create | POST | 是 | title/play_type/play_time/location/budget/max_people/description |
| /api/play/detail/:id | GET | 否 | id路径参数 |
| /api/business/create | POST | 是 | name/address/score/reason/avg_cost/images |
| /api/business/detail/:id | GET | 否 | id路径参数 |

## 订单模块
| 接口 | 方法 | 权限 | 参数 | 规则 |
|---|---|---|---|---|
| /api/order/create | POST | 是 | content_id/content_type/amount/service_time/remark | 初始状态待支付 |
| /api/order/pay/:id | POST | 是 | - | 仅待支付可支付 |
| /api/order/process/:id | POST | 是 | - | 仅已支付可变为待完成 |
| /api/order/cancel/:id | POST | 是 | - | 待支付/已支付/待完成可取消 |
| /api/order/complete/:id | POST | 是 | - | 仅待完成可完成 |
| /api/order/list | GET | 是 | status/page/pageSize可选 | 按状态筛选并分页，返回列表附带标题/封面/摘要等展示字段 |
| /api/order/detail/:id | GET | 是 | - | 获取单个订单详情 |
| /api/order/delete/:id | POST | 是 | - | 仅已完成/已取消订单可删除 |

## 收藏、搜索、附近、消息
| 接口 | 方法 | 权限 | 说明 |
|---|---|---|---|
| /api/collection/add | POST | 是 | 添加收藏 |
| /api/collection/remove | DELETE | 是 | 取消收藏 |
| /api/collection/list | GET | 是 | 收藏列表 |
| /api/common/search | GET | 否 | 全局搜索 |
| /api/common/home | GET | 否 | 首页聚合数据（feed + 附近服务） |
| /api/common/nearby | GET | 否 | 同城附近推荐 |
| /api/common/message | GET | 否 | 模拟消息中心 |
