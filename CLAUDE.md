# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin marketplace — a GitHub-hosted registry where plugins are published and discovered via the Claude Code CLI. The repo is declarative JSON manifests plus plugin source files, with Node 24 TypeScript CLI scripts for syncing upstream components.

## Architecture

- `.claude-plugin/marketplace.json` — Marketplace manifest. Lists every available plugin by `name` and `source`. Every new plugin must be registered here.
- `plugins/<plugin-name>/.claude-plugin/plugin.json` — Per-plugin manifest. Authoritative source for `version`, `description`, `keywords`, `author`, `license`.
- `plugins/<plugin-name>/` — Plugin components (`skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json`).

## Adding a Plugin

1. Create `plugins/<plugin-name>/.claude-plugin/plugin.json` with the plugin manifest.
2. Add plugin components (`skills/`, `commands/`, `hooks/`, `agents/`, `.mcp.json`) under `plugins/<plugin-name>/`.
3. Register the plugin in `.claude-plugin/marketplace.json` by appending `{ "name": "<plugin-name>", "source": "./plugins/<plugin-name>" }` to the `plugins` array.

## npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm test` | `node --test` | Run unit tests for the sync scripts |
| `npm run test:watch` | `node --test --watch` | Watch mode for unit tests |
| `npm run validate` | `claude plugin validate .` | Validate all plugin manifests |
| `npx plugin-import` | `scripts/import.ts` | Interactive CLI to import a skill/agent/command from a GitHub repo |
| `npx plugin-update` | `scripts/update.ts` | Re-fetch all upstream components tracked in each plugin's `origins.json` |

## Sync Scripts (`scripts/`)

- `scripts/lib/github.ts` — Parses GitHub tree URLs and fetches directory contents via the GitHub API (no external deps, uses `node:https`). Set `GITHUB_TOKEN` env var to increase rate limits.
- `scripts/lib/origins.ts` — Read/write `origins.json` files. Schema: `{ skills, agents, commands }` each a `Record<name, url>`.
- `scripts/lib/plugins.ts` — Discovers plugins from `.claude-plugin/marketplace.json`.
- Each plugin directory contains an `origins.json` that tracks the upstream GitHub URL for each imported component. Empty string means locally authored (no upstream).

## Key Constraints

- Plugin names must be unique within the marketplace.
- Marketplace plugin entries should keep only marketplace-specific fields (`name`, `source`, and optionally `category`/`tags`). Do not duplicate `description`/`version`/`keywords` — those live in each plugin's `plugin.json` (the authoritative source; `plugin.json` wins on conflict).
- All JSON manifests must parse as strict JSON (no trailing commas, no comments).
- Editor schemas: `https://json.schemastore.org/claude-code-marketplace.json` for the marketplace and `https://json.schemastore.org/claude-code-plugin-manifest.json` for plugin manifests.
