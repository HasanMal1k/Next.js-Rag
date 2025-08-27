import { z } from 'zod'

export const metaDataSchema = z.union([
    z.object({
    citation_title: z.string(),
    citation_author: z.string(),
    citation_doi: z.string(),
    citation_journal_title: z.string(),
    citation_publication_date: z.string(),
    source_url: z.string().url(),
    title_from_results: z.string()
    }),
    
    z.object({})
])

export type MetaData = z.infer<typeof metaDataSchema> | null