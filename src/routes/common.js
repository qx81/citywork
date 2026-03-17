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

router.get('/home', async (req, res) => {
  const { city = '', district = '' } = req.query;
  const areaKeyword = district ? `${city}${district}` : city;
  const areaLike = `%${areaKeyword}%`;

  const [skillList, secondList, playList, businessList] = await Promise.all([
    query(
      `SELECT id,title,category,price,service_area,images,is_recommend,created_at
       FROM skill_service
       WHERE status = 1 AND service_area LIKE ?
       ORDER BY is_recommend DESC, created_at DESC
       LIMIT 8`,
      [areaLike]
    ),
    query(
      `SELECT id,title,condition_level,price,pickup_address,images,is_recommend,created_at
       FROM second_hand
       WHERE status = 1
       ORDER BY is_recommend DESC, created_at DESC
       LIMIT 8`
    ),
    query(
      `SELECT id,title,play_type,budget,location,distance_km,created_at
       FROM play_together
       WHERE status = 1
       ORDER BY distance_km ASC, created_at DESC
       LIMIT 8`
    ),
    query(
      `SELECT id,name,address,score,avg_cost,likes,images,is_recommend,created_at
       FROM local_business
       ORDER BY is_recommend DESC, score DESC, created_at DESC
       LIMIT 8`
    )
  ]);

  const feed = [
    ...skillList.map((item) => ({
      id: `skill-${item.id}`,
      sourceId: item.id,
      type: 'skill',
      title: item.title,
      tag: item.category || '技能服务',
      priceText: `¥${Number(item.price).toFixed(0)}/次`,
      location: item.service_area,
      distanceText: '同城服务',
      meta: `${new Date(item.created_at).toLocaleDateString('zh-CN')} 发布`,
      image: item.images || '',
      isRecommend: Number(item.is_recommend) === 1
    })),
    ...secondList.map((item) => ({
      id: `second-${item.id}`,
      sourceId: item.id,
      type: 'second',
      title: item.title,
      tag: item.condition_level || '二手闲置',
      priceText: `¥${Number(item.price).toFixed(0)}`,
      location: item.pickup_address,
      distanceText: '可自提',
      meta: `${new Date(item.created_at).toLocaleDateString('zh-CN')} 更新`,
      image: item.images || '',
      isRecommend: Number(item.is_recommend) === 1
    })),
    ...playList.map((item) => ({
      id: `play-${item.id}`,
      sourceId: item.id,
      type: 'play',
      title: item.title,
      tag: item.play_type || '线下约玩',
      priceText: item.budget > 0 ? `预算 ¥${Number(item.budget).toFixed(0)}` : '免费局',
      location: item.location,
      distanceText: `${Number(item.distance_km).toFixed(1)}km`,
      meta: `${new Date(item.created_at).toLocaleDateString('zh-CN')} 发起`,
      image: '',
      isRecommend: Number(item.distance_km) <= 5
    })),
    ...businessList.map((item) => ({
      id: `shop-${item.id}`,
      sourceId: item.id,
      type: 'shop',
      title: item.name,
      tag: `评分 ${Number(item.score).toFixed(1)}`,
      priceText: `人均 ¥${Number(item.avg_cost).toFixed(0)}`,
      location: item.address,
      distanceText: '本地商家',
      meta: `${item.likes} 人点赞`,
      image: item.images || '',
      isRecommend: Number(item.is_recommend) === 1
    }))
  ]
    .sort((a, b) => Number(b.isRecommend) - Number(a.isRecommend))
    .slice(0, 20);

  const nearbyServices = [...skillList, ...businessList]
    .slice(0, 3)
    .map((item, index) => ({
      id: item.id,
      title: item.title || item.name,
      distanceText: `${(1.2 + index * 0.7).toFixed(1)}km`,
      desc: item.service_area || item.address || '同城精选'
    }));

  return ok(res, { city, district, feed, nearbyServices }, '获取成功');
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
