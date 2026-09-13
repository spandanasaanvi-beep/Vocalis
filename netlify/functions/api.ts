import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import { apiRouter } from "../../server/apiRouter";

dotenv.config();

const app = express();

// Parse JSON request payloads up to 25mb for camera frame snapshots
app.use(express.json({ limit: "25mb" }));

// Handle routes regardless of whether Netlify passes the original path or rewritten path
app.use("/api", apiRouter);
app.use("/.netlify/functions/api", apiRouter);
app.use("/", apiRouter);

export const handler = serverless(app);
