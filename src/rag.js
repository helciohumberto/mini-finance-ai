import { VectorStoreIndex, SimpleDirectoryReader } from "llamaindex";

let queryEngine = null;

export async function initRAG() {
  const docs = await new SimpleDirectoryReader("./data").loadData();
  const index = await VectorStoreIndex.fromDocuments(docs);
  queryEngine = index.asQueryEngine();
}

export async function askFinanceAI(question) {
  if (!queryEngine) throw new Error("RAG não inicializado");
  const response = await queryEngine.query(question);
  return response.toString();
}