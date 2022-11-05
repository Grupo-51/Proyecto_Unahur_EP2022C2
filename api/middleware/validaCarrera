var {carrera} = require("../models");
const validaCarrera = (req, res, next) => {
  carrera
    .findOne({
      where: { id: req.body.id_carrera }
    })
    .then(carrera => {
      if (carrera) {
        next();
      } else {
        res.status(400).send("Bad request: carrera no existe");
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaCarrera