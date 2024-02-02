import mongoose from "mongoose";

const connectMongoDB = async (uri) => {
  // return mongoose.connect(uri) // Simple method for connection
  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.log("MongoDB error", error);
  }
};

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Successfully connected to database");
});
connection.on("error", (error) => {
  console.error("Database Connection Error:", error);
});
export default connectMongoDB;
