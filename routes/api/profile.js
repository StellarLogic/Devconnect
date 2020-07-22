const request = require("request");
const config = require("config");
const { check, validationResult } = require("express-validator");
const express = require("express");
const Profile = require("../../model/Profile");
const User = require("../../model/User");
const Post = require("../../model/Post");
const router = express.Router();
const auth = require("../../middleware/auth");
const { compareSync } = require("bcrypt");

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return res.status(400).send({ msg: "There is no profile for this user" });

    return res.status(200).send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/", async (req, res) => {
  const errors = {};

  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    if (!profiles) {
      errors.noprofile = "There are no profiles";
      return res.status(404).json(errors);
    }
    res.json(profiles);
  } catch (err) {
    res.status(404).json({ profile: "There are no profiles" });
  }
});

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is require").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });

    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.send(profile);
      }

      profile = new Profile(profileFields);

      await profile.save();

      return res.send(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }

    res.send("Profile Route");
  }
);

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.send(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).send({ msg: "Profile Not found" });

    res.send(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      res.status(400).send({ msg: "Profile Not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    await Post.deleteMany({ user: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.send({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      res.status(400).send({ msg: "Profile Not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.get("/experience", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    res.send(profile.experience);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      res.status(400).send({ msg: "Profile Not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = { title, company, location, from, to, current, description };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.send(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        res.status(400).send({ msg: "Profile Not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.send(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      res.status(400).send({ msg: "Profile Not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.get("/education", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    res.send(profile.education);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      res.status(400).send({ msg: "Profile Not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);

      await profile.save();

      res.send(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        res.status(400).send({ msg: "Profile Not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();

    res.send(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      res.status(400).send({ msg: "Profile Not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (err, response, body) => {
      if (err) console.error(err);

      if (response.statusCode !== 200) {
        return res.status(404).send({ msg: "No Github profile found" });
      }

      return res.send(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
