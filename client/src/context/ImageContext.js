import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export const ImageContext = createContext();

export const ImageProvider = (prop) => {
  const [images, setImages] = useState([]);
  const [me] = useContext(AuthContext);
  const [isPublic, setIsPublic] = useState(true); // from src\components\ImageList.js
  const [imageUrl, setImageUrl] = useState("/images");
  const [lastImgId, setLastImgId] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [addedNewImageId, setAddedNeewImageId] = useState(0);

  let lastImageId = images.length > 0 ? images[images.length - 1]._id : null;

  const loadMoreImagesForNotLoginUser = async () => {
    console.log("추가 이미지 for not loing user !!");

    const imageId = images[images.length - 1]._id;
    // console.log("imageId : ", imageId);

    axios
      .get(`images?lastid=${imageId}`)
      .then((result) => {
        if (result.data.length === 0) {
          console.log("result.data.length 11: ", result.data.length);
          return;
        } else {
          console.log("result.data.length 22: ", result.data.length);
        }
        setImages((prevData) => [...prevData, ...result.data]);
        setImageLoading(false);
      })
      .catch((err) => console.error(err));
  };

  const loadMoreImagesForLoginUser = async () => {
    console.log("추가 이미지 for loing user");
    const imageId = images[images.length - 1]._id;

    axios
      .get(`users/me/images?lastid=${imageId}`)
      .then((result) => {
        if (result.data.length === 0) {
          console.log("result.data.length 11: ", result.data.length);
          return;
        } else {
          console.log("result.data.length 22: ", result.data.length);
        }
        setImages((prevData) => [...prevData, ...result.data]);
        setImageLoading(false);
      })
      .catch((err) => console.error(err));
  };

  const loadMoreImages = () => {
    // console.log("me : ", me);
    if (me === undefined) {
      console.log("이미지 추가 ");
      loadMoreImagesForNotLoginUser();
    } else {
      loadMoreImagesForLoginUser();
    }
  };

  const loadMyImages = () => {
    console.log("loadMyImages 실행");
    // setImages([])
      axios
        .get(`users/me/images`)
        .then((result) => {
          const imagesLength = result.data.length;
          console.log("imagesLength : ", imagesLength);
          if (imagesLength !== 0) {
            console.log("result.data : ", result.data);
            setLastImgId(result.data[imagesLength - 1]._id);
          }
          setImages((prevData) => [...prevData, ...result.data]);
          setImageLoading(false);
        })
        .catch((err) => console.error(err));
  };

  const loadImages = () => {
    console.log("전체 이미지 불러 오기 !!");
      axios
      .get("images/")
      .then((result) => {
        const imagesLength = result.data.length;
        console.log("imagesLength : ", imagesLength);
        if (imagesLength !== 0) {
          // console.log("result.data : ", result.data);
          setLastImgId(result.data[imagesLength - 1]._id);
        }
        setImages((prevData) => [...prevData, ...result.data]);
        setImageLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {

      if (me === undefined) {
        console.log("me : ", me);
        loadImages();
      } else {
        loadMyImages();
      }

  }, []);

  return (
    <ImageContext.Provider
      value={{
        images,
        setImages,
        isPublic,
        setIsPublic,
        loadMoreImages,
        lastImgId,
        imageLoading,
        addedNewImageId,
        setAddedNeewImageId,
      }}
    >
      {prop.children}
    </ImageContext.Provider>
  );
};
