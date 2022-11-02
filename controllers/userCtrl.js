const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const Payments = require('../models/paymentModel')
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await Users.findOne({ email });
      if (user) return res.status(400).json({ msg: "the email already exist" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password is at least 6 caracters " });
      //password encryption
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({ name, email, password: passwordHash });
      // save mongoDB
      await newUser.save();

      //  then create jsonwebtoken to authentification
      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshtoken,
        {
          httpOnly: true,
          path: "/user/refresh_token",
        });
      res.json({ accesstoken });
      // res.json({ msg: " Register success!" })
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Incorrect password." });

      // If Login success,create access token and refresh token
      const accesstoken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken
        ,
        {
          httpOnly: true,
          path: "/user/refresh_token",
        });
      res.json({ accesstoken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "logged out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ msg: "Please Login or Register " });

      jwt.verify(rf_token, process.env.REFRECH_TOKEN_SELECT, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "Please Login or Register " });
        const accesstoken = createAccessToken({ id: user.id });
        res.json({ accesstoken });
      });
      // res.json({rf_token})
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      //res.json(req.user); // id of user
      const user = await Users.findById(req.user.id).select('-password')
      if (!user) return res.status(400).json({ msg: " User does not exist." })
      res.json(user)
    } catch (err) {
      return res.status(400).json({ msg: err.message });
    }
  },
  addCart: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id)
      if (!user) return res.status(400).json({ msg: "user does not exist." })

      await Users.findByIdAndUpdate({ _id: req.user.id }, {
        cart: req.body.cart
      })
      return res.json({ msg: "Added to cart " })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  history: async (req, res) => {
    try {
      const history = await Payments.find({ user_id: req.user.id })

      res.json(history)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
};

// explication
const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};
const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRECH_TOKEN_SELECT, { expiresIn: "7d" });
};
module.exports = userCtrl;
