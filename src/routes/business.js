const express = require('express');
const { query } = require('../config/db');
const { ok } = require('../utils/response');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  const { name, address, score, reason, avg_cost, images = '' } = req.body;
  const result = await query('INSERT INTO local_business(user_id,name,address,score,recommend_reason,avg_cost,images) VALUES(?,?,?,?,?,?,?)', [req.user.userId, name, address, score, reason, avg_cost, images]);
  return ok(res, { id: result.insertId }, '发布成功');
});

router.post('/like/:id', auth, async (req, res) => {
  await query('UPDATE local_business SET likes=likes+1 WHERE id=?', [req.params.id]);
  return ok(res, null, '点赞成功');
});


router.get('/detail/:id', async (req, res) => {
  const rows = await query('SELECT * FROM local_business WHERE id=? LIMIT 1', [req.params.id]);
  return ok(res, rows[0] || null, '获取成功');
});

router.get('/list', async (req, res) => {
  const list = await query('SELECT * FROM local_business ORDER BY score DESC, is_recommend DESC');
  return ok(res, list, '获取成功');
});

module.exports = router;
