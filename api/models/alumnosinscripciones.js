'use strict';
module.exports = (sequelize, DataTypes) => {
  const alumnosinscripciones = sequelize.define('alumnosinscripciones', {
    id_alumno: DataTypes.INTEGER,
    id_materia: DataTypes.INTEGER,
    nota_final: DataTypes.INTEGER
  }, {});

  alumnosinscripciones.associate = function(models) {
  	//asociacion a alumno y materia (pertenece a:)
  	alumnosinscripciones.belongsTo(models.materia// modelo al que pertenece
    ,{
      as : 'Materia-Matriculada',  // nombre de mi relacion
      foreignKey: 'id_materia'     // campo con el que voy a igualar
    }),
    alumnosinscripciones.belongsTo(models.alumno// modelo al que pertenece
    ,{
      as : 'Alumno-Matriculado',  // nombre de mi relacion
      foreignKey: 'id_alumno'     // campo con el que voy a igualar
    })
  	/////////////////////
  }
  return alumnosinscripciones;
};