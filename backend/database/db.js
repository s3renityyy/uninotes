import mongoose from "mongoose";

const Connection = () => {
  mongoose.connect(process.env.MONGODP_URL);
};

export default Connection;
