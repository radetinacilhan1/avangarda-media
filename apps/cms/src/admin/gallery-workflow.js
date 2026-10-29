import GalleryWorkflow from "./components/GalleryWorkflow";
import { createGalleryMediaField } from "./components/GalleryMediaField";
import { galleryLayout } from "./gallery-workflow-utils";

export function installGalleryWorkflow(app) {
  app.registerHook("Admin/CM/pages/EditView/mutate-edit-view-layout", galleryLayout);
  app.injectContentManagerComponent("editView", "right-links", {
    name: "avangarda-gallery-workflow",
    Component: GalleryWorkflow,
  });
}

export function registerGalleryMediaField(app) {
  // A local plugin retains the full register() app. Application bootstrap only
  // receives selected methods, and cannot inspect the field registry. Register
  // the wrapper during plugin bootstrap after native upload registration.
  const NativeMedia = app.library?.fields?.fields?.media;
  if (!NativeMedia) throw new Error("Gallery workflow requires the registered native media field.");
  app.addFields({ type: "media", Component: createGalleryMediaField(NativeMedia) });
}
