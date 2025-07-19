# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Simpleton CLI, please send an email to [your-email@example.com]. All security vulnerabilities will be promptly addressed.

Please include the following information in your report:

- Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us quickly assess and address the vulnerability.

## Security Features

Simpleton CLI includes several security features:

- **Local Execution**: All processing happens on localhost - no data leaves your machine
- **File Sandboxing**: Operations are limited to project root directory
- **Command Allow-listing**: Only safe commands are allowed to execute
- **Path Validation**: Prevents directory traversal attacks
- **Git Protection**: Warns about untracked directories
- **Timeout Limits**: Prevents hanging processes

## Best Practices

When using Simpleton CLI:

1. Always review code changes before applying them
2. Use `--suggest` mode to preview changes before applying
3. Keep your local LLM models updated
4. Run in a controlled environment when testing new features
5. Report any suspicious behavior immediately 