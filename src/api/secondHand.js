const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// 发布二手闲置
router.post('/create', async (req, res) => {
  try {
    const { user_id, title, description, price, category, images, pickup_address } = req.body;
    
    const result = await query(
      'INSERT INTO second_hand (user_id, title, description, price, category, images, pickup_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, description, price, category, images, pickup_address]
    );
    
    res.json({ code: 200, msg: '发布成功', data: { id: result.insertId } });
  } catch (error) {
    res.json({ code: 500, msg: '发布失败', data: null });
  }
});

// 获取二手闲置列表
router.get('/list', async (req, res) => {
  try {
    const { category, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    let sql = 'SELECT * FROM second_hand WHERE status = 1';
    let params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);
    
    const items = await query(sql, params);
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM second_hand WHERE status = 1' + (category ? ' AND category = ?' : '');
    const countParams = category ? [category] : [];
    const countResult = await query(countSql, countParams);
    
    res.json({ code: 200, msg: '获取成功', data: { list: items, total: countResult[0].total } });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 获取二手闲置详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await query('SELECT * FROM second_hand WHERE id = ?', [id]);
    if (item.length === 0) {
      return res.json({ code: 404, msg: '二手闲置不存在', data: null });
    }
    
    res.json({ code: 200, msg: '获取成功', data: item[0] });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 更新二手闲置
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, images, pickup_address, status } = req.body;
    
    await query(
      'UPDATE second_hand SET title = ?, description = ?, price = ?, category = ?, images = ?, pickup_address = ?, status = ? WHERE id = ?',
      [title, description, price, category, images, pickup_address, status, id]
    );
    
    res.json({ code: 200, msg: '更新成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '更新失败', data: null });
  }
});

// 删除二手闲置
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM second_hand WHERE id = ?', [id]);
    
    res.json({ code: 200, msg: '删除成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '删除失败', data: null });
  }
});

module.exports = router;