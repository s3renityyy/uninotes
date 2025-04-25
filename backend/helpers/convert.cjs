const toUtf8 = (latin1Str) => Buffer.from(latin1Str, "latin1").toString("utf8");
module.exports = toUtf8;
