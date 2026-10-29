"use strict";
const { createGalleryRequestErrors } = require("../gallery-request-errors");
module.exports = (_config, { strapi }) => createGalleryRequestErrors(strapi);
