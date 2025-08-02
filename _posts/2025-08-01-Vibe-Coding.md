---
layout: post
title: "Vibe Coding with LLMs: Tips for Building Faster"
date: 2025-08-01 11:00:00 -0400
categories: [ai, llm]
tags: [ai, llm, technical]
hidden: false
---

Large Language Models (LLMs) are transforming the way we build software. Vibe Coding — popularized by tools like Cursor and Windsurf — refers to deeply embedding LLMs into the development workflow. Like all tools, however, it takes time to learn how to use them effectively.

Here are a few general tips I've come to discover using tools like Cursor, Windsurf, and GitHub Copilot:


### 1. Treat It Like a Colleague

LLMs can be brilliant at finding bugs, even obscure and complex ones.

But they also hallucinate and make mistakes. To improve the signal-to-noise ratio, treat the AI like a peer developer: give it plenty of context (error logs, hypotheses, what you’ve tried, your suspicions).

The more info you provide, the better the results. Sometimes, spending 20 minutes writing a detailed prompt is an exceptionally good investment. LLMs do their best work when they can see the whole picture.


### 2. Ask Before You Build

Before diving into code, prompt the model to explain its plan or approach. Ask how it intends to implement a feature, fix a bug, or structure a codebase. Request alternatives, and have it critique its own strategy so you can understand the tradeoffs up front.

For larger projects, LLMs that support research (like ChatGPT with browsing) can be a major asset. Ask about the best libraries, design patterns, or references to similar projects.

Early on, don’t hesitate to try multiple paths — the cost of experimenting has never been lower.


### 3. *Feel* the Limits

LLMs are powerful, but they have limits. When stuck, experiment:

- _Tweak your prompts:_ Rephrase or simplify. Small wording changes often yield vastly different results.
- _Reduce the scope:_ Break the problem into smaller pieces, then chain them together.
- _Take Control:_ For obscure tools, edge-case bugs, or glue code that ties systems together, you might need to write parts yourself. Treat it as a junior developer, for whom you may take over at times, based on their capabilities. With experience, you'll develop a sense of where the model will struggle and manual intervention will become part of your workflow.


### 4. Experiment with Different Models

The AI landscape evolves quickly. _Very quickly._ Even models within the same generation can outperform each other in surprising ways that benchmarks miss.

Use tools that support multiple models and are regularly updated. Switch models when stuck — occasionally a problem that defeats one can be solved by another.


### 5. Pasting into ChatGPT Remains Undefeated

Even with modern, integrated tooling, a well-crafted paste-into-ChatGPT can work wonders. Distill the problem into a clear prompt and drop it in.

In my experience, the ChatGPT UI model (especially with browsing) has solved issues other tools couldn’t. Also, the act of writing a concise prompt often surfaces insights on its own.


### 6. Commit Frequently, When the Stakes Are High

Modern tools are very good at stepping through (and reverting) changes — but they're not perfect.

Before big refactors or sweeping changes, commit. That way, you can revert cleanly if needed, and you won’t lose progress if you abandon the attempt entirely.

With a ~20-year head start, Git should have earned more trust than your LLM tooling likely has.


### 7. Use It for Documentation

LLMs excel at writing docs. Ask it to update your README, add usage examples, and generate a setup guides.

*Bonus*: I sometimes ask it to summarize our entire debugging session and add those notes to a docs folder. Not only does this create useful documentation for future developers (and myself), it also gives the LLM more context next time (since you can feed its own summary back into the prompt if you need to). Good documentation helps both humans and AI down the line.


### 8. Use it for Tests

Writing tests can be tedious, but LLMs are very good at it (and don't complain!). If it doesn't handle it in the first pass, instruct it to generate positive and negative test cases for your code.

This has a dual benefit: it saves development time _and_ improves confidence in the generated code, reducing the need for review.


### 9. Standardize With Makefiles

LLMs reduce the cost of trying new languages and frameworks — but rapid experimentation can lead to chaos.

Ask the LLM to generate a `Makefile` for each project with common commands (such as `make run`). A few shared patterns across projects go a long way toward clarity and speed.

Here's an example from a small utility I built. After entering the repo, I just type `make`, and it returns a list of commands:
```
$ make

Event List Project Makefile

Available commands:
  make help          - Show this help message
  make setup         - Create virtual environment and install dependencies
  make run           - Run the web application in development mode
  make fetch         - Fetch events from all sources
  make fetch-source  - Fetch events from a specific source (e.g. make fetch-source SOURCE=eventbrite)
  make build         - Build the standalone executable
  make run-app       - Run the standalone executable
  make package       - Create a distributable package
  make clean         - Remove build artifacts and cache files
```
For more details, I can simply open the Makefile itself. Without this, I’d likely forget half of these commands and waste time relearning the flow every time I return to the project.


### 10. Experiment with Project-Level System Prompts

Some tools like Cursor and Windsurf support project-level system prompts — a special file (e.g. `.cursor_prompt`, `system_prompt.txt`, or similar) placed in the root of your repo that guides the behavior of the LLM inside your project.

This file can set expectations for the codebase, preferred style, architecture constraints, or anything else you’d want a new team member to know. For example:
```
- You are helping build a fast, minimal Python CLI using Click.
- Avoid using classes unless necessary.
- Default to functional style and small files.
- Dependencies should be standard library only unless otherwise noted.
```
This becomes especially useful when working across many projects with different conventions, or when multiple people are using LLM-based tools on the same codebase.

The exact filename and syntax vary — check your tool's documentation — but in practice, these prompts can improve the consistency and relevance of generated code, acting like a lightweight `CONTRIBUTING.md` for an AI pair programmer.


### 11. The LLM is a Machine; You’re Not; Take Breaks

The LLM can iterate forever without getting tired, but you’re still human.

Many breakthroughs come after a short context switch. When you're stuck for too long, admit defeat and come back with a fresh perspective. The LLM depends on you being sharp to guide it in the right direction.


### 12. Stay Curious

The AI tooling and model landscape moves *fast*.

Even if your current setup works well, it pays to revisit the ecosystem regularly. Newer APIs, plugins, and workflows appear almost weekly, often with big quality-of-life improvements. Make a habit of trying out promising new tools or features, even if only for 30 minutes. A small investment in a new tool that improves your workflow will pay for itself very quickly.


### 13. Constrain the Models

I prefer to maintain a strict boundary between my LLM tooling and infrastructure. This guidence may change over time (and there are certainly tools that embrace different philosophies), but while LLMs remain unpredictable, they can only do damage within the constraints that are placed upon them.

My workflow: Avoid access to your deployed services, databases, real data, and deployment infrastructure.


### 14. Utilize LLMs for E2E Projects

Finally, remember that LLMs aren’t just for writing code – they’re general-purpose assistants for all kinds of knowledge work. Take advantage of that.

Need to create a landing page or marketing copy for your side project? Ask the LLM to draft it. Struggling with naming, design ideas, or even writing a privacy policy or doing some quick legal research? The LLM can help with those too. As general purpose models, they can be a useful tool for a wide range of tasks.


### 15. Don't Take my Word For It

Try it yourself. Disagree. Form your own opinions. There's no "correct" way to vibe code — we’re all figuring it out as we go. Being curious and open-minded is the only requirement.


_I can't wait to see what you build._

**P.S.** Want to wear some Vibe Coding swag while you vibe code? I may have [just what you need](https://founderwear.creator-spring.com/listing/new-vibe-coding?product=2&variation=2232).
