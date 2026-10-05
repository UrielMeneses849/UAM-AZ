# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Portal-specific design constraints

- Preserve the intentionally legacy 2005–2012 visual language: Arial/Helvetica, black header, narrow fixed sidebar, blue section bars, dense bordered tables, square corners and large white fields.
- Do not introduce modern SaaS cards, decorative gradients, glass effects, large radii, modern display fonts or Material/Tailwind styling.
- For the login-screen reference recreation, the user explicitly authorized the original raster assets on 2026-09-26; keep them scoped to that screen and preserve the simulation-only behavior of the app.
- The ADMIN interface may be more practical, but must remain visually compatible with the student portal.
