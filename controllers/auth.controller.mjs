import { stringToHash, verifyHash } from "bcrypt-inzi";
import Jwt from "jsonwebtoken";
import USER from "../models/user.mjs";
import responseFunc from "../utilis/response.mjs";
import { uploadCloudinary } from "../utilis/cloudinary.mjs";

export const signupController = async (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !username || !password) {
    res.status(403).send({ message: "Required Paramater Missing" });
    return;
  }
  username.trim();
  email.trim();
  password.trim();
  try {
    const result = await USER.findOne({
      email,
    });

    if (!result) {
      const file = req.file;
      if (file.size > 2000000) {
        // size bytes, limit of 2MB
        res
          .status(403)
          .send({ message: "File size limit exceed, max limit 2MB" });
        return;
      }

      const img = await uploadCloudinary(file.path);
      const passwordHash = await stringToHash(password);
      const user = await USER.create({
        username,
        email,
        password: passwordHash,
        imgUrl: img?.secure_url,
        imgPublicId: img?.public_id,
      });
      const token = Jwt.sign(
        {
          username: user.username,
          email: user.email,
          _id: user._id,
        },
        process.env.SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token, { httpOnly: true, secure: true });
      console.log(user);
      res.send({
        message: "Signup Successfully",
        data: {
          username: user.username,
          email: user.email,
          _id: user._id,
          imgUrl: user.imgUrl,
          imgPublicId: user.imgPublicId,
        },
      });
    } else {
      res.status(403).send({
        message: "User already exist with this email",
      });
    }
  } catch (error) {
    console.log("signup error", error);
    res.status(500).send({ message: "Server Error, Please try later" });
  }
};
export const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403).send({ message: "Required Paramater Missing" });
    return;
  }

  const emailInLower = email.toString().toLowerCase().trim();
  password.trim();
  try {
    const result = await USER.findOne({
      email: emailInLower,
    });
    if (!result) {
      res.status(401).send({ message: "Email or Password incorrect" });
      return;
    } else {
      const isMatch = await verifyHash(password, result.password);
      if (isMatch) {
        const token = Jwt.sign(
          {
            username: result.username,
            email: result.email,
            _id: result._id,
          },
          process.env.SECRET,
          {
            expiresIn: "1h",
          }
        );
        res.cookie("token", token, { httpOnly: true, secure: true });
        res.send({
          message: "Login Successfully",
          data: {
            username: result.username,
            email: result.email,
            _id: result._id,
            imgUrl: result.imgUrl,
            imgPublicId: result.imgPublicId,
          },
        });
        return;
      } else {
        res.status(401).send({ message: "Email or Password incorrect" });
      }
    }
  } catch (error) {
    console.log("error getting data mongodb: ", error);
    res.status(500).send({ message: "server error, please try later" });
  }
};

export const logoutController = (req, res) => {
  res.clearCookie("token");
  res.send({
    message: "Logout Successfully",
  });
};

export const getProfile = async (req, res) => {
  const { _id } = req.currentUser;
  try {
    const result = await USER.findOne({
      _id,
    });
    responseFunc(res, 200, "Profile Fetched", {
      username: result.username,
      email: result.email,
      _id: result._id,
      imgUrl:result.imgUrl,
      imgPublicId:result.imgPublicId
    });
  } catch (error) {
    console.log("profileFetchedError", error);
  }
};
