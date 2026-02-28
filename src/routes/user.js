const express = require('express');
const { body } = require('express-validator');
const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { signToken } = require('../utils/jwt');

const router = express.Router();

router.post('/register', [body('phone').isLength({ min: 11, max: 11 }), body('password').isLength({ min: 6 }), body('username').notEmpty()], validate, async (req, res) => {
  const { phone, password, username, code = '123456' } = req.body;
  if (code !== '123456') return fail(res, 400, '验证码错误');
  const exists = await query('SELECT id FROM user WHERE phone=?', [phone]);
  if (exists.length) return fail(res, 400, '手机号已注册');
  const result = await query('INSERT INTO user(username, phone, password) VALUES(?,?,?)', [username, phone, password]);
  return ok(res, { id: result.insertId }, '注册成功');
});

router.post('/login', [body('phone').notEmpty(), body('password').notEmpty()], validate, async (req, res) => {
  const { phone, password } = req.body;
  const users = await query('SELECT id,username,phone,avatar FROM user WHERE phone=? AND password=?', [phone, password]);
  if (!users.length) return fail(res, 400, '手机号或密码错误');
  const token = signToken({ userId: users[0].id, phone: users[0].phone });
  return ok(res, { token, user: users[0] }, '登录成功');
});

router.get('/profile', auth, async (req, res) => {
  const users = await query('SELECT id,username,phone,avatar,address,bio FROM user WHERE id=?', [req.user.userId]);
  return users.length ? ok(res, users[0], '获取成功') : fail(res, 404, '用户不存在');
});

router.put('/profile', auth, async (req, res) => {
  const { username, avatar, address, bio } = req.body;
  await query('UPDATE user SET username=?,avatar=?,address=?,bio=? WHERE id=?', [username, avatar, address, bio, req.user.userId]);
  return ok(res, null, '更新成功');
});

router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const rows = await query('SELECT id FROM user WHERE id=? AND password=?', [req.user.userId, oldPassword]);
  if (!rows.length) return fail(res, 400, '旧密码错误');
  await query('UPDATE user SET password=? WHERE id=?', [newPassword, req.user.userId]);
  return ok(res, null, '密码修改成功');
});

module.exports = router;
