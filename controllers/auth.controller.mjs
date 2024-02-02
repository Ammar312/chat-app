import { stringToHash, verifyHash } from "bcrypt-inzi";
import Jwt from "jsonwebtoken";
import USER from "../models/signup.mjs";

export const signupController = async (req, res) => {
  if (!req.body.email || !req.body.username || !req.body.password) {
    res.status(403).send({ message: "Required Paramater Missing" });
    return;
  }

  try {
    const result = await USER.findOne({
      email: req.body.email,
    });

    if (!result) {
      const passwordHash = await stringToHash(req.body.password);
      await USER.create({
        username: req.body.username,
        email: req.body.email,
        password: passwordHash,
      });
      res.send({ message: "Signup Successfully" });
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
  if (!req.body.email || !req.body.password) {
    res.status(403).send({ message: "Required Paramater Missing" });
    return;
  }

  const emailInLower = req.body.email.toString().toLowerCase();
  try {
    const result = await USER.findOne({
      email: emailInLower,
    });
    if (!result) {
      res.status(401).send({ message: "Email or Password incorrect" });
      return;
    } else {
      const isMatch = await verifyHash(req.body.password, result.password);
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
