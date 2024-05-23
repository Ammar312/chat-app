import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { GlobalContext } from "../context/context";
import { FaUser } from "react-icons/fa6";
import { FaCamera } from "react-icons/fa";
import { useRef } from "react";
import { IoPersonSharp } from "react-icons/io5";
import { HiPencil } from "react-icons/hi";
import axios from "axios";
import { baseURL } from "../core";

const Profile = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [img, setImg] = useState(null);
  const[isLoading,setIsLoading] = useState(false)
  const imgRef = useRef()
  const updateAvatar = async () => {
    const formData = new FormData();
    // console.log(imgRef.current.files[0])
    formData.append("profileImg", imgRef.current.files[0]);
    try {
      const response = await axios.post(`${baseURL}api/profile/updateAvatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log(response.data)
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="">
      <div className="flex items-center bg-gray-600 py-2 gap-2 px-2">
        <Link to={`/`}><IoMdArrowRoundBack className="text-5xl font-semibold text-white" /></Link>
        <p className="text-[44px] text-white font-bold tracking-wide">Profile</p>
      </div>
      <div className="border-2 mx-auto flex justify-between items-center flex-col z-0 mt-3 p-2">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-end justify-center relative shadow-md">
          {img || state.user.imgUrl ? (
            <img
              src={img || state.user.imgUrl}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <FaUser className="text-white text-[95px]" />
          )
          }
          <label htmlFor="profileImg" className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden absolute -right-[9px] bottom-[1px] z-50 hover:cursor-pointer"><FaCamera className="text-[20px] text-white" /></label>
        </div>
        <input
          type="file"
          className="hidden"
          id="profileImg"
          ref={imgRef}
          accept="image/*"
          onChange={(e) => {
            const base64Url = URL.createObjectURL(e.target.files[0]);
            setImg(base64Url);
          }}
        />
        {img && (<button className="border border-gray-600 text-gray-600 p-2 text-lg hover:cursor-pointer" onClick={updateAvatar}>
          Upload Profile
        </button>)}
        <div className="flex items-center border w-96 my-4">
          <div className="p-2"><IoPersonSharp className="text-gray-400 text-4xl" /></div>
          <div className="flex flex-col flex-grow px-4">
            <span className="font-medium text-lg text-gray-500">Name</span>
            <span className="font-semibold text-5xl text-gray-600 first-letter:capitalize ">{state.user.username}</span>
          </div>
          <div className="text-gray-600 text-[35px]  "><HiPencil /></div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
