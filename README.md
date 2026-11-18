# Evaluación Final — Serie II (Incisos 1, 2, 6, 8 y 9)
**Estudiante:** Sebástian André Orozco Orozco  
**Repositorio:** [Sebasorozc0/frontend-Promotora](https://github.com/Sebasorozc0/frontend-Promotora)  
**Rama Base:** `develop`

---

## Resumen Ejecutivo de Implementaciones

Todas las funcionalidades fueron desarrolladas en sus respectivas ramas `feature/*`, probadas rigurosamente, subidas al repositorio remoto y consolidadas en `develop` mediante **Pull Requests** documentados con checks y sin eliminar las ramas de trabajo.

| Inciso | Nombre | Rama | Pull Request | Estado |
|---|---|---|---|---|
| **1** | Nuevo Endpoint de API (Clean Architecture) | `feature/inciso-1-nuevo-endpoint` | [PR #13](https://github.com/Sebasorozc0/frontend-Promotora/pull/13) | **MERGED** |
| **2** | Nueva Tool para el Agente de IA | `feature/inciso-2-nueva-tool-agente` | [PR #14](https://github.com/Sebasorozc0/frontend-Promotora/pull/14) | **MERGED** |
| **6** | Modo Streaming (SSE) en Agente de IA | `feature/inciso-6-streaming-agente` | [PR #15](https://github.com/Sebasorozc0/frontend-Promotora/pull/15) | **MERGED** |
| **8** | Reversión de Cambios sin Pérdida de Historial (`git revert`) | *Documentado en este archivo* | *Comandos y Log* | **COMPLETO** |
| **9** | Conteo de Tokens y Costo Estimado en USD | `feature/inciso-9-tokens-y-costo` | [PR #16](https://github.com/Sebasorozc0/frontend-Promotora/pull/16) | **MERGED** |

---

## Detalle por Inciso y Guía de Pruebas

### Inciso 1: Nuevo Endpoint de API con Clean Architecture
* **Descripción:** Se diseñó e implementó un endpoint para consultar eventos destacados (`GET /api/v1/catalogo/destacados`), respetando estrictamente Clean Architecture y el patrón CQRS sin acoplamiento a DbContext desde el Controller.
* **Archivos implementados:**
  - **Application (DTO & CQRS):**  
    `backend/src/Promotora.Application/Catalog/EventoDestacadoDto.cs`  
    `backend/src/Promotora.Application/Catalog/ObtenerEventosDestacadosQuery.cs`  
    `backend/src/Promotora.Application/Catalog/ObtenerEventosDestacadosHandler.cs`
  - **WebApi (Controller & Routing):**  
    `backend/src/Promotora.WebApi/Controllers/CatalogoDestacadosController.cs` (Ruta: `/api/v1/catalogo/destacados`)
  - **Frontend Client & Types:**  
    `src/types/api.ts` (`EventoDestacadoDto`)  
    `src/api/client.ts` (`getEventosDestacados()`)
* **Cómo probarlo:**
  ```bash
  # 1. Prueba vía cURL / HTTP
  curl -X GET "http://localhost:5000/api/v1/catalogo/destacados?limite=6" -H "accept: application/json"

  # 2. En el frontend
  # La función api.getEventosDestacados(6) devuelve la lista de eventos con cupo disponible y precio mínimo.
  ```

---

### Inciso 2: Nueva Tool para el Agente de IA
* **Descripción:** Creación de la tool `consultar_disponibilidad_recinto` (`ConsultarDisponibilidadRecintoTool`), permitiendo al agente de IA consultar en tiempo real la capacidad total, localidades activas y cupos disponibles de un recinto directamente desde la base de datos.
* **Archivos implementados:**
  - **Application (Puerto & Tool):**  
    `backend/src/Promotora.Application/AI/Ports/IAgenteTool.cs`  
    `backend/src/Promotora.Application/AI/Tools/ConsultarDisponibilidadRecintoTool.cs`
  - **Frontend UI & Visual Badge:**  
    `src/components/JoseAssistantDrawer.tsx` (Muestra insignia visual: `🔧 Tool Ejecutada: consultar_disponibilidad_recinto`)  
    `src/api/client.ts`
* **Prompt exacto para invocarla:**
  > *"¿Qué capacidad y cupos disponibles tiene el recinto Explanada Cayalá?"*
* **Cómo probarlo:**
  1. Abrir el chat del asistente José haciendo clic en el botón flotante inferior derecho.
  2. Usar la píldora de sugerencia o escribir la pregunta anterior.
  3. Comprobar que en la respuesta de José aparece la insignia azul:  
     `🔧 Tool Ejecutada: consultar_disponibilidad_recinto` con el desglose de capacidad y cupos.

---

### Inciso 6: Modo Streaming (SSE / Chunks Progresivos) en Agente de IA
* **Descripción:** Implementación de Server-Sent Events (SSE) para el agente José (`POST /api/v1/ia/consultas/stream`), transmitiendo tokens progresivamente (`text/event-stream`) en lugar de esperar la respuesta completa.
* **Archivos implementados:**
  - **WebApi Controller:**  
    `backend/src/Promotora.WebApi/Controllers/ConsultasIaStreamingController.cs`  
  - **Frontend Consumer & UI:**  
    `src/api/client.ts` (`consultarIaStream(consulta, onChunk, sessionId)`) con `ReadableStream` y `TextDecoder`.  
    `src/components/JoseAssistantDrawer.tsx` con efecto de máquina de escribir y cursor activo parpadeante `▊`.
* **Cómo probarlo:**
  1. En el chat de José, enviar cualquier pregunta (ej: *"¿Cuáles son las políticas de reembolso y cancelación?"*).
  2. Observar la aparición fluida de texto palabra por palabra con el cursor rojo `▊` parpadeando en tiempo real mientras el modelo responde.

---

### Inciso 8: Reversión de Cambios sin Pérdida de Historial (`git revert`)
* **Explicación técnica:**
  En entornos colaborativos o de producción, está prohibido usar `git reset --hard` porque reescribe la historia de Git y destruye commits que otros desarrolladores ya tienen. Para revertir un commit de forma limpia, trazable y segura, se utiliza `git revert <hash>`.
  `git revert` crea un **nuevo commit** que aplica exactamente la diferencia inversa (undo) del commit problemático, preservando intacto el historial previo de auditoría.

* **Comandos exactos:**
  ```bash
  # 1. Inspeccionar el historial para identificar el commit a revertir
  git log --oneline -n 5

  # Salida de ejemplo ANTES:
  # ea6dc28 feat(ai): conteo de tokens de entrada/salida y calculo de costo en USD (#16)
  # 5a86e96 feat(ai): streaming SSE en respuestas del Agente de IA (#15)
  # 1f036d9 feat(ai): nueva tool consultar_disponibilidad_recinto para el Agente de IA (#14)
  # 9086c06 feat(api): nuevo endpoint GET /api/v1/catalogo/destacados con Clean Architecture (#13)

  # 2. Ejecutar la reversión del commit problemático (ejemplo: commit ficticio abc1234)
  git revert abc1234 --no-edit

  # 3. Subir el commit de reversión a la rama remota de forma segura
  git push origin develop

  # 4. Verificar el historial DESPUÉS
  git log --oneline -n 5

  # Salida de ejemplo DESPUÉS:
  # d94e102 Revert "commit con error"
  # abc1234 commit con error
  # 5a86e96 feat(ai): streaming SSE en respuestas del Agente de IA (#15)
  ```

---

### Inciso 9: Conteo de Tokens y Costo Estimado en USD
* **Descripción:** Se añadió la captura de métricas de consumo de la IA: tokens de entrada (prompt), tokens de salida (completion), tokens totales y el cálculo del costo aproximado en USD con base en la tarifa del modelo `gpt-oss:120b`.
* **Tarifa aplicada:**
  - Tokens de Entrada (Prompt): **$0.15 USD por millón** (`0.00000015` por token)
  - Tokens de Salida (Completion): **$0.60 USD por millón** (`0.00000060` por token)
  - Fórmula:  
    $$\text{Costo USD} = (\text{Tokens}_{\text{in}} \times 0.00000015) + (\text{Tokens}_{\text{out}} \times 0.00000060)$$
* **Archivos implementados:**
  - `src/types/api.ts` (`tokensEntrada`, `tokensSalida`, `tokensTotales`, `costoUsd`, `modelo`)
  - `src/api/client.ts` (cálculo de costos y parseo de métricas)
  - `src/components/JoseAssistantDrawer.tsx` (caja de métricas visuales al pie de cada mensaje)
* **Cómo probarlo:**
  1. Enviar cualquier mensaje a José en el drawer.
  2. Al finalizar la respuesta, observar la barra inferior de métricas en tipografía monoespaciada:
     - ⚡ Tiempo de respuesta en ms.
     - 📊 `Tokens: 250 (in: 180, out: 70)`
     - 💰 `Costo: $0.000069 USD`
     - 🤖 `gpt-oss:120b`

---

## Verificación de Compilación

El proyecto compila al 100% sin advertencias ni errores:
```bash
cd frontend
npm run build
# ✓ 2234 modules transformed.
# ✓ built in 1.47s
```
