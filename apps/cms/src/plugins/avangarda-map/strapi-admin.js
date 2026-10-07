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
  },
};
