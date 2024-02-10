import axios from "axios";
import React, { useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/context";

const Login = () => {
  const inputRef = useRef(null);
  const baseURL = "http://localhost:3000/";
  const navigate = useNavigate();
  const { state, dispatch } = useContext(GlobalContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = inputRef.current[0].value;
    const password = inputRef.current[1].value;

    try {
      const response = await axios.post(
        `${baseURL}api/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      console.log(response);
      dispatch({
        type: "USER_LOGIN",
        payload: response.data.data,
      });
    } catch (error) {}
  };
  return (
    <div className="bg-blue-200 min-h-screen flex justify-center items-center">
      <div className=" bg-white px-8 pt-10 pb-6 w-[360px]">
        <p className=" text-center font-semibold text-4xl mb-6 text-blue-600">
          Login
        </p>
        <div>
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            ref={inputRef}
          >
            <input
              type="email"
              placeholder="abc@gmail.com"
              className="p-3 border-2 "
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 border-2 "
            />

            <button
              type="submit"
              className=" bg-blue-400 text-white p-2 text-lg hover:rounded-md transition-all mt-5"
            >
              Login
            </button>
          </form>
        </div>
        <div className=" text-center my-4 text-blue-900">
          Don't Have Account? <Link to="/signup">Signup</Link>
        </div>
        <div>{JSON.stringify(state)}</div>
      </div>
    </div>
  );
};

export default Login;
