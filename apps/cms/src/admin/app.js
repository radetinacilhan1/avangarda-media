import React from "react";

import authLogo from "./assets/avangarda-auth-logo.png";
import favicon from "./assets/avangarda-favicon.png";
import menuLogo from "./assets/avangarda-menu-logo.png";

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
    auth: { logo: authLogo },
    head: { favicon },
    menu: { logo: menuLogo },
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
  bootstrap(app) {
    if (typeof document !== "undefined") {
      let faviconLink = document.querySelector('link[data-avangarda-favicon="true"]');
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.setAttribute("data-avangarda-favicon", "true");
        faviconLink.setAttribute("rel", "icon");
        faviconLink.setAttribute("type", "image/png");
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute("href", favicon);
    }

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
};
