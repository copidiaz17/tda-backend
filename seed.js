import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { sequelize, Usuario, Paciente, ProfesionalPaciente } from './models/index.js';

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Tablas creadas');

  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await Usuario.create({
    nombre: 'Admin', apellido: 'Sistema', email: 'admin@sistema.com',
    password: adminPass, rol: 'admin',
  });

  const psico = await Usuario.create({
    nombre: 'María', apellido: 'González', email: 'psico@sistema.com',
    password: await bcrypt.hash('psico123', 10), rol: 'profesional', especialidad: 'psicologa',
  });

  const psicoped = await Usuario.create({
    nombre: 'Laura', apellido: 'Martínez', email: 'psicoped@sistema.com',
    password: await bcrypt.hash('psicoped123', 10), rol: 'profesional', especialidad: 'psicopedagoga',
  });

  const maestra = await Usuario.create({
    nombre: 'Ana', apellido: 'Rodríguez', email: 'maestra@sistema.com',
    password: await bcrypt.hash('maestra123', 10), rol: 'profesional', especialidad: 'maestra_integracion',
  });

  const paciente1 = await Paciente.create({
    nombre: 'Tomás', apellido: 'Pérez', fechaNacimiento: '2016-05-15',
    diagnosticoPrincipal: 'TDAH', subtipo: 'con predominio hiperactivo-impulsivo',
    severidad: 'moderado', escuela: 'Escuela N° 12 Belgrano',
    grado: '4° grado', turno: 'mañana',
    observacionesGenerales: 'Dificultad para mantenerse en la tarea. Buen desempeño con tareas concretas y visuales.',
  });

  const paciente2 = await Paciente.create({
    nombre: 'Valentina', apellido: 'López', fechaNacimiento: '2017-09-22',
    diagnosticoPrincipal: 'TDA', subtipo: 'con predominio inatento',
    severidad: 'leve', escuela: 'Colegio San Martín',
    grado: '3° grado', turno: 'tarde',
    observacionesGenerales: 'Muy distraída, necesita apoyo en organización. Creatividad destacada.',
  });

  // Asignar profesionales a paciente1
  await ProfesionalPaciente.create({ pacienteId: paciente1.id, usuarioId: psico.id });
  await ProfesionalPaciente.create({ pacienteId: paciente1.id, usuarioId: psicoped.id });
  await ProfesionalPaciente.create({ pacienteId: paciente1.id, usuarioId: maestra.id });

  // Asignar profesionales a paciente2
  await ProfesionalPaciente.create({ pacienteId: paciente2.id, usuarioId: psicoped.id });

  console.log('\n✅ Seed completado\n');
  console.log('Usuarios creados:');
  console.log('  admin@sistema.com / admin123  (admin)');
  console.log('  psico@sistema.com / psico123  (psicóloga)');
  console.log('  psicoped@sistema.com / psicoped123  (psicopedagoga)');
  console.log('  maestra@sistema.com / maestra123  (maestra integración)');
  console.log('\nPacientes:');
  console.log('  Tomás Pérez — TDAH moderado (equipo: psicóloga, psicopedagoga, maestra)');
  console.log('  Valentina López — TDA leve (equipo: psicopedagoga)');

  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
