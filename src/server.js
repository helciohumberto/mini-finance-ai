import Fastify from "fastify";

const fastify = Fastify();

fastify.post("/chat", async (request, reply) => {
  const { prompt } = request.body;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3:mini",
      prompt
    })
  });

  reply.raw.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });

  const reader = response.body.getReader();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = new TextDecoder().decode(value);
    const lines = chunk.split("\n").filter(l => l.trim() !== "");

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.response) {
          fullText += json.response;
          reply.raw.write(json.response); // stream para o terminal
        }
      } catch {}
    }
  }

  reply.raw.end();
});

fastify.listen({ port: 3000 }, () => {
  console.log("Fastify rodando em http://localhost:3000");
});