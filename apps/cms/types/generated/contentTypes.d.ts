import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiAboutPageAboutPage extends Schema.SingleType {
  collectionName: 'about_pages';
  info: {
    displayName: 'O nama / About Page';
    pluralName: 'about-pages';
    singularName: 'about-page';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::about-page.about-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    directions: Attribute.Relation<
      'api::about-page.about-page',
      'manyToMany',
      'api::editorial-direction.editorial-direction'
    >;
    editorialPrincipleText: Attribute.Text & Attribute.Required;
    editorialPrincipleText_ar: Attribute.Text;
    editorialPrincipleText_de: Attribute.Text;
    editorialPrincipleText_el: Attribute.Text;
    editorialPrincipleText_en: Attribute.Text;
    editorialPrincipleText_es: Attribute.Text;
    editorialPrincipleText_fr: Attribute.Text;
    editorialPrincipleText_tr: Attribute.Text;
    editorialPrincipleTitle: Attribute.String & Attribute.Required;
    editorialPrincipleTitle_ar: Attribute.String;
    editorialPrincipleTitle_de: Attribute.String;
    editorialPrincipleTitle_el: Attribute.String;
    editorialPrincipleTitle_en: Attribute.String;
    editorialPrincipleTitle_es: Attribute.String;
    editorialPrincipleTitle_fr: Attribute.String;
    editorialPrincipleTitle_tr: Attribute.String;
    impressumLinkLabel: Attribute.String;
    impressumLinkLabel_ar: Attribute.String;
    impressumLinkLabel_de: Attribute.String;
    impressumLinkLabel_el: Attribute.String;
    impressumLinkLabel_en: Attribute.String;
    impressumLinkLabel_es: Attribute.String;
    impressumLinkLabel_fr: Attribute.String;
    impressumLinkLabel_tr: Attribute.String;
    intro: Attribute.Text & Attribute.Required;
    intro_ar: Attribute.Text;
    intro_de: Attribute.Text;
    intro_el: Attribute.Text;
    intro_en: Attribute.Text;
    intro_es: Attribute.Text;
    intro_fr: Attribute.Text;
    intro_tr: Attribute.Text;
    peopleSectionIntro: Attribute.Text & Attribute.Required;
    peopleSectionIntro_ar: Attribute.Text;
    peopleSectionIntro_de: Attribute.Text;
    peopleSectionIntro_el: Attribute.Text;
    peopleSectionIntro_en: Attribute.Text;
    peopleSectionIntro_es: Attribute.Text;
    peopleSectionIntro_fr: Attribute.Text;
    peopleSectionIntro_tr: Attribute.Text;
    peopleSectionTitle: Attribute.String & Attribute.Required;
    peopleSectionTitle_ar: Attribute.String;
    peopleSectionTitle_de: Attribute.String;
    peopleSectionTitle_el: Attribute.String;
    peopleSectionTitle_en: Attribute.String;
    peopleSectionTitle_es: Attribute.String;
    peopleSectionTitle_fr: Attribute.String;
    peopleSectionTitle_tr: Attribute.String;
    portfolioCtaLabel: Attribute.String;
    portfolioCtaLabel_ar: Attribute.String;
    portfolioCtaLabel_de: Attribute.String;
    portfolioCtaLabel_el: Attribute.String;
    portfolioCtaLabel_en: Attribute.String;
    portfolioCtaLabel_es: Attribute.String;
    portfolioCtaLabel_fr: Attribute.String;
    portfolioCtaLabel_tr: Attribute.String;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::about-page.about-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    whoWeAreText: Attribute.Text & Attribute.Required;
    whoWeAreText_ar: Attribute.Text;
    whoWeAreText_de: Attribute.Text;
    whoWeAreText_el: Attribute.Text;
    whoWeAreText_en: Attribute.Text;
    whoWeAreText_es: Attribute.Text;
    whoWeAreText_fr: Attribute.Text;
    whoWeAreText_tr: Attribute.Text;
    whoWeAreTitle: Attribute.String & Attribute.Required;
    whoWeAreTitle_ar: Attribute.String;
    whoWeAreTitle_de: Attribute.String;
    whoWeAreTitle_el: Attribute.String;
    whoWeAreTitle_en: Attribute.String;
    whoWeAreTitle_es: Attribute.String;
    whoWeAreTitle_fr: Attribute.String;
    whoWeAreTitle_tr: Attribute.String;
  };
}

