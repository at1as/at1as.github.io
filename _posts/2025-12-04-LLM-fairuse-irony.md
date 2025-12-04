---
layout: post
title: "The Fair Use Paradox: If It Applies to Training… Doesn't It Apply to Distillation?"
date: 2025-12-04 12:00:00 -0400
categories: [ai]
tags: [ai, commentary, legal]
hidden: false
---

Few industries have experienced as many disruptions in the 21st century as publishing. The last two decades have brought a shift from print to digital, the decline of ad-supported models, the rise of paywalls, and a surge of self-publishing and social platforms.

Today, publishers face a new and growing threat: traffic losses due to AI assistants and large language models (**"LLMs"**), which increasingly answer questions directly and bypass publisher websites. Similarweb reports that, in the year after Google launched its AI Overviews feature in May 2024, organic search traffic to news publishers [fell by about 26%](https://www.similarweb.com/corp/reports/generative-ai-publishers/), coinciding with a sharp rise in “zero‑click” searches where users do not visit any news site

As in prior disruptions, publishers are seeking new monetization channels—this time through regulation and litigation. But this situation is more paradoxical than before: **the same LLM developers who argue fair use justifies training on others' data now argue against fair use when others train on their model outputs.**


### Training


Large Language Models are trained on content scraped from the public internet: books, articles, blogs, forums, code repositories, and multimedia. Much of this material is copyrighted, though publicly accessible. In some cases, even private or questionably sourced data has been used (Anthropic recently agreed to a [$1.5 billion settlement](https://www.reuters.com/legal/litigation/authors-lawyers-15-billion-anthropic-settlement-seek-300-million-2025-12-04/#:~:text=Anthropic%20agreed%20to%20the%20settlement,commercial%20AI%20models%20like%20Claude) with publishers over training on pirated works. But we'll save this for a separate discussion).

In general, LLMs don't memorize or reproduce source documents. Instead, they build statistical representations of language patterns that guide how they generate new content. These compressed patterns often allow models to produce informative summaries, reducing the need for users to visit source articles.

Publishers argue that if their copyrighted works were used to create these systems, they deserve compensation, especially when LLMs compete with their own business models. The *New York Times v. OpenAI* case hinges on whether this training qualifies as transformative fair use or commercial exploitation.

I've heard LLM developers offer two main arguments:

- **Transformative learning:** A model internalizes statistical associations, not full copies of training data. It operates like a human reader who is influenced by content but cannot reproduce it verbatim. Copyright protects expression, not the underlying knowledge embedded in that expression.
- **Global competition:** Open-source models in jurisdictions with weaker IP enforcement will continue training on public data. Singularly forcing U.S. companies into costly licensing deals for training data could leave them at a major competitive disadvantage.


### Distillation

One of the most important advances in AI is **model distillation**: training a smaller, cheaper model to replicate the behavior of a larger one. This enables edge deployment, personalization, and improved inference speeds. Many 7B and 3B parameter models today exist only because they were distilled from larger systems.

Distillation is often staged: a 70B model is distilled to 30B, then 7B, then 2B. Each iteration trades fidelity for efficiency (the latter of which is important for local AI inference and to reduce the amount of extremely-in-demand GPU time).

Initially, companies distilled *their own models*. But more recently, some are alledged to have begun distilling based on outputs from _competitors' models_, such as GPT-4 and GPT-4o. Instead of training on internet text, they train a smaller model to mimic the answers given by a leading model via API calls. This drastically reduces training costs.

OpenAI argues this practice violates its Terms of Use, claiming it constitutes replication of proprietary behavior. The company has accused foreign labs of using OpenAI APIs to mass-query and distill GPT-4.

The better LLM developers argue for fair use in training, however, the more they weaken their position against distillation.


### The Fair Use Paradox

Many of the arguments used to defend training on copyrighted works also apply to distillation:

<div class="wide-bleed premium-table" markdown="1">

| Argument / Principle                             | Training on Copyrighted Works                      | Distillation from Another Model                            |
| ------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------- |
| **Transformative use**                           | Produces new statistical representations from text | Produces a new model based on statistical patterns with distinct weights and behavior |
| **No verbatim reproduction**                     | Rarely outputs source text word-for-word           | _Rarely_ mirrors teacher output verbatim                     |
| **Human-learning analogy**                       | Learns from text like a person internalizing ideas | Learns from responses like a student imitating a tutor     |
| **Diffuse, non-deterministic influence**         | No one document controls model behavior            | No one output governs the student model                    |
| **Not a market substitute**                      | Doesn't replace the original article               | Doesn't copy internal weights or architecture              |
| **Copyright doesn't cover statistical mappings** | Learned parameters aren't expressive works         | Student weights are learned independently                  |
| **No unauthorized access or hacking**            | Scraping public data is legally gray but common    | Uses official, rate-limited API without breaching security |

</div>


This raises difficult questions:

- If OpenAI can train on New York Times articles posted online, can others train on ChatGPT answers posted online?
- If scraping web content is fair use, is scraping model outputs fair use?
- If it's legal to learn from human-generated text, why not machine-generated text?
- What happens when most online content is machine-generated? At that point, training and distillation become indistinguishable.
- What if distillation is performed via an intermediary (a researcher who publishes ChatGPT responses, not for thier own training purposes)?
- Is the % of model output that comes from distillation vs. original training a relevant factor?



### Terms of Service

What *is* clear is that distillation using OpenAI's API violates **Terms of Service**, and companies can enforce their policies through:

- Rate limits
- Abuse detection
- API key revocation
- Geo-blocking
- Monitoring prompt patterns

However, these are **contractual protections**, not **copyright or intellectual property protections**. This means they carry less legal weight. And the heavier the enforcement becomes, the more publishers are emboldened to leverage their own Terms of Service against the very AI companies training on their content.


### What Now?

The modern LLM ecosystem is built on the premise that training on publicly available data is fair use. But that same logic, applied consistently, appears to justify distillation as well.

Courts may soon be forced to choose:

- **If training is allowed but distillation is not**, they must articulate a line the technology itself doesn't clearly draw and answer the questions we posed earlier.
- **If distillation is allowed**, companies will need to compete through better offerings (tooling, architecture, memory, research, personalization, and UX) rather than exclusive data access.
- **If training is not allowed**, many existing AI models face existential legal risk, and innovation may consolidate into a handful of licensed, highly regulated incumbents.


A lot is at stake for AI companies and publishers. However, this increasingly impacts the global economy as well. AI has become a core driver of GDP growth, suggesting that these courtroom battles will become unavoidable.








