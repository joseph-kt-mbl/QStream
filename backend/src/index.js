import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import videoRoutes from "./routes/video.route.js";
import requestLogger from "./middleware/requestLogger.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT;

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);


app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
});