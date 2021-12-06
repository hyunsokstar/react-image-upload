import React, { useState, useContext, useEffect, useRef } from "react";
import { ImageContext } from "../context/ImageContext.js";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./ImageList.css";
import { toast } from "react-toastify";

function ImageList() {
  const elementRef = useRef(null);

  const {
    images,
    isPublic,
    setIsPublic,
    loadMoreImages,
    imageLoading,
    addedNewImageId,
  } = useContext(ImageContext);
  const [me] = useContext(AuthContext);

  console.log("me : ", me);

  useEffect(() => {
    // setTimeout(() => {
    //   console.log("last image element", elementRef.current);
    // }, 1000);

    if (!elementRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      // console.log("intersection", entry.isIntersecting);
      if (entry.isIntersecting) {
        //  setOccuredId(images[images.length-1]._id)
        setTimeout(() => {
          loadMoreImages();
        }, 1500);
      }
    });
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [loadMoreImages]);

  const imgList = images.map((image, index) => (
    <Link
      key={image.key}
      to={`/images/${image._id}`}
      ref={index + 1 === images.length ? elementRef : undefined}
    >
      <img
        // key={image.key}
        // src={`http://localhost:5000/uploads/${image.key}`}
        src={`https://ohs-image-upload.s3.ap-northeast-2.amazonaws.com/raw/${image.key}`}
        alt="noimage"
        style={
          index + 1 === images.length || addedNewImageId === image._id
            ? { border: "2px solid red" }
            : {}
        }
      />
    </Link>
  ));

  return (
    <div>
      <br />
      {me !== undefined ? me.name +'의 이미지 리스트' : "이미지 리스트(전체)"}

      <div>
        <br />
        {imgList.length > 0 ? (
          <div className="image-list-container">{imgList}</div>
        ) : (
          <p>{imageLoading ? "이미지 로딩중" : "이미지가 없습니다"}</p>
        )}
      </div>
      {!imageLoading ? (
        <button
          type="button"
          onClick={loadMoreImages}
          style={{ width: "100%", marginTop: "4px" }}
        >
          load more (현재 이미지 개수: {images.length})
        </button>
      ) : (
        ""
      )}
    </div>
  );
}

export default ImageList;
