var {materia} = require("../models");
const validaMateria = (req, res, next) => {
  materia
    .findOne({
      where: { id: req.body.id_materia }
    })
    .then(materia => {
      if (materia) {
        next();
      } else {
        res.status(400).send("Bad request: materia no existe");
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaMateria