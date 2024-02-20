import axios from "axios";
import React, { useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/context";
import { FaUser } from "react-icons/fa6";

const Signup = () => {
  const inputRef = useRef(null);
  const baseURL = "http://localhost:3000/";
  const { state, dispatch } = useContext(GlobalContext);
  const [img, setImg] = useState(null);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("profileImg", inputRef.current[0].files?.[0]);
    formData.append("username", inputRef.current[1].value);
    formData.append("email", inputRef.current[2].value);
    formData.append("password", inputRef.current[3].value);
    // console.log("profileImg", inputRef.current[3].files[0]);
    // const username = inputRef.current[0].value;
    // const email = inputRef.current[1].value;
    // const password = inputRef.current[2].value;

    try {
      const response = await axios.post(`${baseURL}api/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
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
    <div className="bg-blue-300 min-h-screen flex justify-center items-center">
      <div className=" bg-white px-8 pt-10 pb-6 w-[360px]">
        <p className=" text-center font-semibold text-4xl mb-6 text-blue-600">
          Register
        </p>
        <div>
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            ref={inputRef}
          >
            <div className="flex justify-center">
              <label
                htmlFor="profileImg"
                className=" text-center rounded-full w-[80px] h-[80px] overflow-hidden flex justify-center cursor-pointer"
              >
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-[80px] h-[80px] object-cover rounded-full"
                  />
                ) : (
                  // <i className="bi bi-person text-blue-400 mr-3 text-[40px]  mx-auto"></i>
                  <span className="w-12 h-12 rounded-full bg-gray-300 flex items-end justify-center overflow-hidden">
                    <FaUser className="text-white text-4xl" />
                  </span>
                )}
              </label>
            </div>

            <input
              type="file"
              className="hidden"
              id="profileImg"
              accept="image/*"
              onChange={(e) => {
                const base64Url = URL.createObjectURL(e.target.files[0]);
                setImg(base64Url);
              }}
            />
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
