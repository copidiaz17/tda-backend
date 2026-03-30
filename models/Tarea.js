import { DataTypes } from 'sequelize';

export function defineTarea(sequelize) {
  return sequelize.define('Tarea', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pacienteId: { type: DataTypes.INTEGER, allowNull: false },
    autorId: { type: DataTypes.INTEGER, allowNull: false },
    curriculaId: { type: DataTypes.INTEGER, allowNull: true },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    materia: { type: DataTypes.STRING(100), allowNull: true },
    tipo: {
      type: DataTypes.ENUM('tarea', 'evaluacion', 'actividad', 'ejercicio', 'proyecto', 'otro'),
      allowNull: false,
      defaultValue: 'tarea',
    },
    descripcionOriginal: { type: DataTypes.TEXT('long'), allowNull: true },
    archivoNombre: { type: DataTypes.STRING(255), allowNull: true },
    archivoPath: { type: DataTypes.STRING(500), allowNull: true },
    textoExtraido: { type: DataTypes.TEXT('long'), allowNull: true },
    tareaAdaptada: { type: DataTypes.TEXT('long'), allowNull: true },
    adaptadaAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'tareas',
    freezeTableName: true,
    timestamps: true,
  });
}
