const express = require('express');
const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');
const auth = require('../middleware/auth');
const { signToken } = require('../utils/jwt');

const router = express.Router();

function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone || '');
}

router.post('/register', async (req, res) => {
  const { phone, password, username, code = '123456' } = req.body;
  if (!username || !isValidPhone(phone) || !password || String(password).length < 6) {
    return fail(res, 400, '参数校验失败');
  }
  if (code !== '123456') return fail(res, 400, '验证码错误');
  const exists = await query('SELECT id FROM `user` WHERE phone=?', [phone]);
  if (exists.length) return fail(res, 400, '手机号已注册');
  const result = await query('INSERT INTO `user`(username, phone, password) VALUES(?,?,?)', [username, phone, password]);
  return ok(res, { id: result.insertId }, '注册成功');
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!isValidPhone(phone) || !password) {
    return fail(res, 400, '参数校验失败');
  }
  const users = await query('SELECT id,username,phone,avatar,city FROM `user` WHERE phone=? AND password=?', [phone, password]);
  if (!users.length) return fail(res, 400, '手机号或密码错误');
  const token = signToken({ userId: users[0].id, phone: users[0].phone });
  return ok(res, { token, user: users[0] }, '登录成功');
});

router.get('/profile', auth, async (req, res) => {
  const users = await query('SELECT id,username,phone,avatar,address,bio,city FROM `user` WHERE id=?', [req.user.userId]);
  return users.length ? ok(res, users[0], '获取成功') : fail(res, 404, '用户不存在');
});

router.get('/center', auth, async (req, res) => {
  const [users, orderStats, collectionStats, skillStats] = await Promise.all([
    query('SELECT id,username,avatar,city FROM `user` WHERE id=?', [req.user.userId]),
    query('SELECT COUNT(1) AS count FROM `order` WHERE user_id=?', [req.user.userId]),
    query('SELECT COUNT(1) AS count FROM collection WHERE user_id=?', [req.user.userId]),
    query('SELECT COUNT(1) AS count FROM skill_service WHERE user_id=?', [req.user.userId])
  ]);

  if (!users.length) return fail(res, 404, '用户不存在');

  return ok(
    res,
    {
      user: users[0],
      stats: {
        orderCount: orderStats[0]?.count || 0,
        collectionCount: collectionStats[0]?.count || 0,
        skillCount: skillStats[0]?.count || 0
      }
    },
    '获取成功'
  );
});

router.post('/logout', auth, async (req, res) => ok(res, null, '退出成功'));

router.put('/profile', auth, async (req, res) => {
  const { username, avatar = '', address = '', bio = '' } = req.body;
  if (!username) {
    return fail(res, 400, '用户名不能为空');
  }
  await query('UPDATE `user` SET username=?,avatar=?,address=?,bio=? WHERE id=?', [username, avatar, address, bio, req.user.userId]);
  return ok(res, null, '更新成功');
});

router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || String(newPassword).length < 6) {
    return fail(res, 400, '参数校验失败');
  }
  const rows = await query('SELECT id FROM `user` WHERE id=? AND password=?', [req.user.userId, oldPassword]);
  if (!rows.length) return fail(res, 400, '旧密码错误');
  await query('UPDATE `user` SET password=? WHERE id=?', [newPassword, req.user.userId]);
  return ok(res, null, '密码修改成功');
});

module.exports = router;
