import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GLOSSARY } from "@/data/glossary";

export const Route = createFileRoute("/glossary")({
  head: () => ({ meta: [{ title: "Glossary — Anatomy of AI Infrastructure" }] }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return GLOSSARY;
    return GLOSSARY.filter((item) => `${item.term} ${item.group} ${item.definition}`.toLowerCase().includes(needle));
  }, [query]);
  const groups = [...new Set(items.map((item) => item.group))];

  return (
    <main className="page glossary">
      <p className="eyebrow">Terms</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0 0.6rem" }}>
        Glossary
      </h1>
      <p className="lede">Short definitions for the words the model uses. They are not standards documents.</p>
      <label className="slider" style={{ margin: "1rem 0" }}>
        <span className="sr-only">Filter glossary</span>
        <input className="search-input" value={query} placeholder="Filter: PUE, CDU, InfiniBand…" onChange={(event) => setQuery(event.target.value)} />
      </label>
      {groups.map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          {items
            .filter((item) => item.group === group)
            .map((item) => (
              <details key={item.id} id={item.id} open={query.length > 0}>
                <summary>{item.term}</summary>
                <p>{item.definition}</p>
              </details>
            ))}
        </section>
      ))}
      {items.length === 0 ? <p>No term matches.</p> : null}
    </main>
  );
}
