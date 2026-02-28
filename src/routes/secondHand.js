const express = require('express');
const { query } = require('../config/db');
const { ok } = require('../utils/response');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  const { title, description, original_price, price, condition_level, pickup_address, contact_phone, images = '' } = req.body;
  const result = await query('INSERT INTO second_hand(user_id,title,description,original_price,price,condition_level,pickup_address,contact_phone,images) VALUES(?,?,?,?,?,?,?,?,?)', [req.user.userId, title, description, original_price, price, condition_level, pickup_address, contact_phone, images]);
  return ok(res, { id: result.insertId }, '发布成功');
});

router.get('/list', async (req, res) => {
  const list = await query('SELECT sh.*,u.username,u.avatar FROM second_hand sh JOIN user u ON sh.user_id=u.id WHERE sh.status=1 ORDER BY sh.is_recommend DESC, sh.created_at DESC');
  return ok(res, list, '获取成功');
});

module.exports = router;
