// Strapi v4 calls plugin register hooks before loading Content Manager.
// The application's admin config supports config/bootstrap, not register.
export default {
  register(app) {
    app.customFields.register({
      name: "map-color",
      type: "string",
      intlLabel: { id: "avangarda.map-color.label", defaultMessage: "Boja na mapi" },
      intlDescription: { id: "avangarda.map-color.description", defaultMessage: "Boja autora u HEX formatu (#RRGGBB)." },
      components: { Input: async () => import("../../admin/components/MapColorInput") },
    });
    app.customFields.register({
      name: "headline-position",
      type: "json",
      intlLabel: { id: "avangarda.headline-position.label", defaultMessage: "Pozicija na naslovnoj" },
      intlDescription: { id: "avangarda.headline-position.description", defaultMessage: "Predlog reda pet glavnih priča; primenjuje se pri objavi." },
      components: { Input: async () => import("../../admin/components/HeadlinePositionInput") },
    });
  },
};
