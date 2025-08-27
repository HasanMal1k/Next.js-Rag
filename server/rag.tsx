import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import docLoader from "./utils/document-loader";


// Step 1: Define embeddings
const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: 'sentence-transformers/all-MiniLM-L6-v2'
})

// Step 2: Load Docs
const rawDocs = await docLoader()

// Step 3: Split Docs
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
})

const chunkedDocs = await splitter.splitDocuments(rawDocs)

// Step 4: Putting the chunked docs onto a vector DB
const vectorStore = await Chroma.fromDocuments(chunkedDocs, embeddings, {
    collectionName: '200 Research Papers'
})