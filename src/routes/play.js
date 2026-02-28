const express = require('express');
const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  const { title, play_type, play_time, location, budget, max_people, description } = req.body;
  const result = await query('INSERT INTO play_together(user_id,title,play_type,play_time,location,budget,max_people,description) VALUES(?,?,?,?,?,?,?,?)', [req.user.userId, title, play_type, play_time, location, budget, max_people, description]);
  return ok(res, { id: result.insertId }, '发布成功');
});

router.post('/join/:id', auth, async (req, res) => {
  const rows = await query('SELECT * FROM play_together WHERE id=?', [req.params.id]);
  if (!rows.length || rows[0].current_people >= rows[0].max_people) return fail(res, 400, '人数已满');
  await query('UPDATE play_together SET current_people=current_people+1 WHERE id=?', [req.params.id]);
  return ok(res, null, '报名成功');
});

router.get('/list', async (req, res) => {
  const { sort = 'time' } = req.query;
  const orderBy = sort === 'distance' ? 'distance_km ASC' : 'play_time ASC';
  const list = await query(`SELECT * FROM play_together WHERE status=1 ORDER BY ${orderBy}`);
  return ok(res, list, '获取成功');
});

module.exports = router;
