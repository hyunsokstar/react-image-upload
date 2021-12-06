import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

import { ImageContext } from "../context/ImageContext";
import { useNavigate } from "react-router-dom";

function ImagePage() {
  const { imageId } = useParams();
  const [image, setImage] = useState("");
  const [likeCheck, setLikeCheck] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [me] = useContext(AuthContext);
  const { images, setImages } = useContext(ImageContext);
  const navigate = useNavigate();

  console.log("me : ", me);

  const deleteHandler = async () => {
    try {
      if (!window.confirm("정말 해당 이미지를 삭제하시겠습니까? ")) return;
      const result = await axios.delete(`/images/${imageId}`);
      toast.success(result.data.message);
      setImages(images.filter((image) => image._id !== imageId));
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
    console.log("deleteHandler");
  };

  const likeHandler = async () => {
    console.log("좋아요 핸들러 실행");

    let url = "";

    if (likeCheck === true) {
      url = "/images/" + imageId + "/unlike";
    } else {
      url = "/images/" + imageId + "/like";
    }

    await axios
      .patch(url)
      .then((result) => {
        console.log("result : ", result);

        if (likeCheck === true) {
          toast.success("좋아요 취소 성공");
          setLikeCount((prevState) => prevState - 1);
        } else {
          setLikeCount((prevState) => prevState + 1);
          toast.success("좋아요 성공");
        }

        setLikeCheck(!likeCheck);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axios
      .get(imageId)
      .then((result) => {
        console.log("result : ", result);
        if (me) {
          if (result.data[0].likes.includes(me.userId)) {
            setLikeCheck(true);
            setLikeCount(result.data[0].likes.length);
            console.log("실행 확인 11");
          } else {
            console.log("실행 확인 22");
            setLikeCount(result.data[0].likes.length);
            setLikeCheck(false);
          }
        } else {
          setLikeCheck(false);
        }
        setImage(result.data[0]);
      })
      .catch((err) => console.error(err));
  }, [me, imageId]);

  if (!image) return <h3> Loading...</h3>;
  return (
    <div sytle={{ marginLeft: "auto", marginRight: "auto" }}>
      <h3> Image Page - {imageId}</h3>
      <img
        alt={imageId}
        // src={`http://localhost:5000/uploads/${image.key}`}
        src={`https://ohs-image-upload.s3.ap-northeast-2.amazonaws.com/raw/${image.key}`}
        style={{ width: "70%", height: "70%" }}
      />
      <div style={{ width: "70%" }}>
        <span style={{ float: "left" }}>좋아요{likeCount}</span>
        <button style={{ float: "right" }} onClick={likeHandler}>
          {likeCheck ? "좋아요 취소" : "좋아요"}
        </button>

        <button
          style={{ float: "right", marginLeft: 10 }}
          onClick={deleteHandler}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default ImagePage;
