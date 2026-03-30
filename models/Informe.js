import { DataTypes } from 'sequelize';

export function defineInforme(sequelize) {
  return sequelize.define('Informe', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pacienteId: { type: DataTypes.INTEGER, allowNull: false },
    autorId: { type: DataTypes.INTEGER, allowNull: false },
    tipo: {
      type: DataTypes.ENUM(
        'psicopedagogico', 'psicologico', 'fonoaudiologico',
        'medico', 'pedagogico', 'integracion', 'otro'
      ),
      allowNull: false,
    },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    archivoNombre: { type: DataTypes.STRING(255), allowNull: true },
    archivoPath: { type: DataTypes.STRING(500), allowNull: true },
    textoExtraido: { type: DataTypes.TEXT('long'), allowNull: true },
    contenidoManual: { type: DataTypes.TEXT('long'), allowNull: true },
    incorporadoEnAdaptacion: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'informes',
    freezeTableName: true,
    timestamps: true,
  });
}
