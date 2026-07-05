import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- FEEDBACK (Proxied to Formspree) ---

  app.post("/api/feedback/send", async (req, res) => {
    const { category, label, message } = req.body;
    try {
      const response = await fetch("https://formspree.io/f/xykqgopw", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `[NEXUS Feedback] ${label}`,
          email: 'user@nexus.app',
          Category: label,
          Message: message,
        }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Core running on http://localhost:${PORT}`);
  });
}

startServer();
