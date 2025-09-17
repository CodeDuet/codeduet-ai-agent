# CodeDuet Release & Publishing Guide

This document outlines the process for publishing CodeDuet binaries using GitHub Actions and the required configuration.

## Overview

CodeDuet uses Electron Forge to build and publish native applications across multiple platforms:

- **Windows**: `.exe` installer + NuGet package (.nupkg)
- **macOS**: Intel and ARM64 `.zip` archives
- **Linux**: `.deb` and `.rpm` packages

The release process is automated via the `.github/workflows/release.yml` workflow and publishes to GitHub Releases.

## Release Workflow Trigger

The release workflow is triggered manually via `workflow_dispatch`:

```bash
# Via GitHub UI: Actions > Release app > Run workflow
# Or via GitHub CLI:
gh workflow run release.yml
```

## Required GitHub Secrets

### Repository Configuration

Before setting up secrets, update the repository references in:

1. **forge.config.ts** (lines 100-101):

```typescript
repository: {
  owner: "CodeDuet",  // Update from "dyad-sh"
  name: "codeduet-ai-agent",  // Update from "dyad"
}
```

2. **scripts/verify-release-assets.js** (lines 20-21):

```javascript
const owner = "CodeDuet"; // Update from "dyad-sh"
const repo = "codeduet-ai-agent"; // Update from "dyad"
```

### Required Secrets in GitHub Repository Settings

#### Universal Secrets

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (no setup needed)

#### macOS Code Signing

- `MACOS_CERT_P12` - Base64 encoded .p12 certificate file
- `MACOS_CERT_PASSWORD` - Password for the .p12 certificate
- `APPLE_TEAM_ID` - Apple Developer Team ID
- `APPLE_ID` - Apple ID email for notarization
- `APPLE_PASSWORD` - App-specific password for Apple ID

#### Windows Code Signing (DigiCert)

- `SM_CLIENT_CERT_FILE_B64` - Base64 encoded client certificate
- `SM_CLIENT_CERT_PASSWORD` - Client certificate password
- `SM_HOST` - DigiCert Software Trust Manager host
- `SM_API_KEY` - DigiCert API key
- `SM_CODE_SIGNING_CERT_SHA1_HASH` - SHA1 hash of signing certificate
- `DIGICERT_KEYPAIR_ALIAS` - DigiCert keypair alias

## Platform-Specific Setup

### macOS Code Signing Setup

1. **Get Apple Developer Certificate**:

   - Log into Apple Developer portal
   - Create a "Developer ID Application" certificate
   - Download the certificate and export as .p12

2. **Convert Certificate to Base64**:

   ```bash
   base64 -i certificate.p12 -o certificate_base64.txt
   ```

3. **Create App-Specific Password**:

   - Go to appleid.apple.com
   - Sign in and go to "App-Specific Passwords"
   - Generate password for "CodeDuet Notarization"

4. **Set GitHub Secrets**:
   - `MACOS_CERT_P12`: Contents of certificate_base64.txt
   - `MACOS_CERT_PASSWORD`: Password used when exporting .p12
   - `APPLE_TEAM_ID`: Found in Apple Developer portal
   - `APPLE_ID`: Your Apple ID email
   - `APPLE_PASSWORD`: App-specific password

### Windows Code Signing Setup (DigiCert)

1. **DigiCert Software Trust Manager Setup**:

   - Register with DigiCert
   - Set up Software Trust Manager account
   - Generate client certificate for authentication

2. **Certificate Preparation**:

   ```bash
   # Convert client certificate to base64
   base64 -i client_cert.p12 -o client_cert_base64.txt
   ```

3. **Set GitHub Secrets**:
   - `SM_CLIENT_CERT_FILE_B64`: Contents of client_cert_base64.txt
   - `SM_CLIENT_CERT_PASSWORD`: Client certificate password
   - `SM_HOST`: DigiCert host URL (provided by DigiCert)
   - `SM_API_KEY`: API key from DigiCert portal
   - `SM_CODE_SIGNING_CERT_SHA1_HASH`: SHA1 hash of your code signing cert
   - `DIGICERT_KEYPAIR_ALIAS`: Keypair alias from DigiCert

