const { CODE } = require('../config/constants');

function ok(res, data = null, msg = 'success') {
  return res.status(200).json({ code: CODE.SUCCESS, msg, data });
}

function fail(res, code = CODE.SERVER_ERROR, msg = '服务器错误', data = null) {
  return res.status(200).json({ code, msg, data });
}

module.exports = { ok, fail };
