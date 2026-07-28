export interface Slide {
  emoji: string;
  titulo: string;
  html: string;
}

export interface Presentacion {
  slug: string;
  cliente: string;
  titulo: string;
  subtitulo: string;
  fecha: string;
  slides: Slide[];
}

export const presentacion: Presentacion = {
  slug: 'gabriel-tesis-ambiental',
  cliente: 'Gabriel Ibrahin Tovar',
  titulo: 'Mentoría — Capa agéntica para tesis ambiental',
  subtitulo: 'Reunión 1 · relevamiento y alcance de las 4 sesiones',
  fecha: '2026-07-27',
  slides: [
    {
      emoji: '🌎',
      titulo: 'El proyecto de Gabriel',
      html: `
        <p>
          Tesis: evaluar el <b>impacto de la IA en la prevención de delitos ambientales</b>.
          El sistema que están construyendo (Gabriel + practicante de Ing. Informática, con
          un mentor de UX/UI que ya definió funcionalidades):
        </p>
        <div class="flujo">
          <span class="flujo-item"><span class="flujo-caja">📜 Monitorea legislación ambiental</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">🗂️ RAG propio (normas + Drive de empresas)</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">💬 Chatbot público + privado</span></span>
        </div>
        <p>
          Además: <b>agentes que alimentan y mejoran el sistema a diario</b>, de forma masiva.
        </p>
        <div class="beneficio">✦ <b>Objetivo de hoy:</b>&nbsp;confirmar que este resumen es correcto antes de entrar en arquitectura.</div>
      `,
    },
    {
      emoji: '🧭',
      titulo: 'Cómo va a funcionar esta mentoría',
      html: `
        <p>4 sesiones enfocadas en <b>dejar la capa agéntica armada y funcionando</b>. Cada encuentro tiene un entregable concreto.</p>
        <ol class="pasos">
          <li><b>Cada sesión cierra con algo andando</b> — no son charlas abiertas, hay un resultado tangible por encuentro.</li>
          <li><b>El practicante hace, yo guío.</b> La idea es que el conocimiento quede en el equipo de Gabriel.</li>
          <li><b>Al final de las 4 sesiones:</b> arquitectura definida, RAG funcionando, agente conversacional con demo, y documentación para seguir solos.</li>
        </ol>
        <div class="beneficio">✦ <b>Beneficio:</b>&nbsp;expectativas alineadas desde el minuto uno para llegar al final con resultados concretos.</div>
      `,
    },
    {
      emoji: '🎯',
      titulo: 'Qué vamos a lograr en las 4 sesiones',
      html: `
        <div class="table-wrap">
          <table class="tabla">
            <thead><tr><th></th><th>Lo que entregamos</th><th>Siguiente etapa (post-mentoría)</th></tr></thead>
            <tbody>
              <tr><td>Cobertura normativa</td><td class="t-ok">✔ Corpus de prueba ingestado y buscable</td><td class="t-bad">Escalar a toda la legislación del país</td></tr>
              <tr><td>Chatbot</td><td class="t-ok">✔ Un agente conversacional funcionando (público <i>o</i> privado)</td><td class="t-bad">Segundo chatbot en paralelo</td></tr>
              <tr><td>Integración Drive</td><td class="t-ok">✔ Conexión de prueba con una carpeta real</td><td class="t-bad">Integración productiva multi-empresa</td></tr>
              <tr><td>Actualización diaria</td><td class="t-ok">✔ Diseño del pipeline de ingesta automática</td><td class="t-bad">Agentes corriendo en producción 24/7</td></tr>
              <tr><td>Entregable</td><td class="t-ok">✔ Arquitectura documentada + demo funcional</td><td class="t-bad">Deploy a producción con usuarios reales</td></tr>
            </tbody>
          </table>
        </div>
        <div class="beneficio">✦ <b>Beneficio:</b>&nbsp;un entregable concreto y demostrable que sirve como evidencia real para la defensa de tesis.</div>
      `,
    },
    {
      emoji: '❓',
      titulo: 'Preguntas clave para definir el stack',
      html: `
        <ol class="pasos">
          <li><b>¿Qué nivel de código maneja el practicante?</b> ¿Python? ¿Ya tocó APIs o LLMs, o viene de frontend puro?</li>
          <li><b>¿Qué dejó definido el mentor de UX/UI?</b> Pantallas y flujos de usuario — confirmamos que no incluye arquitectura técnica.</li>
          <li><b>¿Ya tienen normativa/documentos de ejemplo recopilados</b>, o armamos el corpus de prueba desde cero?</li>
          <li><b>Prioridad: ¿chatbot público o privado primero?</b> Arrancamos por uno y dejamos el otro documentado.</li>
          <li>¿Qué significa exactamente <b>"conectado al Drive de las empresas"</b>? ¿Leer archivos que ellas suben? ¿Con qué permisos?</li>
          <li>¿Hay <b>fecha límite de entrega de la tesis</b> que condicione el cronograma?</li>
        </ol>
        <div class="beneficio">✦ <b>Beneficio:</b>&nbsp;estas respuestas definen si el stack es n8n (rápido, sin código pesado) o Python/LangChain (si el practicante ya programa bien).</div>
      `,
    },
    {
      emoji: '🗺️',
      titulo: 'Plan de las 4 sesiones',
      html: `
        <div class="flujo">
          <span class="flujo-item"><span class="flujo-caja">1️⃣ Arquitectura y stack</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">2️⃣ Ingesta y RAG</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">3️⃣ Agente conversacional</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">4️⃣ Cierre y documentación</span></span>
        </div>
        <ol class="pasos">
          <li><b>Sesión 1 — Arquitectura:</b> definimos stack (LLM, vector DB, orquestador) y recortamos el corpus de prueba.</li>
          <li><b>Sesión 2 — RAG:</b> ingestamos normativa real, configuramos chunking, embeddings y la base de conocimiento.</li>
          <li><b>Sesión 3 — Agente:</b> armamos el chatbot con herramientas (búsqueda en RAG, conexión a Drive), prompts y memoria.</li>
          <li><b>Sesión 4 — Cierre:</b> ajustes al demo, evaluación, y documentación completa para que el practicante siga autónomo.</li>
        </ol>
      `,
    },
    {
      emoji: '🚀',
      titulo: 'Qué se lleva Gabriel al final',
      html: `
        <ul class="pasos">
          <li>🗺️ <b>Arquitectura documentada</b> de la capa agéntica, con cada decisión técnica fundamentada.</li>
          <li>🤖 <b>Demo funcionando</b> — un agente RAG que responde sobre el corpus de prueba definido en sesión 1.</li>
          <li>📋 <b>Guía de continuidad</b> para el practicante: qué falta, cómo seguir, y el camino a producción.</li>
          <li>📈 <b>Evidencia para la tesis</b> — la mentoría y el demo son insumo directo para demostrar el impacto de la IA aplicada a la prevención ambiental.</li>
        </ul>
        <div class="beneficio">✦ <b>Resultado:</b>&nbsp;Gabriel sale con algo que puede mostrar en la defensa de tesis — un sistema real, no solo apuntes.</div>
      `,
    },
  ],
};
