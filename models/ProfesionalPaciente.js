import { DataTypes } from 'sequelize';

export function defineProfesionalPaciente(sequelize) {
  return sequelize.define('ProfesionalPaciente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pacienteId: { type: DataTypes.INTEGER, allowNull: false },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'profesional_paciente',
    freezeTableName: true,
    timestamps: true,
  });
}
