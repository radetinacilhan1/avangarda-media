import type { Attribute, Schema } from '@strapi/strapi';

export interface SharedCta extends Schema.Component {
  collectionName: 'components_shared_ctas';
  info: {
    displayName: 'CTA';
  };
  attributes: {
    label: Attribute.String;
    type: Attribute.Enumeration<['watch', 'read', 'listen', 'support', 'join']>;
    url: Attribute.String;
  };
}

export interface SharedEditorialControl extends Schema.Component {
  collectionName: 'components_shared_editorial_controls';
  info: {
    displayName: 'Editorial Control';
  };
  attributes: {
    isBreaking: Attribute.Boolean & Attribute.DefaultTo<false>;
    isFeatured: Attribute.Boolean & Attribute.DefaultTo<false>;
    isTrending: Attribute.Boolean & Attribute.DefaultTo<false>;
    priority: Attribute.Integer & Attribute.DefaultTo<0>;
  };
}

export interface SharedHomepageEditorialCard extends Schema.Component {
  collectionName: 'components_shared_homepage_editorial_cards';
  info: {
    displayName: 'Homepage editorial card';
  };
  attributes: {
    ctaHref: Attribute.String;
    ctaLabel: Attribute.String;
    ctaLabel_de: Attribute.String;
    ctaLabel_en: Attribute.String;
    ctaLabel_fr: Attribute.String;
    ctaLabel_tr: Attribute.String;
    label: Attribute.String;
    label_de: Attribute.String;
    label_en: Attribute.String;
    label_fr: Attribute.String;
    label_tr: Attribute.String;
    text: Attribute.Text & Attribute.Required;
    text_de: Attribute.Text;
    text_en: Attribute.Text;
    text_fr: Attribute.Text;
    text_tr: Attribute.Text;
    title: Attribute.String & Attribute.Required;
    title_de: Attribute.String;
    title_en: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
  };
}

export interface SharedSeoMeta extends Schema.Component {
  collectionName: 'components_shared_seo_meta';
  info: {
    displayName: 'SEO';
  };
  attributes: {
    seoDescription: Attribute.Text;
    seoTitle: Attribute.String;
  };
}

export interface SharedSidebarItem extends Schema.Component {
  collectionName: 'components_shared_sidebar_items';
  info: {
    displayName: 'Sidebar Item';
  };
  attributes: {
    image: Attribute.Media<'images'>;
    link: Attribute.String;
    shortDescription: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface SharedSocial extends Schema.Component {
  collectionName: 'components_shared_socials';
  info: {
    displayName: 'Social';
  };
  attributes: {
    platform: Attribute.Enumeration<
      ['instagram', 'tiktok', 'x', 'facebook', 'youtube', 'website']
    >;
    url: Attribute.String & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.cta': SharedCta;
      'shared.editorial-control': SharedEditorialControl;
      'shared.homepage-editorial-card': SharedHomepageEditorialCard;
      'shared.seo-meta': SharedSeoMeta;
      'shared.sidebar-item': SharedSidebarItem;
      'shared.social': SharedSocial;
    }
  }
}
