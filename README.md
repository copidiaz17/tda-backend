# Seguimiento-TDA — AI Curriculum Adaptation for Special Education

A platform to follow up students with learning/health diagnoses. It reads professional reports (**Word / PDF**) and uses **Claude to generate and keep updated individualized curriculum adaptations** based on each student's diagnosis and prior reports — and to adapt specific classroom tasks to their needs.

## AI features
- **Generate adaptation** — builds an individualized curriculum adaptation from the student's diagnosis + prior professional reports.
- **Update with new report** — re-generates the adaptation when a new professional report comes in.
- **Adapt a task** — rewrites a specific assignment to fit the student's needs.
- **Reads source reports** from `.docx` (mammoth / word-extractor) and `.pdf` (pdf-parse) automatically.

## Tech stack
`Node.js` · `Express` · `Anthropic SDK (Claude)` · `Sequelize + MySQL` · `pdf-parse` · `mammoth` · `word-extractor` · `Multer` · `Vue 3`

> Built by [copidiaz17](https://github.com/copidiaz17) — AI automation & full-stack developer.
