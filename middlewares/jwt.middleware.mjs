import Jwt from "jsonwebtoken";
const jwtMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  try {
    const decoded = Jwt.verify(token, process.env.SECRET);

    req.body.decoded = {
      username: decoded.username,
      email: decoded.email,
      _id: decoded._id,
    };

    req.currentUser = {
      username: decoded.username,
      email: decoded.email,
      _id: decoded._id,
    };
    next();
  } catch (error) {
    console.log("errorabc", error);
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
};
export default jwtMiddleware;
