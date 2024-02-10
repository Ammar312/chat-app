import axios from "axios";
import React, { useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/context";

const Signup = () => {
  const inputRef = useRef(null);
  const baseURL = "http://localhost:3000/";
  const { state, dispatch } = useContext(GlobalContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = inputRef.current[0].value;
    const email = inputRef.current[1].value;
    const password = inputRef.current[2].value;

    try {
      const response = await axios.post(`${baseURL}api/signup`, {
        username,
        email,
        password,
      });
      dispatch({
        type: "USER_LOGIN",
        payload: response.data.data,
      });
      console.log(response);
      console.log(state.user);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="bg-blue-200 min-h-screen flex justify-center items-center">
      <div className=" bg-white px-8 pt-10 pb-6 w-[360px]">
        <p className=" text-center font-semibold text-4xl mb-6 text-blue-600">
          Register
        </p>
        <div>
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit}
            ref={inputRef}
          >
            <input
              type="text"
              placeholder="Username"
              className="p-2 border-2 "
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="p-2 border-2 "
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 border-2 "
              required
            />

            {/* <label
              htmlFor="file"
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src={addAvatar} alt="addavatar" className="w-10" />
              <span className=" text-blue-800">Add Your Image</span>
            </label>
            <input type="file" name="" id="file" className="hidden" /> */}
            <button
              type="submit"
              className=" bg-blue-400 text-white p-2 text-lg hover:rounded-md transition-all mt-5"
            >
              Signup
            </button>
          </form>
        </div>
        <div className=" text-center my-4 text-blue-900">
          Already Have Account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
