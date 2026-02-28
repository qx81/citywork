const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// 创建订单
router.post('/create', async (req, res) => {
  try {
    const { user_id, service_id, service_type, price, address, remark } = req.body;
    
    const result = await query(
      'INSERT INTO `order` (user_id, service_id, service_type, price, status, address, remark) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, service_id, service_type, price, 0, address, remark]
    );
    
    res.json({ code: 200, msg: '订单创建成功', data: { order_id: result.insertId } });
  } catch (error) {
    res.json({ code: 500, msg: '订单创建失败', data: null });
  }
});

// 获取用户订单列表
router.get('/list/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    let sql = 'SELECT * FROM `order` WHERE user_id = ?';
    let params = [user_id];
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);
    
    const orders = await query(sql, params);
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM `order` WHERE user_id = ?' + (status !== undefined ? ' AND status = ?' : '');
    const countParams = status !== undefined ? [user_id, status] : [user_id];
    const countResult = await query(countSql, countParams);
    
    res.json({ code: 200, msg: '获取成功', data: { list: orders, total: countResult[0].total } });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 获取订单详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await query('SELECT * FROM `order` WHERE id = ?', [id]);
    if (order.length === 0) {
      return res.json({ code: 404, msg: '订单不存在', data: null });
    }
    
    res.json({ code: 200, msg: '获取成功', data: order[0] });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 模拟支付
router.post('/pay/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查订单是否存在且状态为待支付
    const order = await query('SELECT * FROM `order` WHERE id = ? AND status = 0', [id]);
    if (order.length === 0) {
      return res.json({ code: 400, msg: '订单不存在或已支付', data: null });
    }
    
    // 更新订单状态为已支付
    await query('UPDATE `order` SET status = 1 WHERE id = ?', [id]);
    
    res.json({ code: 200, msg: '支付成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '支付失败', data: null });
  }
});

// 更新订单状态为待完成
router.post('/process/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查订单是否存在且状态为已支付
    const order = await query('SELECT * FROM `order` WHERE id = ? AND status = 1', [id]);
    if (order.length === 0) {
      return res.json({ code: 400, msg: '订单不存在或状态错误', data: null });
    }
    
    // 更新订单状态为待完成
    await query('UPDATE `order` SET status = 2 WHERE id = ?', [id]);
    
    res.json({ code: 200, msg: '订单已开始处理', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '更新失败', data: null });
  }
});

// 更新订单状态为已完成
router.post('/complete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查订单是否存在且状态为待完成
    const order = await query('SELECT * FROM `order` WHERE id = ? AND status = 2', [id]);
    if (order.length === 0) {
      return res.json({ code: 400, msg: '订单不存在或状态错误', data: null });
    }
    
    // 更新订单状态为已完成
    await query('UPDATE `order` SET status = 3 WHERE id = ?', [id]);
    
    // 如果是二手闲置订单，更新商品状态为已售出
    const orderInfo = order[0];
    if (orderInfo.service_type === 2) {
      await query('UPDATE second_hand SET status = 0 WHERE id = ?', [orderInfo.service_id]);
    }
    
    res.json({ code: 200, msg: '订单已完成', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '更新失败', data: null });
  }
});

module.exports = router;