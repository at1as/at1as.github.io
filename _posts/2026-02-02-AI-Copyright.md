---
layout: post
title: "AI Didn't Break Copyright Law, It Just Exposed How Broken It Already Was"
date: 2026-02-02 12:00:00 -0400
categories: [technology]
tags: [tech, history, legal]
hidden: false
popular: true
hackernews_id: 46872562
---

If you paint a picture of Sonic the Hedgehog in your living room, you are technically creating an unauthorized derivative work—but in practice, no one cares. Private, noncommercial creation has always lived in a space where copyright law exists on paper but is rarely enforced.

Gift it to a friend? Still functionally tolerated—a technical act of distribution that copyright law mostly ignores at human scale. Take a photo and post it on Instagram? Now you've crossed into public distribution of a derivative work without permission. Under the letter of the law, that's infringement, although a fair-use defense *might* apply and Sega almost certainly won't care. It's fan engagement, free marketing, and good PR.

Sell that painting, though, and the tolerance disappears. You're no longer a fan, you're a competitor.

<!--more-->

This gap between the written law and its practical application isn't an AI problem. It's something that has been quietly tolerated for decades. The system works not because the rules are clear, but because enforcement has been selectively targeted for impact and the scale has been human. With generative AI, that ambiguity suddenly represents billions of dollars in litigation and potential damages, transforming what was once informal tolerance into an existential legal battle that forces long-implicit assumptions into the open.

## Copyright Law Was Built for Human Scale

Copyright law has always relied on a set of quiet assumptions that were never written down but broadly understood: creation and transformation are slow, distribution is costly, and enforcement can be discretionary. Most infringement has been tolerated not because it was legal, but because it was rare, small, and culturally useful.

Fan art lives in this space. So do fan films. *Star Wars* is a canonical example; not because Lucasfilm formally granted rights, but because informal norms emerged: no monetization, no confusion with official releases, and the understanding that rights holders could assert control at any moment. This worked because these projects were expensive to make, clearly unofficial, and very few in number.

AI didn't cherry-pick gray areas in copyright law; it removed the human-scale constraints that made those gray areas manageable. When AI can generate feature-length content at ultra-high volume, rights holders will inevitably argue that mere creation—not just distribution—must be prohibited.

But is there an easy solution?

## The Training Layer: Why You Can't Solve It There

The most common proposal is simple: ban training on copyrighted content. Keep AI "clean" from the start.

This sounds reasonable until you examine what "clean" actually means.

Even if you scrupulously avoid pirated material, the internet is saturated with legally posted content about copyrighted characters. Fair-use images of Sonic appear in reviews, commentary, parody, and news articles. There are photographs of licensed Sonic merchandise. There are text descriptions in product listings, forum discussions, and blog posts.

An AI trained only on legally accessible data will still learn what Sonic looks like. It will learn the character design, the color palette, the aesthetic. You cannot train on the open internet without absorbing information about major cultural properties. That knowledge emerges from millions of non-infringing references.

It gets worse. An entire article's worth of information can be reconstructed from fair-use snippets scattered across the web—a quote here, a summary there, facts recombined from public sources. The model may not copy any single source; it synthesizes patterns from a sea of legitimate data.

Copyright law _does_ recognize intermediate copies as potentially infringing absent fair-use defenses, and courts have historically treated unauthorized reproductions, however temporary, as relevant. But applying that doctrine to modern model training collapses under scale. When training datasets contain billions of documents, establishing precisely what went in, which copies matter, and what causal role any individual work played becomes functionally impossible.

Even outside AI, the boundaries around “transformation” have always been murky. Artisans de Genève, for example, is an independent workshop that was sued by Rolex for modifying its watches. The eventual compromise was not a clean rule about transformation, but a narrow procedural boundary imposed by settlement: Artisans de Genève could only modify watches brought in directly by customers, not purchase them themselves. The law avoided defining where transformation ends and infringement begins; it simply constrained scale and distribution.

