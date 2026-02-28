const express = require('express');
const { query } = require('../config/db');
const { ok } = require('../utils/response');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/add', auth, async (req, res) => {
  const { content_id, content_type } = req.body;
  await query('INSERT IGNORE INTO collection(user_id,content_id,content_type) VALUES(?,?,?)', [req.user.userId, content_id, content_type]);
  return ok(res, null, '收藏成功');
});

router.delete('/remove', auth, async (req, res) => {
  const { content_id, content_type } = req.body;
  await query('DELETE FROM collection WHERE user_id=? AND content_id=? AND content_type=?', [req.user.userId, content_id, content_type]);
  return ok(res, null, '取消收藏成功');
});

router.get('/list', auth, async (req, res) => {
  const list = await query('SELECT * FROM collection WHERE user_id=? ORDER BY created_at DESC', [req.user.userId]);
  return ok(res, list, '获取成功');
});

module.exports = router;
