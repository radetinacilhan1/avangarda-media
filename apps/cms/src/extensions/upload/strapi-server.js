"use strict";

const { extendUploadService } = require("../../upload-file-hash");

module.exports = (plugin) => {
  plugin.services.upload = extendUploadService(plugin.services.upload);
  return plugin;
};
