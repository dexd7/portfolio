import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CONTENT_DIR = path.join(process.cwd(), 'content/work')

/** Reads a project's prose file, if one exists. Not every project needs one. */
export async function getProjectMdxSource(slug: string): Promise<string | null> {
  try {
    return await readFile(path.join(CONTENT_DIR, `${slug}.mdx`), 'utf-8')
  } catch {
    return null
  }
}
