"use strict";
// Local preview: static assets plus a proxy to the currently deployed public API.
// It needs no API secrets and never ships as a Vercel entrypoint.
const express = require("express");
const path = require("node:path");
const app = express();
app.use(express.json());
app.use("/api", async (req, res) => {
  try {
    const response = await fetch("https://find-library.vercel.app/api" + req.url, {
      method: req.method,
      headers: req.method === "POST" ? { "Content-Type": "application/json" } : {},
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined
    });
    res.status(response.status).set("Content-Type", "application/json").send(await response.text());
  } catch { res.status(502).json({ error: "Local preview proxy unavailable" }); }
});
app.use(express.static(path.join(__dirname, "../docs")));
app.listen(4173, "127.0.0.1", () => console.log("Local preview: http://127.0.0.1:4173"));
