---
layout: post
title: "AI Didn't Break Copyright Law—It Just Exposed How Broken It Already Was"
date: 2026-01-23 12:00:00 -0400
categories: [technology]
tags: [tech, history]
hidden: false
---

If you paint a picture of Sonic the Hedgehog in your living room, that's fine. You're essentially allowed to make private, noncommercial art. Gift it to a friend? Still tolerated—a technical act of distribution that copyright law mostly ignores in practice. Take a photo and post it on Instagram? Now you've crossed into public distribution of a derivative work without permission. Under the letter of the law, that's infringement, although a fair-use defense *might* apply and Sega almost certainly won't care. It's fan engagement, free marketing, and good PR.

Sell that painting, though, and the tolerance disappears. You're no longer a fan—you're a competitor.

This gap between the written law and its practical application isn't an AI problem. It's something that has been quietly tolerated for decades. The system works not because the rules are clear, but because enforcement has been selectively targeted for impact and the scale has been human. With generative AI, that ambiguity suddenly represents billions of dollars in potential damages, forcing a reckoning that makes long-implicit assumptions explicit.

## Copyright Law Was Built for Human Scale

Copyright law has always relied on a set of quiet assumptions that were never written down but broadly understood: creation and transformation are slow, distribution is costly, and enforcement can be discretionary. Most infringement has been tolerated not because it was legal, but because it was rare, small, and culturally useful.

Fan art lives in this space. So do fan films. *Star Wars* is a canonical example—not because Lucasfilm formally "allowed" fan films, but because informal norms emerged: no monetization, no confusion with official releases, and the understanding that rights holders could assert control at any moment. This worked because these projects were expensive to make, clearly unofficial, and very few in number.

AI didn't cherry-pick gray areas in copyright law; it removed the human-scale constraints that made those gray areas manageable. When AI can generate feature-length content at ultra-high volume, rights holders will inevitably argue that mere creation—not just distribution—must be prohibited.

But is there an easy solution?

## The Training Layer: Why You Can't Solve It There

The most common proposal is simple: ban training on copyrighted content. Keep AI "clean" from the start.

This sounds reasonable until you examine what "clean" actually means.

Even if you scrupulously avoid pirated material, the internet is saturated with legally posted content about copyrighted characters. Fair-use images of Sonic appear in reviews, commentary, parody, and news articles. There are photographs of licensed Sonic merchandise. There are text descriptions in product listings, forum discussions, and blog posts.

An AI trained only on legally accessible data will still learn what Sonic looks like. It will learn the character design, the color palette, the aesthetic. You cannot train on the open internet without absorbing information about major cultural properties. That knowledge emerges from millions of non-infringing references.

It gets worse. An entire article's worth of information can be reconstructed from fair-use snippets scattered across the web—a quote here, a summary there, facts recombined from public sources. The model may not copy any single source; it synthesizes patterns from a sea of legitimate data.

And even when pirated content *is* used in training, proving it is extraordinarily difficult—and removing it without retraining is nearly impossible. *The New York Times* attempted to demonstrate this by prompt-engineering models to reproduce exact articles through next-token prediction—a resource-intensive effort that doesn't scale (which OpenAI characterizes as a form of hacking). For training datasets containing billions of documents, establishing precisely what went in and where it came from is functionally impossible.

Copyright law also traditionally targets the act of piracy itself, not second-order effects. If an employee illegally downloads pirated content, that individual may be liable. But declaring an entire model "tainted" and subject to destruction because some fraction of its inputs were improperly sourced pushes copyright into uncharted territory. Unlike trade secret law, copyright typically remedies harm through damages, not destruction of downstream works.

The training layer simply cannot act as a reliable enforcement point.

So where does that leave us?

## The Generation Layer: Creation Without Friction

At the generation layer, AI systems turn abstract knowledge into concrete outputs. This is where large model providers implement partial copyright enforcement today, implicitly framing LLMs as something more than neutral tools. Adobe Illustrator doesn't impose IP restrictions on what users can draw; LLMs increasingly do.

Effective enforcement at this layer requires treating intent, experimentation, parody, reference, and coincidence identically. This is not a subtle shift. Copyright law was never designed to evaluate private acts of creation at massive scale.

Two problems immediately emerge:

