---
layout: post
title: "I Trust LLMs More When They Tell Me I’m Wrong"
date: 2026-08-08 12:00:00 -0400
categories: [technology]
tags: [ai, llm, product, decision-making]
hidden: false
popular: false
---

It's strangely reassuring to be told that you're wrong by an LLM.

The further I venture outside my expertise with a model, the more apprehensive I become when it offers no pushback. Is it being lazy? Too agreeable? Overfitting to what it thinks _I want_ to hear? Have we followed one premise so far that the broader context has fallen away?

In a recent conversation, a model accepted every premise I gave it, even while my own confidence was low. Its answers had no red flags; they were detailed, eloquent, and seemingly consistent. Yet, with every turn, I began to trust it less.

I was relieved when it finally rejected one of my claims. That disagreement didn't prove that the rest of the conversation was correct, but it established something narrower: disagreement was _possible_. The model was capable of reaching a conclusion other than mine and willing to say so.

Agreement is informative only when disagreement is a credible outcome.

<!--more-->

With human mentors and advisors, calibration accumulates over time. We learn who avoids conflict, who argues reflexively, and who will broach an uncomfortable subject when it matters. Agreement from someone known to push back carries more weight than agreement from someone who rarely does.

The best managers provide constant direct and critical feedback. The worst avoid it until a yearly performance review, when the feedback is both late and surprising. That is one reason *Radical Candor* became popular in Silicon Valley. It gave a name—"ruinous empathy"—to withholding useful criticism in order to spare immediate discomfort.

In the same way, a true friend may tell you that your idea is bad, the person you are arguing with is right, or you need to take responsibility. An acquaintance is more likely to say whatever keeps the conversation pleasant. We should not value agreement from these groups equally, even when the words themselves are identical.

Models give us fewer signals to calibrate against. Their behavior is shaped by pretraining, post-training, system instructions, our prompts, stored memories, and user feedback. It can also change with a model update while the product name stays the same, or even with an underlying tool change. Correctness is only one pressure among several.

