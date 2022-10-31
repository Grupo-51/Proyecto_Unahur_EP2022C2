'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  profesor.associate = function(models) {
    // associations can be defined here
    profesor.hasMany(models.materia, {
      as: 'Materias-QueDicta',
      foreignKey: 'id_profesor'
    })
  };
  return profesor;
};