import mongoose from "mongoose";

const Connection = () => {
  const URL =
    "mongodb+srv://Uninotes:dowahjdiuwahdiuh821y3e8qhwsidha@uninotes.f0rahbp.mongodb.net/";

  mongoose
    .connect(URL)
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("Error while connecting with databse", err);
    });
};

export default Connection;
