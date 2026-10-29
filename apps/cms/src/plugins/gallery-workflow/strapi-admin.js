import { registerGalleryMediaField } from "../../admin/gallery-workflow";

let registeredApp;

export default {
  register(app) {
    registeredApp = app;
  },
  bootstrap() {
    registerGalleryMediaField(registeredApp);
  },
};
