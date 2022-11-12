'use strict';
module.exports = (sequelize, DataTypes) => {
  const alumno = sequelize.define('alumno', {
    DNI: {type: DataTypes.INTEGER, allownull: false, unique: true},
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  alumno.associate = function(models) {
    // associations can be defined here
    alumno.hasMany(models.alumnosinscripciones, {
      as: 'Inscripciones',
      foreignKey: 'id_alumno'
    })
  };
  return alumno;
};