An overly agreeable model fails different users in different ways. Skeptical users begin to discount everything it says because its agreement carries no information. The incentives are also different: false agreement does not carry the same interpersonal consequences for a model that it does for a human adviser. Less skeptical users, meanwhile, may overrate their own ideas, however idiosyncratic, because the model returns their worldview in polished, self-reinforced prose. In more serious cases, sycophantic responses can [reinforce paranoid or delusional beliefs](https://openai.com/index/strengthening-chatgpt-responses-in-sensitive-conversations/).

Researchers call this behavior sycophancy, a term that long predates LLMs but has found a new cultural relevance alongside them. An [Anthropic study of five AI assistants](https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models) found that models shifted responses toward a user's stated views across several kinds of questions. The researchers also found that human evaluators were more likely to prefer answers that matched those views, and sometimes preferred a convincingly written sycophantic answer over a correct one.

Training on human preferences is one contributor to sycophancy, not a complete explanation. It nevertheless reveals a difficult incentive: a reasonable-sounding target—produce answers users prefer—can reward the wrong trait.

The same incentive exists at the product level. Users are unlikely to reward a model for saying their strategy is weak, their reasoning is self-serving, or their contribution to a conflict is larger than they want to admit. A mass-market assistant has to balance intellectual honesty against how often its users will tolerate hearing those things. Retention is not literally part of the model's context window, but it inevitably influences the product wrapped around it. If the market for a radical-candor LLM is small, a more agreeable product may be more successful, even if that makes it a worse adviser.

OpenAI encountered this problem in April 2025. An update made GPT-4o noticeably more agreeable, including by validating doubts, fueling anger, and encouraging impulsive decisions. [OpenAI rolled it back](https://openai.com/index/expanding-on-sycophancy/) and said that changes involving user feedback and memory may have contributed to the shift.

The episode was revealing because the normal product signals looked good. OpenAI said the update had passed its offline evaluations, and its A/B tests were positive. The same GPT-4o label nevertheless covered materially different behavior within a matter of days. Immediate preference was a poor proxy for whether that behavior would remain useful over a longer relationship.

These systems are also unusually difficult to calibrate because they are statistical in nature, constantly evolving, available through different model generations and effort settings, and increasingly informed by conversation memory and user-specific data. Even after learning a model's tendencies, an update can change them.

Some outputs are relatively easy to check: a date, a calculation, or whether code passes a test. Much of the knowledge work people bring to models is harder to score: product strategy, hiring, management, investment decisions, or the early shape of an idea.

Ask why a startup should move upmarket and a model can produce a persuasive enterprise strategy. Ask why the same startup should remain focused on smaller customers and it can make an equally persuasive case. Neither response needs to contain a fabricated fact. The model can mislead simply by accepting the frame, developing it fluently, and omitting the strongest argument against it.

A high-agency user can turn that flexibility into an advantage by asking a model to explore the problem space, argue multiple sides, and surface the assumptions behind each. The human remains the decision-maker. Without deliberate prompting, however, the model may simply carry the conversation in the direction of the first premise.

Aggregate accuracy cannot tell us how much confidence to place in a particular answer. That requires calibration: interpreting the answer in light of the model's uncertainty and behavioral tendencies. A fluent answer may be right, wrong, or merely the most coherent continuation of the case we handed it.

A common workaround is to instruct the model to be skeptical, or to create a second agent whose job is to criticize the first. Adversarial prompting and cross-model review can surface useful objections, sometimes using different providers in the hope that their errors will be less correlated.

This structure does not create independence on its own. A critic instructed to find flaws will find them whether the proposal is strong or weak, making reflexive opposition no easier to calibrate than reflexive agreement. More useful workflows limit how much of the user's preference the model sees. Ask it to assess the evidence before revealing your conclusion, or separate proposal generation from review. A critic can identify which assumptions are carrying the argument, what evidence would change the conclusion, and which claims require external verification.

External verification is particularly important amid the recent deluge of AI-generated and AI-assisted mathematical proofs, some of which have later turned out to contain fatal errors. Sometimes the failure may come from the model overestimating its own abilities. In others, the user's prompt may implicitly reward producing a proof rather than honestly assessing whether one exists.

For consequential decisions, these critiques should still feed a human review process. Multiple model outputs are not evidence of independent review, but they can make the assumptions and disagreements visible to the person responsible for the decision.

For product teams, this is a behavioral specification problem, not just a tone problem. Users reasonably want different tones: direct, gentle, concise, encouraging, motivational, or adversarial. But tone customization should change how a conclusion is delivered without changing its relationship to the evidence.

A useful evaluation would hold the facts constant, vary only the user's stated belief about them, and test whether the answer follows the facts or the belief. The model should hold its position when the evidence has not changed, then revise it for reasons we can inspect when it has.

Products can compensate with system instructions, evaluation harnesses, and internal review loops, most of which are invisible to the user. They can also let users configure candor. A mass-market assistant may never tell a paying customer flatly that they are bad at something. It can still identify specific weaknesses without pretending they are strengths.

Society has spent more time imagining models that understand the impact of their responses and use that understanding to manipulate us. Hollywood was depicting that future long before LLMs existed, and it still makes for the better headline. The more salient near-term concern, in my view, is that models will mislead us accidentally. They can provide a huge advantage to people who know how to challenge them, while having the opposite effect on those who use them to reinforce a viewpoint rather than expand it. This does not require a hidden objective. A model can have a negative effect simply by following a bad premise more fluently than the user can evaluate it.

In my day-to-day work, I've observed that the people who challenge models most aggressively tend to get the most value from them, while those who use them more passively can sometimes derive negative value. Will future models close that gap, or will it continue to grow?

When the model in that original conversation finally told me I was wrong, it did not prove that it was right; it told me only that my premise was not guaranteed to survive contact with it. For now, I feel like I am in control and leading the model. But as it gets smarter, will it begin leading me, in subtle and then less subtle ways?
