const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./src/config/db');

// 导入接口模块
const userRoutes = require('./src/api/user');
const skillRoutes = require('./src/api/skill');
const secondHandRoutes = require('./src/api/secondHand');
const playTogetherRoutes = require('./src/api/playTogether');
const orderRoutes = require('./src/api/order');

const app = express();
const port = 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 测试数据库连接
testConnection();

// 接口路由
app.use('/api/user', userRoutes);
app.use('/api/skill', skillRoutes);
app.use('/api/secondHand', secondHandRoutes);
app.use('/api/playTogether', playTogetherRoutes);
app.use('/api/order', orderRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ code: 200, msg: '服务正常', data: null });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});