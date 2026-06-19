import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- COMMUNITY SYNC (Third-Party) ---
  
  app.post("/api/community/sync", async (req, res) => {
    const { content, authorName, type, timestamp } = req.body;
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      return res.json({ status: "skipped", reason: "webhook_not_configured" });
    }

    try {
      const response = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: "Nexus Core Community",
          avatar_url: "https://picsum.photos/seed/nexus/200/200",
          embeds: [{
            title: `New ${type.toUpperCase()} Transmission`,
            description: content,
            color: type === 'achievement' ? 0xFBBF24 : (type === 'progress' ? 0x3B82F6 : 0x10B981),
            fields: [
              { name: "Operator", value: authorName, inline: true },
              { name: "Sync Time", value: new Date(timestamp).toLocaleString(), inline: true }
            ],
            footer: { text: "Nexus Core Neural Link" }
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord API responded with ${response.status}`);
      }

      res.json({ status: "synced", platform: "discord" });
    } catch (error) {
      console.error("Community Sync Error:", error);
      res.status(500).json({ error: "Failed to sync transmission." });
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
