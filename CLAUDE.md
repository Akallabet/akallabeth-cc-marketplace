# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin marketplace — a GitHub-hosted registry where plugins are published and discovered via the Claude Code CLI. There is no build system, test suite, or runtime code. The repo is purely declarative JSON manifests and plugin source files.

## Architecture

- `.claude-plugin/marketplace.json` — The single source of truth for the marketplace. Contains the `plugins` array that registers every available plugin by name, path, and metadata. Every new plugin must be added here.
- `plugins/<plugin-name>/` — Each plugin lives in its own subdirectory with a `plugin.json` manifest and its components (commands, skills, hooks, agents).

## Adding a Plugin

1. Create `plugins/<plugin-name>/plugin.json` with the plugin manifest
2. Add plugin components (commands/, skills/, hooks/, agents/) inside that directory
3. Register the plugin in `.claude-plugin/marketplace.json` by appending to the `plugins` array
4. The plugin path in the marketplace manifest should be relative to the repo root (e.g., `plugins/<plugin-name>`)

## Key Constraints

- Plugin names must be unique within the marketplace
- The marketplace manifest must remain valid JSON matching the schema at `https://anthropic.com/claude-code/marketplace.schema.json`
- Plugin subdirectories must each contain a valid `plugin.json`
