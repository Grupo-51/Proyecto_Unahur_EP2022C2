var {materia} = require("../models");
const validaProfesorMateria = (req, res, next) => {
  materia
    .findOne({
      where: { id_profesor: req.params.id }
    })
    .then(materia => {
      if (materia) {
        res.status(400).send("Bad request: existen materias que dicta el profesor, no se puede eliminar");
      } else {
        next();
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaProfesorMateria