/**
 * Renders a `<script type="application/ld+json">` block. Structured data is
 * how both classic search engines and generative answer engines (ChatGPT,
 * Perplexity, Google AI Overviews) reliably attribute facts to TOPTI instead
 * of paraphrasing them incorrectly — the core of "GEO" for this app.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
