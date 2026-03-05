export default function handler(req, res) {
  res.status(200).json({
    functions: [
      {
        name: "generate_utm_links",
        description:
          "Generates UTM-tagged tracking URLs for each marketing channel in a campaign. " +
          "Use this after campaign strategy is created to produce ready-to-use tracking links " +
          "for LinkedIn, email, blog, paid search, and any other channels identified in the strategy.",
        parameters: [
          {
            name: "base_url",
            type: "string",
            description:
              "The destination landing page URL (e.g. https://example.com/landing). Must be a valid URL.",
            required: true,
          },
          {
            name: "campaign_name",
            type: "string",
            description:
              "The campaign name used for utm_campaign. Use lowercase with hyphens, no spaces (e.g. ai-crm-saas-launch).",
            required: true,
          },
          {
            name: "channels",
            type: "array",
            description:
              "List of marketing channels to generate UTM links for. " +
              "Supported values: linkedin, email, blog, paid_search, twitter, facebook, instagram, display, youtube, direct. " +
              "Maps automatically to appropriate utm_source and utm_medium values.",
            required: true,
          },
          {
            name: "campaign_content",
            type: "string",
            description:
              "Optional utm_content value to differentiate ad variants or creatives (e.g. hero-banner, cta-button).",
            required: false,
          },
        ],
        endpoint: "/tools/generate-utm-links",
        http_method: "POST",
        auth_requirements: [],
      },
    ],
  });
}
