var {profesor} = require("../models");
const validaProfesor = (req, res, next) => {
  profesor
    .findOne({
      where: { id: req.body.id_profesor }
    })
    .then(profesor => {
      if (profesor) {
        next();
      } else {
        res.status(400).send("Bad request: profesor no existe");
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaProfesor