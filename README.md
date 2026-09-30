# NEXUS Web Bot — versión completa

## Qué incluye
- Página pública de reclutamiento.
- Verificación automática de requisitos.
- Validación del usuario de Roblox mediante la API pública de Roblox.
- Rechazo automático cuando no cumple edad, nivel, horas declaradas, pertenencia a otro clan o aceptación de reglas.
- Solicitudes que cumplen pasan a revisión manual.
- Panel privado en `/admin`.
- Administrador puede aceptar, rechazar o dejar en revisión.
- Campos para añadir enlace del Lobby y enlace de WhatsApp al aprobar.
- Guardado local en `applications.json`.

## Requisitos NEXUS configurados
- Edad: 10–20.
- Nivel Evade: 20+.
- 7+ horas semanales.
- No pertenecer a otro clan/team.
- Aceptar reglas.
- Actividad de 1 hora diaria en el grupo: revisión manual.
- Micrófono: no necesario.
- Prueba de habilidad: no necesaria.

## Ejecutar
1. Instalar Node.js.
2. En esta carpeta ejecutar:
   `npm install`
3. Luego:
   `npm start`
4. Abrir:
   `http://localhost:3000`
5. Panel:
   `http://localhost:3000/admin`

## Variables recomendadas en el hosting
`ADMIN_KEY` = una clave privada distinta a la de ejemplo.
`LOBBY_URL` = enlace del Lobby de Roblox (si ya existe).
`WHATSAPP_URL` = enlace de invitación del grupo de WhatsApp.

IMPORTANTE:
El proyecto no puede verificar por sí solo que una persona realmente juegue 7 horas por semana o que esté 1 hora diaria en el chat. Esos datos se declaran en el formulario y la actividad del chat queda para revisión del administrador. Tampoco se debe presentar como verificación automática algo que la plataforma no exponga de forma fiable.

## Seguridad
Antes de hacerlo público cambia `ADMIN_KEY` por una contraseña larga y privada. No compartas esa clave con postulantes.
