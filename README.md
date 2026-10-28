# Packet Tracer MCP

**MCP server** that lets AI agents (OpenCode, Claude Code, Cursor, Claude Desktop…) **create and control network topologies in Cisco Packet Tracer in real time**.

```
You (prompt)  →  OpenCode / Claude  →  MCP (this server)  →  HTTP bridge  →  Packet Tracer
```

Adaptive Script Engine layer: works across Packet Tracer **8.x / 9.x** by probing available APIs at runtime (no hard-coded single method).

---

## Features

| Capability | Description |
|---|---|
| **Planning** | `pt_plan_simple_lan`, `pt_plan_two_site_ospf`, `pt_plan_from_prompt` |
| **Live deploy** | One call deploys devices + cables + IPs + IOS configs |
| **Granular control** | Add device, connect, configure PC, send CLI, clear, query topology |
| **API probe** | `pt_probe_api` discovers workspace paths & type codes |
| **Catalog** | Routers, switches, PCs, cables with aliases |

---

## Requirements

- **Python 3.11+**
- **Cisco Packet Tracer 8.x or 9.x** (running, with Script Module bridge active)
- An MCP client: **OpenCode**, Claude Code, Cursor, etc.

---

## Install

### Windows (PowerShell)

```powershell
git clone https://github.com/DiomedesMateo/packet-tracer-mcp.git
cd packet-tracer-mcp

python -m venv .venv
.\.​venv\Scripts\Activate.ps1

# If execution policy blocks Activate:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

pip install -e .
pip install "mcp<2"
```

OpenCode config (`%USERPROFILE%\.config\opencode\opencode.json` or `%APPDATA%\opencode\opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "packet-tracer": {
      "type": "local",
      "command": [
        "C:\\Users\\YOUR_USER\\path\\to\\packet-tracer-mcp\\.venv\\Scripts\\python.exe",
        "-m",
        "packet_tracer_mcp.server"
      ],
      "enabled": true
    }
  }
}
```

Replace the path with your real absolute path.

---

### macOS / Linux

```bash
git clone https://github.com/DiomedesMateo/packet-tracer-mcp.git
cd packet-tracer-mcp

python3 -m venv .venv
source .venv/bin/activate

pip install -e .
pip install "mcp<2"
```

OpenCode config (`~/.config/opencode/opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "packet-tracer": {
      "type": "local",
      "command": [
        "/absolute/path/to/packet-tracer-mcp/.venv/bin/python",
        "-m",
        "packet_tracer_mcp.server"
      ],
      "enabled": true
    }
  }
}
```

---

### Claude Desktop / Cursor

Add a similar MCP entry pointing to the same Python module and absolute interpreter path.

---

## Packet Tracer bridge (required for live control)

1. Open **Cisco Packet Tracer**.
2. **Extensions → Scripting → New PT Script Module** (or edit existing).
3. In **Script Engine**, paste the contents of `extension/bridge_debug.js` (recommended for PT 8.x — uses `_NetAccess`).
4. **Export** as `.pts` → **Configure PT Script Modules → Add** → **Start**.
5. Leave Packet Tracer open while using the MCP.

Fallback: `extension/bridge_bootstrap.js` (XMLHttpRequest / webview style).

The MCP HTTP bridge listens on `http://127.0.0.1:54321`.

---

## Usage examples

```
Usa pt_bridge_status
```

```
Crea una red simple con 1 router, 1 switch y 2 PCs en 192.168.1.0/24 y despliégala en Packet Tracer.
```

```
pt_add_device R1 router-pt
pt_get_topology
```

More prompts: `examples/sample_prompts.md`.

---

## Tools

### Status
- `pt_bridge_status` / `pt_start_bridge`
- `pt_probe_api` — discover Script Engine paths & cache type codes

### Catalog
- `pt_list_devices` / `pt_list_cables`

### Planning (offline)
- `pt_plan_simple_lan` / `pt_plan_two_site_ospf` / `pt_plan_from_prompt`

### Live
- `pt_add_device` / `pt_connect` / `pt_configure_pc` / `pt_send_cli`
- `pt_get_topology` / `pt_clear_topology` / `pt_live_deploy` / `pt_run_js`

---

## Project layout

```
packet-tracer-mcp/
├── pyproject.toml
├── README.md
├── extension/
│   ├── bridge_bootstrap.js
│   └── bridge_debug.js
├── src/packet_tracer_mcp/
│   ├── server.py
│   ├── bridge.py
│   ├── api_probe.py
│   ├── catalog.py
│   ├── planner.py
│   └── js_generator.py
└── examples/
    ├── opencode.json
    └── sample_prompts.md
```

---

## Notes

- Prefer `pip install "mcp<2"` if you hit FastMCP / MCPServer import errors (SDK 2.x rename).
- Cache file: `~/.packet_tracer_mcp_cache.json`.
- If `connected: false` in `pt_bridge_status`, the Script Module is not polling — re-Start the module.

## License

MIT
