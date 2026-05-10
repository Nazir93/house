/** Один объект schema.org без обёртки в Suspense/async layout. */
export function JsonLdInline({ schema }: { schema: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
