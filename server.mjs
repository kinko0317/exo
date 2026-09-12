import http from "node:http";

const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error("Set OPENAI_API_KEY first.");

const read = req => new Promise((ok, bad) => {
  let s = "";
  req.on("data", c => s += c);
  req.on("end", () => { try { ok(JSON.parse(s || "{}")); } catch (e) { bad(e); } });
});

const reply = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") return reply(res, 200, { ok: true });
  if (req.method !== "POST") return reply(res, 404, { error: "Not found" });

  try {
    const input = await read(req);
    if (req.url === "/v1/translate") {
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5-mini",
          input: "Translate into concise Simplified Chinese. Return only the translation.\n\n" + input.text
        })
      });
      const result = await upstream.json();
      if (!upstream.ok) return reply(res, upstream.status, result);
      const translation = result.output_text || result.output
        ?.flatMap(item => item.content || [])
        .filter(content => content.type === "output_text")
        .map(content => content.text || "")
        .join("") || "";
      if (!translation) return reply(res, 502, { error: "OpenAI returned an empty translation." });
      return reply(res, 200, { translation });
    }

    if (req.url !== "/v1/realtime-credential") return reply(res, 404, { error: "Not found" });
    const sessionConfig = {
      session: {
        type: "transcription",
        audio: { input: {
          transcription: {
            model: "gpt-transcribe",
            prompt: input.course,
            keywords: String(input.vocabulary || "").split("\n").filter(Boolean),
            languages: ["en"]
          },
          turn_detection: { type: "server_vad", threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 700 }
        } }
      }
    };
    const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(sessionConfig)
    });
    const result = await upstream.json();
    if (!upstream.ok) return reply(res, upstream.status, result);
    reply(res, 200, { value: result.client_secret?.value ?? result.value });
  } catch (error) {
    reply(res, 500, { error: error.message });
  }
}).listen(process.env.PORT || 8787, () => console.log("LectureLive backend running"));
