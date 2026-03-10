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

### coding-external

> **Disclaimer**: The `coding-external` plugin is a curated collection of skills, agents, hooks, and tools copied from various external open-source projects. The original author of this marketplace is not the author of those components. Each component's source is tracked in [`plugins/coding-external/origins.json`](./plugins/coding-external/origins.json). Please refer to the original creators for attribution, support, and contributions.

## Adding a plugin

1. Create a new directory under `plugins/` with your plugin name
2. Add a `plugin.json` manifest inside it
3. Add your plugin components (commands, skills, hooks, agents)
4. Register the plugin in `.claude-plugin/marketplace.json`
5. Submit a pull request

## Structure

```
akallabet-cc-marketplace/
├── .claude-plugin/
│   └── marketplace.json     # Marketplace manifest
├── plugins/                 # Plugin subdirectories
├── README.md
└── .gitignore
```
