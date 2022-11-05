var {materia} = require("../models");
const validaCarreraMateria = (req, res, next) => {
  materia
    .findOne({
      where: { id_carrera: req.params.id }
    })
    .then(materia => {
      if (materia) {
        res.status(400).send("Bad request: existen materias de la carrera, no se puede eliminar");
      } else {
        next();
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaCarreraMateria