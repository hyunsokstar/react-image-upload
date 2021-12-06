const express = require("express");
const mongoose = require("mongoose");
const { imageRouter } = require('./routes/imageRouter')
const { userRouter } = require('./routes/userRouter')
const { authenticate } = require('./middleware/authentication')


require("dotenv").config();

const app = express();
const PORT = 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDb Connected");
    app.use(express.json())

    app.use(authenticate)

    app.use("/uploads", express.static("uploads"));
    app.use('/images', imageRouter)
    app.use("/users", userRouter)

    app.listen(PORT, () =>
      console.log("Express server listening on PORT " + PORT)
    );
  })
  .catch((err) => console.log(err));