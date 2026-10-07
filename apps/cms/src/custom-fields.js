"use strict";

function registerAvangardaCustomFields(strapi) {
  strapi.customFields.register({
    name: "map-color",
    type: "string",
    inputSize: { default: 6, isResizable: true },
  });
}

module.exports = { registerAvangardaCustomFields };