**First, intent becomes unreadable.** A model generating something "similar" to Sonic isn't forming an artistic goal. It's sampling from a probability space shaped by its training. Inferring copyright-relevant intent here is conceptually incoherent and operationally impossible. Enforcement degrades into a cat-and-mouse game of banned phrases and descriptions that users can always circumvent. There is no discrete boundary where output becomes infringing, nor any realistic way for a model to recognize all forms of infringement across global IP. If model providers are responsible for the restriction, are they liable for inevitable gaps in their filtering?

**Second, statutory damages become absurd.** Copyright penalties were calibrated for rare, explicit, human-scale violations. When generation is cheap and ubiquitous, applying the same framework produces penalties so disproportionate that enforcement loses legitimacy. A single runaway prompt script generating Mario in millions of scenarios could theoretically bankrupt a provider.

Crucially, generation alone does not imply harm. Most generated content is never shared. Context matters.

Which brings us to the only layer where copyright law has ever really functioned.

## The Distribution Layer: Where Harm Actually Manifests

Copyright law polices distribution, not thought. Harm occurs when works are shared, substituted, or monetized.

Uploading an AI-generated Sonic animation to a private folder is meaningfully different from uploading it to YouTube. Flooding a platform with AI-generated *Star Wars* shorts is meaningfully different from sketching them for yourself. Market substitution, audience diversion, and brand dilution occur only once content is distributed.

This is why enforcement mechanisms like takedowns, content-ID systems, and platform moderation—however imperfect—operate here. They're blunt, but they align with where harm occurs.

Trying to push enforcement downward into generation destabilizes the system. You end up policing private creation because you cannot control public scale.

Rights holders will push for enforcement at every layer. LLM providers will argue liability belongs at distribution. Platforms—flooded with AI slop—will push responsibility back onto generation. The enforcement point becomes inseparable from the question of liability.

So who bears it?

## The Liability Maze: Everyone Loses

If _generation_ is the enforcement point, who's responsible?

**Hold the companies responsible.** Require safeguards, filters, surveillance of API usage, and comprehensive IP databases.

This favors incumbents. Google, OpenAI, and Meta can afford teams of lawyers, sophisticated filters, and partnerships with major rights holders. A startup can't. An open-source project certainly can't. Compliance costs become an existential barrier, entrenching monopolies and killing competition.

**Hold users responsible.** Make generation of copyrighted content illegal.

This creates absurdities. Is typing "Mario" now a crime, how about "Italian plumber"? What if a vague prompt produces something infringing unintentionally? Do we really want millions of people technically violating the law for private, non-commercial experimentation?

Enforcement would require policing private generation—impossible without surveillance infrastructure that would rightly alarm civil libertarians. And the punishment would be wildly disproportionate to the harm.

If we shift to the _platforms_, the responsible party is clear, however, the indirect costs are much higher.

**Hold platforms responsible.** Shift the responsibility firmly to distribution, who will likely field increased pressure to restrict the reach of derivative work and fan art, in addition to their existing direct copyright enforcement. With this, we'll lose a significant portion of our culture and the most creative corners of the internet.

None of these approaches are spectacular.

## Foreign Models: Why US Regulation Might Not Matter

Even if the U.S. solved every problem above, perfectly, it might not matter.

AI is global. If U.S. regulation becomes too restrictive, development elsewhere will outpace it. A foreign company can train models with minimal copyright constraints, host them abroad, and make them accessible to Americans. Using foreign AI services is not illegal.

Addressing this challenge leaves us with bleak options:

**Restrict access to foreign models**: Block access to non-compliant foreign AI services via ISPs, DNS providers, and hosting providers. This approach, however, has not effectively stopped piracy.

**Criminalize use**: This is nearly impossible to enforce without massive surveillance and would raise serious privacy and legal concerns.

**Restrict commercial use of outputs**: Accept that people will use foreign AI services, but prohibit selling or commercially distributing the outputs in the US. This is more enforceable, but requires a traceable process (via an LLM watermark, or an additional permitting process to verify compliance).

The likely outcome is already in motion: a two-tier system. "Safe" U.S. AI for commercial use (), in partnership with the largest model providers. And unavoidable access to foreign or open-source models for everyone else.

Open-source makes this irreversible. Open source models are especially challenging because they can be downloaded, modified, and redistributed by anyone, anywhere. Once weights are public, compliance is voluntary. You can sue Meta. You can't stop someone in Belarus from hosting an unrestricted fork. Strict U.S. regulation handicaps domestic companies while failing to protect rights holders.

## The Pressure Cooker: Irreconcilable Forces

All of this is playing out against a backdrop of enormous, contradictory pressures.

