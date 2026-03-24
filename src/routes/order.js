const express = require('express');
const { query, pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const auth = require('../middleware/auth');
const { ORDER_STATUS } = require('../config/constants');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  const { content_id, content_type, amount, service_time, remark = '' } = req.body;
  const orderNo = `CW${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const result = await query('INSERT INTO `order`(order_no,user_id,content_id,content_type,amount,status,service_time,remark) VALUES(?,?,?,?,?,?,?,?)', [orderNo, req.user.userId, content_id, content_type, amount, ORDER_STATUS.PENDING_PAYMENT, service_time, remark]);
  return ok(res, { id: result.insertId, order_no: orderNo }, '创建成功');
});

router.post('/pay/:id', auth, async (req, res) => {
  const rows = await query('SELECT status FROM `order` WHERE id=? AND user_id=?', [req.params.id, req.user.userId]);
  if (!rows.length || rows[0].status !== ORDER_STATUS.PENDING_PAYMENT) return fail(res, 400, '仅待支付订单可支付');
  await query('UPDATE `order` SET status=? WHERE id=?', [ORDER_STATUS.PAID, req.params.id]);
  return ok(res, null, '支付成功');
});

router.post('/cancel/:id', auth, async (req, res) => {
  const rows = await query('SELECT status FROM `order` WHERE id=? AND user_id=?', [req.params.id, req.user.userId]);
  if (!rows.length) return fail(res, 404, '订单不存在');
  if (![ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PAID, ORDER_STATUS.PENDING_COMPLETE].includes(rows[0].status)) return fail(res, 400, '当前状态不可取消');
  await query('UPDATE `order` SET status=? WHERE id=?', [ORDER_STATUS.CANCELED, req.params.id]);
  return ok(res, null, '取消成功');
});

router.post('/complete/:id', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT status,content_type,content_id FROM `order` WHERE id=? AND user_id=? FOR UPDATE', [req.params.id, req.user.userId]);
    if (!rows.length || rows[0].status !== ORDER_STATUS.PENDING_COMPLETE) {
      await conn.rollback();
      return fail(res, 400, '仅待完成订单可完成');
    }
    await conn.execute('UPDATE `order` SET status=? WHERE id=?', [ORDER_STATUS.COMPLETED, req.params.id]);
    await conn.commit();
    return ok(res, null, '确认完成成功');
  } catch (e) {
    await conn.rollback();
    return fail(res, 500, '完成失败');
  } finally {
    conn.release();
  }
});

router.get('/list', auth, async (req, res) => {
  const { status } = req.query;
  const sql = status === undefined ? 'SELECT * FROM `order` WHERE user_id=? ORDER BY created_at DESC' : 'SELECT * FROM `order` WHERE user_id=? AND status=? ORDER BY created_at DESC';
  const list = await query(sql, status === undefined ? [req.user.userId] : [req.user.userId, status]);
  return ok(res, list, '获取成功');
});

router.get('/detail/:id', auth, async (req, res) => {
  const rows = await query(
    `SELECT o.id,o.order_no,o.user_id,o.content_id,o.content_type,o.amount,o.status,o.service_time,o.remark,o.created_at,o.updated_at,
            CASE WHEN o.content_type='skill' THEN 1 ELSE 2 END AS service_type,
            o.amount AS price,
            CASE
              WHEN o.content_type='skill' THEN ss.service_area
              WHEN o.content_type='second_hand' THEN sh.pickup_address
              WHEN o.content_type='play' THEN pt.location
              ELSE ''
            END AS address
     FROM \`order\` o
     LEFT JOIN skill_service ss ON o.content_type='skill' AND o.content_id=ss.id
     LEFT JOIN second_hand sh ON o.content_type='second_hand' AND o.content_id=sh.id
     LEFT JOIN play_together pt ON o.content_type='play' AND o.content_id=pt.id
     WHERE o.id=? AND o.user_id=?`,
    [req.params.id, req.user.userId]
  );
  if (!rows.length) return fail(res, 404, '订单不存在');
  return ok(res, rows[0], '获取成功');
});

router.post('/process/:id', auth, async (req, res) => {
  const rows = await query('SELECT status FROM `order` WHERE id=? AND user_id=?', [req.params.id, req.user.userId]);
  if (!rows.length) return fail(res, 404, '订单不存在');
  if (rows[0].status !== ORDER_STATUS.PAID) return fail(res, 400, '仅已支付订单可开始处理');
  await query('UPDATE `order` SET status=? WHERE id=?', [ORDER_STATUS.PENDING_COMPLETE, req.params.id]);
  return ok(res, null, '开始处理成功');
});

module.exports = router;
