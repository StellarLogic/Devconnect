import alert from "./alert";
import auth from "./auth";
import profile from "./profile";
import post from "./post";

const { combineReducers } = require("redux");

export default combineReducers({ alert, auth, profile, post });
