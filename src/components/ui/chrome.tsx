import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { COMPONENTS } from "@/data/components";
import { GLOSSARY } from "@/data/glossary";
import { focusComponent } from "@/lib/focus";
import { LAYER_ORDER, useInfra } from "@/lib/store";

const LINKS = [
  { to: "/explore", label: "Explore" },
  { to: "/compare", label: "Compare" },
  { to: "/supply", label: "Supply chain" },
  { to: "/timeline", label: "Timeline" },
  { to: "/metrics", label: "Metrics" },
  { to: "/glossary", label: "Glossary" },
  { to: "/methodology", label: "Methodology" },
  { to: "/atlas", label: "Atlas" },
] as const;

export function AppChrome({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = window.localStorage.getItem("anatomy-ai-infra");
    void useInfra.persist.rehydrate();
    const state = useInfra.getState();
    if (!stored) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) state.setReducedMotion(true);
      if (window.matchMedia("(max-width: 900px)").matches) state.setQuality("low");
    }
    state.setHydrated(true);
  }, []);

  const reduced = useInfra((state) => state.reducedMotion);
  const contrast = useInfra((state) => state.highContrast);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce", reduced);
    document.documentElement.classList.toggle("hc", contrast);
  }, [reduced, contrast]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (event.target as HTMLElement | null)?.isContentEditable) {
        return;
      }
      if (event.key === "Escape") {
        useInfra.getState().select(null);
        useInfra.getState().setRackOpen(false);
        useInfra.getState().setTourStep(null);
        setOpen(false);
      }
      if (meta || event.altKey) return;
      const layer = LAYER_ORDER.find((item) => item.key === event.key.toLowerCase());
      if (layer && path.startsWith("/explore")) useInfra.getState().toggleLayer(layer.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [path]);

  const systems = useMemo(
    () =>
      COMPONENTS.map((item) => ({
        id: item.id,
        name: item.name,
        hint: item.category,
        value: `${item.name} ${item.keywords.join(" ")} ${item.category}`,
      })),
    [],
  );

  return (
    <>
      <header className="nav">
        <Link to="/" className="brand">
          <strong>Anatomy of AI</strong>
          <span>Infrastructure</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} data-active={path === link.to ? "true" : "false"}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Search systems and terms">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search</span>
          <span className="nav-search-label" aria-hidden="true">
            Search
          </span>
        </button>
      </header>
      <div id="main">{children}</div>
      {open ? (
        <div className="palette" role="presentation" onMouseDown={() => setOpen(false)}>
          <Command label="Search infrastructure" onMouseDown={(event) => event.stopPropagation()}>
            <Command.Input placeholder="GPU, transformer, water, PUE, busway…" autoFocus />
            <Command.List>
              <Command.Empty>Nothing in the atlas matches that.</Command.Empty>
              <Command.Group heading="Systems">
                {systems.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.value}
                    onSelect={() => {
                      focusComponent(item.id);
                      setOpen(false);
                      void navigate({ to: "/explore" });
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="kicker">{item.hint}</span>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Glossary">
                {GLOSSARY.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.term} ${item.definition}`}
                    onSelect={() => {
                      setOpen(false);
                      void navigate({ to: "/glossary", hash: item.id });
                    }}
                  >
                    <span>{item.term}</span>
                    <span className="kicker">{item.group}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}