**Publishers** are desperate. Each technological wave—blogs & self publishing, social media, ad blockers, paywalls—eroded their position. AI feels like another major blow to their revenue and influence, and the span of impact is across all types of media.

**Governments** are caught in an impossible bind. Historically, they've sided with rightsholders—copyright terms have extended repeatedly, from 14 years in the original US statute to life-plus-70-years today. Enforcement has generally strengthened over time.

But crippling domestic AI while rivals surge ahead is politically untenable. Old alliances are colliding with new realities. And the case made by LLM providers to the government of AI fueled GDP growth is not one the publishers can easily counter. AI companies are now the lobbyists in the way the media industry was for many decades.

## Searching for Alternatives

Every proposed solution fails on multiple dimensions. Every enforcement layer breaks down. Training is untraceable. Generation is incoherent. Distribution is late and imperfect. Other geographies adhere to different restrictions. And the publishing industry, after a few cycles of disruption, can no longer lobby for its interests with the same force as it once did.

### Alternative Frameworks: Can We Embed Enforcement Into the Industry?

If traditional enforcement is impossible and liability models all fail, it is worth evaluating entirely different approaches.

**Government-mediated compensation**: Tax AI companies and redistribute funds to rights holders, similar to blank media levies in some countries. But how do you determine fair distribution? Should a photographer whose work appeared once in training data receive the same as an artist whose style was heavily learned? Do you track direct use of individual data points, or somehow measure second-order effects on model capabilities? Everyone with an online presence is a content creator whose work was ingested. Does money actually reach creators, or sit in a government fund? The result is a staggering administrative complexity, or worse, a system that benefits only the largest companies who can navigate it best.

**Mandatory licensing**: Treat AI training like music covers—compulsory licensing at government-set rates. But at which layer does licensing apply? Training (companies pay for data ingestion, which as we've discussed is nearly impossible to track)? Generation (users pay per output, which is cumbersome and imperfect)? Commercial use (fees only for monetization, largely through existing platforms)? And how do you appease everybody that the impact of their work is adequately compensated for? Licensing is no longer a discrete trackable unit (like licensing a song for a movie), and the precise point at which an output becomes infringement is legally murkier.

If both bespoke deals and government-mandated frameworks seem impossibly complex, we're left with a fundamental question: should AI companies bear any responsibility at all? And do existing IP norms make sense in a world where content creation is increasingly performed by AI?

### The Fundamental Incompatibility

The uncomfortable truth is that copyright law only works effectively under scarcity—that creation and transformation are difficult, that distribution is limited, that enforcement can happen reliably at a fixed set of chokepoints, and that the volume of legal cases remains manageable. While we grapple with the impact of AI on these laws, there's a deeper problem: the underlying nature of content itself may be starting a dramatic shift. We're moving from static, general-purpose content to dynamic, personalized, on-demand experiences.

Imagine the New York Times not publishing articles but running AI services that generate articles tailored to your preferences for length, tone, and topic. Their journalists source and index information (and potentially opinions). Their system dynamically builds content off of that.

In the same way one may favor learning about quantum physics through a conversation with an LLM instead of browsing Wikipedia's static page, the layer that is exposed to customers may be decoupled from the raw information itself. Over time, this may span beyond text based outputs. Imagine a shift from fixed films to interactive narratives that adapt to viewer choices and generate scenes on the fly. With heavy personalization, will companies even be able to store an account of the content that was generated?

In that world, what does copyright even mean? If an article is generated fresh for each reader, synthesized from thousands of sources, is the copyright applied to the output? If knowledge becomes conversational rather than published, where do rights attach? If a story adapts in real-time based on user interaction, is each experience a separate work?

These aren't distant hypotheticals. We're at the very beginning of something profound, armed with a set of 20th century IP frameworks—built for physical books, fixed recordings, and discrete artworks—that have no conceptual tools to handle it.

The irony is that by the time we solve the current AI copyright debates—if we ever do—those solutions may already be obsolete. We're fighting over whether AI can train on existing fixed articles while the very concept of "an article" is dissolving into something fluid and personalized. We're litigating static NYTimes articles, while meanwhile the boundary between creation and consumption blurs into interactive experiences that don't fit existing categories.

The problems we're grappling with today are genuinely difficult. But they may also be the wrong problems. The AI copyright debate isn't just exposing how broken existing law is—it's revealing that we're trying to regulate a world that no longer exists while the actual future races past us, raising questions we haven't even begun to ask.

The ambiguity was always there. AI just made it impossible to keep pretending we had answers.