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
  const { status, page = 1, pageSize = 10 } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const sizeNum = Math.min(50, Math.max(1, Number(pageSize) || 10));
  const offset = (pageNum - 1) * sizeNum;

  const whereSql = status === undefined ? 'o.user_id=?' : 'o.user_id=? AND o.status=?';
  const params = status === undefined ? [req.user.userId] : [req.user.userId, Number(status)];

  const countRows = await query(`SELECT COUNT(1) AS total FROM \`order\` o WHERE ${whereSql}`, params);
  const total = countRows[0]?.total || 0;

  const list = await query(
    `SELECT o.id,o.order_no,o.user_id,o.content_id,o.content_type,o.amount,o.status,o.service_time,o.remark,o.created_at,o.updated_at,
            COALESCE(ss.title, sh.title, pt.title) AS title,
            CASE
              WHEN o.content_type='skill' THEN CONCAT(COALESCE(ss.description,''), ' | ', COALESCE(ss.service_time,''))
              WHEN o.content_type='second_hand' THEN CONCAT(COALESCE(sh.condition_level,''), ' | 自提')
              WHEN o.content_type='play' THEN CONCAT(COALESCE(pt.play_type,''), ' | ', DATE_FORMAT(pt.play_time,'%m-%d %H:%i'))
              ELSE ''
            END AS summary,
            CASE
              WHEN o.content_type='skill' THEN DATE_FORMAT(o.service_time,'%Y-%m-%d %H:%i')
              WHEN o.content_type='second_hand' THEN COALESCE(sh.pickup_address,'')
              WHEN o.content_type='play' THEN COALESCE(pt.location,'')
              ELSE ''
            END AS meta,
            CASE
              WHEN o.content_type='skill' THEN ss.service_area
              WHEN o.content_type='second_hand' THEN sh.pickup_address
              WHEN o.content_type='play' THEN pt.location
              ELSE ''
            END AS location,
            CASE
              WHEN o.content_type='skill' THEN ss.images
              WHEN o.content_type='second_hand' THEN sh.images
              WHEN o.content_type='play' THEN ''
              ELSE ''
            END AS images
     FROM \`order\` o
     LEFT JOIN skill_service ss ON o.content_type='skill' AND o.content_id=ss.id
     LEFT JOIN second_hand sh ON o.content_type='second_hand' AND o.content_id=sh.id
     LEFT JOIN play_together pt ON o.content_type='play' AND o.content_id=pt.id
     WHERE ${whereSql}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, sizeNum, offset]
  );

  return ok(res, {
    list,
    page: pageNum,
    pageSize: sizeNum,
    total,
    hasMore: offset + list.length < total
  }, '获取成功');
});


router.post('/delete/:id', auth, async (req, res) => {
  const rows = await query('SELECT status FROM `order` WHERE id=? AND user_id=?', [req.params.id, req.user.userId]);
  if (!rows.length) return fail(res, 404, '订单不存在');
  if (![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELED].includes(rows[0].status)) {
    return fail(res, 400, '仅已完成或已取消订单可删除');
  }
  await query('DELETE FROM `order` WHERE id=? AND user_id=?', [req.params.id, req.user.userId]);
  return ok(res, null, '删除成功');
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