export interface ApiArticleArticle extends Schema.CollectionType {
  collectionName: 'articles';
  info: {
    displayName: 'Article';
    pluralName: 'articles';
    singularName: 'article';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    audioEmbedUrl: Attribute.String;
    authors: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::author.author'
    >;
    bodyImages: Attribute.Component<'shared.article-image-credit', true>;
    content: Attribute.RichText & Attribute.Required;
    content_ar: Attribute.RichText;
    content_de: Attribute.RichText;
    content_el: Attribute.RichText;
    content_en: Attribute.RichText;
    content_es: Attribute.RichText;
    content_fr: Attribute.RichText;
    content_tr: Attribute.RichText;
    cover: Attribute.Media<'images'> & Attribute.Required;
    coverMeta: Attribute.Component<'shared.article-image-credit'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    cta: Attribute.Component<'shared.cta'>;
    distributionNote: Attribute.Text;
    distributionNote_ar: Attribute.Text;
    distributionNote_de: Attribute.Text;
    distributionNote_el: Attribute.Text;
    distributionNote_en: Attribute.Text;
    distributionNote_es: Attribute.Text;
    distributionNote_fr: Attribute.Text;
    distributionNote_tr: Attribute.Text;
    editorialControl: Attribute.Component<'shared.editorial-control'>;
    editorialDirection: Attribute.Relation<
      'api::article.article',
      'manyToOne',
      'api::editorial-direction.editorial-direction'
    >;
    editorNote: Attribute.Text;
    focus: Attribute.String;
    imageCredits: Attribute.Component<'shared.article-image-credit', true>;
    locations: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::location.location'
    >;
    publishedAt: Attribute.DateTime;
    readingTime: Attribute.Integer;
    relatedArticles: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::article.article'
    >;
    section: Attribute.Enumeration<
      ['front', 'analysis', 'interview', 'column']
    >;
    seo: Attribute.Component<'shared.seo-meta'>;
    signalText: Attribute.String;
    signalText_ar: Attribute.String;
    signalText_de: Attribute.String;
    signalText_el: Attribute.String;
    signalText_en: Attribute.String;
    signalText_es: Attribute.String;
    signalText_fr: Attribute.String;
    signalText_tr: Attribute.String;
    slug: Attribute.UID<'api::article.article', 'title'> & Attribute.Required;
    style: Attribute.Enumeration<
      ['analiza', 'intervju', 'kolumna', 'reporta\u017Ea']
    >;
    subtitle: Attribute.String;
    subtitle_ar: Attribute.String;
    subtitle_de: Attribute.String;
    subtitle_el: Attribute.String;
    subtitle_en: Attribute.String;
    subtitle_es: Attribute.String;
    subtitle_fr: Attribute.String;
    subtitle_tr: Attribute.String;
    tags: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::tag.tag'
    >;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
    topics: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::topic.topic'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    videoEmbedUrl: Attribute.String;
    viewCount: Attribute.Integer & Attribute.DefaultTo<0>;
    year: Attribute.Integer;
  };
}

