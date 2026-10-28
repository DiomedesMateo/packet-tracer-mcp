# Example prompts for OpenCode + Packet Tracer MCP

## Basic

```
Crea una red simple con un router, un switch y 2 PCs en la red 192.168.1.0/24 y despliégala en Packet Tracer.
```

```
Plan a simple LAN with 4 PCs and deploy it live.
```

## Two sites + OSPF

```
Quiero una topología de dos sitios conectados por serial con OSPF.
Cada sitio con router, switch y un PC. Despliégala ahora.
```

## Incremental changes

```
Añade un servidor llamado WEB1 conectado al switch SW1 en el puerto FastEthernet0/10.
Dale la IP 192.168.1.80/24 con gateway 192.168.1.1
```

```
Envía estos comandos al router R1:
enable
configure terminal
hostname R1-CORE
interface FastEthernet0/0
description LAN-USERS
no shutdown
end
write memory
```

## Inspection

```
¿Qué dispositivos hay ahora mismo en Packet Tracer?
Muéstrame la topología actual.
```

```
¿Está el bridge conectado?
```

## Clean start

```
Borra toda la topología actual de Packet Tracer y crea una nueva con 1 router 4321, 1 switch 2960 y 3 PCs.
```
