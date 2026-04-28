import { Router } from "express";
import {createMailbox, deleteMailbox, getMailBoxes, mails, updateMailbox} from "../controllers/mails";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/emails", mails);

router.get("/mailboxes", getMailBoxes);

router.post("/mailboxes", createMailbox);

router.delete("/mailboxes/:id", deleteMailbox);

router.patch("/mailboxes/:id", updateMailbox)

export default router;
