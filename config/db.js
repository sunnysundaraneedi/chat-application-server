import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const connection = await mongoose.connect(process.env.CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(connection.connection.host);
  } catch (error) {
    console.log("Error : ", error.message);
    process.exit();
  }
};
