import type { MDXComponents } from 'mdx/types'
import { Decision } from './Decision'
import { Callout } from './Callout'

/**
 * Style overrides for plain markdown elements plus the custom shortcodes
 * available inside content/work/*.mdx. Kept intentionally small — case
 * studies use headings, paragraphs, lists, and <Decision>/<Callout>, nothing
 * more exotic.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="text-h2 mb-6 mt-16 max-w-2xl first:mt-0" {...props} />,
  h3: (props) => <h3 className="text-h3 mb-4 mt-10 max-w-2xl" {...props} />,
  p: (props) => <p className="text-body mb-4 max-w-2xl text-[var(--color-text-secondary)]" {...props} />,
  ul: (props) => <ul className="mb-4 ml-5 max-w-2xl list-disc space-y-2 text-body text-[var(--color-text-secondary)]" {...props} />,
  ol: (props) => <ol className="mb-4 ml-5 max-w-2xl list-decimal space-y-2 text-body text-[var(--color-text-secondary)]" {...props} />,
  strong: (props) => <strong className="text-[var(--color-text)]" {...props} />,
  a: (props) => <a className="text-[var(--color-signal)] hover:underline" {...props} />,
  Decision,
  Callout,
}
