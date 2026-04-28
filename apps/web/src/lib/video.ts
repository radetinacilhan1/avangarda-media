function extractYouTubeId(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    let id = "";

    if (url.hostname.includes("youtu.be")) {
      id = url.pathname.replace("/", "").trim();
    } else if (url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/embed/")[1]?.split("/")[0] ?? "";
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/shorts/")[1]?.split("/")[0] ?? "";
    } else {
      id = url.searchParams.get("v") ?? "";
    }

    if (!id) return null;
    return id;
  } catch {
    return null;
  }
}

type VideoVariant = "hero" | "article";

export function getYouTubeEmbedUrl(value?: string | null, variant: VideoVariant = "article") {
  const id = extractYouTubeId(value);
  if (!id) return null;

  const embed = new URL(`https://www.youtube.com/embed/${id}`);
  const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  embed.searchParams.set("autoplay", "1");
  embed.searchParams.set("mute", "1");
  embed.searchParams.set("playsinline", "1");
  embed.searchParams.set("rel", "0");
  embed.searchParams.set("modestbranding", "1");
  embed.searchParams.set("playlist", id);
  embed.searchParams.set("enablejsapi", "1");
  embed.searchParams.set("origin", siteOrigin);

  if (variant === "hero") {
    embed.searchParams.set("controls", "0");
    embed.searchParams.set("loop", "1");
    embed.searchParams.set("showinfo", "0");
    embed.searchParams.set("iv_load_policy", "3");
    embed.searchParams.set("disablekb", "1");
  } else {
    embed.searchParams.set("controls", "1");
  }

  return embed.toString();
}
