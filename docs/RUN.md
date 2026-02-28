# 运行说明

## 1. 环境准备
- Node.js >= 18
- MySQL 8.0+
- HBuilderX（uni-app）+ 微信开发者工具

## 2. 导入数据库
```bash
mysql -uroot -proot < city_life_platform.sql
```
或使用 Navicat/DataGrip 导入同名文件。

## 3. 启动后端
```bash
npm install
npm run dev
```
健康检查：`http://localhost:3000/api/test`

数据库默认连接：
- host: `127.0.0.1`
- port: `3306`
- user: `root`
- password: `root`
- database: `city_life_platform`
- pool: `10`

## 4. 启动前端
1. 使用 HBuilderX 打开 `frontend` 目录。
2. 在 `frontend/common/utils/request.js` 配置后端地址。
3. 运行到微信小程序/H5/APP。

## 5. 常见问题
- 数据库连接失败：检查 MySQL 端口、用户权限、DB_NAME。
- 401：登录后是否写入 token，接口是否携带 Bearer Token。
- 小程序定位失败：需在小程序后台启用地理位置权限并调用授权。
- 跨域问题：后端已启用 cors，如反向代理请透传 `Authorization`。
