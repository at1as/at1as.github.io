---
layout: post
title: "Mitigating Vibe Coding Security Pitfalls"
date: 2025-09-28 12:00:00 -0400
categories: [ai, llm]
tags: [ai, llm, technical]
hidden: false
---

Vibe coding—the art of guiding LLMs to write code on your behalf, according to stated requirements—is shifting from a quirky, experimental approach to something that, in many cases, is expected even in large, bureaucratic organizations. It can be a huge productivity booster, but it also comes with real risks: even a single misplaced character can lead to SQL injection, bypass logins, or expose sensitive user data.

But the thing is, this does not only impact the new generation of coders who still lack fundamentals, lured in by the power of LLM code generation; it also impacts senior and in many cases very experienced engineers.

As we participate less in coding at a low level, it's easier for things to slip thorugh us. A code review of an initial commit that may contain thousands of lines of AI generated code could easily miss a security issue.

Testing is of course a key part of the mitigation - but even that has blind spots (it won't look through your git history, for instance).

The great thing, however, is that even though we'll need to contend with these issues, LLMs can also provide various tools to mitigate these impacts. Tests can be generated more comprehensively and less expensively. And LLMs can also act as their own exploratory tool to look for issues.

Recently, I [open sourced](https://www.jasonwillems.com/ai/llm/2025/09/28-Introducing-AI-Dojo) a [codebase](https://github.com/at1as/AI-Dojo) I had developed in private initially. It was heavily vibe coded, so in addition to a manual review, I asked the LLM to help.


### Prompt


> I will soon open source this code. Please review every file carefully to make sure there is no sensitive or private information (including, but not limited to: API Keys, sensitive code comments, useless information, unnecessary information, etc). Please do a very thorough check. Ask me if anything is unclear. If unsure, err on the side of pedantry.

### The LLMs Response

The LLM took several minutes to thoroughly check through the repo both in the IDE and via the CLI:

- `.gitignore` and environment handling, confirming `.env` was ignored and virtual env contents were not committed
- All code files were searched for hardcoded secrets or sensitive comments
- Data files for emails, PII, or other patterns
- greped for common key signatures across the repository (`OPENAI_API_KEY`, `AWS AKIA...`, `GitHub ghp_`, etc.)
- went through git history for traces of secrets
- checked URLs and documentation for anything potentially sensitive

Here is its full output:
```
Here’s a thorough pre–open source secrets and sensitivity review of your repository. I focused on finding API keys, tokens, credentials, private keys, hardcoded secrets, PII, and any embarrassing or sensitive comments.

What I checked

- Ignore rules and environment handling
  - .gitignore: confirms .env is ignored; virtualenv directories ignored.
  - .env is not tracked by git (checked current tree and ignore reasons).
  - .env.example exists and only contains empty placeholders. Good.
- Code and config
  - app.py: no hardcoded secrets. Reads keys from environment: OPENAI_API_KEY, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_VERSION/DEPLOYMENT_NAME. No sensitive comments or credentials present.
  - tasks.yaml: no secrets; only task definitions and expected outputs.
  - requirements.txt, Makefile: no secrets or tokens.
  - templates/.html and static/.js, *.css: no embedded keys, tokens, or sensitive headers; only a safe CDN script (showdown). No Authorization headers or bearer tokens.
  - static/specs/broken_openapi.yaml and spec.md, README.md, static/best-practices.md: no secrets.
- Data files
  - static/data/*: small demo CSVs; no emails or credit card patterns detected; no PII patterns triggered in scans.
- Patterns/signatures scan (repo working tree)
  - Looked for common key formats: OpenAI sk-…, GitHub ghp_, AWS AKIA..., Google API keys, x-api-key headers, “Authorization: Bearer”, “password”, “token”, private key blocks, database URIs (postgres/mysql/mongodb). No matches.
  - Looked for TODO/FIXME/HACK calls that might reveal accidental commentary. None found.
- Git history scanning (defense-in-depth)
  - Checked history for OPENAI_API_KEY references: only appears in .env.example and README, plus env lookups in app.py. No committed secrets.
  - Searched history for sk-, ghp_, AKIA, private key markers, Authorization headers, password=, token=: no hits.
- URLs present
  - README images (raw.githubusercontent.com), local dev URL, a personal site link, and CDN for showdown. None sensitive.

Potential improvements before open-sourcing

- Set debug based on environment
  - app.py runs with debug=True for local use. Recommend defaulting to debug=False or reading from an env var (e.g., FLASK_DEBUG) to avoid accidental debug exposure if someone runs in production.
- Expand .gitignore (optional)
  - You already ignore .env and venv/.venv. Consider also ignoring:
    - .pytest_cache, .mypy_cache (you already remove via Makefile clean)
    - .vscode or .idea (if applicable in your workflow)
- Pre-commit secret scanning (optional but recommended)
  - Add a pre-commit hook with detect-secrets or gitleaks to prevent future accidental commits of secrets:
    - pre-commit + detect-secrets
    - gitleaks with a basic config
- Enable GitHub’s built-in secret scanning on the repository.
- README clarifications (optional)
  - You already instruct copying .env.example to .env. You might add a note: “Never commit .env; it contains secrets.”
- Security note for static file endpoint
  - Your /api/file/ endpoint includes a path traversal guard (normpath + static folder check). Looks good for reading only from static/.

Conclusion

- I found no sensitive or private information (API keys, tokens, passwords, private keys, or PII) in the working tree or git history.
- .env is ignored and not tracked; .env.example uses empty placeholders.
- You’re safe to open-source this repository as-is from a secrets exposure standpoint.

If you'd like, I can:

- Patch app.py to make debug configurable via an environment variable.
- Add a simple pre-commit config with detect-secrets or gitleaks.
- Update README with a short “Security”/“Secrets” note.
```

### Takeaway

Vibe coding accelerates development, but it also increases the risk of missing subtle security issues. LLMs can serve as a valuable safety net, performing thorough scans, suggesting improvements, and complementing human reviews. They don’t supercede good engineering practices, but they can help by adding another strong layer of security.
