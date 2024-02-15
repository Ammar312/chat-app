import React, { useContext, useEffect, useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";
import { GlobalContext } from "./context/context";
import { baseURL } from "./core";
import Conversation from "./pages/Conversation";

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

  useEffect(() => {
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
    checkLoginStatus();
  }, []);
  return (
    <BrowserRouter>
      {state.isLogin === true ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path={`conversation/:conversationId`}
            element={<Conversation />}
          />
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
        <div>
          <h1>Loading</h1>
        </div>
      ) : null}
    </BrowserRouter>
  );
};

export default App;
