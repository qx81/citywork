const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    
    // 检查手机号是否已存在
    const existingUser = await query('SELECT * FROM user WHERE phone = ?', [phone]);
    if (existingUser.length > 0) {
      return res.json({ code: 400, msg: '手机号已注册', data: null });
    }
    
    // 插入新用户
    const result = await query(
      'INSERT INTO user (username, phone, password) VALUES (?, ?, ?)',
      [username, phone, password]
    );
    
    res.json({ code: 200, msg: '注册成功', data: { id: result.insertId, username, phone } });
  } catch (error) {
    res.json({ code: 500, msg: '注册失败', data: null });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // 查找用户
    const user = await query('SELECT * FROM user WHERE phone = ? AND password = ?', [phone, password]);
    if (user.length === 0) {
      return res.json({ code: 400, msg: '手机号或密码错误', data: null });
    }
    
    res.json({ code: 200, msg: '登录成功', data: user[0] });
  } catch (error) {
    res.json({ code: 500, msg: '登录失败', data: null });
  }
});

// 获取用户信息
router.get('/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await query('SELECT id, username, phone, avatar, address FROM user WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.json({ code: 404, msg: '用户不存在', data: null });
    }
    
    res.json({ code: 200, msg: '获取成功', data: user[0] });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 更新用户信息
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, avatar, address } = req.body;
    
    await query(
      'UPDATE user SET username = ?, avatar = ?, address = ? WHERE id = ?',
      [username, avatar, address, id]
    );
    
    res.json({ code: 200, msg: '更新成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '更新失败', data: null });
  }
});

module.exports = router;