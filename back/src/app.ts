import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mailsRouter from "./routes/mails";
import {startMailCron} from "./mailChecker/mailChecker";

dotenv.config();
const PORT = 5001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(mailsRouter);

app.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
});

startMailCron();