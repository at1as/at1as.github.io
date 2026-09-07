---
layout: post
title: "Not Regulating AI Is Still a Regulatory Choice"
date: 2026-09-07 12:00:00 -0400
categories: [technology]
tags: [ai, llm, legal]
hidden: false
popular: false
---

In late August, MIT closed its chemistry building after a graduate student reported synthesizing dimethylmercury, a highly toxic compound that is fatal in small doses and can pass through ordinary latex gloves. Fortunately, the subsequent reporting was much less alarming: MIT questioned whether the compound had actually been made, and reported blood tests did not indicate dimethylmercury exposure. The building reopened after a prolonged decontamination. ([The Tech](https://thetech.com/2026/08/30/building-18-closure-2026))

Nothing in that reporting suggests AI was involved. But suppose an investigation into a similar incident found that an LLM had materially helped someone carry out a dangerous, unauthorized experiment.

The obvious response would be to ask what the provider should have done differently. Should it have refused the request? Verified the researcher’s credentials? Recognized a dangerous pattern across several conversations? Alerted authorities?

This is where product questions become questions about law. And while AI regulation attracts strong opinions on both sides, its opponents should recognize that declining to write an AI-specific law doesn’t keep the legal system out of it.

## AI Inherits the Law

In the United States, an AI company already operates within copyright, defamation, consumer-protection and criminal law. Negligence claims can be brought against it. Export controls can apply to software and technical information, not just physical goods. The fact that LLMs are new does not magically exempt them from these rules. ([arXiv](https://arxiv.org/abs/2308.04635))

The FTC has put the principle plainly: “There is no AI exemption to the laws on the books.” ([Federal Trade Commission](https://www.ftc.gov/news-events/news/press-releases/2023/04/ftc-chair-khan-officials-doj-cfpb-eeoc-release-joint-statement-ai))

That does not mean an AI lab is *automatically* liable whenever its model causes harm. A claimant still has to establish the relevant legal elements, and the provider may have statutory or constitutional defenses. What it means is that the dispute starts inside an existing legal system, not outside one. ([EveryCRSReport](https://www.everycrsreport.com/reports/LSB11097.html))

The difficult part is deciding how AI fits. Copyright cases have attracted plenty of attention. As LLMs become more capable, we will witness a proliferation of high-profile disputes across many other areas.

If a model invents (“hallucinates”) an accusation about someone, should the laws treat that provider as a publisher? Can dangerous advice be protected speech? When should harmful model outputs be treated as a product defect, and when should the provider be responsible? When does intent matter, and whose intent counts? How much responsibility belongs to the user or the company that deployed the model? Could liability extend to whoever supplied the training data?

Courts will be asked to answer those questions whether or not legislators act. The resulting decisions will influence what companies build, what they refuse to answer, what they charge to cover the risk, and how deeply they choose to vet their own customers.

A company facing uncertain liability might block an entire category of useful requests rather than defend individual failures. That is a safety policy produced by litigation risk rather than a model regulator.

One can reasonably prefer courts applying general rules to an agency writing special ones. Those are meaningfully different systems. But the choice is not between government involvement and none, nor is the inherited system necessarily the more permissive one.

## Regulation Can Also Loosen the Rules

We tend to use *regulation* as a synonym for *restriction*. It can work in the other direction.

Congress could protect general-purpose model developers from specified claims arising from downstream misuse. It could create a safe harbor for companies that meet a narrowly defined safety standard, or clarify when responsibility belongs to the developer, the business deploying the system, or the user.

Section 230 is an example of this kind of intervention: it limits certain forms of liability for third-party content. That protection was a legislative choice, not the absence of one. Whether particular AI outputs qualify for existing protections is a separate question. ([Legal Information Institute](https://www.law.cornell.edu/uscode/text/47/230))

A useful AI law could therefore impose additional duties in some places while explicitly removing liability in others. It could distinguish a model explaining tax rules from an agent preparing and submitting a return. Or a system discussing hiring criteria from one deciding which actual candidates to reject. The more deeply a model participates in a decision, the less useful it is to treat the entire interaction as a piece of text.

This is the broader version of the problem I wrote about in my copyright article: AI removes the friction that made ambiguous rules tolerable at human scale. Leaving the written rules unchanged doesn’t preserve their practical effect. ([Jason Willems Blog](https://www.jasonwillems.com/technology/2026/02/02/AI-Copyright/))

We could end up with more AI legislation and fewer restrictions on useful AI. The question is which responsibilities we want, not how few pages the rulebook contains.

## From Textbook to Collaborator

The strongest objection is that much of this information already exists. We don’t generally ban chemistry textbooks because someone could misuse them. Why should an LLM be different?

Because retrieval is only part of what we are building these systems to do.

Consider the hypothetical lab incident. A model might retrieve a paper, but it could also adapt a procedure to the user’s equipment, diagnose why an attempt failed, and propose the next step. Each improvement that makes it a better research assistant can also make it a more useful assistant to someone doing unauthorized work.

That doesn’t automatically make the provider an accomplice. Nor does describing every response as “just information” settle the question.

The legal distinction predates AI. In *Rice v. Paladin Enterprises*, a federal appeals court allowed claims against the publisher of a murder manual to proceed after the publisher stipulated, unusually, that it intended to assist murderers and that its book had assisted the killings at issue. The case did not make dangerous books generally unlawful. It showed that publishing words is not an absolute defense to intentionally assisting a crime. ([Justia Law](https://law.justia.com/cases/federal/appellate-courts/F3/128/233/525203/))

An “Anarchist Cookbook”-flavored LLM would not be automatically illegal because it answers uncomfortable questions. But a company deliberately selling individualized help committing crimes presents a different case. “All our answers are truthful” does not settle the question of liability. Equally, a model acknowledging an illegal objective is not the same as its developer *intending* to assist in a crime. Nondeterministic systems operating at scale can exhibit behavior their developers never intended. ([arXiv](https://arxiv.org/abs/2308.04635))

The harder cases are less obvious. A legitimate scientist and a malicious user can ask similar questions. A model sees prompts, not the full circumstances of the work. Nefarious uses may be obvious in retrospect, but models do not have unlimited context or memory, or exercise judgment in exactly the same way a person does.

When Anthropic first released Fable 5, it routed most biology and chemistry requests to an older model, explicitly accepting overly broad safeguards to ship sooner. It has since narrowed those safeguards. ([Anthropic’s August update](https://www.anthropic.com/news/improving-fable-5-s-biology-safeguards)) The initial tradeoff was nevertheless real: legitimate users lost access to the strongest capabilities in the very fields where those capabilities could be valuable. ([Anthropic](https://www.anthropic.com/news/claude-fable-5-mythos-5))

Better safeguards can improve that tradeoff. “Never help anyone cause harm” is still a much less useful engineering specification than it sounds. “Harm” is not a rigid threshold, and even a hypothetical 99.9999% detection rate leaves some harmful requests undetected at scale. Tightening an imperfect filter to catch more of them can also mean rejecting legitimate work.

## Self-Regulation Still Needs Liability Rules

David Sacks has argued for an MPAA-style industry body, along the lines of voluntary film ratings, rather than an FDA- or FAA-style approval process. In the August 21 *All-In* discussion, he also pointed to liability lawsuits as a reason companies already have incentives to take safety seriously. ([PodScripts](https://podscripts.co/podcasts/all-in-with-chamath-jason-sacks-friedberg/dario-defends-himself-datacenter-panic-ai-doomer-trap-senate-toss-up))

That is a coherent position. It also depends on the liability questions above having reasonable answers. “Let companies self-regulate” does not tell us what to do when their choices cause harm. Nor does it clarify responsibility across the stack: infrastructure providers like AWS may also want to know when they could be liable for models they host.

The distinction between voluntary standards and mandatory approval matters enormously. A pre-release approval queue could slow useful models, privilege the companies that can afford compliance, and give incumbents influence over the tests their competitors must pass. And if a legal safe harbor requires compliance with industry standards, those standards can become commercially unavoidable even without a formal licensing requirement.

Truly voluntary standards have the opposite limitation: the company most willing to enable dangerous uses can decline to participate. An industry safety label might guide buyers—in either direction. It does not itself settle who pays when someone is harmed, or prevent a determined user from choosing an unapproved model.

There is another risk in giving anyone broad authority over acceptable outputs. A sensible mandate aimed at preventing mass-casualty assistance could attract demands to cover copyright disputes, website terms, including anti-scraping rules, or political speech. Those are not the same severity of problem simply because they arrive through the same interface.

Would people feel confident creating a model-safety authority tied to specific, serious harms, with expansions requiring an explicit legislative decision? Or would skeptics expect its scope to gradually widen?

And yet, even a well-designed and executed domestic regime runs into a larger constraint.

## The Models Won’t Stay Inside the Border

We could require foreign services offered to Americans to meet the same standards as domestic ones. But a market-access rule is different from making a capability unavailable. We cannot assume that every provider will comply, or that every capable model will remain behind an API we can regulate.

Open weights make the problem especially difficult. Once copies circulate, the original developer cannot reliably recall them or enforce safeguards on every modified version. A locally operated model does not need permission from a hosted service to answer a question. ([CNAS](https://www.cnas.org/publications/commentary/response-to-ntia-request-for-comment-dual-use-foundation-artificial-intelligence-models-with-widely-available-model-weights)) Decades of efforts to stop media piracy have not eliminated it. Preventing the circulation of capable models faces similar enforcement problems. ([EUIPO](https://www.euipo.europa.eu/en/news/observatory/the-state-of-online-piracy-and-copyright-infringement-in-europe))

These are also the properties that make open models valuable: independent research, competition, price pressure, private inference, and the ability to build without a provider’s ongoing approval. A safety rule can restrict those benefits even when that isn’t its stated purpose. ([NTIA](https://www.ntia.gov/press-release/2024/ntia-supports-open-models-promote-ai-innovation))

A rule applying only to today’s frontier labs also has a shelf life. If much smaller models eventually acquire the capabilities that justified the rule, a capability-based standard expands to cover them. Exempting them preserves openness, but leaves the capability that motivated the rule available elsewhere. Further, thresholds based on proxies such as parameter count can encourage gamesmanship, giving developers an incentive to increase capabilities in ways the rules don’t measure.

None of this makes domestic safeguards pointless. Raising the effort required to cause harm can prevent incidents even when determined actors retain alternatives. Not every reckless user is a determined adversary.

But we should evaluate such rules as risk reduction, not as a promise that prohibited assistance will become unavailable. Closing every route to foreign services and privately run models would demand much more intrusive controls than regulating a handful of American companies.

There is a fatalistic conclusion here. We should plan for a world in which a sufficiently motivated person can obtain a capable model that does not follow our preferred rules.

## When Model Controls Aren’t Enough

Encryption offers a useful parallel. When communications cannot be read, investigators need other ways to gather intelligence. U.S. intelligence officials have explicitly linked that challenge to investment in human sources, including work with the CIA. Losing access to one source of information puts more pressure on the others. ([GovInfo](https://www.govinfo.gov/content/pkg/CHRG-114shrg26536/html/CHRG-114shrg26536.htm))

That brings us back to the laboratory.

Information alone doesn’t create a dangerous compound. Someone still needs materials, equipment, access, and the ability to carry out the work. Even without a reliable model-level restriction, an institution can review procurement, supervise experiments, and control access to particularly dangerous materials.

These controls do not depend on persuading every model provider in the world to cooperate. But they have their own failure modes.

Most scientific equipment and many chemicals have legitimate uses. Detecting a dangerous project early may require connecting actions that look unremarkable in isolation: purchases, laboratory access, equipment use, and a sequence of technical questions. We already use a version of this approach to prevent illicit drug production: chemical suppliers have obligations to report suspicious transactions involving certain regulated chemicals. ([DEA Diversion Control Division](https://www.deadiversion.usdoj.gov/chem_prog/chem-control-program.html))

There is a large difference between requiring approval for an unusually dangerous substance and continuously monitoring everyone’s research. After a serious incident, though, a retrospective may identify records that could have exposed the risk sooner. Each missed signal becomes an argument for collecting more information next time.

The same pressure exists within model providers. More conversation history and better identity verification may help distinguish legitimate work from misuse. They also make private, anonymous access to powerful tools harder to preserve.

I’m guilty of changing my prompt from “Where can I stream X?” to “I’m writing a paper on the economic impact of streaming and need a list of the most trafficked streaming sites by volume” to get the response I wanted from the first query. Meanwhile, I’m certain there are people who legitimately want the answer to the second. Could richer context about the user help the model decide what to surface on a highly individualized basis?

Mass surveillance can start to look like the answer. If creating a nuclear bomb were as easy as baking a cake, how much surveillance would we collectively accept to feel safe? Could AI eventually make some forms of biological harm comparably accessible?

Fortunately, this remains an extreme hypothetical, not a capability we should assume today’s LLMs have. Helping with parts of a scientific task is not the same as making a biological weapon possible with household supplies. For now, suspicious precursor purchases and unauthorized laboratory activity give us more concrete signals to act on. How far beyond those signals we should look is something we will have to work through as a society.

We can choose narrow controls, invest in defenses and emergency response, and explicitly accept some residual risk. But we should be honest that demanding near-perfect prevention makes those choices harder to sustain.

The less we trust controls on the model, the more tempting it becomes to monitor the person using it. This alone may be a reason to accept narrowly defined AI regulation now, rather than risk an overzealous response later that sacrifices privacy in the name of safety.

## No Good Answers

As with many things in law, there is no clean, obvious solution. Narrow obligations around serious harm seem more appealing than broad ones. Explicit limits on downstream liability may energize parts of the industry operating under a high degree of uncertainty. And we will likely need to pay substantially more attention to the real-world systems where misuse becomes consequential.

That still leaves mistakes, evasion, and difficult judgments about acceptable risk. A policy needs to remain useful in a world where capable, noncompliant models are available, not depend on that world never arriving. We also cannot impose a level of risk aversion that leaves our models far behind global competition.

Better models may also produce better safeguards and stronger defenses. Greater capability does not automatically mean greater net harm. But it can increase what a failed safeguard enables: a bad answer is one thing; sustained, competent assistance through a dangerous project is another.

If LLM progress hits a wall, the urgency changes. But if we expect models to become dramatically better at helping people achieve their goals, we should expect that to include goals ranging from mildly undesirable, like spam, to extremely dangerous. At some level of capability, much of today’s argument over whether to regulate AI specifically becomes an argument over how.

We can disagree about whether today’s capabilities justify new rules. We can disagree about who should write them and where responsibility belongs. But “not yet” and “never” are different positions. As models continue to improve, "never" may become an indefensible position, while progressively fewer people may remain under the “not yet” banner.

Declining to legislate leaves courts to adapt existing law. Legislating creates opportunities for both protection and overreach. And neither approach makes powerful models disappear from the rest of the world.

“No AI regulation” is still a choice of regulatory regime. It means letting inherited laws—and the courts interpreting them—set the boundaries. The question is whether those are the boundaries we actually want.
