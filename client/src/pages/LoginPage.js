import React, { useState, useContext } from "react";
import CustomInput from "..//components/CustomInput";
// 로그인 api 요청을 위한 axios 추가
import axios from "axios";
// 로그인후 응답 데이터로 부터 받은 로그인 유저 정보를 전역 스테이트 변수 me에 초기화 하려면
// setMe 함수가 필요
import { AuthContext } from "../context/AuthContext";
// 로그인 성공 메세지 처리를 위한 toast 임포트 추가
import { toast } from "react-toastify";

// 로그인후 페이지 이동
import { useNavigate } from "react-router-dom";


function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // AuthContext 로부터 setMe 만 얻어 오기
  const [_, setMe] = useContext(AuthContext);

  // 페이지 이동용 객체 생성
  const navigate = useNavigate();

  // 로그인 submit 핸들러 => 로그인 api 요청
  const loginHandler = async (e) => {
    // e.preventDefault();
    try {
      e.preventDefault();
      if (username.length < 3 || password.length < 6)
        throw new Error("입력하신 정보가 올바르지 않습니다.");
      const result = await axios.patch("/users/login", { username, password });
      setMe({
        name: result.data.name,
        sessionId: result.data.sessionId,
        userId: result.data.userId
      });
      // 로그인 성공후 페이지 이동 설정
      navigate("/");
      toast.success("로그인 성공");

    } catch (err) {
      // console.error(err);
      // toast.error(err.message);
      console.log("로그인 에러 발생");
      console.log("err : ", err.response.data.message)
      toast.error(err.response.data.message)
    }
  };

  // return <div>Login 페이지</div>;
  // 기본 입력폼 추가
  return (
    <div
      style={{
        marginTop: 200,
        maxWidth: 350,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h3>Login</h3>
      <form onSubmit={loginHandler}>
        <CustomInput label="회원 id" value={username} setValue={setUsername} />
        <CustomInput
          label="비밀번호"
          value={password}
          setValue={setPassword}
          type="password"
        />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

export default LoginPage;
