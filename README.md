# Anatomy of AI Infrastructure

An educational, explorable model of how electricity, water, cooling, fiber, buildings, and supply chains become AI compute. It is not a construction document and not a vendor catalog.

## What you can do

- Orbit the campus. Click a system. Shift-click to compare up to three. Double-click a rack to open a representative cabinet.
- Switch eras: pre-cloud room, cloud hall, hyperscale AI campus, neocloud pods.
- Follow power, water, data, or heat. Scrub a build sequence. Start the eight-step tour.
- Open the supply globe, the timeline, the metrics lab, the glossary, and the text atlas (no WebGL required).
- Search with the search button or Ctrl/Cmd+K. Layer shortcuts on the explore page: P power, B backup, C cooling, W water, N network, G compute, U building, S supply, E capital, O carbon, T construction, Y telemetry.

## Stack

TanStack Start, React, TypeScript, Tailwind, React Three Fiber, drei, Zustand, Recharts. Preferences (quality, motion, contrast, the scenario sliders, pins) stay in local storage.

## Data model

Typed records live in `src/data`: components, eras, glossary, timeline, supply regions, and the tour. The scene layout is generated in `src/components/three/layout.ts`. The metrics lab is `src/lib/calculations.ts` and is labeled as an educational model.

## Assumptions

Ranges are representative. PUE is not water, carbon, or useful work. 800 V DC is discussed as an emerging option, not as the default one-line. Supplier geography is illustrative. See the methodology page inside the exhibit.
