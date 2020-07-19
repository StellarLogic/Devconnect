const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../model/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .send({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res
          .status(400)
          .send({ errors: [{ msg: "Invalid Credentials" }] });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtToken"),
        {
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
