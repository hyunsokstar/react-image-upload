import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import "./UploadForm.css";
import { ImageContext } from "../context/ImageContext";

const makeImagePreViewArray = async (imageFiles) => {
  const imagePreviews = await Promise.all(
    [...imageFiles].map((imageFile) => {
      return new Promise((resolve, reject) => {
        try {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(imageFile);
          fileReader.onload = (e) =>
            resolve({ imgSrc: e.target.result, fileName: imageFile.name });
        } catch (err) {
          reject(err);
        }
      });
    })
  );
  return imagePreviews;
};

function UploadForm() {
  const imageSelecterInputRef = useRef(null);

  const {
    images,
    setImages,
    isPublic,
    setIsPublic,
    addedNewImageId,
    setAddedNeewImageId,
  } = useContext(ImageContext);
  const [percent, setPercent] = useState([]);
  const [files, setFiles] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [fileNamesToUpload, setFileNamesToUpload] = useState([]);

  const showFileNamesToUpload = (imageFiles) => {
    const imageFilesArray = [...imageFiles];
    console.log("imageFilesArray : ", imageFilesArray);
    const fileNamesForPreview = imageFilesArray.map((file) => {
      return file.name;
    });
    console.log("setFileNamesToUpload : ", setFileNamesToUpload);
    setFileNamesToUpload(fileNamesForPreview);
  };

  const imageSelectHandler = async (event) => {
    const imageFiles = event.target.files;
    setFiles(imageFiles);

    const imagePreviews = await makeImagePreViewArray(imageFiles);
    setPreviews(imagePreviews);
    showFileNamesToUpload(imageFiles);
  };

  let previewImages = [];
  previewImages = previews.map((preview, index) => {
    return (
      // 33 프로그래스바 추가
      <div style={{ display: "flex", flexWrap: "wrap", width: "49%" }}>
        {previews.length > 0 ? <ProgressBar percent={percent[index]} /> : ""}
        <img key={index} src={preview.imgSrc} alt="" />
      </div>
    );
  });

  const fileName =
    previews.length === 0
      ? "이미지 업로드해주세요"
      : previews.length > 0 &&
        previews.map((image) => {
          return (
            <>
              <div style={{ width: "40%", border: "0px solid red" }}>
                {image.fileName}{" "}
              </div>
            </>
          );
        });

  const onSubmitV2 = async (e) => {
    e.preventDefault();
    const contentTypesArray = [...files].map((file) => file.type);

    try {
      const presignedData = await axios.post("/images/presigned", {
        contentTypes: contentTypesArray,
      });
      console.log("presignedData : ", presignedData);

      const result = await Promise.all(
        [...files].map((file, index) => {
          const { presigned } = presignedData.data[index];

          console.log("presigned : ", presigned);
          console.log("presigned.fields : ", presigned.fields);

          const formData = new FormData();
          for (const key in presigned.fields) {
            console.log("key : ", key);
            formData.append(key, presigned.fields[key]);
          }
          formData.append("Content-Type", file.type);
          formData.append("file", file);

          // return axios.post(presigned.url, formData);
          // 11 axios 이벤트로부터 progressbar 출력 설정 하기
          return axios.post(presigned.url, formData, {
            onUploadProgress: (e) => {
              console.log("e.loaded : ", e.loaded);
              // setPercent(Math.round((100 * e.loaded) / e.total));
              setPercent((prevData) => {
                const newData = [...prevData];
                newData[index] = Math.round((100 * e.loaded) / e.total);
                return newData;
              });
            },
          });
        })
      );

      const res = await axios.post("/images", {
        images: [...files].map((file, index) => ({
          imageKey: presignedData.data[index].imageKey,
          originalname: file.name,
        })),
        public: isPublic,
      });

      setImages((prevData) => [...res.data, ...prevData]);

      toast.success("이미지 업로드 성공");
      setTimeout(() => {
        setPercent(0);
        setFileNamesToUpload([]);
        setPreviews([]);
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  };

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("submit 함수 실행 check");
  //   const formData = new FormData();
  //   formData.append("image", files);

  //   if (files != null) {
  //     console.log("files : ", files);
  //     for (let file of files) {
  //       formData.append("image", file);
  //     }
  //   } else {
  //     alert("파일을 선택해 주세요");
  //     return;
  //   }

  //   formData.append("public", isPublic);

  //   try {
  //     const res = await axios.post("/images", formData, {
  //       headers: { "Content-Type": "multi/form-data" },

  //       onUploadProgress: (e) => {
  //         setPercent(Math.round((100 * e.loaded) / e.total));
  //       },
  //     });
  //     console.log("res.data : ", res.data[res.data.length - 1]._id);

  //     setImages([...res.data, ...images]);
  //     setAddedNeewImageId(res.data[0]._id);

  //     toast.success("success!!");

  //     setTimeout(() => {
  //       setPercent(0);
  //       imageSelecterInputRef.current.value = "";
  //       setPreviews([]);
  //       setFileNamesToUpload([]);
  //     }, 3000);
  //   } catch (err) {
  //     // toast.error("fail!");
  //     console.log("이미지 업로드 에러 발생: ", err);
  //     // console.log("err : ", err.response.data.message);
  //     // toast.error(err.response.data.message);
  //     // setImgSrc(null);
  //   }
  // };

  return (
    <div>
      <div>
        <div className="imagePreviewCss">{previewImages}</div>
      </div>

      {/* 22 주석 처리 */}
      {/* {previews.length > 0 ? <ProgressBar percent={percent} /> : ""} */}

      {/* <form onSubmit={onSubmit}> */}
      <form onSubmit={onSubmitV2}>
        <div className="file-dropper">
          {fileNamesToUpload.length !== 0
            ? fileNamesToUpload.map((file) => {
                console.log("file : ", file);
                return (
                  <div className="fileNamesToUpload" style={{ width: "44%" }}>
                    {file}{" "}
                  </div>
                );
              })
            : "업로드할 파일을 선택해 주세요"}
          <input
            ref={(ref) => {
              imageSelecterInputRef.current = ref;
            }}
            id="image"
            type="file"
            onChange={imageSelectHandler}
            multiple
          />
        </div>

        <label htmlFor="public-check">비공개</label>
        <input
          type="checkbox"
          id="public-check"
          value={!isPublic}
          onChange={() => setIsPublic(!isPublic)}
        />
        {String(isPublic)}

        <button
          type="submit"
          style={{
            width: "100%",
            height: 40,
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          제출
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
