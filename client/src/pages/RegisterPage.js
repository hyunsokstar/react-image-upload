import React, { useState, useContext } from "react";
import CustomInput from "../components/CustomInput";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
// import { useHistory } from 'react-router-dom'
import { useNavigate  } from "react-router-dom";


function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [me, setMe] = useContext(AuthContext);
  // const history = useHistory()
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (username.length < 3)
        throw new Error("회원 Id가 너무 짧아요 3자 이상으로 해주세요");
      if (password.length < 6)
        throw new Error("비밀번호가 너무 짧아요 6자 이상으로 해주세요");
      if (password !== passwordCheck)
        throw new Error("비밀번호가 달라요 확인해주세요");
      console.log({ name, username, password, passwordCheck });

      const result = await axios.post("/users/register", {
        name,
        username,
        password,
      });

      setMe({
        sessionId: result.data.sessionId,
        name: result.data.name,
      });

      console.log("result : ", { result });
      console.log("result.data : ", result.data);
      toast.success("회원 가입 성공");

      // history.push('/')
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }

    console.log({ name, username, password, passwordCheck });
  };

  return (
    <div
      style={{
        margintOP: 100,
        maxWidth: 350,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h3>회원 가입</h3>
      <form onSubmit={submitHandler}>
        <CustomInput label="이름" value={name} setValue={setName} />
        <CustomInput label="회원ID" value={username} setValue={setUsername} />
        <CustomInput
          label="비밀번호"
          value={password}
          type="password"
          setValue={setPassword}
        />
        <CustomInput
          label="비밀번호 확인2"
          value={passwordCheck}
          type="password"
          setValue={setPasswordCheck}
        />
        <button type="submit">회원 가입</button>
      </form>
    </div>
  );
}

export default RegisterPage;
