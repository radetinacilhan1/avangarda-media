import React from "react";

function GuideIcon() {
  return React.createElement(
    "svg",
    { viewBox: "0 0 24 24", width: 20, height: 20, fill: "none", "aria-hidden": true },
    React.createElement("path", {
      d: "M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12H7.5A2.5 2.5 0 0 1 5 16.5v-12Z",
      stroke: "currentColor",
      strokeWidth: 1.7,
    }),
    React.createElement("path", {
      d: "M8 8h7M8 11.5h7M8 15h4.5",
      stroke: "currentColor",
      strokeWidth: 1.7,
      strokeLinecap: "round",
    })
  );
}

export default {
  config: {
    locales: ["en"],
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Avangarda CMS",
        "app.components.LeftMenu.navbrand.workplace": "Urednički prostor",
        "Auth.form.welcome.title": "Dobro došli u Avangarda CMS",
        "Auth.form.welcome.subtitle": "Prijavite se za uređivanje višejezičnog sadržaja.",
      },
    },
    theme: {
      dark: {
        colors: {
          primary100: "#f6e8eb",
          primary200: "#e8c0c9",
          primary500: "#9f4057",
          primary600: "#7d263e",
          primary700: "#651d32",
          buttonPrimary500: "#9f4057",
          buttonPrimary600: "#7d263e",
        },
      },
    },
    tutorials: false,
    notifications: { releases: false },
  },
  register(app) {
    app.addMenuLink({
      to: "/plugins/avangarda-guide",
      icon: GuideIcon,
      intlLabel: {
        id: "avangarda-guide.menu",
        defaultMessage: "Avangarda vodič",
      },
      Component: async () => import("./pages/AvangardaGuide"),
      permissions: [],
    });
  },
  bootstrap() {},
};
