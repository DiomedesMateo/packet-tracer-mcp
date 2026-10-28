/**
 * Packet Tracer MCP Bridge - PT 8.2 via _NetAccess (FINAL)
 */
(function () {
  var BRIDGE = "http://127.0.0.1:54321";
  var INTERVAL_MS = 500;

  var G = (function(){ return this; })();
  if (G.__pt_mcp_running) {
    console.log("PT-MCP: ya corriendo");
    return;
  }
  G.__pt_mcp_running = true;

  function b64decode(s) {
    try {
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
      var lookup = {};
      for (var i = 0; i < chars.length; i++) lookup[chars.charAt(i)] = i;
      s = s.replace(/=+$/, "");
      var result = "";
      var buffer = 0;
      var bits = 0;
      for (var j = 0; j < s.length; j++) {
        buffer = (buffer << 6) | lookup[s.charAt(j)];
        bits += 6;
        if (bits >= 8) {
          bits -= 8;
          result += String.fromCharCode((buffer >> bits) & 0xff);
        }
      }
      return result;
    } catch (e) {
      return s;
    }
  }

  function getBody(arg1, arg5) {
    if (arg1 && arg1 !== "" && arg1 !== "e30=") {
      var decoded = b64decode(arg1);
      if (decoded && decoded !== "{}") return decoded;
    }
    if (arg5) {
      if (typeof arg5 === "string" && arg5 !== "{}") return arg5;
      try {
        if (arg5.body) return String(arg5.body);
        if (arg5.data) return String(arg5.data);
        if (arg5.responseText) return String(arg5.responseText);
      } catch (e) {}
    }
    if (arg1) return b64decode(arg1);
    return "";
  }

  function executeCode(code) {
    try {
      var result = eval(code);
      return String(result);
    } catch (e) {
      return "EXCEPTION: " + e;
    }
  }

  function reportResult(rid, result) {
    var body = JSON.stringify({ rid: rid, result: result });
    console.log("PT-MCP: enviando resultado rid=" + rid + " body=" + body.substring(0, 150));
    try {
      _NetAccess.httpPostBody(BRIDGE + "/result", "application/json", body, function(){
        console.log("PT-MCP: POST callback rid=" + rid);
      });
      console.log("PT-MCP: httpPostBody llamado rid=" + rid);
    } catch (e) {
      console.log("PT-MCP: report err: " + e);
    }
  }

  var cmdCount = 0;
  _NetAccess.httpDone.connect(function (id, arg1, status, arg3, errMsg, arg5) {
    try {
      cmdCount++;
      if (cmdCount <= 10 || cmdCount % 20 === 0) {
        var preview = "";
        try { preview = getBody(arg1, arg5).substring(0, 80); } catch(e) {}
        console.log("PT-MCP: httpDone#" + cmdCount + " st=" + status + " body=" + preview);
      }
      if (String(status) !== "200") return;
      var body = getBody(arg1, arg5);
      if (!body || body === "{}") return;
      var msg = JSON.parse(body);
      if (!msg || !msg.code) return;
      console.log("PT-MCP: COMANDO rid=" + msg.rid);
      var result = executeCode(msg.code);
      console.log("PT-MCP: RESULTADO=" + String(result).substring(0, 200));
      setTimeout(function(){ reportResult(msg.rid, result); }, 100);
    } catch (e) {
      console.log("PT-MCP: handler err: " + e);
    }
  });

  function poll() {
    try {
      _NetAccess.httpGet(BRIDGE + "/next", null, function(){});
    } catch (e) {
      console.log("PT-MCP: poll err: " + e);
    }
  }

  poll();
  setInterval(poll, INTERVAL_MS);
  console.log("PT-MCP: bridge ACTIVO via _NetAccess -> " + BRIDGE);
})();
