---
layout: post
title: "The Fair Use Paradox: If It Applies to Training… Doesn't It Apply to Distillation?"
date: 2025-12-04 12:00:00 -0400
categories: [ai]
tags: [ai, commentary, legal]
hidden: false
---

Few industries have experienced as many repeated disruptions in the 21st century as publishing. The last two decades ushered in a shift from print to digital, a semi-collapse of ad-driven models, the rise of subscription paywalls, and finally the growing threat of self-publishing and social platforms.

Today, publishers are facing another major disruption: declining traffic driven by AI assistants and large language models (LLMs) that increasingly provide information directly, bypassing publisher websites entirely. As models have improved and mainstream adoption grows, the existential threat facing publishers has intensified.

As with previous disruptions, publishers are responding by seeking new monetization mechanisms — primarily through regulation and legal action. But this time, the situation is more paradoxical: **the same LLM developers who argue in favor of fair use when training on others' data simultaneously argue against fair use when others train on their models' outputs.**


### Training

Large Language Models are trained on content scraped from the public internet: books, articles, blogs, forums, code repositories, and even multimedia content. Much of this information, while publicly accessible, is copyrighted. In some cases even *private* information has been unintentionally trained on (Anthropic recently agreed to a multi-billion-dollar settlement addressing claims of improper training on torrented copyrighted works).

In the case of public information, an LLM does not store the original documents. Instead, it develops *compressed statistical representations* across all training data. These representations shape the model's future outputs: well-performing models produce summaries or explanations that often reduce the need for a user to read the primary source.

Publishers argue that if their copyrighted works were used during training, they are entitled to compensation — especially when that training reduces traffic to their own properties. The *New York Times v. OpenAI* lawsuit hinges on the idea that training on their content without payment constitutes unlawful commercial use.

LLM developers refute this with several arguments:

1. **Training is transformative.**
   A model learns from text but does not reproduce it, just as a human might read an article, internalize its ideas, and later write something influenced—but not determined—by it. Copyright restricts *copying*, not *learning*. The influence of any individual training document is diffuse, indirect, and impossible to isolate.

2. **International competition.**
   Open-source models from jurisdictions that do not enforce U.S. copyright law will not be held to the same standards. If U.S. models must pay licensing fees for training, they risk becoming globally uncompetitive.


### Distillation

One of the most important techniques in modern AI development is **model distillation**: taking a large, expensive model and training a smaller model to imitate its behavior. The resulting model becomes more efficient, cheaper to run, and often better suited for specific tasks. Many small-parameter LLMs, including those that run on laptops or phones, exist only because they were distilled from larger models.

Distillation is often performed in multiple stages. A 70B-parameter model may be distilled into a 30B model, then into a 7B model, then into a 2B model. Each step preserves much of the previous step's knowledge while shedding computational weight.

As distillation became widespread, some companies began distilling their models using outputs from *competitor* models — most commonly OpenAI's GPT-4 and GPT-4o. Rather than learning directly from the internet (traditional “training”), these models learn from another model's responses, drastically reducing the cost to develop new models.

OpenAI argues this is unacceptable and a violation of their Terms of Use, claiming it constitutes an improper attempt to “replicate” or “steal” proprietary model behavior. There have been public accusations of foreign labs performing large-scale distillation using OpenAI's API.

And yet, this raises an uncomfortable question for them: **If training is fair use, then why isn't distillation?**


### The Fair Use Paradox

Training on copyrighted works is justified by LLM developers using arguments that apply *equally well* to model distillation:


| Argument / Principle | Training on Copyrighted Works | Distillation from Another Model |
|----------------------|------------------------------|---------------------------------|
| **Transformative use** | Produces new statistical representations from text | Produces a smaller model with new, transformed representations |
| **No verbatim reproduction** | Does not reproduce copyrighted text verbatim (except rare edge cases) | Student does not reproduce teacher outputs verbatim (except rare edge cases) |
| **Human-learning analogy** | Humans read copyrighted works and internalize ideas | Smaller models learn patterns from larger models in a comparable way |
| **Diffuse, non-deterministic influence** | No single document determines model behavior | No single teacher output determines student behavior |
| **Not a market substitute** | A trained model does not replace the original article | A distilled model is not a substitute for the teacher's internal weights |
| **Copyright covers expression, not statistical mappings** | Learned weights are not considered copyrighted expression | Student weights are newly learned, not copied |
| **Requires no hacking or unauthorized access** | Scraping public web pages is not considered hacking | API queries use the *official, paid*, rate-limited interface; no weights are extracted |


This symmetry raises several difficult questions for AI companies:

- If OpenAI can train on *New York Times* articles posted online, can another company train on **ChatGPT answers posted online**?
- If scraping the public internet is fair use, is scraping **public GPT outputs** also fair use?
- If a model can legally train on millions of documents created by humans, why can it not legally train on documents created by a different model?
- And what happens when a significant portion of the internet becomes machine-generated? At that point, “distillation” and “training” become indistinguishable.



### Terms of Service

What *is* clear is that distillation using OpenAI's API violates **Terms of Service**, and companies can enforce their policies through:

- Terms of Use
- Rate limiting
- Geo-blocking
- Automatic blocking
- Detection of high-volume querying
- Prohibitions on training with API-generated text

However, these are **contractual protections**, not **copyright or intellectual property protections**. And the heavier the enforcement becomes, the more publishers are emboldened to weaponize their own Terms of Service against the very AI companies training on their content.


### What Now?

The AI industry is built on the argument that training on publicly available data is fair use. That argument enabled the explosion of modern LLMs. But when applied consistently, the same reasoning appears to justify distillation as well.

Courts will now face difficult choices:

- **If training is allowed but distillation is not**, they must draw a distinction that the technology itself does not meaningfully recognize.
- **If distillation is allowed**, companies must innovate or differentiate on architecture (tools, memory, personalization, reasoning, etc.), not on exclusive access to training data.
- **If training is not allowed**, many existing AI models face existential legal risk, and innovation may consolidate into a handful of licensed, highly regulated incumbents.


There is a great deal at stake—not only for AI companies and publishers, but for governments and the global economy. As AI becomes an increasingly large driver of GDP growth, the Fair Use Paradox will likely play out in courts around the world.
