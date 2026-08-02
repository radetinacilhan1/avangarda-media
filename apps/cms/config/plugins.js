module.exports = ({ env }) => {
  const cloudinaryName = env("CLOUDINARY_NAME");
  const cloudinaryKey = env("CLOUDINARY_KEY");
  const cloudinarySecret = env("CLOUDINARY_SECRET");
  const hasCloudinaryConfig = Boolean(
    cloudinaryName && cloudinaryKey && cloudinarySecret
  );

  return {
    "users-permissions": { config: { jwtSecret: env("JWT_SECRET") } },
    ...(hasCloudinaryConfig
      ? {
          upload: {
            config: {
              provider: "cloudinary",
              providerOptions: {
                cloud_name: cloudinaryName,
                api_key: cloudinaryKey,
                api_secret: cloudinarySecret,
              },
              actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
              },
            },
          },
        }
      : {}),
  };
};
