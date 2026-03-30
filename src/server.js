import Fastify from "fastify";

const fastify = Fastify();

// Lista de temas permitidos
const allowedTopics = [
  "finanças",
  "dinheiro",
  "orçamento",
  "gastos",
  "investimentos",
  "economia pessoal",
  "controle financeiro",
  "planejamento financeiro",
  "poupança",
  "cartão",
  "dívida",
  "juros"
];

// Função para verificar se o prompt é permitido
function isAllowed(prompt) {
  const lower = prompt.toLowerCase();
  return allowedTopics.some(topic => lower.includes(topic));
}

fastify.post("/chat", async (request, reply) => {
  const { prompt } = request.body;

  // 1. Filtro de tema
  if (!isAllowed(prompt)) {
    return reply.send("Só posso falar sobre finanças pessoais.");
  }

  // 2. Chamada ao Ollama com system prompt
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3:mini",
      system: "Você é um assistente especializado exclusivamente em finanças pessoais. Não responda nada fora desse tema.",
      prompt
    })
  });

  reply.raw.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });

  // 3. Streaming da resposta
  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = new TextDecoder().decode(value);
    const lines = chunk.split("\n").filter(l => l.trim() !== "");

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.response) {
          reply.raw.write(json.response);
        }
      } catch {}
    }
  }

  reply.raw.end();
});

fastify.listen({ port: 3000 }, () => {
  console.log("Fastify rodando em http://localhost:3000");
});