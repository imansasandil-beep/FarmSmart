# Troubleshooting

## Claude Opus 4 Not Available in VS Code Extension

If Claude Opus 4 is not showing up as an available model in your VS Code extension, follow these steps:

### 1. Update VS Code

Make sure you are running the latest version of VS Code:

- Open VS Code
- Go to **Help → Check for Updates**
- Install any available updates and restart VS Code

### 2. Install or Update GitHub Copilot Extensions

Claude models are available through the **GitHub Copilot** extension. Install both recommended extensions:

- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)

To install from VS Code, open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`) and search for "GitHub Copilot". Make sure both extensions are installed and up to date.

### 3. Verify Your GitHub Copilot Subscription

Claude Opus 4 requires an active **GitHub Copilot** subscription that supports model selection:

- **GitHub Copilot Free** — Limited model access; Claude Opus 4 may not be available
- **GitHub Copilot Pro** — Includes access to Claude models
- **GitHub Copilot Pro+** — Full access to all available models including Claude Opus 4
- **GitHub Copilot Enterprise** — Organization-managed; model availability depends on admin settings

Check your subscription at: [github.com/settings/copilot](https://github.com/settings/copilot)

### 4. Select Claude Opus 4 as Your Model

Once Copilot is installed and your subscription supports it:

1. Open **GitHub Copilot Chat** in VS Code (click the Copilot icon in the sidebar or press `Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Click the **model selector dropdown** at the top of the chat panel
3. Select **Claude Opus 4** from the list of available models

If Claude Opus 4 does not appear in the dropdown:

- Make sure your extensions are up to date (check the Extensions panel for updates)
- Sign out of GitHub in VS Code and sign back in
- Restart VS Code

### 5. Check Organization Policy (If Applicable)

If you are using GitHub Copilot through an organization:

- Your organization admin may have restricted which models are available
- Contact your organization admin to enable Claude Opus 4 in the Copilot policy settings
- Admins can configure model access at: **Organization Settings → Copilot → Policies**

### 6. Note on Model Naming

The model referred to as "Claude Opus 4.6" may not exist as a specific version. The available Claude models in GitHub Copilot are:

- **Claude Sonnet 4** — Fast, balanced model
- **Claude Opus 4** — Most capable Claude model

If you are looking for "Claude Opus 4.6", you likely want **Claude Opus 4**. Check the model selector in Copilot Chat for the exact model names currently available.

---

If the issue persists after following these steps, consult the [GitHub Copilot documentation](https://docs.github.com/en/copilot) or open a support ticket with [GitHub Support](https://support.github.com/).
