import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SIN_API_KEY = `## ⚠️ IA no configurada

La adaptación curricular con Inteligencia Artificial requiere una API key de Anthropic.

Para activar esta funcionalidad:
1. Obtené tu API key en https://console.anthropic.com
2. Agregá \`ANTHROPIC_API_KEY=tu_key\` en el archivo \`.env\` del backend
3. Reiniciá el servidor

Una vez configurada, el sistema generará automáticamente la currícula adaptada según el diagnóstico del paciente.`;

export async function generarAdaptacion({ paciente, textoCurricula, informesPrevios = [] }) {
  const client = getClient();
  if (!client) return { contenido: SIN_API_KEY, sinApiKey: true };

  const diagnosticoStr = `${paciente.diagnosticoPrincipal}${paciente.subtipo ? ' - ' + paciente.subtipo : ''}${paciente.severidad ? ' (severidad: ' + paciente.severidad + ')' : ''}`;

  const contextoInformes = informesPrevios.length > 0
    ? `\n\nINFORMES DE PROFESIONALES PREVIOS:\n${informesPrevios.map(i => `[${i.tipo.toUpperCase()} - ${i.autor}]:\n${i.texto}`).join('\n\n---\n\n')}`
    : '';

  const prompt = `Sos una especialista en adaptaciones curriculares para estudiantes con diagnóstico de ${diagnosticoStr}.

DATOS DEL ESTUDIANTE:
- Nombre: ${paciente.nombre} ${paciente.apellido}
- Diagnóstico: ${diagnosticoStr}
- Grado: ${paciente.grado || 'no especificado'}
- Escuela: ${paciente.escuela || 'no especificada'}
- Turno: ${paciente.turno || 'no especificado'}
- Medicación: ${paciente.medicacion || 'ninguna'}
- Observaciones: ${paciente.observacionesGenerales || 'ninguna'}
${contextoInformes}

CURRÍCULA ORIGINAL:
${textoCurricula}

Tu tarea es generar una ADAPTACIÓN CURRICULAR COMPLETA en formato Markdown que incluya:

1. **Resumen del diagnóstico y sus implicancias** - cómo afecta el aprendizaje
2. **Adaptaciones metodológicas** - cómo presentar los contenidos
3. **Adaptaciones de evaluación** - cómo evaluar al estudiante
4. **Ajustes de tiempo** - tiempos extendidos, pausas, etc.
5. **Estrategias específicas por contenido** - adaptá cada unidad/tema de la currícula
6. **Materiales y recursos sugeridos** - herramientas concretas
7. **Indicaciones para el docente** - pautas de acompañamiento
8. **Indicaciones para el equipo interdisciplinario** - coordinación con profesionales

Sé específica, práctica y concreta. La adaptación debe ser directamente aplicable en el aula.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  return { contenido: message.content[0].text, sinApiKey: false };
}

export async function actualizarAdaptacionConInforme({ paciente, adaptacionActual, informe }) {
  const client = getClient();
  if (!client) return { contenido: SIN_API_KEY, sinApiKey: true };

  const prompt = `Sos una especialista en adaptaciones curriculares para estudiantes con TDA/TDAH.

ESTUDIANTE: ${paciente.nombre} ${paciente.apellido}
Diagnóstico: ${paciente.diagnosticoPrincipal} ${paciente.subtipo || ''} - ${paciente.severidad || ''}

ADAPTACIÓN CURRICULAR VIGENTE:
${adaptacionActual}

NUEVO INFORME DE ${informe.tipo.toUpperCase()} (emitido por: ${informe.autor}):
${informe.texto}

Tu tarea es ACTUALIZAR la adaptación curricular incorporando las recomendaciones y hallazgos del nuevo informe.
- Mantené toda la estructura existente
- Resaltá los cambios con "✏️ ACTUALIZADO:" al inicio de cada sección modificada
- Agregá al inicio un bloque "## Cambios incorporados" explicando qué cambió y por qué
- Si el informe no requiere cambios en alguna sección, dejala igual

Respondé con la adaptación completa actualizada en formato Markdown.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  return { contenido: message.content[0].text, sinApiKey: false };
}

export async function adaptarTarea({ paciente, tarea, informesPrevios = [] }) {
  const client = getClient();
  if (!client) return { contenido: SIN_API_KEY, sinApiKey: true };

  const diagnosticoStr = `${paciente.diagnosticoPrincipal}${paciente.subtipo ? ' - ' + paciente.subtipo : ''}${paciente.severidad ? ' (severidad: ' + paciente.severidad + ')' : ''}`;

  const contextoInformes = informesPrevios.length > 0
    ? `\n\nCONTEXTO CLÍNICO (informes del equipo interdisciplinario):\n${informesPrevios.map(i => `[${i.tipo.toUpperCase()} - ${i.autor}]:\n${i.texto}`).join('\n\n---\n\n')}`
    : '';

  const prompt = `Sos una especialista en adaptaciones pedagógicas para estudiantes con ${diagnosticoStr}.

DATOS DEL ESTUDIANTE:
- Nombre: ${paciente.nombre} ${paciente.apellido}
- Diagnóstico: ${diagnosticoStr}
- Grado: ${paciente.grado || 'no especificado'}
- Escuela: ${paciente.escuela || 'no especificada'}
- Turno: ${paciente.turno || 'no especificado'}
- Medicación: ${paciente.medicacion || 'ninguna'}
- Observaciones: ${paciente.observacionesGenerales || 'ninguna'}
${contextoInformes}

TAREA ORIGINAL:
Título: ${tarea.titulo}
Tipo: ${tarea.tipo}
Materia: ${tarea.materia || 'no especificada'}

${tarea.textoTarea}

---

Tu tarea es devolver esta tarea ADAPTADA en formato Markdown para que sea accesible y realizable por el estudiante según su diagnóstico. Incluí:

## 📋 Tarea adaptada: ${tarea.titulo}

**Materia:** ${tarea.materia || '-'} | **Tipo:** ${tarea.tipo}

### Consigna adaptada
(Reescribí la consigna con lenguaje claro, simple, sin ambigüedades. Usá oraciones cortas.)

### Pasos para realizarla
(Numerá los pasos en orden. Máximo 5-6 pasos concretos.)

### Apoyos sugeridos
(Materiales visuales, ayudas concretas, herramientas que puede usar)

### Tiempo estimado
(Estimá bloques de tiempo recomendados con pausas)

### Para el docente / acompañante
(Pautas específicas de acompañamiento durante esta tarea)

### Criterios de evaluación adaptados
(Cómo evaluar el desempeño teniendo en cuenta el diagnóstico)

Sé concreta y práctica. La adaptación debe poder usarse directamente en clase o en casa.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  return { contenido: message.content[0].text, sinApiKey: false };
}
