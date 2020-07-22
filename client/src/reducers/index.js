import alert from "./alert";
import auth from "./auth";
import profile from "./profile";

const { combineReducers } = require("redux");

export default combineReducers({ alert, auth, profile });
