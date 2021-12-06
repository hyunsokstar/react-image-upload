import React, { useContext } from "react";
import UploadForm from "../components/UploadForm";
import ImageList from "../components/ImageList";
import { AuthContext } from "../context/AuthContext";


function MainPage() {
  const [me] = useContext(AuthContext);

  return (
    <div>
      {/* <h2>사진첩</h2> */}
      {/* <UploadForm /> */}
      {me && <UploadForm />}
      <ImageList />
    </div>
  );
}

export default MainPage;
