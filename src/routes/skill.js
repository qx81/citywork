const express = require('express');
const { query } = require('../config/db');
const { ok } = require('../utils/response');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  const { title, description, price, price_unit, area, available_time, images = '', category = '通用技能' } = req.body;
  const result = await query('INSERT INTO skill_service(user_id,title,description,price,price_unit,service_area,service_time,images,category) VALUES(?,?,?,?,?,?,?,?,?)', [req.user.userId, title, description, price, price_unit, area, available_time, images, category]);
  return ok(res, { id: result.insertId }, '发布成功');
});

router.get('/list', async (req, res) => {
  const { sort = 'recommend' } = req.query;
  const orderBy = sort === 'price' ? 'price ASC' : sort === 'latest' ? 'created_at DESC' : 'is_recommend DESC, created_at DESC';
  const list = await query(`SELECT s.*,u.username,u.avatar FROM skill_service s JOIN user u ON s.user_id=u.id WHERE s.status=1 ORDER BY ${orderBy}`);
  return ok(res, list, '获取成功');
});

router.get('/detail/:id', async (req, res) => {
  const list = await query('SELECT s.*,u.username,u.avatar,u.phone FROM skill_service s JOIN user u ON s.user_id=u.id WHERE s.id=?', [req.params.id]);
  return ok(res, list[0] || null, '获取成功');
});

module.exports = router;
