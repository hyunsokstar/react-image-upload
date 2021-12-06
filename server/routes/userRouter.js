const { Router } = require("express");
const userRouter = Router();
const User = require("../models/User");
const { hash, compare } = require("bcryptjs");
const Image = require("../models/Image");
const mongoose = require("mongoose");

userRouter.post("/register", async (req, res) => {
  try {
    if (req.body.password.length < 6) {
      throw new Error("비밀 번호를 6자 이상으로 해주세요");
    }

    const hashedPassword = await hash(req.body.password, 10);

    const user = await new User({
      name: req.body.name,
      username: req.body.username,
      hashedPassword,
      sessions: [{ createdAt: new Date() }],
    }).save();

    const session = user.sessions[0];

    res.json({
      message: "user registered",
      sessionId: session._id,
      name: user.name,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.patch("/login", async (req, res) => {
  console.log("로그인 요청 받음");

  try {
    const user = await User.findOne({ username: req.body.username });
    console.log("user : ", user);
    if (!user) throw new Error("가입되지 않은 이메일입니다");
    const isValid = await compare(req.body.password, user.hashedPassword);
    if (!isValid) throw new Error("입력하신 정보가 올바르지 않습니다");
    // 로그인 상태에 대한 세션 데이터 추가 하기[배열에 객체 요소를 추가(로그인 시점을 알수 있도록 함)]
    user.sessions.push({ createdAt: new Date() });
    // 배열의 마지막 요소를 변수에 담음 응답 데이터에 필요하므로 설정
    const session = user.sessions[user.sessions.length - 1];
    await user.save();

    res.json({
      message: "user validated",
      sessionId: session._id,
      name: user.name,
      userId: user._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.patch("/logout", async (req, res) => {
  console.log("로그 아웃 요청 받음");
  try {
    console.log(req.user);

    if (req.user == undefined) {
      console.log("req.user == undefiend 입니다 로그인 상태가 아닙니다.");
    }

    if (!req.user) throw new Error("invalid sessionid");

    await User.updateOne(
      { _id: req.user.id },
      { $pull: { sessions: { _id: req.headers.sessionid } } }
    );

    res.json({ message: "user is logeged out" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/me", (req, res) => {
  try {
    if (!req.user) throw new Error("권한이 없습니다.");
    res.json({
      message: "success",
      sessionId: req.headers.sessionid,
      name: req.user.name,
      userId: req.user._id,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

// 로그인 유저 이미지만 요청할 경우
userRouter.get("/me/images", async (req, res) => {
  console.log("내 이미지 리스트 호출 확인");
  const { lastid } = req.query;
  if (lastid && !mongoose.isValidObjectId(lastid))
    throw new Error("invalid lastid");

  console.log("req.user : ", req.user);

  try {
    if (!req.user) throw new Error("권한이 없습니다.");

    const images = await Image.find(
      lastid ? { public: true, _id: { $lt: lastid } } : { public: true }
    )
      .sort({ _id: -1 })
      .limit(4);

    console.log("images : ", images.length);

    const imagesLength = await Image.find({ user_id: req.user._id });

    console.log(imagesLength.length);

    res.json(images);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

// 로그인 유저 이미지만 요청할 경우
userRouter.get("/me/images/nopublic", async (req, res) => {
  try {
    if (!req.user) throw new Error("권한이 없습니다.");
    const images = await Image.find({ "user._id": req.user.id, public: false });
    res.json(images);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = { userRouter };
