---
layout: post
title: "The Five-Minute Fork: The Era of Personalized Software"
date: 2026-05-30 00:00:00 -0400
categories: [technology]
tags: [tech, ai]
hidden: false
popular: false
---

Good software quietly disappears: it stops feeling like a tool and starts feeling like an extension of how you think. Most software never gets there in large part because it wasn't built for you specifically. It was built for a market segment. But that rigid constraint is starting to dissolve, and the downstream effects are going to completely rewrite how we think about product defensibility.

A recent example: I spend a lot of time using [Excalidraw](https://excalidraw.com/). It’s a fast and minimal open-source diagramming tool. But I kept wanting one thing it doesn't offer: multiple tabs.

For privacy, Excalidraw only stores data locally in your browser storage. However, the way they've chosen to store this data makes editing multiple diagrams incredibly high-friction. Changing tasks requires exporting your current work, and then importing a different file (and reversing the process later). Work isn't parallelizable; it's meant to operate as a scratchpad, not a notebook.


### The Flexibility of Open Source

In the traditional open-source software playbook, the solution is simple: alter the code to create the desired feature yourself and contribute the changes back into the main project.

But Excalidraw also runs a commercial SaaS product, and multi-tab workspace management [sits right in the layer](https://github.com/excalidraw/excalidraw/issues/1543#issuecomment-3507955346) they monetize. The maintainers have a completely rational business reason to protect their paid tier. It is the familiar tension around open-source projects that also have to support a commercial product.

The beauty of open source is that you don't actually need permission to modify the code for yourself. But historically, that's where the story ends for most users. The friction of downloading a large, unfamiliar codebase, deciphering how it works, and building a layout feature from scratch isn't worth a weekend of unglamorous debugging. For most people the practical choice is to either pay for the premium version, or live with the limitations.


### The Five-Minute Fork

In the past I would have probably begrudgingly accepted the one tab workflow. I'm confident I could make the required changes, but the effort to do so is difficult to gauge ahead of time. And it will likely find its way down my priority list before it gets completed.

The last few years, however, have provided a new toolset: LLMs. So, armed with a team of models, I asked Codex to implement native tab support in Excalidraw.

The model essentially one-shotted it (completed the entire task provided only an initial prompt), requiring exactly one quick back-and-forth to clean up a minor layout preference. Within five minutes, I had a fully functional, customized version of the tool running under my own repository ([excalidraw-multitab](https://github.com/at1as/excalidraw-multitab)).

![Excalidraw fork with multiple diagram tabs](/assets/images/posts/2026-05-31-Personalized-Software-Era/excalidraw-multitab-tabs.png)

This was not a profound engineering achievement due to its complexity, but rather due to the significant reduction in effort. The barrier to entry had dropped far enough that even failure would have been cheap. I would have learned within minutes whether the idea was worth pursuing. Experimentation is no longer expensive.


### Dynamic Software

That personal win points at something larger. The reason multi-tab support doesn't exist in the free tier isn't a technical limitation, but a deliberate product boundary. And those boundaries exist everywhere, baked into how commercial software has always been built. Right now, software is built around these rigid market segments:

* **Independent:** Lightweight, minimal tools focused on individual speed.
* **SMB:** Standardized platforms meant to coordinate a small, growing team.
* **Enterprise:** Heavy, compliance-driven software built for scale and governance.

As an organization grows, its operational needs change. To meet those needs, it undergoes step-function upgrades—migrating from one software tier to another, or adopting an entirely new vendor. It is very hard to build software to serve all market segments simultaneously, which is why Atlassian acquired Trello, to allow them to serve a different market segment, with no intention to merge the products.

This high-friction cycle exists because commercial software has trended towards standardized products in order to be economically viable. A vendor has to build one product that fits thousands of companies well enough. But every new feature added for one customer is potential bloat for another. This design debt compounds over time, eventually resulting in a complex web of deeply nested settings, or the need for dedicated internal staff just to manage the tool (like Jira administrators).

Because software companies must prioritize their roadmap by the highest-paying customer segments, smaller teams often find their feature requests _"being evaluated by the product team"_ indefinitely.

But what happens when AI agents materially reduce the cost of understanding and modifying a codebase?

We may be entering an era where software behaves less like a standardized product and more like a tailored suit. You start from a common, shared platform, but the final shape is unique to the organization.

Instead of major step-function migrations between products or vendors, more of the software product surface can become adaptive. It can evolve incrementally, day-by-day, to meet your changing operational needs. Imagine an internal stack that quietly adapts based on observed usage patterns or simple text feedback from your team, adjusting its own interface and adding niche features on the fly.

This shift does not need to be limited to open source.

Open-source projects will be easier to mold first, because the code is already available and the permission model is simple: fork it, change it, run your own version. But proprietary vendors will face pressure too. If customers get used to software that can be reshaped around them, it becomes harder to defend a product surface that only changes on the vendor’s roadmap.

That does not mean every SaaS company turns into a bespoke software shop. More likely, the business model shifts around the boundary between product and customization. Vendors may stop selling only a fixed application and start selling a starting point, plus the infrastructure that underlies it.

The valuable part of the product becomes not just the workflow itself, but the guardrails around changing it: permissions, audit logs, sandboxes, test generation, staged rollouts, rollback, compliance controls, and security boundaries that let the software adapt without quietly breaking the business.

None of this arrives all at once. The models and tooling will need to continue to improve, and most companies aren't ready to support this type of complexity (yet). But the direction is already visible in small experiments like this one — and the pace of change has caught many in the software industry off guard.


### The Contextual Moat

This also introduces an interesting shift in how we think about software defensibility.

We usually evaluate SaaS moats through metrics like network effects, proprietary data, or deep API integrations. Every few years, software spend comes up for review, and a vendor has to convince an organization to renew.

But if your software stack has spent years dynamically adapting to the exact, idiosyncratic operational quirks of your business, the friction to leave becomes massive. Switching to a new vendor wouldn't just mean migrating data; it would mean restarting an entire evolutionary process with a platform that doesn’t understand how your company actually operates. In this sense, vendors may actually _embrace_ a dynamic software offering.

The strongest moat may become a combination of a vendor's core platform, and the depth of historical context accumulated in your personalized configuration.
