import { DataTypes } from 'sequelize';

export function defineAdaptacion(sequelize) {
  return sequelize.define('Adaptacion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pacienteId: { type: DataTypes.INTEGER, allowNull: false },
    curriculaId: { type: DataTypes.INTEGER, allowNull: false },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    contenido: { type: DataTypes.TEXT('long'), allowNull: false },
    motivoActualizacion: { type: DataTypes.TEXT, allowNull: true },
    informeBaseId: { type: DataTypes.INTEGER, allowNull: true },
    activa: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'adaptaciones',
    freezeTableName: true,
    timestamps: true,
  });
}
