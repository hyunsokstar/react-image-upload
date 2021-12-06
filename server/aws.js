const aws = require("aws-sdk");
// const { AWS_ACCESS_KEY, AWS_SECRET_KEY } = process.env;
require("dotenv").config();
// console.log("process.env.AWS_ACCESS_KEY : ", process.env.AWS_ACCESS_KEY);
// console.log("process.env.AWS_SECRET_KEY : ", process.env.AWS_SECRET_KEY);

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: "ap-northeast-2",
});

// new Promise((resolve, reject) => {..} 를 적용한 이유 ? 아래처럼 호출할수 있도록 하기 위해
// getSignedUrl({key}).then(result => console.log(result)).catch(err => console.log(err))

const getSignedUrl = ({ key }) => {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(
      {
        Bucket: "ohs-image-upload",
        Fields: {
          key,
        },
        Expires: 300, // 유효 기간 300초
        Conditions: [
          ["content-length-range", 0, 50 * 1000 * 1000], // 콘텐츠 범위
          ["starts-with", "$Content-Type", "image/"], // 이미지만
        ],
      },
      (err, data) => {
        if (err) {
          throw reject(err);
        } else {
          resolve(data); // 아마존 s3에 직접 post 하기 위한 데이터를 리턴
        }
      }
    );
  });
};

module.exports = { s3, getSignedUrl };
