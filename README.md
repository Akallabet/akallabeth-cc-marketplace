# akallabet-cc-marketplace

A Claude Code plugin marketplace.

## Usage

### Register this marketplace

```bash
claude plugin marketplace add https://github.com/akallabet/akallabet-cc-marketplace
```

### Browse available plugins

```bash
claude plugin marketplace search --marketplace akallabet-cc-marketplace
```

### Install a plugin

```bash
claude plugin install <plugin-name> --marketplace akallabet-cc-marketplace
```

## Plugins

### ak-coding

General coding utilities (code explanation, review, refactoring, testing, debugging). Includes an MCP bundle (`.mcp.json`) wiring up context7, postgres, github, playwright, chrome-devtools, and storybook.

Several of its skills are vendored from external open-source projects; attribution is tracked in [`plugins/ak-coding/origins.json`](./plugins/ak-coding/origins.json).

### ak-documentation

Utilities for generating and improving documentation, docstrings, README files, and API docs. Vendored-skill attribution is in [`plugins/ak-documentation/origins.json`](./plugins/ak-documentation/origins.json).

## Adding a plugin

1. Create a new directory under `plugins/` with your plugin name.
2. Add a `.claude-plugin/plugin.json` manifest inside it.
3. Add your plugin components (`skills/`, `commands/`, `hooks/`, `agents/`, `.mcp.json`).
4. Register the plugin in `.claude-plugin/marketplace.json` (`name` + `source`).
5. Run `npm test` (`claude plugin validate .`) and submit a pull request.

## Structure

```
akallabet-cc-marketplace/
├── .claude-plugin/
│   └── marketplace.json     # Marketplace manifest
├── plugins/
│   └── <plugin-name>/
│       ├── .claude-plugin/
│       │   └── plugin.json  # Plugin manifest
│       ├── skills/
│       ├── .mcp.json        # optional
│       └── origins.json     # optional attribution
├── README.md
└── CLAUDE.md
```
