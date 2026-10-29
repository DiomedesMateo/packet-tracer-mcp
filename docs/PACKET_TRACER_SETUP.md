# Configurar Packet Tracer para el MCP

Este documento explica **solo** la parte de Packet Tracer. Sin ella, el MCP puede planificar redes pero **no** crear dispositivos en vivo.

## Resumen

| Componente | Ubicación |
|------------|-----------|
| Servidor MCP (Python) | OpenCode / terminal |
| Bridge HTTP `127.0.0.1:54321` | Lo inicia el MCP automáticamente |
| **Script Module (Running)** | **Dentro de Packet Tracer** ← obligatorio |

## Pasos

### 1. Abrir Packet Tracer

Deja un archivo nuevo o existente abierto en la vista **Logical**.

### 2. Crear el Script Module

1. **Extensions → Scripting → New PT Script Module...**
2. O bien: **Configure PT Script Modules...** → **New** / **Edit**

### 3. Añadir el código JavaScript

1. Pestaña **Script Engine** (o **Info → 3. Script Engine Files → Go To**).
2. Crea un archivo (por ejemplo `bridge.js`) y pega **todo** el contenido del archivo que corresponda a tu versión:

| Versión PT | Archivo |
|------------|---------|
| **9.0.1 / 9.x** | [`extension/bridge_pt901.js`](../extension/bridge_pt901.js) |
| **8.x** | [`extension/bridge_debug.js`](../extension/bridge_debug.js) |
| Webview / alternativa | [`extension/bridge_bootstrap.js`](../extension/bridge_bootstrap.js) |

**PT 9.0.1:** si ves `TypeError: Passing incompatible arguments to C++ functions from JavaScript is not allowed`, usa **`bridge_pt901.js`** (prueba varias firmas de `httpGet` / `httpPost`).

### 4. Exportar el módulo

1. **Info → 6. Saving → Export**
2. Guarda como `MCP-Bridge.pts` (en cualquier carpeta).

> Si intentas **Start** antes de exportar, PT muestra:  
> *"New script modules must be exported and added as persistent script modules before starting."*

### 5. Añadir y arrancar

1. **Extensions → Scripting → Configure PT Script Modules...**
2. Si no aparece en la lista → **Add** → elige el `.pts`.
3. Selecciona el módulo → **Start**.
4. El título debe cambiar de `(Stopped)` a **`(Running)`**.

### 6. (Opcional) Debug

Con el módulo seleccionado, **Debug** muestra mensajes como:

```
PT-MCP 9.0.1: bridge ACTIVE (multi-signature) -> http://127.0.0.1:54321
PT-MCP 9.0.1: httpGet mode=0
```

### 7. Dejar PT abierto

Mientras uses OpenCode / Claude / Cursor, **no cierres** Packet Tracer y mantén el módulo en **Running**.

## Verificar desde el cliente MCP

```
Usa pt_bridge_status
```

| Campo | Valor esperado |
|-------|----------------|
| `running` | `true` (servidor HTTP del MCP) |
| `connected` | `true` (PT está haciendo polling) |

Si `connected` es `false`:

- ¿El módulo está en **Running**?
- ¿Usaste el bridge correcto para tu versión (9.0.1 → `bridge_pt901.js`)?
- ¿Packet Tracer sigue abierto?
- Prueba **Stop** → **Start** de nuevo en el módulo.

## Flujo completo

```
OpenCode  --stdio-->  packet-tracer-mcp (Python)
                           |
                           | HTTP :54321 /next
                           v
              Script Module en Packet Tracer (Running)
                           |
                           | $se / eval / ipc
                           v
                    Topología en PT
```
