'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING
  }, {});
  carrera.associate = function(models) {
    // associations can be defined here
    carrera.hasMany(models.materia, {
      as: 'Plan-DeEstudios',
      foreignKey: 'id_carrera'
    })
  };
  return carrera;
};