export interface ApiAuthorAuthor extends Schema.CollectionType {
  collectionName: 'authors';
  info: {
    displayName: 'Author';
    pluralName: 'authors';
    singularName: 'author';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    bio: Attribute.Text;
    bio_ar: Attribute.Text;
    bio_de: Attribute.Text;
    bio_el: Attribute.Text;
    bio_en: Attribute.Text;
    bio_es: Attribute.Text;
    bio_fr: Attribute.Text;
    bio_tr: Attribute.Text;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::author.author',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email;
    name: Attribute.String & Attribute.Required;
    photo: Attribute.Media<'images'>;
    slug: Attribute.UID<'api::author.author', 'name'> & Attribute.Required;
    socials: Attribute.Component<'shared.social', true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::author.author',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCommentComment extends Schema.CollectionType {
  collectionName: 'comments';
  info: {
    displayName: 'Comment';
    pluralName: 'comments';
    singularName: 'comment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    article: Attribute.Relation<
      'api::comment.comment',
      'manyToOne',
      'api::article.article'
    >;
    authorEmail: Attribute.Email;
    authorName: Attribute.String;
    content: Attribute.Text & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::comment.comment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ipHash: Attribute.String;
    status: Attribute.Enumeration<['pending', 'approved', 'rejected']> &
      Attribute.DefaultTo<'pending'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::comment.comment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDailyQuestionDailyQuestion extends Schema.SingleType {
  collectionName: 'daily_questions';
  info: {
    displayName: 'Pitanje dana';
    pluralName: 'daily-questions';
    singularName: 'daily-question';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    answerA: Attribute.String & Attribute.Required & Attribute.DefaultTo<'DA'>;
    answerA_ar: Attribute.String;
    answerA_de: Attribute.String;
    answerA_el: Attribute.String;
    answerA_en: Attribute.String;
    answerA_es: Attribute.String;
    answerA_fr: Attribute.String;
    answerA_tr: Attribute.String;
    answerB: Attribute.String & Attribute.Required & Attribute.DefaultTo<'NE'>;
    answerB_ar: Attribute.String;
    answerB_de: Attribute.String;
    answerB_el: Attribute.String;
    answerB_en: Attribute.String;
    answerB_es: Attribute.String;
    answerB_fr: Attribute.String;
    answerB_tr: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::daily-question.daily-question',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ctaLabel: Attribute.String & Attribute.DefaultTo<'Pro\u010Ditaj kontekst'>;
    ctaLabel_ar: Attribute.String;
    ctaLabel_de: Attribute.String;
    ctaLabel_el: Attribute.String;
    ctaLabel_en: Attribute.String;
    ctaLabel_es: Attribute.String;
    ctaLabel_fr: Attribute.String;
    ctaLabel_tr: Attribute.String;
    internalNote: Attribute.Text;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    label: Attribute.String & Attribute.DefaultTo<'PITANJE DANA'>;
    label_ar: Attribute.String;
    label_de: Attribute.String;
    label_el: Attribute.String;
    label_en: Attribute.String;
    label_es: Attribute.String;
    label_fr: Attribute.String;
    label_tr: Attribute.String;
    linkedArticle: Attribute.Relation<
      'api::daily-question.daily-question',
      'oneToOne',
      'api::article.article'
    >;
    publishedDate: Attribute.Date;
    question: Attribute.Text & Attribute.Required;
    question_ar: Attribute.Text;
    question_de: Attribute.Text;
    question_el: Attribute.Text;
    question_en: Attribute.Text;
    question_es: Attribute.Text;
    question_fr: Attribute.Text;
    question_tr: Attribute.Text;
    resetVotes: Attribute.Boolean & Attribute.DefaultTo<false>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::daily-question.daily-question',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    voteRound: Attribute.Integer & Attribute.DefaultTo<1>;
    votesA: Attribute.Integer & Attribute.DefaultTo<0>;
    votesB: Attribute.Integer & Attribute.DefaultTo<0>;
  };
}

export interface ApiDocumentaryDocumentary extends Schema.CollectionType {
  collectionName: 'documentaries';
  info: {
    displayName: 'Dokumentarci';
    pluralName: 'documentaries';
    singularName: 'documentary';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::documentary.documentary',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    date: Attribute.Date;
    description: Attribute.Text & Attribute.Required;
    description_ar: Attribute.Text;
    description_de: Attribute.Text;
    description_el: Attribute.Text;
    description_en: Attribute.Text;
    description_es: Attribute.Text;
    description_fr: Attribute.Text;
    description_tr: Attribute.Text;
    director: Attribute.String;
    director_ar: Attribute.String;
    director_de: Attribute.String;
    director_el: Attribute.String;
    director_en: Attribute.String;
    director_es: Attribute.String;
    director_fr: Attribute.String;
    director_tr: Attribute.String;
    duration: Attribute.String;
    duration_ar: Attribute.String;
    duration_de: Attribute.String;
    duration_el: Attribute.String;
    duration_en: Attribute.String;
    duration_es: Attribute.String;
    duration_fr: Attribute.String;
    duration_tr: Attribute.String;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    isFeatured: Attribute.Boolean & Attribute.DefaultTo<false>;
    location: Attribute.String;
    location_ar: Attribute.String;
    location_de: Attribute.String;
    location_el: Attribute.String;
    location_en: Attribute.String;
    location_es: Attribute.String;
    location_fr: Attribute.String;
    location_tr: Attribute.String;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    slug: Attribute.UID<'api::documentary.documentary', 'title'> &
      Attribute.Required;
    thumbnail: Attribute.Media<'images'>;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::documentary.documentary',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    youtubeUrl: Attribute.String & Attribute.Required;
    youtubeVideoId: Attribute.String;
  };
}

export interface ApiEditorialDirectionEditorialDirection
  extends Schema.CollectionType {
  collectionName: 'editorial_directions';
  info: {
    displayName: 'Editorial Direction';
    pluralName: 'editorial-directions';
    singularName: 'editorial-direction';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::editorial-direction.editorial-direction',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text & Attribute.Required;
    description_ar: Attribute.Text;
    description_de: Attribute.Text;
    description_el: Attribute.Text;
    description_en: Attribute.Text;
    description_es: Attribute.Text;
    description_fr: Attribute.Text;
    description_tr: Attribute.Text;
    displayOrder: Attribute.Integer & Attribute.DefaultTo<1>;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    ordinal: Attribute.Integer & Attribute.Required;
    relatedArticles: Attribute.Relation<
      'api::editorial-direction.editorial-direction',
      'manyToMany',
      'api::article.article'
    >;
    slug: Attribute.String & Attribute.Required & Attribute.Unique;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::editorial-direction.editorial-direction',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEditorialSignalEditorialSignal extends Schema.SingleType {
  collectionName: 'editorial_signals';
  info: {
    displayName: 'Uredni\u010Dki signal';
    pluralName: 'editorial-signals';
    singularName: 'editorial-signal';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    author: Attribute.String;
    author_ar: Attribute.String;
    author_de: Attribute.String;
    author_el: Attribute.String;
    author_en: Attribute.String;
    author_es: Attribute.String;
    author_fr: Attribute.String;
    author_tr: Attribute.String;
    backgroundMode: Attribute.Enumeration<['yellow', 'dark', 'outline']> &
      Attribute.DefaultTo<'yellow'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::editorial-signal.editorial-signal',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ctaLabel: Attribute.String & Attribute.DefaultTo<'Pro\u010Ditaj kontekst'>;
    ctaLabel_ar: Attribute.String;
    ctaLabel_de: Attribute.String;
    ctaLabel_el: Attribute.String;
    ctaLabel_en: Attribute.String;
    ctaLabel_es: Attribute.String;
    ctaLabel_fr: Attribute.String;
    ctaLabel_tr: Attribute.String;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    label: Attribute.String & Attribute.DefaultTo<'UREDNI\u010CKI SIGNAL'>;
    label_ar: Attribute.String;
    label_de: Attribute.String;
    label_el: Attribute.String;
    label_en: Attribute.String;
    label_es: Attribute.String;
    label_fr: Attribute.String;
    label_tr: Attribute.String;
    linkedArticle: Attribute.Relation<
      'api::editorial-signal.editorial-signal',
      'oneToOne',
      'api::article.article'
    >;
    priority: Attribute.Integer;
    source: Attribute.String;
    source_ar: Attribute.String;
    source_de: Attribute.String;
    source_el: Attribute.String;
    source_en: Attribute.String;
    source_es: Attribute.String;
    source_fr: Attribute.String;
    source_tr: Attribute.String;
    text: Attribute.Text & Attribute.Required;
    text_ar: Attribute.Text;
    text_de: Attribute.Text;
    text_el: Attribute.Text;
    text_en: Attribute.Text;
    text_es: Attribute.Text;
    text_fr: Attribute.Text;
    text_tr: Attribute.Text;
    type: Attribute.Enumeration<
      ['quote', 'statement', 'question', 'manifesto']
    > &
      Attribute.DefaultTo<'statement'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::editorial-signal.editorial-signal',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedNote: Attribute.Text;
  };
}

export interface ApiHomepageConfigHomepageConfig extends Schema.SingleType {
  collectionName: 'homepage_configs';
  info: {
    displayName: 'Homepage Config';
    pluralName: 'homepage-configs';
    singularName: 'homepage-config';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::homepage-config.homepage-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currentItems: Attribute.Component<'shared.sidebar-item', true>;
    currentLabel: Attribute.String & Attribute.DefaultTo<'Sada'>;
    currentLabel_ar: Attribute.String & Attribute.DefaultTo<'Sada'>;
    currentLabel_de: Attribute.String & Attribute.DefaultTo<'Sada'>;
    currentLabel_el: Attribute.String & Attribute.DefaultTo<'Sada'>;
    currentLabel_en: Attribute.String & Attribute.DefaultTo<'Sada'>;
    currentLabel_es: Attribute.String & Attribute.DefaultTo<'Sada'>;
    currentLabel_fr: Attribute.String & Attribute.DefaultTo<'Sada'>;
    currentLabel_tr: Attribute.String & Attribute.DefaultTo<'Sada'>;
    editorialCards: Attribute.Component<'shared.homepage-editorial-card', true>;
    mostReadItems: Attribute.Component<'shared.sidebar-item', true>;
    mostReadLabel: Attribute.String & Attribute.DefaultTo<'Naj\u010Ditanije'>;
    mostReadLabel_ar: Attribute.String &
      Attribute.DefaultTo<'Naj\u010Ditanije'>;
    mostReadLabel_de: Attribute.String &
      Attribute.DefaultTo<'Naj\u010Ditanije'>;
    mostReadLabel_el: Attribute.String &
      Attribute.DefaultTo<'Naj\u010Ditanije'>;
    mostReadLabel_en: Attribute.String &
      Attribute.DefaultTo<'Naj\u010Ditanije'>;
    mostReadLabel_es: Attribute.String &
      Attribute.DefaultTo<'Naj\u010Ditanije'>;
    mostReadLabel_fr: Attribute.String &
      Attribute.DefaultTo<'Naj\u010Ditanije'>;
    mostReadLabel_tr: Attribute.String &
      Attribute.DefaultTo<'Naj\u010Ditanije'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::homepage-config.homepage-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiImpressumImpressum extends Schema.SingleType {
  collectionName: 'impressums';
  info: {
    displayName: 'Impresum';
    pluralName: 'impressums';
    singularName: 'impressum';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    contactEmail: Attribute.Email;
    copyrightNotice: Attribute.Text;
    copyrightNotice_ar: Attribute.Text;
    copyrightNotice_de: Attribute.Text;
    copyrightNotice_el: Attribute.Text;
    copyrightNotice_en: Attribute.Text;
    copyrightNotice_es: Attribute.Text;
    copyrightNotice_fr: Attribute.Text;
    copyrightNotice_tr: Attribute.Text;
    country: Attribute.String;
    country_ar: Attribute.String;
    country_de: Attribute.String;
    country_el: Attribute.String;
    country_en: Attribute.String;
    country_es: Attribute.String;
    country_fr: Attribute.String;
    country_tr: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::impressum.impressum',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    editorialPolicyShort: Attribute.Text;
    editorialPolicyShort_ar: Attribute.Text;
    editorialPolicyShort_de: Attribute.Text;
    editorialPolicyShort_el: Attribute.Text;
    editorialPolicyShort_en: Attribute.Text;
    editorialPolicyShort_es: Attribute.Text;
    editorialPolicyShort_fr: Attribute.Text;
    editorialPolicyShort_tr: Attribute.Text;
    editorInChief: Attribute.String;
    editorInChief_ar: Attribute.String;
    editorInChief_de: Attribute.String;
    editorInChief_el: Attribute.String;
    editorInChief_en: Attribute.String;
    editorInChief_es: Attribute.String;
    editorInChief_fr: Attribute.String;
    editorInChief_tr: Attribute.String;
    heroTitle: Attribute.String;
    heroTitle_ar: Attribute.String;
    heroTitle_de: Attribute.String;
    heroTitle_el: Attribute.String;
    heroTitle_en: Attribute.String;
    heroTitle_es: Attribute.String;
    heroTitle_fr: Attribute.String;
    heroTitle_tr: Attribute.String;
    lastUpdated: Attribute.Date;
    lastUpdatedLabel: Attribute.String;
    lastUpdatedLabel_ar: Attribute.String;
    lastUpdatedLabel_de: Attribute.String;
    lastUpdatedLabel_el: Attribute.String;
    lastUpdatedLabel_en: Attribute.String;
    lastUpdatedLabel_es: Attribute.String;
    lastUpdatedLabel_fr: Attribute.String;
    lastUpdatedLabel_tr: Attribute.String;
    legalRepresentative: Attribute.String;
    legalRepresentative_ar: Attribute.String;
    legalRepresentative_de: Attribute.String;
    legalRepresentative_el: Attribute.String;
    legalRepresentative_en: Attribute.String;
    legalRepresentative_es: Attribute.String;
    legalRepresentative_fr: Attribute.String;
    legalRepresentative_tr: Attribute.String;
    mediaProjectName: Attribute.String;
    mediaProjectName_ar: Attribute.String;
    mediaProjectName_de: Attribute.String;
    mediaProjectName_el: Attribute.String;
    mediaProjectName_en: Attribute.String;
    mediaProjectName_es: Attribute.String;
    mediaProjectName_fr: Attribute.String;
    mediaProjectName_tr: Attribute.String;
    mediaRegistryNumber: Attribute.String;
    municipality: Attribute.String;
    municipality_ar: Attribute.String;
    municipality_de: Attribute.String;
    municipality_el: Attribute.String;
    municipality_en: Attribute.String;
    municipality_es: Attribute.String;
    municipality_fr: Attribute.String;
    municipality_tr: Attribute.String;
    organisationName: Attribute.String;
    organisationName_ar: Attribute.String;
    organisationName_de: Attribute.String;
    organisationName_el: Attribute.String;
    organisationName_en: Attribute.String;
    organisationName_es: Attribute.String;
    organisationName_fr: Attribute.String;
    organisationName_tr: Attribute.String;
    pageSummary: Attribute.Text;
    pageSummary_ar: Attribute.Text;
    pageSummary_de: Attribute.Text;
    pageSummary_el: Attribute.Text;
    pageSummary_en: Attribute.Text;
    pageSummary_es: Attribute.Text;
    pageSummary_fr: Attribute.Text;
    pageSummary_tr: Attribute.Text;
    phone: Attribute.String;
    privacyContactEmail: Attribute.Email;
    projectOwner: Attribute.String;
    projectOwner_ar: Attribute.String;
    projectOwner_de: Attribute.String;
    projectOwner_el: Attribute.String;
    projectOwner_en: Attribute.String;
    projectOwner_es: Attribute.String;
    projectOwner_fr: Attribute.String;
    projectOwner_tr: Attribute.String;
    publisherFullLegalName: Attribute.String;
    publisherFullLegalName_ar: Attribute.String;
    publisherFullLegalName_de: Attribute.String;
    publisherFullLegalName_el: Attribute.String;
    publisherFullLegalName_en: Attribute.String;
    publisherFullLegalName_es: Attribute.String;
    publisherFullLegalName_fr: Attribute.String;
    publisherFullLegalName_tr: Attribute.String;
    publisherLegalForm: Attribute.String;
    publisherLegalForm_ar: Attribute.String;
    publisherLegalForm_de: Attribute.String;
    publisherLegalForm_el: Attribute.String;
    publisherLegalForm_en: Attribute.String;
    publisherLegalForm_es: Attribute.String;
    publisherLegalForm_fr: Attribute.String;
    publisherLegalForm_tr: Attribute.String;
    publisherName: Attribute.String & Attribute.Required;
    publisherName_ar: Attribute.String;
    publisherName_de: Attribute.String;
    publisherName_el: Attribute.String;
    publisherName_en: Attribute.String;
    publisherName_es: Attribute.String;
    publisherName_fr: Attribute.String;
    publisherName_tr: Attribute.String;
    registeredAddress: Attribute.String;
    registeredAddress_ar: Attribute.String;
    registeredAddress_de: Attribute.String;
    registeredAddress_el: Attribute.String;
    registeredAddress_en: Attribute.String;
    registeredAddress_es: Attribute.String;
    registeredAddress_fr: Attribute.String;
    registeredAddress_tr: Attribute.String;
    registrationNumber: Attribute.String;
    responsibilityNote: Attribute.Text;
    responsibilityNote_ar: Attribute.Text;
    responsibilityNote_de: Attribute.Text;
    responsibilityNote_el: Attribute.Text;
    responsibilityNote_en: Attribute.Text;
    responsibilityNote_es: Attribute.Text;
    responsibilityNote_fr: Attribute.Text;
    responsibilityNote_tr: Attribute.Text;
    siteName: Attribute.String & Attribute.Required;
    siteName_ar: Attribute.String;
    siteName_de: Attribute.String;
    siteName_el: Attribute.String;
    siteName_en: Attribute.String;
    siteName_es: Attribute.String;
    siteName_fr: Attribute.String;
    siteName_tr: Attribute.String;
    socialLinks: Attribute.Component<'shared.social', true>;
    statusNote: Attribute.Text;
    statusNote_ar: Attribute.Text;
    statusNote_de: Attribute.Text;
    statusNote_el: Attribute.Text;
    statusNote_en: Attribute.Text;
    statusNote_es: Attribute.Text;
    statusNote_fr: Attribute.Text;
    statusNote_tr: Attribute.Text;
    taxNumber: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::impressum.impressum',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    websiteUrl: Attribute.String;
  };
}

export interface ApiLocationLocation extends Schema.CollectionType {
  collectionName: 'locations';
  info: {
    displayName: 'Location';
    pluralName: 'locations';
    singularName: 'location';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    active: Attribute.Boolean & Attribute.DefaultTo<true>;
    country: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::location.location',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    description_ar: Attribute.Text;
    description_de: Attribute.Text;
    description_el: Attribute.Text;
    description_en: Attribute.Text;
    description_es: Attribute.Text;
    description_fr: Attribute.Text;
    description_tr: Attribute.Text;
    latitude: Attribute.Decimal;
    longitude: Attribute.Decimal;
    name: Attribute.String & Attribute.Required;
    name_ar: Attribute.String;
    name_de: Attribute.String;
    name_el: Attribute.String;
    name_en: Attribute.String;
    name_es: Attribute.String;
    name_fr: Attribute.String;
    name_tr: Attribute.String;
    region: Attribute.String;
    slug: Attribute.UID<'api::location.location', 'name'> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::location.location',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSignalSignal extends Schema.CollectionType {
  collectionName: 'signals';
  info: {
    displayName: 'Signal';
    pluralName: 'signals';
    singularName: 'signal';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::signal.signal',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    date: Attribute.Date & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    description_ar: Attribute.Text;
    description_de: Attribute.Text;
    description_el: Attribute.Text;
    description_en: Attribute.Text;
    description_es: Attribute.Text;
    description_fr: Attribute.Text;
    description_tr: Attribute.Text;
    editorialNote: Attribute.Text;
    editorialNote_ar: Attribute.Text;
    editorialNote_de: Attribute.Text;
    editorialNote_el: Attribute.Text;
    editorialNote_en: Attribute.Text;
    editorialNote_es: Attribute.Text;
    editorialNote_fr: Attribute.Text;
    editorialNote_tr: Attribute.Text;
    externalSourceKey: Attribute.String;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    isFeatured: Attribute.Boolean & Attribute.DefaultTo<true>;
    methodNote: Attribute.Text;
    methodNote_ar: Attribute.Text;
    methodNote_de: Attribute.Text;
    methodNote_el: Attribute.Text;
    methodNote_en: Attribute.Text;
    methodNote_es: Attribute.Text;
    methodNote_fr: Attribute.Text;
    methodNote_tr: Attribute.Text;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    region: Attribute.String;
    region_ar: Attribute.String;
    region_de: Attribute.String;
    region_el: Attribute.String;
    region_en: Attribute.String;
    region_es: Attribute.String;
    region_fr: Attribute.String;
    region_tr: Attribute.String;
    relatedAnalysis: Attribute.Relation<
      'api::signal.signal',
      'manyToOne',
      'api::article.article'
    >;
    relatedSection: Attribute.Enumeration<
      ['front', 'analysis', 'interview', 'column']
    > &
      Attribute.DefaultTo<'analysis'>;
    showOnHomepage: Attribute.Boolean & Attribute.DefaultTo<false>;
    source: Attribute.String & Attribute.Required;
    source_ar: Attribute.String;
    source_de: Attribute.String;
    source_el: Attribute.String;
    source_en: Attribute.String;
    source_es: Attribute.String;
    source_fr: Attribute.String;
    source_tr: Attribute.String;
    sourceUrl: Attribute.String & Attribute.Required;
    title: Attribute.String & Attribute.Required;
    title_ar: Attribute.String;
    title_de: Attribute.String;
    title_el: Attribute.String;
    title_en: Attribute.String;
    title_es: Attribute.String;
    title_fr: Attribute.String;
    title_tr: Attribute.String;
    topics: Attribute.Relation<
      'api::signal.signal',
      'manyToMany',
      'api::topic.topic'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::signal.signal',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    value: Attribute.String & Attribute.Required;
    value_ar: Attribute.String;
    value_de: Attribute.String;
    value_el: Attribute.String;
    value_en: Attribute.String;
    value_es: Attribute.String;
    value_fr: Attribute.String;
    value_tr: Attribute.String;
  };
}

export interface ApiTagTag extends Schema.CollectionType {
  collectionName: 'tags';
  info: {
    displayName: 'Tag';
    pluralName: 'tags';
    singularName: 'tag';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    slug: Attribute.UID<'api::tag.tag', 'name'> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiTeamMemberTeamMember extends Schema.CollectionType {
  collectionName: 'team_members';
  info: {
    displayName: 'Ljudi iza Avangarde';
    pluralName: 'team-members';
    singularName: 'team-member';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    awards: Attribute.Component<'people.portfolio-entry', true>;
    certifications: Attribute.Component<'people.portfolio-entry', true>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::team-member.team-member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    customSections: Attribute.Component<'people.custom-section', true>;
    cvFile: Attribute.Media<'files'>;
    education: Attribute.Component<'people.portfolio-entry', true>;
    email: Attribute.Email;
    experience: Attribute.Component<'people.portfolio-entry', true>;
    fullName: Attribute.String & Attribute.Required;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    languages: Attribute.Component<'people.portfolio-tag', true>;
    location: Attribute.String;
    location_ar: Attribute.String;
    location_de: Attribute.String;
    location_el: Attribute.String;
    location_en: Attribute.String;
    location_es: Attribute.String;
    location_fr: Attribute.String;
    location_tr: Attribute.String;
    longBio: Attribute.RichText;
    longBio_ar: Attribute.RichText;
    longBio_de: Attribute.RichText;
    longBio_el: Attribute.RichText;
    longBio_en: Attribute.RichText;
    longBio_es: Attribute.RichText;
    longBio_fr: Attribute.RichText;
    longBio_tr: Attribute.RichText;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    portfolioEnabled: Attribute.Boolean & Attribute.DefaultTo<true>;
    portrait: Attribute.Media<'images'>;
    projects: Attribute.Component<'people.portfolio-entry', true>;
    publications: Attribute.Component<'people.portfolio-entry', true>;
    relatedArticles: Attribute.Relation<
      'api::team-member.team-member',
      'manyToMany',
      'api::article.article'
    >;
    role: Attribute.String & Attribute.Required;
    role_ar: Attribute.String;
    role_de: Attribute.String;
    role_el: Attribute.String;
    role_en: Attribute.String;
    role_es: Attribute.String;
    role_fr: Attribute.String;
    role_tr: Attribute.String;
    shortBio: Attribute.Text & Attribute.Required;
    shortBio_ar: Attribute.Text;
    shortBio_de: Attribute.Text;
    shortBio_el: Attribute.Text;
    shortBio_en: Attribute.Text;
    shortBio_es: Attribute.Text;
    shortBio_fr: Attribute.Text;
    shortBio_tr: Attribute.Text;
    skills: Attribute.Component<'people.portfolio-tag', true>;
    slug: Attribute.UID<'api::team-member.team-member', 'fullName'> &
      Attribute.Required;
    socialLinks: Attribute.Component<'shared.social', true>;
    trainings: Attribute.Component<'people.portfolio-entry', true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::team-member.team-member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    website: Attribute.String;
  };
}

export interface ApiTopicTopic extends Schema.CollectionType {
  collectionName: 'topics';
  info: {
    displayName: 'Topic';
    pluralName: 'topics';
    singularName: 'topic';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::topic.topic',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    name_ar: Attribute.String;
    name_de: Attribute.String;
    name_el: Attribute.String;
    name_en: Attribute.String;
    name_es: Attribute.String;
    name_fr: Attribute.String;
    name_tr: Attribute.String;
    slug: Attribute.UID<'api::topic.topic', 'name'> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::topic.topic',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::about-page.about-page': ApiAboutPageAboutPage;
      'api::article.article': ApiArticleArticle;
      'api::author.author': ApiAuthorAuthor;
      'api::comment.comment': ApiCommentComment;
      'api::daily-question.daily-question': ApiDailyQuestionDailyQuestion;
      'api::documentary.documentary': ApiDocumentaryDocumentary;
      'api::editorial-direction.editorial-direction': ApiEditorialDirectionEditorialDirection;
      'api::editorial-signal.editorial-signal': ApiEditorialSignalEditorialSignal;
      'api::homepage-config.homepage-config': ApiHomepageConfigHomepageConfig;
      'api::impressum.impressum': ApiImpressumImpressum;
      'api::location.location': ApiLocationLocation;
      'api::signal.signal': ApiSignalSignal;
      'api::tag.tag': ApiTagTag;
      'api::team-member.team-member': ApiTeamMemberTeamMember;
      'api::topic.topic': ApiTopicTopic;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
