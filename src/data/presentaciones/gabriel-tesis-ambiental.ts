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
        <p>4 sesiones. Presupuesto simbólico (USD 10-15) — esto es mentoría, no un proyecto a medida.</p>
        <ol class="pasos">
          <li><b>El objetivo no es entregar el sistema completo.</b> Es dejar la arquitectura de la capa agéntica definida y una base funcionando que el practicante pueda seguir solo.</li>
          <li><b>Cada sesión cierra con algo concreto</b> — no son charlas abiertas, hay un entregable chico por sesión.</li>
          <li><b>El practicante hace, yo guío.</b> La idea es que el conocimiento quede en el equipo de Gabriel, no en mí.</li>
        </ol>
        <div class="beneficio">✦ <b>Beneficio:</b>&nbsp;expectativas alineadas desde el minuto uno evita que la sesión 4 termine siendo la sesión 1 otra vez.</div>
      `,
    },
    {
      emoji: '🎯',
      titulo: 'Alcance: qué entra en las 4 sesiones y qué no',
      html: `
        <div class="table-wrap">
          <table class="tabla">
            <thead><tr><th></th><th>Entra en las 4 sesiones</th><th>Queda para después</th></tr></thead>
            <tbody>
              <tr><td>Cobertura normativa</td><td class="t-ok">✔ Un corpus acotado de prueba</td><td class="t-bad">Toda la legislación ambiental del país</td></tr>
              <tr><td>Chatbots</td><td class="t-ok">✔ Uno solo (público <i>o</i> privado)</td><td class="t-bad">Los dos funcionando en paralelo</td></tr>
              <tr><td>Integración Drive</td><td class="t-ok">✔ Conexión de prueba, una carpeta</td><td class="t-bad">Integración productiva con Drive real de empresas</td></tr>
              <tr><td>Actualización diaria</td><td class="t-ok">✔ Diseño de cómo haría falta</td><td class="t-bad">Agentes corriendo en producción todos los días</td></tr>
              <tr><td>Entregable</td><td class="t-ok">✔ Arquitectura documentada + demo</td><td class="t-bad">Sistema terminado y desplegado</td></tr>
            </tbody>
          </table>
        </div>
        <div class="beneficio">✦ <b>Beneficio:</b>&nbsp;un alcance chico y demostrable en 4 sesiones vale más para la tesis que una promesa grande sin terminar.</div>
      `,
    },
    {
      emoji: '❓',
      titulo: 'Preguntas clave para relevar hoy',
      html: `
        <ol class="pasos">
          <li><b>¿Qué nivel de código maneja el practicante?</b> ¿Python? ¿Ya tocó APIs o LLMs, o viene de frontend puro?</li>
          <li><b>¿Qué dejó definido el mentor de UX/UI?</b> Pantallas y flujos de usuario — no arquitectura técnica, hay que confirmarlo.</li>
          <li><b>¿Ya tienen normativa/documentos de ejemplo recopilados</b>, o hay que armar el corpus de prueba desde cero?</li>
          <li><b>Prioridad: ¿chatbot público o privado primero?</b> No se puede empezar por los dos a la vez.</li>
          <li>¿Qué significa exactamente <b>"conectado al Drive de las empresas"</b>? ¿Leer archivos que ellas suben? ¿Con qué permisos?</li>
          <li>¿Hay <b>fecha límite de entrega de la tesis</b> que condicione el cronograma de las 4 sesiones?</li>
        </ol>
        <div class="beneficio">✦ <b>Beneficio:</b>&nbsp;estas respuestas definen si el stack es n8n (rápido, sin código pesado) o Python/LangChain (si el practicante ya programa bien).</div>
      `,
    },
    {
      emoji: '🗺️',
      titulo: 'Temario propuesto de las 4 sesiones',
      html: `
        <div class="flujo">
          <span class="flujo-item"><span class="flujo-caja">1️⃣ Arquitectura y stack</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">2️⃣ Ingesta y RAG</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">3️⃣ Agente conversacional</span><span class="flujo-flecha">→</span></span>
          <span class="flujo-item"><span class="flujo-caja">4️⃣ Cierre y documentación</span></span>
        </div>
        <ol class="pasos">
          <li><b>Sesión 1 — Arquitectura:</b> stack (LLM, vector DB, orquestador), corte de alcance del corpus de prueba.</li>
          <li><b>Sesión 2 — RAG:</b> ingestión de normativa, chunking, embeddings, base de conocimiento.</li>
          <li><b>Sesión 3 — Agente:</b> chatbot con herramientas (búsqueda en el RAG, conexión de prueba a Drive), prompts y memoria.</li>
          <li><b>Sesión 4 — Cierre:</b> ajustes, evaluación del demo, documentación para que el practicante siga solo.</li>
        </ol>
      `,
    },
    {
      emoji: '🚀',
      titulo: 'Entregable final y próximos pasos',
      html: `
        <ul class="pasos">
          <li>🗺️ <b>Arquitectura documentada</b> de la capa agéntica, con las decisiones y el porqué de cada una.</li>
          <li>🤖 <b>Demo funcionando</b> de un agente RAG sobre el corpus de prueba definido en sesión 1.</li>
          <li>📋 <b>Guía para el practicante</b>: cómo seguir solo, qué falta para producción.</li>
          <li>📈 <b>Insumo real para la tesis</b>: la mentoría en sí misma es evidencia del "impacto de la IA aplicada" que Gabriel está evaluando.</li>
        </ul>
        <div class="beneficio">✦ <b>Beneficio:</b>&nbsp;Gabriel sale de las 4 sesiones con algo que puede mostrar en la defensa de tesis, no solo con anotaciones de una charla.</div>
      `,
    },
  ],
};
