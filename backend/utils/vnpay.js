const crypto = require("crypto");
const qs = require("qs");

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    });
  return sorted;
}

function signParams(params, secretKey) {
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });

  return crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

module.exports = { signParams, sortObject };