import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

import { defineUsuario } from './Usuario.js';
import { definePaciente } from './Paciente.js';
import { defineProfesionalPaciente } from './ProfesionalPaciente.js';
import { defineCurricula } from './Curricula.js';
import { defineAdaptacion } from './Adaptacion.js';
import { defineInforme } from './Informe.js';
import { defineTarea } from './Tarea.js';

export const Usuario = defineUsuario(sequelize);
export const Paciente = definePaciente(sequelize);
export const ProfesionalPaciente = defineProfesionalPaciente(sequelize);
export const Curricula = defineCurricula(sequelize);
export const Adaptacion = defineAdaptacion(sequelize);
export const Informe = defineInforme(sequelize);
export const Tarea = defineTarea(sequelize);

// Relaciones
Paciente.belongsToMany(Usuario, {
  through: ProfesionalPaciente,
  foreignKey: 'pacienteId',
  otherKey: 'usuarioId',
  as: 'profesionales',
});
Usuario.belongsToMany(Paciente, {
  through: ProfesionalPaciente,
  foreignKey: 'usuarioId',
  otherKey: 'pacienteId',
  as: 'pacientes',
});

Paciente.hasMany(Curricula, { foreignKey: 'pacienteId', as: 'curriculas' });
Curricula.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

Curricula.hasMany(Adaptacion, { foreignKey: 'curriculaId', as: 'adaptaciones' });
Adaptacion.belongsTo(Curricula, { foreignKey: 'curriculaId', as: 'curricula' });

Paciente.hasMany(Adaptacion, { foreignKey: 'pacienteId', as: 'adaptaciones' });
Adaptacion.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

Paciente.hasMany(Informe, { foreignKey: 'pacienteId', as: 'informes' });
Informe.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

Usuario.hasMany(Informe, { foreignKey: 'autorId', as: 'informes' });
Informe.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' });

Usuario.hasMany(Curricula, { foreignKey: 'subidoPorId', as: 'curriculas' });
Curricula.belongsTo(Usuario, { foreignKey: 'subidoPorId', as: 'subidoPor' });

Paciente.hasMany(Tarea, { foreignKey: 'pacienteId', as: 'tareas' });
Tarea.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

Usuario.hasMany(Tarea, { foreignKey: 'autorId', as: 'tareas' });
Tarea.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' });

Curricula.hasMany(Tarea, { foreignKey: 'curriculaId', as: 'tareas' });
Tarea.belongsTo(Curricula, { foreignKey: 'curriculaId', as: 'curricula' });
