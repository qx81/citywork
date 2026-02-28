const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// 发布约玩
router.post('/create', async (req, res) => {
  try {
    const { user_id, title, description, time, location, budget, max_people } = req.body;
    
    const result = await query(
      'INSERT INTO play_together (user_id, title, description, time, location, budget, max_people) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, description, time, location, budget, max_people]
    );
    
    res.json({ code: 200, msg: '发布成功', data: { id: result.insertId } });
  } catch (error) {
    res.json({ code: 500, msg: '发布失败', data: null });
  }
});

// 获取约玩列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    const items = await query(
      'SELECT * FROM play_together WHERE status = 1 ORDER BY time ASC LIMIT ? OFFSET ?',
      [parseInt(pageSize), offset]
    );
    
    // 获取总数
    const countResult = await query('SELECT COUNT(*) as total FROM play_together WHERE status = 1');
    
    res.json({ code: 200, msg: '获取成功', data: { list: items, total: countResult[0].total } });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 获取约玩详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await query('SELECT * FROM play_together WHERE id = ?', [id]);
    if (item.length === 0) {
      return res.json({ code: 404, msg: '约玩不存在', data: null });
    }
    
    res.json({ code: 200, msg: '获取成功', data: item[0] });
  } catch (error) {
    res.json({ code: 500, msg: '获取失败', data: null });
  }
});

// 报名约玩
router.post('/join/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查约玩是否存在且状态为招募中
    const play = await query('SELECT * FROM play_together WHERE id = ? AND status = 1', [id]);
    if (play.length === 0) {
      return res.json({ code: 404, msg: '约玩不存在或已结束', data: null });
    }
    
    // 检查是否已满员
    if (play[0].current_people >= play[0].max_people) {
      return res.json({ code: 400, msg: '约玩已报满', data: null });
    }
    
    // 更新人数
    await query(
      'UPDATE play_together SET current_people = current_people + 1 WHERE id = ?',
      [id]
    );
    
    // 检查是否已满员，如果已满员则更新状态
    const updatedPlay = await query('SELECT * FROM play_together WHERE id = ?', [id]);
    if (updatedPlay[0].current_people >= updatedPlay[0].max_people) {
      await query('UPDATE play_together SET status = 0 WHERE id = ?', [id]);
    }
    
    res.json({ code: 200, msg: '报名成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '报名失败', data: null });
  }
});

// 取消报名
router.post('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查约玩是否存在
    const play = await query('SELECT * FROM play_together WHERE id = ?', [id]);
    if (play.length === 0) {
      return res.json({ code: 404, msg: '约玩不存在', data: null });
    }
    
    // 检查人数是否大于1
    if (play[0].current_people <= 1) {
      return res.json({ code: 400, msg: '至少需要一人参与', data: null });
    }
    
    // 更新人数
    await query(
      'UPDATE play_together SET current_people = current_people - 1, status = 1 WHERE id = ?',
      [id]
    );
    
    res.json({ code: 200, msg: '取消报名成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '取消报名失败', data: null });
  }
});

// 更新约玩
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, time, location, budget, max_people, status } = req.body;
    
    await query(
      'UPDATE play_together SET title = ?, description = ?, time = ?, location = ?, budget = ?, max_people = ?, status = ? WHERE id = ?',
      [title, description, time, location, budget, max_people, status, id]
    );
    
    res.json({ code: 200, msg: '更新成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '更新失败', data: null });
  }
});

// 删除约玩
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM play_together WHERE id = ?', [id]);
    
    res.json({ code: 200, msg: '删除成功', data: null });
  } catch (error) {
    res.json({ code: 500, msg: '删除失败', data: null });
  }
});

module.exports = router;