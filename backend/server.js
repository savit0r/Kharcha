import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world")
})

app.listen(3000, () => {
    console.log("server is running on port 3000")
})
