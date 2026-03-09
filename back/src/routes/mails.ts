import { Router } from "express";
import {createMailbox, deleteMailbox, getMailBoxes, mails} from "../controllers/mails";

const router = Router();

router.get("/emails", mails);

router.get("/mailboxes", getMailBoxes);

router.post("/mailboxes", createMailbox);

router.delete("/mailboxes/:id", deleteMailbox);

export default router;
