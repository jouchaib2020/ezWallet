import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app, port } from './app.js';

dotenv.config();
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app.listen(port, () => {
      console.log(`app listening on port ${port}!`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();