import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";


function ToolBar() {
  const [me, setMe] = useContext(AuthContext);

  const logoutHandler = async () => {
    try {
      await axios.patch(
        "/users/logout",
      );
      setMe();
      toast.success("로그 아웃");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div>
      <Link to="/">
        <span>home</span>
      </Link>

      {me ? (
        // <span style={{ float: "right" }}>로그아웃</span>
        <span onClick={logoutHandler} style={{ float: "right" }}>
          로그아웃
        </span>
      ) : (
        <div>
          <Link to="/auth/login">
            <span style={{ float: "right" }}>로그인</span>
          </Link>
          <Link to="/auth/register">
            <span style={{ float: "right", marginRight: 15 }}>회원가입</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default ToolBar;
