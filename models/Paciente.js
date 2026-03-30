import { DataTypes } from 'sequelize';

export function definePaciente(sequelize) {
  return sequelize.define('Paciente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: false },
    fechaNacimiento: { type: DataTypes.DATEONLY, allowNull: true },
    dni: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    diagnosticoPrincipal: {
      type: DataTypes.ENUM('TDA', 'TDAH', 'TDAH_combinado', 'otro'),
      allowNull: false,
    },
    subtipo: { type: DataTypes.STRING(100), allowNull: true },
    severidad: {
      type: DataTypes.ENUM('leve', 'moderado', 'severo'),
      allowNull: true,
    },
    medicacion: { type: DataTypes.STRING(255), allowNull: true },
    escuela: { type: DataTypes.STRING(200), allowNull: true },
    grado: { type: DataTypes.STRING(50), allowNull: true },
    turno: {
      type: DataTypes.ENUM('mañana', 'tarde', 'vespertino'),
      allowNull: true,
    },
    observacionesGenerales: { type: DataTypes.TEXT, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'pacientes',
    freezeTableName: true,
    timestamps: true,
  });
}
