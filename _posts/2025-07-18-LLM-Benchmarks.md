---
layout: post
title: "Most AI Benchmarks Don't Measure Intelligence"
date: 2025-07-18 12:00:00 -0400
categories: [ai, llm]
tags: [ai, llm, technical]
hidden: false
---

François Chollet recently introduced a new version of the [ARC AGI benchmark](https://www.youtube.com/watch?v=5QcCeSsNRks) during his talk at Y Combinator’s Startup School. It's one of the more thoughtful discussions on evaluating AI systems — and well worth watching.

I pay less attention to recent LLM benchmarks, as it's been clear for a while that models can be tuned — or overfit — to perform well on static test sets. We routinely see announcements of near-perfect scores on "Ph.D.-level" exams, yet these same models often struggle with basic tasks that involve actual reasoning. A model that can answer obscure questions about physics but fails to count the number of r’s in strawberry is not a demonstration of intelligence. It is revealing a clear gap between memorization (through token prediction) and core understanding.

This problem is made worse by how easily people anthropomorphize LLMs. Once a model gets a high score on an exam we associate with human intelligence, we tend to assume the model "knows" or "understands" something.


### ARC AGI 2

ARC AGI 2 was designed to address this. Unlike most static benchmarks, it uses dynamically generated reasoning tasks that test for abstraction, not recall. These are pattern-based problems that require flexible thinking — the kind of reasoning humans are generally good at, but current AI systems are not.

The difference in performance is telling. Humans routinely score well on these exams. LLMs, meanwhile, rarely score more than 5%. In competitive settings, the best score to date is ~12%. These problems are built to be representative of the kinds of problems AI would need to solve to exhibit general intelligence.

It's not actually a discouraging result; a valid benchmark is an important precursor to being able to measure intelligence. Most existing benchmarks fail to measure what we actually care about: generalization, reasoning, and the ability to handle novel problems, which is clearly reflected in the lofty scores LLMs are able to achieve.


### Why This Matters

Take human longevity as an example: there’s no shortage of claims about reversing biological age using various biomarkers. But those claims are meaningless unless the biomarker itself is valid — and in many cases, it isn’t. Few outperform something as simple and predictive as grip strength. A flattering score is only useful if it measures something real.

The same principle applies in AI. If a benchmark can be gamed, memorized, or inflated through prompt tuning, it won’t tell us anything meaningful about intelligence — and we risk drifting into the AI equivalent of "anti-aging" supplements.

Fortunately, innovation is happening: tool-augmented reasoning, integration with real-time systems, chain-of-thought "reasoning", more efficient fine-tuning, and efforts to move beyond static pretraining. These are all valuable steps. But progress remains more incremental than the headlines suggest, and real leaps will likely require deeper breakthroughs — the kind that show up clearly on reliable benchmarks.


### Mathematical Reasoning

One area worth watching closely is mathematical discovery. Open problems in mathematics are well documented, with clearly understood levels of difficulty and often decades (or centuries!) of partial progress. They provide a good testbed for evaluating whether a model can reason, rather than just predict the next token. A solution to an unsolved problem would not be present in any training data and require truly novel thinking, in many cases across multiple domains of mathematics.

While full autonomy is a long way off, mathematicians like Terence Tao have noted that models could assist with certain aspects of the process — testing conjectures, generating examples, or exploring edge cases. But real contributions will depend on when models can demonstrate abstraction, creativity, and rigor — some of the qualities ARC AGI 2 is attempting to measure.


### The Future

For now, the ability to solve deep, abstract problems remains firmly human. But that won’t always be the case. The pace of progress on more reliable benchmarks — the kind that resist overfitting and reward generalization — will give us a much better sense of how close we are to that line.

If we want to understand what these systems can really do — and how quickly they’re improving — we should stop focusing on which model scored best on an exam, and start looking at how they handle problems they’ve never seen before.

We are at a critical juncture in AI history in which it still very much means something to be biologically rather than artificially intelligent; savor the moment.