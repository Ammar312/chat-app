import React, { useContext, useEffect, useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";
import { GlobalContext } from "./context/context";
import { baseURL } from "./core";
import Conversation from "./pages/Conversation";
import { TailSpin } from "react-loader-spinner";
import Profile from "./pages/Profile";

const App = () => {
  const { state, dispatch } = useContext(GlobalContext);
  // const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    axios.interceptors.request.use(
      function (config) {
        // Do something before request is sent
        config.withCredentials = true;
        return config;
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error);
      }
    );
  });
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get(`${baseURL}api/profile`, {
        withCredentials: true,
      });
      dispatch({
        type: "USER_LOGIN",
        payload: response.data.data,
      });
    } catch (error) {
      console.log(error);
      dispatch({
        type: "USER_LOGOUT",
      });
    }
  };
  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <BrowserRouter>
      {state.isLogin === true ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={`conversation`} element={<Conversation />} />
          <Route path={`myprofile`} element={<Profile />} />
          {/* <Route path="conversation" element={<Conversation />} /> */}
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      ) : null}
      {state.isLogin === false ? (
        <Routes>
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace={true} />} />
        </Routes>
      ) : null}

      {state.isLogin === null ? (
        <div className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
          <TailSpin
            visible={true}
            height="80"
            width="80"
            color="#48cae4"
            ariaLabel="tail-spin-loading"
            radius="4"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : null}
    </BrowserRouter>
  );
};

export default App;
