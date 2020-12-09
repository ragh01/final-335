require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
// const orderRoutes = require("./routes/order");
//npm install Braintree
//const paymentBRoutes = require("./routes/paymentBRoutes");
//mongodb+srv://<username>:<password>@cluster0.sfxlq.mongodb.net/<dbname>?retryWrites=true&w=majority

//DB Connection
mongoose
  .connect('mongodb+srv://335-Project:335-Project123@cluster0.sfxlq.mongodb.net/335-Bazaar?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
// app.use("/api", orderRoutes);
//app.use("/api", paymentBRoutes);


//PORT
const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
