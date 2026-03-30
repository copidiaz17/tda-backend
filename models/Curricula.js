import { DataTypes } from 'sequelize';

export function defineCurricula(sequelize) {
  return sequelize.define('Curricula', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pacienteId: { type: DataTypes.INTEGER, allowNull: false },
    subidoPorId: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    materia: { type: DataTypes.STRING(100), allowNull: true },
    anioEscolar: { type: DataTypes.STRING(20), allowNull: true },
    archivoNombre: { type: DataTypes.STRING(255), allowNull: false },
    archivoPath: { type: DataTypes.STRING(500), allowNull: false },
    textoExtraido: { type: DataTypes.TEXT('long'), allowNull: true },
    activa: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'curriculas',
    freezeTableName: true,
    timestamps: true,
  });
}
