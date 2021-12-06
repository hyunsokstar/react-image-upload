const { Router } = require("express");
const imageRouter = Router();
const Image = require("../models/Image");
const { upload } = require("../middleware/imageUpload");
const fs = require("fs");
const { promisify } = require("util"); // 유틸에서 promisify  함수를 가져와서
const fileUnlink = promisify(fs.unlink); // fs.unlink 함수를 promise 함수로 만든다.
const mongoose = require("mongoose");

// 추가
const { s3, getSignedUrl } = require("../aws");
const { v4: uuid } = require("uuid");
const mime = require("mime-types");

imageRouter.post("/", upload.array("image", 5), async (req, res) => {
  try {
    console.log("파일 업로드 요청 받음");
    if (!req.user) throw new Error("권한이 없습니다");
    const { images, public } = req.body;
    console.log("images : ", images);
    console.log("public : ", public);

    const imageDocs = await Promise.all(
      images.map(
        (image) =>
          new Image({
            user: {
              _id: req.user.id,
              name: req.user.name,
              username: req.user.username,
            },
            public,
            key: image.imageKey,
            originalFileName: image.originalname,
          }).save()
      )
    );


    res.json(imageDocs);

  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

imageRouter.post("/presigned", async (req, res) => {
  try {
    if (!req.user) throw new Error("권한이 없습니다");
    const { contentTypes } = req.body;
    if (!Array.isArray(contentTypes)) throw new Error("invalid content Types"); // req.body.contentTypes 가 배열이 아니면 에러 발생

    const presignedData = await Promise.all(
      contentTypes.map(async (contentType) => {
        const imageKey = `${uuid()}.${mime.extension(contentType)}`;
        const key = `raw/${imageKey}`;

        const presigned = await getSignedUrl({ key });
        return { imageKey, presigned };
      })
    );
    console.log("presignedData : ", presignedData);

    res.json(presignedData);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

// public 이미지들만 제공하도록 설정
imageRouter.get("/", async (req, res) => {
  console.log("imagelist router 라우터 실행!!");

  const { lastid } = req.query;
  console.log("lastid : ", lastid);
  if (lastid && !mongoose.isValidObjectId(lastid))
    throw new Error("invalid lastid");

  const images = await Image.find(
    lastid ? { public: true, _id: { $lt: lastid } } : { public: true }
  )
    .sort({ _id: -1 })
    .limit(4);

  console.log("images : ", images);

  res.json(images);
});

// imageRouter.post("/", upload.single("image"), async (req, res) => {
// imageRouter.post("/", upload.array("image", 5), async (req, res) => {
//   try {
//     console.log("파일 업로드 요청 받음");
//     if (!req.user) throw new Error("권한이 없습니다");
//     console.log("req.files 1234: ", req.files);
//     console.log("req.body 1234: ", req.body);
//     // res.json("ok");

//     const images = await Promise.all(
//       req.files.map(async (file) => {
//         const image = await new Image({
//           user: {
//             _id: req.user.id,
//             name: req.user.name,
//             username: req.user.username,
//           },
//           public: req.body.public,
//           // key: file.filename,
//           key: file.key.replace("raw/", ""),
//           originalFileName: file.originalname,
//         }).save();
//         return image;
//       })
//     );
//     res.json(images);
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: err.message });
//   }
// });

imageRouter.get("/:imageId", async (req, res) => {
  console.log("개별 이미지 데이터 요청 받음");
  const image = await Image.find({ _id: req.params.imageId });
  res.json(image);
});

// 이미지 삭제 요청에 대한 라우터 로직 추가
imageRouter.delete("/:imageId", async (req, res) => {
  // 유저 권한 확인 하기
  // 사진 삭제
  try {
    if (!req.user) throw new Error("권한이 없습니다");

    // 이미지 아이디 유효성 검사
    if (!mongoose.isValidObjectId(req.params.imageId))
      throw new Error("올바르지 않은 이미지 id입니다");

    // 이미지 아이디로 검색해서 삭제
    const image = await Image.findOneAndDelete({ _id: req.params.imageId });

    // await fileUnlink(`./uploads/${image.key}`);
    s3.deleteObject(
      { Bucket: "ohs-image-upload", Key: `raw/${image.key}` },
      (error) => {
        if (error) throw error;
      }
    );
    res.json({ message: "요청하신 이미지가 삭제 되었습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ mesage: err.message });
  }
});

imageRouter.patch("/:imageId/like", async (req, res) => {
  console.log("좋아요 실행");
  console.log("imageId : ", req.params.imageId);
  try {
    if (!req.user) throw new Error("권한이 없습니다");
    if (!mongoose.isValidObjectId(req.params.imageId)) {
      throw new Error("올바르지 않은 이미지 id 입니다");
    }
    const image = await Image.findOneAndUpdate(
      { _id: req.params.imageId },
      { $addToSet: { likes: req.user.id } },
      { new: true }
    );
    console.log("image : ", image);

    if (image === "" || image === null) {
      console.log("이미지가 없습니다");
      throw new Error("존재하지 않는 image 입니다");
    }

    res.json(image);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

imageRouter.patch("/:imageId/unlike", async (req, res) => {
  console.log("좋아요 취소 실행");
  console.log("imageId : ", req.params.imageId);

  try {
    if (!req.user) throw new Error("권한이 없습니다");
    if (!mongoose.isValidObjectId(req.params.imageId)) {
      throw new Error("올바르지 않은 이미지 id 입니다");
    }
    const image = await Image.findOneAndUpdate(
      { _id: req.params.imageId },
      { $pull: { likes: req.user.id } },
      { new: true }
    );
    res.json(image);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = { imageRouter };
