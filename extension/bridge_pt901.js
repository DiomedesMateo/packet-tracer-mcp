/**
 * Packet Tracer MCP Bridge — Packet Tracer 9.0.1
 * ================================================
 * Paste into: Extensions → Scripting → Script Engine
 * Then Export as .pts, Add module, and Start.
 *
 * PT 9.x tightened Qt/JS bindings: calling _NetAccess.httpGet with the
 * wrong arity throws:
 *   TypeError: Passing incompatible arguments to C++ functions from JavaScript is not allowed.
 *
 * This script tries several call signatures for GET/POST so the same file
 * works across 9.0.x builds.
 *
 * Keep Packet Tracer open while using the MCP (OpenCode / Claude / Cursor).
 * Bridge URL: http://127.0.0.1:54321
 */

(function () {
  var BRIDGE = "http://127.0.0.1:54321";
  var INTERVAL_MS = 800;

  var G = (function () { return this; })();
  if (G.__pt_mcp_running) {
    console.log("PT-MCP 9.0.1: already running");
    return;
  }
  G.__pt_mcp_running = true;

  function executeCode(code) {
    try {
      return String(eval(code));
    } catch (e) {
      return "EXCEPTION: " + e;
    }
  }

  function reportResult(rid, result) {
    var body = JSON.stringify({ rid: rid, result: String(result) });
    tryHttpPost(BRIDGE + "/result", body);
  }

  function tryHttpGet(url) {
    if (typeof _NetAccess === "undefined") {
      throw new Error("no _NetAccess");
    }
    var attempts = [
      function () { _NetAccess.httpGet(url); },
      function () { _NetAccess.httpGet(url, null); },
      function () { _NetAccess.httpGet(url, ""); },
      function () { _NetAccess.httpGet(url, function () {}); },
      function () { _NetAccess.httpGet(url, null, function () {}); },
      function () { _NetAccess.httpGet(url, {}, function () {}); },
      function () {
        if (typeof _NetAccess.httpRequest === "function") {
          _NetAccess.httpRequest("GET", url, null, null, function () {});
        } else {
          throw new Error("no httpRequest");
        }
      }
    ];
    var last = null;
    for (var i = 0; i < attempts.length; i++) {
      try {
        attempts[i]();
        if (!G.__pt_mcp_get_mode) {
          G.__pt_mcp_get_mode = i;
          console.log("PT-MCP 9.0.1: httpGet mode=" + i);
        }
        return true;
      } catch (e) {
        last = e;
      }
    }
    throw last || new Error("httpGet failed");
  }

  function tryHttpPost(url, body) {
    if (typeof _NetAccess === "undefined") return;
    var attempts = [
      function () { _NetAccess.httpPostBody(url, "application/json", body); },
      function () { _NetAccess.httpPostBody(url, "application/json", body, function () {}); },
      function () { _NetAccess.httpPost(url, body); },
      function () { _NetAccess.httpPost(url, body, function () {}); },
      function () {
        if (typeof _NetAccess.httpRequest === "function") {
          _NetAccess.httpRequest("POST", url, "application/json", body, function () {});
        }
      }
    ];
    for (var i = 0; i < attempts.length; i++) {
      try {
        attempts[i]();
        return;
      } catch (e) {}
    }
  }

  function extractBody(arg1, arg5) {
    var body = "";
    if (arg5) {
      if (typeof arg5 === "string") body = arg5;
      else {
        try {
          if (arg5.body) body = String(arg5.body);
          else if (arg5.data) body = String(arg5.data);
          else if (arg5.responseText) body = String(arg5.responseText);
        } catch (e) {}
      }
    }
    if (!body && arg1 && typeof arg1 === "string" && arg1 !== "" && arg1 !== "e30=") {
      body = arg1;
    }
    return body;
  }

  function onHttpDone(id, arg1, status, arg3, errMsg, arg5) {
    try {
      if (String(status) !== "200") return;
      var body = extractBody(arg1, arg5);
      if (!body || body === "{}") return;
      var msg;
      try {
        msg = JSON.parse(body);
      } catch (e) {
        return;
      }
      if (!msg || !msg.code) return;
      console.log("PT-MCP 9.0.1: CMD rid=" + msg.rid);
      var result = executeCode(msg.code);
      console.log("PT-MCP 9.0.1: RESULT=" + String(result).substring(0, 120));
      setTimeout(function () {
        reportResult(msg.rid, result);
      }, 50);
    } catch (e) {
      console.log("PT-MCP 9.0.1: handler err: " + e);
    }
  }

  try {
    if (_NetAccess.httpDone && typeof _NetAccess.httpDone.connect === "function") {
      _NetAccess.httpDone.connect(onHttpDone);
      console.log("PT-MCP 9.0.1: httpDone.connect OK");
    } else {
      console.log("PT-MCP 9.0.1: httpDone signal not available");
    }
  } catch (e) {
    console.log("PT-MCP 9.0.1: httpDone.connect fail: " + e);
  }

  var pollErrors = 0;
  function poll() {
    try {
      tryHttpGet(BRIDGE + "/next");
      pollErrors = 0;
    } catch (e) {
      pollErrors++;
      if (pollErrors <= 5 || pollErrors % 25 === 0) {
        console.log("PT-MCP 9.0.1: poll err: " + e);
      }
    }
  }

  try {
    console.log("PT-MCP 9.0.1: typeof _NetAccess=" + (typeof _NetAccess));
    if (typeof _NetAccess !== "undefined") {
      console.log("PT-MCP 9.0.1: httpGet=" + (typeof _NetAccess.httpGet));
      console.log("PT-MCP 9.0.1: httpPostBody=" + (typeof _NetAccess.httpPostBody));
      console.log("PT-MCP 9.0.1: httpPost=" + (typeof _NetAccess.httpPost));
      console.log("PT-MCP 9.0.1: httpRequest=" + (typeof _NetAccess.httpRequest));
    }
  } catch (e) {}

  poll();
  setInterval(poll, INTERVAL_MS);
  console.log("PT-MCP 9.0.1: bridge ACTIVE (multi-signature) -> " + BRIDGE);
})();
