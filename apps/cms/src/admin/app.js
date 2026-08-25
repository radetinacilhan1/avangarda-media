import React from "react";

import authLogo from "./assets/avangarda-auth-logo.png";
import favicon from "./assets/avangarda-favicon.png";
import menuLogo from "./assets/avangarda-menu-logo.png";
import QuickCreateRelations from "./components/QuickCreateRelations";
import "./mobile-admin.css";
import { installRichTextEditorEnhancements } from "./richtext-editor-enhancements";

function installMobileAdminNavigation() {
  if (typeof document === "undefined" || window.__avangardaMobileAdminInstalled) return;

  const root = document.getElementById("strapi");
  if (!root?.querySelector("main")) {
    window.requestAnimationFrame(installMobileAdminNavigation);
    return;
  }

  window.__avangardaMobileAdminInstalled = true;

  const toolbar = document.createElement("div");
  toolbar.setAttribute("data-avangarda-mobile-toolbar", "true");
  toolbar.setAttribute("role", "navigation");
  toolbar.setAttribute("aria-label", "Mobilna CMS navigacija");

  const menuButton = document.createElement("button");
  menuButton.type = "button";
  menuButton.setAttribute("data-avangarda-mobile-toggle", "menu");
  menuButton.setAttribute("aria-label", "Otvori glavni meni");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.innerHTML = '<span aria-hidden="true">☰</span><span>Meni</span>';

  const contentButton = document.createElement("button");
  contentButton.type = "button";
  contentButton.setAttribute("data-avangarda-mobile-toggle", "content");
  contentButton.setAttribute("aria-label", "Otvori tipove sadržaja");
  contentButton.setAttribute("aria-expanded", "false");
  contentButton.innerHTML = '<span aria-hidden="true">☷</span><span>Sadržaj</span>';

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.hidden = true;
  backdrop.setAttribute("data-avangarda-mobile-backdrop", "true");
  backdrop.setAttribute("aria-label", "Zatvori navigaciju");

  toolbar.append(menuButton, contentButton);
  document.body.append(toolbar, backdrop);

  function setOpenDrawer(drawer) {
    if (drawer) {
      root.setAttribute("data-avangarda-mobile-drawer-open", drawer);
    } else {
      root.removeAttribute("data-avangarda-mobile-drawer-open");
    }

    menuButton.setAttribute("aria-expanded", drawer === "menu" ? "true" : "false");
    contentButton.setAttribute("aria-expanded", drawer === "content" ? "true" : "false");
    backdrop.hidden = !drawer;
  }

  function toggleDrawer(drawer) {
    const openDrawer = root.getAttribute("data-avangarda-mobile-drawer-open");
    setOpenDrawer(openDrawer === drawer ? null : drawer);
  }

  function tagCurrentLayout() {
    const main = root.querySelector("main#main-content");
    const contentNavigation = root.querySelector('nav[aria-label="Content"]');
    const mainNavigation = Array.from(root.querySelectorAll("nav")).find((navigation) => (
      navigation !== contentNavigation
      && navigation.querySelector('a[href="/admin/"]')
      && navigation.querySelector('a[href^="/admin/content-manager"]')
    ));

    root.querySelectorAll("[data-avangarda-mobile-drawer]").forEach((element) => {
      element.removeAttribute("data-avangarda-mobile-drawer");
    });
    root.querySelectorAll("[data-avangarda-mobile-layout]").forEach((element) => {
      element.removeAttribute("data-avangarda-mobile-layout");
    });

    if (mainNavigation) {
      mainNavigation.setAttribute("data-avangarda-mobile-drawer", "menu");
      mainNavigation.id = mainNavigation.id || "avangarda-main-menu";
      menuButton.setAttribute("aria-controls", mainNavigation.id);
      mainNavigation.parentElement?.setAttribute("data-avangarda-mobile-layout", "app");
    }

    if (contentNavigation) {
      contentNavigation.setAttribute("data-avangarda-mobile-drawer", "content");
      contentNavigation.id = contentNavigation.id || "avangarda-content-menu";
      contentButton.hidden = false;
      contentButton.setAttribute("aria-controls", contentNavigation.id);
      contentNavigation.parentElement?.setAttribute("data-avangarda-mobile-layout", "content");
    } else {
      contentButton.hidden = true;
      contentButton.removeAttribute("aria-controls");
      if (root.getAttribute("data-avangarda-mobile-drawer-open") === "content") {
        setOpenDrawer(null);
      }
    }

    if (main) {
      main.setAttribute("data-avangarda-mobile-layout", "main");
      main.parentElement?.setAttribute("data-avangarda-mobile-layout", "scroll");
      if (contentNavigation && contentNavigation.parentElement) {
        contentNavigation.parentElement.setAttribute("data-avangarda-mobile-layout", "content");
      } else if (main.parentElement?.parentElement) {
        main.parentElement.parentElement.setAttribute("data-avangarda-mobile-layout", "content");
      }
    }
  }

  menuButton.addEventListener("click", () => toggleDrawer("menu"));
  contentButton.addEventListener("click", () => toggleDrawer("content"));
  backdrop.addEventListener("click", () => setOpenDrawer(null));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpenDrawer(null);
  });
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest("a[href]");
    if (link?.closest("[data-avangarda-mobile-drawer]")) {
      setOpenDrawer(null);
    }
  });

  let frameId = 0;
  const observer = new MutationObserver(() => {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(tagCurrentLayout);
  });
  observer.observe(root, { childList: true, subtree: true });
  tagCurrentLayout();
}

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

    installMobileAdminNavigation();
    installRichTextEditorEnhancements();

    app.injectContentManagerComponent("editView", "right-links", {
      name: "avangarda-quick-create-relations",
      Component: QuickCreateRelations,
    });

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
