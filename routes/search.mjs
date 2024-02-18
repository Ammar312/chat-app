import express from "express";
import USER from "../models/user.mjs";
import responseFunc from "../utilis/response.mjs";
const router = express.Router();

router.get("/search", async (req, res) => {
  let search = req.query.search;
  try {
    // const result = await USER.aggregate([
    //   {
    //     $search: {
    //       index: "text",
    //       text: {
    //         query: search,
    //         path: ["username", "email"],
    //         // fuzzy: {},
    //       },
    //     },
    //   },
    // ]).exec();

    const result = await USER.find({
      username: { $regex: `${search}`, $options: "i" },
    }).exec();
    console.log(result);
    if (result.length) {
      responseFunc(res, 200, "User fetched", result);
    } else {
      res.send("No user found");
    }
  } catch (error) {
    console.log(error);
    res.send("Error In Fetching User");
  }
});

router.get("/allusers", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  try {
    const allusers = await USER.find({}, { _id: 1, username: 1, email: 1 })
      .skip(skip)
      .limit(pageSize);
    res.send(allusers);
  } catch (error) {
    console.log(error);
    res.send({ message: "Error in getting users" });
  }
});

export default router;
