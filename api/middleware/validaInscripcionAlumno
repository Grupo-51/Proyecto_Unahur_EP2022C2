var {alumnosinscripciones} = require("../models");
const validaInscripcionAlumno = (req, res, next) => {
  alumnosinscripciones
    .findOne({
      where: { id_alumno: req.params.id }
    })
    .then(alumnosinscripciones => {
      if (alumnosinscripciones) {
        res.status(400).send("Bad request: alumno tiene inscripciones, no se puede eliminar");
      } else {
        next();
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaInscripcionAlumno