"use strict";

function registerAvangardaCustomFields(strapi) {
  strapi.customFields.register({
    name: "map-color",
    type: "string",
    inputSize: { default: 6, isResizable: true },
  });
  strapi.customFields.register({
    name: "headline-position",
    type: "json",
    inputSize: { default: 12, isResizable: false },
  });
}

module.exports = { registerAvangardaCustomFields };
