# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin marketplace — a GitHub-hosted registry where plugins are published and discovered via the Claude Code CLI. There is no build system or runtime code; the repo is declarative JSON manifests plus plugin source files. `npm test` runs `claude plugin validate .`.

## Architecture

- `.claude-plugin/marketplace.json` — Marketplace manifest. Lists every available plugin by `name` and `source`. Every new plugin must be registered here.
- `plugins/<plugin-name>/.claude-plugin/plugin.json` — Per-plugin manifest. Authoritative source for `version`, `description`, `keywords`, `author`, `license`.
- `plugins/<plugin-name>/` — Plugin components (`skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json`).

## Adding a Plugin

1. Create `plugins/<plugin-name>/.claude-plugin/plugin.json` with the plugin manifest.
2. Add plugin components (`skills/`, `commands/`, `hooks/`, `agents/`, `.mcp.json`) under `plugins/<plugin-name>/`.
3. Register the plugin in `.claude-plugin/marketplace.json` by appending `{ "name": "<plugin-name>", "source": "./plugins/<plugin-name>" }` to the `plugins` array.

## Key Constraints

- Plugin names must be unique within the marketplace.
- Marketplace plugin entries should keep only marketplace-specific fields (`name`, `source`, and optionally `category`/`tags`). Do not duplicate `description`/`version`/`keywords` — those live in each plugin's `plugin.json` (the authoritative source; `plugin.json` wins on conflict).
- All JSON manifests must parse as strict JSON (no trailing commas, no comments).
- Editor schemas: `https://json.schemastore.org/claude-code-marketplace.json` for the marketplace and `https://json.schemastore.org/claude-code-plugin-manifest.json` for plugin manifests.
