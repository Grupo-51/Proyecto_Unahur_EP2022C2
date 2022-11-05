var {alumnosinscripciones} = require("../models");
const validaInscripcionMateria = (req, res, next) => {
  alumnosinscripciones
    .findOne({
      where: { id_materia: req.params.id }
    })
    .then(alumnosinscripciones => {
      if (alumnosinscripciones) {
        res.status(400).send("Bad request: materia tiene inscripciones, no se puede eliminar");
      } else {
        next();
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaInscripcionMateria