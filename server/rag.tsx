import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import docLoader from "./utils/document-loader";
import { BM25Retriever } from "@langchain/community/retrievers/bm25";

// Step 1: Define embeddings
const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: 'sentence-transformers/all-MiniLM-L6-v2'
})

// Step 2: Load Docs
const rawDocs = await docLoader()

// Step 3: Split Docs, For Semantic Search Only
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
})

const chunkedDocs = await splitter.splitDocuments(rawDocs)

// Step 4: Putting the chunked docs onto a vector DB
const vectorStore = await Chroma.fromDocuments(chunkedDocs, embeddings, {
    collectionName: '200 Research Papers'
})

// Step 5: Hybrid Search. Checking semantically and text based
const bm25Retriever = BM25Retriever.fromDocuments(chunkedDocs, { k: 5 })

const vectorRetriever = vectorStore.asRetriever({ k: 5 })

async function hybridSearch(query: string, k = 5){

    // This will give back the results based on the query
    const [bm25Results, semanticResults] = await Promise.all([
    bm25Retriever.getRelevantDocuments(query),
    vectorRetriever.getRelevantDocuments(query),
  ]);

    //   Creating a new map to store the score of the docs
    const scored: Map<string, { doc: any, score: number }> = new Map()

    bm25Results.forEach((doc, i) => {
        const score = 1 - i / bm25Results.length;
        scored.set(doc.pageContent, {
            doc,
            score: (scored.get(doc.pageContent)?.score || 0) + score * 0.25,
        })
    })

    semanticResults.forEach((doc, i) => {
        const score = 1 - i / semanticResults.length
        scored.set(doc.pageContent, {
        doc,
        score: (scored.get(doc.pageContent)?.score || 0) + score * 0.75, 
        });
    })

    return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(r => r.doc);

}

