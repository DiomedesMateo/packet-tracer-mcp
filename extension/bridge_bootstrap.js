/**
 * Packet Tracer MCP Bridge Bootstrap
 * ==================================
 * Paste this into Packet Tracer → Extensions → Scripting → (any Script Module)
 * or into the Builder Code Editor and click Run.
 *
 * It starts a polling loop that asks the MCP bridge (http://127.0.0.1:54321/next)
 * for JavaScript commands and executes them with $se('runCode', ...).
 *
 * Keep Packet Tracer open while you use the MCP from OpenCode / Claude / Cursor.
 */

(function () {
  var BRIDGE = "http://127.0.0.1:54321";
  var INTERVAL_MS = 500;

  if (window.__pt_mcp_bridge_running) {
    console.log("PT-MCP bridge already running");
    return;
  }
  window.__pt_mcp_bridge_running = true;

  function poll() {
    try {
      var x = new XMLHttpRequest();
      x.open("GET", BRIDGE + "/next", true);
      x.timeout = 2000;
      x.onload = function () {
        if (x.status === 200 && x.responseText && x.responseText !== "{}") {
          try {
            var msg = JSON.parse(x.responseText);
            if (msg.code) {
              $se("runCode", msg.code);
            }
          } catch (e) {
            console.error("PT-MCP parse/exec error", e);
          }
        }
      };
      x.onerror = function () {
        /* bridge not up yet – keep trying */
      };
      x.send();
    } catch (e) {
      console.error("PT-MCP poll error", e);
    }
  }

  setInterval(poll, INTERVAL_MS);
  console.log("PT-MCP bridge started – polling " + BRIDGE);
})();