### Linux (No Code Signing Required)

Linux builds (.deb and .rpm) do not require code signing setup.

## Build Environment Configuration

### Environment Variables (Release Workflow)

The workflow sets these automatically:

- `NODE_OPTIONS: "--max-old-space-size=4096"` - Increases memory for large builds
- `E2E_TEST_BUILD` - Controls whether signing is performed

### Build Matrix

The workflow builds on:

- **windows-latest** - Windows installer and NuGet package
- **ubuntu-22.04** - Linux .deb and .rpm packages
- **macos-13** - Intel macOS build
- **macos-latest** - ARM64 macOS build

## Release Assets Verification

After all builds complete, the workflow runs `verify-release-assets.js` which checks for:

### Expected Assets (per package.json version):

```
dyad-{version}-1.x86_64.rpm           # Linux RPM
dyad-{version}-full.nupkg             # Windows NuGet
dyad-{version}.Setup.exe              # Windows installer
dyad-darwin-arm64-{version}.zip       # macOS ARM64
dyad-darwin-x64-{version}.zip         # macOS Intel
dyad_{version}_amd64.deb              # Linux DEB
RELEASES                              # Windows update manifest
```

**Note**: Version formatting varies by platform:

- **RPM/DEB**: `0.21.0-beta.1` → `0.21.0.beta.1` (dot instead of dash)
- **NuGet**: `0.21.0-beta.1` → `0.21.0-beta1` (no dot after beta)
- **Others**: Keep original format

## Troubleshooting

### Common Issues

1. **"Certificate not found" (macOS)**:

   - Verify MACOS_CERT_P12 is valid base64
   - Check MACOS_CERT_PASSWORD matches export password
   - Ensure certificate is "Developer ID Application" type

2. **"Code signing failed" (Windows)**:

   - Verify all DigiCert secrets are correctly set
   - Check that SM_HOST URL is correct
   - Ensure certificate is properly set up in DigiCert portal

3. **"Asset verification failed"**:

   - One or more platform builds failed to upload
   - Check individual job logs for build failures
   - Verify repository owner/name in forge.config.ts and verify script

4. **"Rate limit exceeded"**:
   - GitHub API rate limits hit during verification
   - Wait and retry, or check if GITHUB_TOKEN has sufficient permissions

### Debug Steps

1. **Check Build Logs**:

   - Go to Actions tab in GitHub
   - Click on failed workflow run
   - Examine individual job logs

2. **Test Locally**:

   ```bash
   # Test packaging without publishing
   npm run package

   # Test with specific platform
   npm run make -- --platform=darwin
   ```

3. **Verify Secrets**:
   - Ensure all required secrets are set in repository settings
   - Check secret names match exactly (case-sensitive)
   - Verify base64 encoding is correct

## Manual Release Process

If automation fails, you can create releases manually:

1. **Build Locally**:

   ```bash
   npm run package
   ```

2. **Create GitHub Release**:

   - Go to repository Releases page
   - Click "Create a new release"
   - Set tag version (e.g., `v0.21.0-beta.1`)
   - Upload built assets from `out/make/`

3. **Update Version**:
   ```bash
   # Bump version in package.json
   npm version patch|minor|major
   ```

## Security Considerations

- **Never commit certificates or private keys**
- **Use app-specific passwords for Apple ID**
- **Rotate DigiCert credentials regularly**
- **Review release assets before making public**
- **Keep GitHub secrets up to date**

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Verify all required secrets are set
- [ ] Update repository references in config files
- [ ] Test build locally
- [ ] Trigger release workflow
- [ ] Monitor build progress
- [ ] Verify all assets uploaded successfully
- [ ] Test downloaded assets on target platforms
- [ ] Update release notes
- [ ] Announce release

## Support

For issues with the release process:

1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Test builds locally to isolate issues
4. Contact the development team for assistance
