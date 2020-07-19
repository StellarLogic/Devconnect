const config = require("config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const _ = require("lodash");
const express = require("express");
const User = require("../../model/User");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .send({ errors: [{ msg: "User already exists" }] });
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        password,
        avatar,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

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

      //   res.send({
      //     status: "User Registed",
      //     data: _.pick(user, ["name", "email"]),
      //   });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
