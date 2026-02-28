const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// 发布技能服务
router.post('/create', async (req, res) => {
  try {
    const { user_id, title, description, price, category, images } = req.body;
    
    const result = await query(
      'INSERT INTO skill_service (user_id, title, description, price, category, images) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, title, description, price, category, images]
    );
    
    res.json({ code: 200, msg: '发布成功', data: { id: result.insertId } });
  } catch (error) {
    res.json({ code: 500, msg: '发布失败', data: null });
  }
});

// 获取技能服务列表
router.get('/list', async (req, res) => {
  try {
    const { category, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    let sql = 'SELECT * FROM skill_service WHERE status = 1';
    let params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);
    
    const skills = await query(sql, params);
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM skill_service WHERE status = 1' + (category ? ' AND category = ?' : '');
    const countParams = category ? [category] : [];
    const countResult = await query(countSql, countParams);
    
    res.json({ code: 200, msg: '获取成功', data: { list: skills, total: countResult[0].total } });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 获取技能服务详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await query('SELECT * FROM skill_service WHERE id = ?', [id]);
    if (skill.length === 0) {
      return res.json({ code: 404, msg: '技能服务不存在', data: null });
    }
    
    res.json({ code: 200, msg: '获取成功', data: skill[0] });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 更新技能服务
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, images, status } = req.body;
    
    await query(
      'UPDATE skill_service SET title = ?, description = ?, price = ?, category = ?, images = ?, status = ? WHERE id = ?',
      [title, description, price, category, images, status, id]
    );
    
    res.json({ code: 200, msg: '更新成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '更新失败', data: null });
  }
});

// 删除技能服务
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM skill_service WHERE id = ?', [id]);
    
    res.json({ code: 200, msg: '删除成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '删除失败', data: null });
  }
});

module.exports = router;