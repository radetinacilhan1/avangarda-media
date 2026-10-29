"use strict";

const GALLERY_UID = "api::gallery.gallery";

function createGalleryWriteGuard() {
  // Only active operations are retained, with no request body or form data.
  const active = new Set();
  return (controller, action) => async function (ctx, ...args) {
    const { model, id } = ctx.params || {};
    // Installed around native controllers, after their authentication and route
    // policies. An unauthenticated request can never reserve a gallery lock.
    if (model !== GALLERY_UID || !ctx.state?.user?.id) return controller.call(this, ctx, ...args);
    const key = action === "create" ? `new:${ctx.state.user.id}` : /^\d+$/.test(String(id)) ? `gallery:${id}` : null;
    if (!key) return controller.call(this, ctx, ...args);
    if (active.has(key)) {
      ctx.set("Retry-After", "1");
      ctx.status = 409;
      ctx.body = { data: null, error: { status: 409, name: "ConflictError", message: "Prethodno čuvanje ili objavljivanje ove galerije još traje. Sačekajte završetak i proverite sačuvanu verziju pre novog pokušaja.", details: { code: "WRITE_IN_PROGRESS", requestId: ctx.state.cmsRequestId } } };
      return;
    }
    active.add(key);
    try { return await controller.call(this, ctx, ...args); }
    finally { active.delete(key); }
  };
}

function installGalleryWriteGuard(plugin) {
  const guard = createGalleryWriteGuard();
  for (const action of ["create", "update", "publish", "unpublish"]) {
    const controller = plugin.controllers["collection-types"][action];
    if (typeof controller === "function") plugin.controllers["collection-types"][action] = guard(controller, action);
  }
}

module.exports = { createGalleryWriteGuard, installGalleryWriteGuard };
