const express = require("express");
const connectDB = require("./config/db");

const app = express();
connectDB();
app.use(express.json());

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is Lisitng to PORT : ${PORT}`));
