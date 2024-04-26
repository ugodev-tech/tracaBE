import app from "./app";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();
const { PORT } = process.env;

const port = PORT || 8000;

app.listen(port, () => {
    
    logger.info(`server connected on ${port}`);
});

