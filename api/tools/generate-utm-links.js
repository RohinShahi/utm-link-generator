// Channel → { utm_source, utm_medium } mapping
const CHANNEL_MAP = {
  linkedin: { source: "linkedin", medium: "social" },
  email: { source: "email", medium: "email" },
  blog: { source: "blog", medium: "organic" },
  paid_search: { source: "google", medium: "cpc" },
  twitter: { source: "twitter", medium: "social" },
  facebook: { source: "facebook", medium: "social" },
  instagram: { source: "instagram", medium: "social" },
  display: { source: "display", medium: "display" },
  youtube: { source: "youtube", medium: "video" },
  direct: { source: "direct", medium: "none" },
};

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildUtmUrl(baseUrl, params) {
  try {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, val]) => {
      if (val) url.searchParams.set(key, val);
    });
    return url.toString();
  } catch {
    // Fallback: manual query string append
    const separator = baseUrl.includes("?") ? "&" : "?";
    const qs = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    return `${baseUrl}${separator}${qs}`;
  }
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base_url, campaign_name, channels, campaign_content } = req.body ?? {};

  // Validate required inputs
  if (!base_url || typeof base_url !== "string") {
    return res.status(400).json({ error: "base_url is required and must be a string." });
  }
  if (!campaign_name || typeof campaign_name !== "string") {
    return res.status(400).json({ error: "campaign_name is required and must be a string." });
  }
  if (!channels || !Array.isArray(channels) || channels.length === 0) {
    return res.status(400).json({ error: "channels is required and must be a non-empty array." });
  }

  const campaignSlug = slugify(campaign_name);
  const results = [];
  const unknown = [];

  for (const ch of channels) {
    const key = ch.toLowerCase().trim().replace(/\s+/g, "_");
    const mapping = CHANNEL_MAP[key];

    if (!mapping) {
      unknown.push(ch);
      // Still generate a URL using the channel name itself
      const utmParams = {
        utm_source: key,
        utm_medium: "custom",
        utm_campaign: campaignSlug,
        ...(campaign_content ? { utm_content: slugify(campaign_content) } : {}),
      };
      results.push({
        channel: ch,
        utm_source: key,
        utm_medium: "custom",
        utm_campaign: campaignSlug,
        utm_content: campaign_content ? slugify(campaign_content) : null,
        url: buildUtmUrl(base_url, utmParams),
        note: "Unrecognized channel — used channel name as utm_source with medium=custom.",
      });
      continue;
    }

    const utmParams = {
      utm_source: mapping.source,
      utm_medium: mapping.medium,
      utm_campaign: campaignSlug,
      ...(campaign_content ? { utm_content: slugify(campaign_content) } : {}),
    };

    results.push({
      channel: ch,
      utm_source: mapping.source,
      utm_medium: mapping.medium,
      utm_campaign: campaignSlug,
      utm_content: campaign_content ? slugify(campaign_content) : null,
      url: buildUtmUrl(base_url, utmParams),
    });
  }

  return res.status(200).json({
    campaign_name,
    campaign_slug: campaignSlug,
    base_url,
    total_links: results.length,
    links: results,
    ...(unknown.length > 0
      ? {
          warnings: [
            `Unrecognized channels were given utm_medium=custom: ${unknown.join(", ")}`,
          ],
        }
      : {}),
  });
}
