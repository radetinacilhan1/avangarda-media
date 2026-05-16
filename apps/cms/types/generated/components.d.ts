import type { Attribute, Schema } from '@strapi/strapi';

export interface PeopleCustomSection extends Schema.Component {
  collectionName: 'components_people_custom_sections';
  info: {
    displayName: 'Custom Section';
  };
  attributes: {
    body: Attribute.Text;
    body_ar: Attribute.Text;
    body_de: Attribute.Text;
    body_el: Attribute.Text;
    body_en: Attribute.Text;
    body_es: Attribute.Text;
    body_fr: Attribute.Text;
    body_tr: Attribute.Text;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
  };
}

export interface PeoplePortfolioEntry extends Schema.Component {
  collectionName: 'components_people_portfolio_entries';
  info: {
    displayName: 'Portfolio Entry';
  };
  attributes: {
    description: Attribute.Text;
    description_ar: Attribute.Text;
    description_de: Attribute.Text;
    description_el: Attribute.Text;
    description_en: Attribute.Text;
    description_es: Attribute.Text;
    description_fr: Attribute.Text;
    description_tr: Attribute.Text;
    location: Attribute.String;
    location_ar: Attribute.String;
    location_de: Attribute.String;
    location_el: Attribute.String;
    location_en: Attribute.String;
    location_es: Attribute.String;
    location_fr: Attribute.String;
    location_tr: Attribute.String;
    organisation: Attribute.String;
    organisation_ar: Attribute.String;
    organisation_de: Attribute.String;
    organisation_el: Attribute.String;
    organisation_en: Attribute.String;
    organisation_es: Attribute.String;
    organisation_fr: Attribute.String;
    organisation_tr: Attribute.String;
    period: Attribute.String;
    period_ar: Attribute.String;
    period_de: Attribute.String;
    period_el: Attribute.String;
    period_en: Attribute.String;
    period_es: Attribute.String;
    period_fr: Attribute.String;
    period_tr: Attribute.String;
    subtitle: Attribute.String;
    subtitle_ar: Attribute.String;
    subtitle_de: Attribute.String;
    subtitle_el: Attribute.String;
    subtitle_en: Attribute.String;
    subtitle_es: Attribute.String;
    subtitle_fr: Attribute.String;
    subtitle_tr: Attribute.String;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
    url: Attribute.String;
  };
}

export interface PeoplePortfolioTag extends Schema.Component {
  collectionName: 'components_people_portfolio_tags';
  info: {
    displayName: 'Portfolio Tag';
  };
  attributes: {
    label: Attribute.String & Attribute.Required;
    label_ar: Attribute.String;
    label_de: Attribute.String;
    label_el: Attribute.String;
    label_en: Attribute.String;
    label_es: Attribute.String;
    label_fr: Attribute.String;
    label_tr: Attribute.String;
  };
}

export interface SharedCta extends Schema.Component {
  collectionName: 'components_shared_ctas';
  info: {
    displayName: 'CTA';
  };
  attributes: {
    label: Attribute.String;
    label_ar: Attribute.String;
    label_de: Attribute.String;
    label_el: Attribute.String;
    label_en: Attribute.String;
    label_es: Attribute.String;
    label_fr: Attribute.String;
    label_tr: Attribute.String;
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
    ctaLabel_ar: Attribute.String;
    ctaLabel_de: Attribute.String;
    ctaLabel_el: Attribute.String;
    ctaLabel_en: Attribute.String;
    ctaLabel_es: Attribute.String;
    ctaLabel_fr: Attribute.String;
    ctaLabel_tr: Attribute.String;
    label: Attribute.String;
    label_ar: Attribute.String;
    label_de: Attribute.String;
    label_el: Attribute.String;
    label_en: Attribute.String;
    label_es: Attribute.String;
    label_fr: Attribute.String;
    label_tr: Attribute.String;
    text: Attribute.Text & Attribute.Required;
    text_ar: Attribute.Text;
    text_de: Attribute.Text;
    text_el: Attribute.Text;
    text_en: Attribute.Text;
    text_es: Attribute.Text;
    text_fr: Attribute.Text;
    text_tr: Attribute.Text;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
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
    seoDescription_ar: Attribute.Text;
    seoDescription_de: Attribute.Text;
    seoDescription_el: Attribute.Text;
    seoDescription_en: Attribute.Text;
    seoDescription_es: Attribute.Text;
    seoDescription_fr: Attribute.Text;
    seoDescription_tr: Attribute.Text;
    seoTitle: Attribute.String;
    seoTitle_ar: Attribute.String;
    seoTitle_de: Attribute.String;
    seoTitle_el: Attribute.String;
    seoTitle_en: Attribute.String;
    seoTitle_es: Attribute.String;
    seoTitle_fr: Attribute.String;
    seoTitle_tr: Attribute.String;
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
    shortDescription_ar: Attribute.Text;
    shortDescription_de: Attribute.Text;
    shortDescription_el: Attribute.Text;
    shortDescription_en: Attribute.Text;
    shortDescription_es: Attribute.Text;
    shortDescription_fr: Attribute.Text;
    shortDescription_tr: Attribute.Text;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
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
      'people.custom-section': PeopleCustomSection;
      'people.portfolio-entry': PeoplePortfolioEntry;
      'people.portfolio-tag': PeoplePortfolioTag;
      'shared.cta': SharedCta;
      'shared.editorial-control': SharedEditorialControl;
      'shared.homepage-editorial-card': SharedHomepageEditorialCard;
      'shared.seo-meta': SharedSeoMeta;
      'shared.sidebar-item': SharedSidebarItem;
      'shared.social': SharedSocial;
    }
  }
}
