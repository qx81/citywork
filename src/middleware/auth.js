const { verifyToken } = require('../utils/jwt');
const { fail } = require('../utils/response');
const { CODE } = require('../config/constants');

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return fail(res, CODE.UNAUTHORIZED, '未登录');
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return fail(res, CODE.UNAUTHORIZED, '登录已过期');
  }
}

module.exports = auth;
