'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: DataTypes.STRING,
    id_materia: DataTypes.INTEGER
  }, {});
  profesor.associate = function(models) {
  	profesor.belongsTo(models.materia// modelo al que pertenece
    ,{
      as : 'Materia-QueDicta',  // nombre de mi relacion
      foreignKey: 'id_materia'     // campo con el que voy a igualar
    })
  };
  return profesor;
};