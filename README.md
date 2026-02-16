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
