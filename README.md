# CodeDuet

CodeDuet AI Studio is a local, open-source AI app builder. It's fast, private, and fully under your control — like Lovable, v0, or Bolt, but running right on your machine.


> **Attribution**: CodeDuet is forked from [Dyad](https://github.com/dyad-sh/dyad), an open-source project by [Will Chen](https://github.com/willchen90). We're grateful for the excellent foundation provided by the original Dyad project and its contributors. All original work remains under the Apache 2.0 license.

[![Image](https://github.com/user-attachments/assets/f6c83dfc-6ffd-4d32-93dd-4b9c46d17790)](https://codeduet.com/)

More info at: [https://codeduet.com/](https://codeduet.com/)

## Mission Statement
The goal of CodeDuet is to allow people to learn more about AI development and create affordable, awesome + exciting products without AI platform lock-in. The vision is for all users to control and switch LLM models as needed based on cost, quality, and personal preference. Privacy is also part of the mission - users can develop products using local LLMs instead of API endpoints or online services.

## 🚀 Features

- ⚡️ **Local**: Fast, private and no lock-in.
- 🛠 **Bring your own keys**: Use your own AI API keys — no vendor lock-in.
- 🖥️ **Cross-platform**: Easy to run on Mac or Windows.
- 💳 **Easy Integrations**: Built-in shortcuts for adding Stripe payments, Supabase backend, and more.
- 🎯 **Ready-to-deploy Templates**: Pre-configured Next.js templates with integrations already set up.

## 📦 Download

No sign-up required. Just download and go.

### [👉 Download for your platform](https://www.codeduet.com/#download)

## 🔌 Quick Integrations

CodeDuet makes it easy to add popular services to your projects:

### 💳 **Stripe Payments**
Add Stripe payment processing in seconds:
- **Templates**: Start with our "Next.js + Stripe Template" from the Hub
- **Integration Button**: Click the ⚡ "Integrations" button in chat → Select "Stripe"
- **Slash Command**: Type `/stripe` and press Enter
- **Automatic Setup**: Installs packages, sets up environment variables, and provides integration UI

### 🗄️ **Supabase Backend**
Add Supabase for authentication and database:
- **Integration Button**: Click ⚡ "Integrations" → Select "Supabase"  
- **Slash Command**: Type `/supabase` and press Enter
- **Full Setup**: Database schema, auth configuration, and client setup

### ⚡ **How It Works**
1. Choose your integration method (button, slash command, or template)
2. CodeDuet automatically installs required packages
3. Environment variables are configured
4. Integration-specific UI components are set up
5. Ready to deploy to Vercel with zero additional configuration

## 🔧 Troubleshooting

### Package Verification Issues

If you encounter missing package errors when migrating to new computers, use our built-in verification system:

```bash
# Verify and auto-fix missing packages
npm run verify-packages

# Manual rebuild if needed
npm run build:packages
```

The verification script automatically:
- ✅ Detects missing local packages
- 🔧 Attempts to restore from npm
- 📦 Creates minimal fallback packages if needed
- 🔨 Rebuilds the workspace

**Common scenarios handled:**
- Missing `@codeduet-sh/supabase-management-js` package
- Corrupted package files after git clone
- Build artifacts missing after computer migration

## 🛠️ Contributing

**CodeDuet** is open-source (Apache 2.0 licensed).

If you're interested in contributing to CodeDuet, please read our [contributing](./CONTRIBUTING.md) doc.
