const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).send({ msg: "No token, Authorization DENIED" });

  try {
    const decoded = jwt.verify(token, config.get("jwtToken"));
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).send({ msg: "Token is not valid" });
  }
};
