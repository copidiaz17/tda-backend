import { DataTypes } from 'sequelize';

export function defineUsuario(sequelize) {
  return sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    rol: {
      type: DataTypes.ENUM('admin', 'profesional', 'familiar'),
      allowNull: false,
      defaultValue: 'profesional',
    },
    especialidad: {
      type: DataTypes.ENUM(
        'psicopedagoga', 'psicologa', 'maestra_integracion',
        'fonoaudiologa', 'tutor', 'medico', 'docente', 'otro'
      ),
      allowNull: true,
    },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'usuarios',
    freezeTableName: true,
    timestamps: true,
  });
}
