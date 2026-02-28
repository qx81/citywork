const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { testConnection } = require('./src/config/db');
const logger = require('./src/utils/logger');
const { fail } = require('./src/utils/response');

const userRoutes = require('./src/routes/user');
const skillRoutes = require('./src/routes/skill');
const secondRoutes = require('./src/routes/secondHand');
const playRoutes = require('./src/routes/play');
const businessRoutes = require('./src/routes/business');
const orderRoutes = require('./src/routes/order');
const collectionRoutes = require('./src/routes/collection');
const commonRoutes = require('./src/routes/common');

const app = express();

const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/api/test', (req, res) => res.json({ code: 200, msg: '服务正常', data: null }));
app.post('/api/upload/avatar', upload.single('file'), (req, res) => {
  res.json({ code: 200, msg: '上传成功', data: { path: req.file.path } });
});

app.use('/api/user', userRoutes);
app.use('/api/skill', skillRoutes);
app.use('/api/secondHand', secondRoutes);
app.use('/api/play', playRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/common', commonRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  return fail(res, 500, '服务器错误');
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, async () => {
  await testConnection();
  logger.info(`服务启动: http://localhost:${PORT}`);
});
