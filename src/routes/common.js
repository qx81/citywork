const express = require('express');
const { query } = require('../config/db');
const { ok } = require('../utils/response');
const router = express.Router();

router.get('/search', async (req, res) => {
  const { keyword = '' } = req.query;
  const kw = `%${keyword}%`;
  const [skills, secondHand, play, business] = await Promise.all([
    query('SELECT id,title,\'skill\' AS type FROM skill_service WHERE title LIKE ? LIMIT 10', [kw]),
    query('SELECT id,title,\'second_hand\' AS type FROM second_hand WHERE title LIKE ? LIMIT 10', [kw]),
    query('SELECT id,title,\'play\' AS type FROM play_together WHERE title LIKE ? LIMIT 10', [kw]),
    query('SELECT id,name AS title,\'business\' AS type FROM local_business WHERE name LIKE ? LIMIT 10', [kw])
  ]);
  return ok(res, [...skills, ...secondHand, ...play, ...business], '搜索成功');
});

router.get('/nearby', async (req, res) => {
  const { city = '杭州' } = req.query;
  const list = await query('SELECT id,title,\'skill\' AS type,service_area AS location FROM skill_service WHERE service_area LIKE ? LIMIT 20', [`%${city}%`]);
  return ok(res, list, '获取成功');
});

router.get('/message', (req, res) => {
  return ok(res, [
    { id: 1, type: 'order', content: '订单状态已变更为待完成', created_at: new Date() },
    { id: 2, type: 'system', content: '您发布的约玩已有新报名', created_at: new Date() }
  ], '获取成功');
});

module.exports = router;
