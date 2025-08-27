import fs from 'fs'
import path from 'path'
import { Document } from 'langchain/document'
import { MetaData, metaDataSchema } from '../zod-schema'

const DOCS_DIR = path.join(process.cwd(), 'public', 'docs')

export default async function docLoader(): Promise<Document[]> {
    const docs: Document [] = [];

    const files = fs.readdirSync(DOCS_DIR)

    const mdFiles = files.filter((file) => {file.endsWith('.md')})

    for( const mdFile of mdFiles ){
        const baseName = path.basename(mdFile, '.md')

        const mdPath = path.join(DOCS_DIR, mdFile)

        const jsonPath = path.join(DOCS_DIR, `${baseName}.json`)

        const pageContent = fs.readFileSync(mdPath, 'utf-8')

        let metaData: MetaData = {}
        if(fs.existsSync(jsonPath)){
            try{
                const raw = fs.readFileSync(jsonPath, 'utf-8')
                const parsed = JSON.parse(raw)

                const result = metaDataSchema.safeParse(parsed)

                if(result.success){
                    metaData = result.data
                }
                else{
                    console.error(`Invalid metadata in ${jsonPath}:`, result.error.format());
                    metaData = {}; 
                }

            }
            catch(err){
                console.error(`Error parsing metadata for ${mdFile}:`, err);
            }
        }

        docs.push(
            new Document({
                pageContent,
                metadata: {
                    source: mdFile,
                    ...metaData
                }
            })
        )
        
    }

    return docs

}
