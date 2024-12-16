const express = require("express");
const { defineAssociations } = require("../models/Asociaciones");

const associationsInProgress = {};

const AsociacionModelos = async (req, res = express.response, next) => {
  
  console.log( associationsInProgress  )
  

  const { tenant } = req;

  if (associationsInProgress[tenant]) {
    await associationsInProgress[tenant];
  } else {
    associationsInProgress[tenant] = defineAssociations(tenant)
      .finally(() => {
        delete associationsInProgress[tenant];
      });

    await associationsInProgress[tenant];
  }

  next();
};

module.exports = { AsociacionModelos };
