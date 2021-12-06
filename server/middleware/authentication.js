const mongoose = require("mongoose");
const User = require("../models/User");


const authenticate = async (req, res, next) => {

  // 요청 헤더에서 sessionid 얻어 오기
  const { sessionid } = req.headers;
  // 세션 정보가 없거나 잘못된 형식일 경우: next() => 다음 코드로 진행
  if (!sessionid || !mongoose.isValidObjectId(sessionid)) {
    return next();
  }

  // 세션 정보에 해당하는 유저 정보가 존재할 경우 즉 로그인 상태일 경우: req.user에 로그인 유저 정보 설정
  const user = await User.findOne({ "sessions._id": sessionid });
  console.log("user (세션으로 검색한 유저 정보): ", user);
  if (!user) {
    return next();
  }
  req.user = user;

  return next();
};

module.exports = { authenticate };
