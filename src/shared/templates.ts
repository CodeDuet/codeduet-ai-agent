export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  isOfficial: boolean;
  isExperimental?: boolean;
  requiresNeon?: boolean;
}

// API Template interface from the external API
export interface ApiTemplate {
  githubOrg: string;
  githubRepo: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const DEFAULT_TEMPLATE_ID = "react";
export const DEFAULT_TEMPLATE = {
  id: "react",
  title: "React.js Template",
  description: "Uses React.js, Vite, Shadcn, Tailwind and TypeScript.",
  imageUrl:
    "https://github.com/user-attachments/assets/5b700eab-b28c-498e-96de-8649b14c16d9",
  isOfficial: true,
};

const PORTAL_MINI_STORE_ID = "portal-mini-store";
export const NEON_TEMPLATE_IDS = new Set<string>([PORTAL_MINI_STORE_ID]);

export const localTemplatesData: Template[] = [
  DEFAULT_TEMPLATE,
  {
    id: "next",
    title: "Next.js Template",
    description: "Uses Next.js, React.js, Shadcn, Tailwind and TypeScript.",
    imageUrl:
      "https://github.com/user-attachments/assets/96258e4f-abce-4910-a62a-a9dff77965f2",
    githubUrl: "https://github.com/codeduet/nextjs-template",
    isOfficial: true,
  },
  {
    id: "nextjs-stripe",
    title: "Next.js + Stripe Template",
    description: "Next.js with Stripe integration for payments, checkout, subscriptions, and webhooks. Ready for Vercel deployment.",
    imageUrl:
      "./assets/nextjs-stripe-demo.png",
    githubUrl: "https://github.com/CodeDuet/nextjs-stripe-template",
    isOfficial: true,
  },
  {
    id: PORTAL_MINI_STORE_ID,
    title: "Portal: Mini Store Template",
    description: "Uses Neon DB, Payload CMS, Next.js",
    imageUrl:
      "https://github.com/user-attachments/assets/ed86f322-40bf-4fd5-81dc-3b1d8a16e12b",
    githubUrl: "https://github.com/codeduet/portal-mini-store-template",
    isOfficial: true,
    isExperimental: true,
    requiresNeon: true,
  },
  {
    id: "nextjs-stripe-v2",
    title: "Next.js + Stripe v2 Template",
    description: "Enhanced Next.js with Stripe integration featuring modern payment flows, subscription management, and comprehensive webhook handling. Production-ready with TypeScript and Tailwind.",
    imageUrl:
      "./assets/saas-template.png",
    githubUrl: "https://github.com/CodeDuet/nextjs-stripe-template-v2",
    isOfficial: true,
  },
];