Model training removes those constraints entirely.

And even when pirated content *is* used in training, proving it is extraordinarily difficult—and removing it without retraining is nearly impossible. *The New York Times* attempted to demonstrate this by prompt-engineering models to reproduce exact articles through next-token prediction (a resource-intensive effort that doesn't scale, which OpenAI characterizes as a form of adversarial prompting). Declaring an entire model "tainted" and subject to destruction because some fraction of its inputs were improperly sourced pushes copyright into uncharted territory. Unlike trade secret law, copyright traditionally remedies harm through damages, not destruction of downstream systems.

The training layer simply cannot act as a reliable enforcement point.

But rather than disappearing entirely, that pressure shifts downward, toward generation and distribution.

## The Generation Layer: Creation Without Friction

At the generation layer, AI systems turn abstract knowledge into concrete outputs. This is where large model providers implement partial copyright enforcement today, implicitly framing LLMs as something more than neutral tools. Adobe Illustrator doesn't impose IP restrictions on what users can draw; LLMs increasingly do.

Effective enforcement at this layer requires treating intent, experimentation, parody, reference, and coincidence identically. This is not a subtle shift. Copyright law was never designed to evaluate private acts of creation at massive scale.

Two problems immediately emerge:

**First, intent becomes unreadable.** A model generating something "similar" to Sonic isn't forming an artistic goal. It's sampling from a probability space shaped by its training. Inferring copyright-relevant intent here is conceptually incoherent and operationally impossible. Enforcement degrades into a cat-and-mouse game of banned phrases and descriptions that users can always circumvent (purposefully, or otherwise). There is no discrete boundary where output becomes infringing, nor any realistic way for a model to recognize all forms of infringement across global IP.

**Second, statutory damages become absurd.** Copyright penalties were calibrated for rare, explicit, human-scale violations, often with willfulness in mind. When generation is cheap and ubiquitous, applying the same framework produces penalties so disproportionate that enforcement loses legitimacy. A single automated script generating infringing content at scale could theoretically expose model providers or users to catastrophic liability entirely disconnected from actual harm.

Crucially, generation alone does not imply harm. Most generated content is never shared. Context matters.

Which brings us to the only layer where copyright law has ever really functioned.

## The Distribution Layer: Where Harm Actually Manifests

Copyright law polices distribution, not thought. Harm occurs when works are shared, substituted, or monetized.

Uploading an AI-generated Sonic animation to a private folder is meaningfully different from uploading it to YouTube. Flooding a platform with AI-generated *Star Wars* shorts is meaningfully different from sketching them for yourself. Market substitution, audience diversion, and brand dilution occur only once content is distributed.

This is why enforcement mechanisms like takedowns, DMCA safe harbors, content-ID systems, and platform moderation, however imperfect, operate here. They're blunt, but they align with where harm occurs.

Trying to push enforcement downward into generation destabilizes the system. You end up policing private creation before any material harm occurs because you cannot control public scale.

## The Liability Maze: Everyone Loses

At this point, the question becomes not just *where* enforcement happens, but *who* absorbs the liability when it does. Different enforcement points pull different actors into the blast radius, and none of them produce a clean outcome. We've already covered why training enforcement is simply unenforceable. But how about generation or distribution?

### Enforcement at Generation

If liability attaches at the moment of generation, responsibility has to fall on either model providers or users.

**Model Providers**
Require safeguards, filters, surveillance of API usage, and comprehensive IP databases.

This overwhelmingly favors incumbents. Google, OpenAI, and Meta can afford legal teams, bespoke filtering infrastructure, and licensing deals with major rights holders. A startup can't. An open-source project certainly can't. Compliance becomes an existential cost, entrenching monopolies and freezing competition at exactly the wrong moment.

**Users**
Make generating copyrighted content illegal.

This quickly collapses into absurdity. Is typing _"Mario"_ now a crime? What about _"Italian plumber in a red hat"_? What if a vague prompt unintentionally produces something infringing? Is discovering gaps in the model safeguards akin to hacking or infringement? Enforcing this would require monitoring generation at scale; a surveillance regime that's both impractical and deeply unsettling to users who share deeply personal information with AI models (a concern already surfacing in NYT v. OpenAI–adjacent arguments that would require access to large volumes of OpenAI customer query data).

Generation-level enforcement either centralizes power or becomes extremely overzealous in its application. Sometimes both.

### Enforcement at Distribution

Alternatively, liability can attach when content is shared, published, or monetized.

**Platforms and intermediaries.**
Shift responsibility to hosting and distribution layers.

This mirrors how copyright already functions online. Individual users are technically liable for infringement, but platforms are shielded by safe-harbor regimes so long as they remove content when notified. In practice, this turns legal enforcement into platform policy.

Faced with massive volumes of AI-generated content, platforms would respond defensively. The safest move is over-enforcement: aggressive takedowns, broad bans on derivative works, and stricter moderation of fan art and remix culture. The result is likely to be quiet erosion of some of the internet's most creative ecosystems.

Users still bear liability in theory, but experience it indirectly through rules that increasingly err on the side of deletion.

### No Clean Cut

Every enforcement point shifts responsibility and damage elsewhere:

- Generation favors incumbents or mandates surveillance.
- Distribution incentivizes over-policing and cultural flattening.
- User liability is impractical at scale.

None of these approaches resolve the tension so much as relocate it, trading one set of pathologies for another.

## Foreign Models: Why US Regulation Might Not Matter

Even if the U.S. solved every problem above perfectly, it might not matter.

AI is global. If U.S. regulation becomes too restrictive, development elsewhere will outpace it. A foreign company can train models with minimal copyright constraints, host them abroad, and make them accessible to Americans. Using foreign AI services is not inherently illegal today.

This leaves bleak options regarding foreign models:

**Restrict access to foreign models**: Block access via ISPs, DNS providers, and hosting platforms—an approach that has not meaningfully stopped piracy

**Criminalize use**: Nearly impossible to enforce without mass internet surveillance.

**Restrict commercial outputs**: Accept access as inevitable, but prohibit monetization without compliance. This is more enforceable, but requires traceability through watermarking or permitting systems for commercial goods. It is also predicated on the assumption that non-commercial content creation won't damage the rights holder's ability to monetize their work.

The likely outcome is already emerging: a two-tier system. "Safe" U.S. AI for commercial use, increasingly tightly integrated with major rights holders, while accepting unavoidable access to foreign or open-source models for everyone else.

Once the ecosystem splits this way, compliance stops being a universal requirement and becomes a choice. Large companies that need legal certainty will opt into the regulated tier. Everyone else will not. And once model weights are public, compliance becomes voluntary in a much more literal sense.

You can sue Meta. You can't stop someone in another jurisdiction from hosting an unrestricted fork. Strict domestic regulation risks handicapping U.S. companies while failing to protect rights holders. It also places a disproportionate burden on smaller companies that can't afford the legal and compliance overhead required to navigate these gray areas.

## The Pressure Cooker: Irreconcilable Forces

All of this is playing out against a backdrop of enormous, contradictory pressures.

Publishers are desperate. Each technological wave—blogs, social media, ad blockers, paywalls—eroded their leverage. AI feels like another existential blow, spanning text, images, audio, and video.

Governments are trapped. Historically aligned with rightsholders, they now face the political cost of crippling domestic AI while global competitors surge ahead. Meanwhile, AI companies now make the GDP-growth argument once owned by the media industry.

## Searching for Alternatives

Given those pressures, it's tempting to look for alternative enforcement frameworks that can satisfy all parties. The problem is that every proposal fails somewhere fundamental.

Training-based enforcement is untraceable. Generation-based enforcement is incoherent. Distribution-based enforcement is reactive, incomplete, and historically failed to curtail piracy. Jurisdictions diverge, and global access routes around national rules.

It's not just enforcement breaking down, but attribution itself. Influence can't be cleanly measured, harm can't be localized, and responsibility can't be assigned without collapsing into surveillance or overreach.

This naturally leads to proposals that sidestep enforcement entirely, embedding compensation directly into the AI industry itself.

**Government-mediated compensation**: Tax AI companies and redistribute funds to rights holders, similar to blank media levies. But how do you determine fair distribution? Should a photographer whose work appeared once in training receive the same as an artist whose style was heavily learned? At internet scale, everyone with an online presence becomes a rights holder whose work was ingested indirectly. The administrative complexity is staggering. The likely outcome is either a blunt, unfair allocation or a system that primarily benefits the largest players who can navigate it best.

**Mandatory licensing**: Treat AI training like music covers, with compulsory licenses at government-set rates. But where does licensing apply? At training time, when data ingestion is diffuse and provenance unclear? At generation time, forcing cumbersome per-output fees? Or only at commercial use, which just pushes enforcement back onto platforms? Licensing works when the unit being licensed is discrete and identifiable. In AI systems, the unit of influence is neither.

What these approaches share is an assumption that influence can be measured, attributed, and priced with reasonable precision. That assumption no longer holds.

If both traditional enforcement and alternative frameworks collapse under their own complexity, we're left with an uncomfortable question: should AI companies bear responsibility at all for diffuse, non-attributable learning? And do existing IP norms—built around discrete works and identifiable acts of copying—still make sense in a world where content creation is increasingly statistical, generative, and cheap?

### No Good Answers: The Fundamental Incompatibility

The uncomfortable truth is that copyright law works best under conditions of scarcity: creation and transformation are costly, distribution is constrained, enforcement can happen at a limited number of chokepoints, and the volume of disputes remains manageable.

While we argue about how AI interacts with these rules, there is a deeper problem: the nature of content itself is changing. We are moving from static, general-purpose works to dynamic, personalized, on-demand experiences.

Imagine the New York Times not publishing fixed articles, but operating an AI service that generates reporting tailored to your preferred length, tone, and depth. Journalists still source information, investigate facts, and shape narratives, but the "article" is assembled dynamically for each reader, potentially never existing twice in the same form.

This pattern is already familiar. Many people now prefer learning about complex topics through conversation with an LLM rather than reading a static Wikipedia page. Over time, this decoupling of interface from underlying information will extend beyond text. Fixed films may give way to interactive narratives that adapt to viewer choices and generate scenes on the fly. With heavy personalization, companies may not even retain a complete record of what content was generated for whom.

In that world, what does copyright mean? If an article is generated fresh for each reader, synthesized from thousands of sources, where do rights attach? Is the output the copyrighted work? The underlying system? Each individualized experience? If a story adapts in real time, is every interaction a new work?

These aren't distant hypotheticals (or won't be for long). We are at the beginning of a shift that existing IP frameworks—designed for physical books, fixed recordings, and discrete artworks—were never meant to handle. The problem isn't that these frameworks are poorly written; it's that they assume stable works, identifiable acts of copying, and enforceable boundaries.

That's why every attempted fix breaks down. We try to regulate training, but learning is diffuse. We try to regulate generation, but creation is private and cheap. We try to regulate distribution, but content is fluid, personalized, and global.

The irony is that by the time we resolve today's AI copyright debates, if we ever do, the thing we're fighting over may already be obsolete. We're litigating static articles while the concept of "an article" dissolves into something conversational and adaptive. We're arguing about copies while the boundary between creation and consumption blurs into a single interactive process.

The problems we're grappling with today are real and difficult. But they may also be the wrong problems. The AI copyright debate isn't just exposing how strained existing law has become; it's revealing that we're trying to regulate a world that no longer exists while the actual future races ahead, raising questions we haven't yet learned how to ask.

The ambiguity was always there. AI just made it impossible to keep pretending we had good answers.
