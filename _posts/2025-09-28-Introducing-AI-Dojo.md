---
layout: post
title: "Leetcode for prompting: Introducing AI Dojo 🥋"
date: 2025-09-28 11:00:00 -0400
categories: [ai, llm]
tags: [ai, llm, technical, training]
hidden: false
---

As AI tools have become more widespread, and generally better, I’ve seen the rift between those who incorporate these tools into their development process and those who don’t, widen.

There are many overly optimistic proclamations of "**AI makes our developers 100x faster!**". This is clearly not true: engineers are not _yet_ delivering a year's worth of output in four days en masse. In large enterprises in particular, where a lot of time is dedicated to process and coordination rather than heads-down coding, the "100x" claim doesn't reflect the reality of the improvement in overall output.

That said, on many specific tasks, the speedup can feel at least that dramatic. And as tooling becomes more generalized and performant, the net effect on overall output will continue to diverge between those who use the tools well and those who don't.

Unfortunately, I regularly interact with many people for whom AI tooling offers a **net decrease in productivity**, often driving them over time to avoid using AI altogether.

The challenge ahead is that AI training inside organizations, especially at enterprise scale, is still minimal.

Employees who are already curious, self-directed, and resourceful are figuring these tools out quickly. But the employees who might benefit the most—the ones for whom AI could be a great equalizer—often struggle with self-directed learning and ambiguous feedback. Their idea of AI is to write a one-sentence prompt, get a 4,000-word ramble, and share it with the team. Or they ask the model to implement a feature without explaining any context, ending up with something entirely off-base (insecure, not fit to the product requirements, etc).

While I can't necessarily teach someone agency, I can help them practice some fundamentals of using AI tools well.

Because whether you’re highly motivated or not, LLMs really do offer something for everyone:

- The **ambitious** can use them to explore more ideas, experiment more, and prototype faster.
- The **struggling** can use them as a constant mentor, improving the baseline quality of their work.

What's often missing are very core skills of using an LLM effectively—skills like:

- Providing the **right context**
- Clarifying **who or what the work is for**
- Explaining **constraints** or what to avoid
- Refining output **iteratively**
- **Reverting** to a previous step when the output is not as expected
- being **persistent**
- learning about the models **capabilities and limitations** through practice

Doing these poorly causes errors and invalid assumptions to cascade throughout the conversation. The net output is often referred to as _AI Slop_.

Because of this, I've started asking myself: could I create a tool to test and improve exactly these skills?

Well, this weekend I decided to _try_ to build a space where people can deliberately practice these fundamentals in a structured way: **Enter AI Dojo.**


## What AI Dojo Is

[AI Dojo](https://github.com/at1as/AI-Dojo) is a lightweight open-source tool for practicing real-world prompting. It works like this:

* You pick a task—“fix this OpenAPI spec and confirm it validates,” “write a SQL query to calculate user spending,” etc.
* You work through the problem with an AI assistant.
* When you’re done, you mark the task complete.
* The system grades your conversation and your solution against a rubric.

The conversation itself is graded to provide feedback about your prompting and the completeness of the solution. Rather than complex problems, these are mostly simple tasks that practise conversing with an LLM across a range of topics and domains. We aim to turn something subjective into a more objective measure with specific feedback on the user's interactions with the LLM.

<figure>
  <img src="/assets/images/posts/2025-09-28-Introducing-AI-Dojo/task-list.png" alt="AI Dojo Task list" class="medium-img">
  <figcaption>
    List of tasks for the user to choose from
  </figcaption>
  </figure>


<figure>
  <img src="/assets/images/posts/2025-09-28-Introducing-AI-Dojo/task-llm-conversation.png" alt="AI Dojo Task: LLM pair debugging" class="medium-img">
  <figcaption>
    Problem solve alongside the LLM assistant
  </figcaption>
</figure>

### Features (current)

* ✅ **Graded conversations**: AI evaluates not just your final answer, but how you approached the task.
* ⚡ **Extensible tasks**: define new ones in YAML/JSON, no hardcoding.
* ✅ **Objective grading for structured tasks**: SQL queries run against a test database, OpenAPI specs checked for validity.

<figure>
  <img src="/assets/images/posts/2025-09-28-Introducing-AI-Dojo/openapi-spec-validation.png" alt="AI Dojo Task: OpenAPI Spec Validation" class="medium-img">
  <figcaption>
    Task: Repair the OpenAPI YAML spec
  </figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/2025-09-28-Introducing-AI-Dojo/SQL-query-compose.png" alt="AI Dojo Task: Compose SQL" class="medium-img">
  <figcaption>
    Task: Compose a SQL query to calculate user spending
  </figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/2025-09-28-Introducing-AI-Dojo/select-the-prompt.png" alt="AI Dojo Task: Select the better prompt" class="medium-img">
  <figcaption>
    Task: Select the better prompt for the given task
  </figcaption>
</figure>


### Features (coming soon)

* 🔜 **Code sandboxing**: Python tasks graded by execution results.
* 🔜 **Progress tracking & gamification**: streaks, badges, leaderboards
* 🔜 **Analytics**: identify where teams struggle most (e.g., SQL joins, vague prompts)

---

## Why This Matters

If AI is going to be integrated into every knowledge workflow, then AI literacy is going to matter as much as Excel literacy did a generation ago.

Right now, the gap between good and bad use is stark. And too many people are either discouraged after one bad experience, or convinced they’re "using AI" while mostly producing noise.

The only way to close that gap is practice—structured, measurable, and reflective.

That’s what we’re trying to build with AI Dojo.


## FAQ

#### Was this repo itself written by an LLM?

Yes, much of this repo was written by an LLM 🎉. In our house we [vibe code](https://founderwear.creator-spring.com/listing/new-vibe-coding?product=1565)


#### Do you have any tips for vibe coding?

I learn new things every day about LLM limitations, clever prompting, new tooling, etc. I am collecting [some of my thoughts here](https://www.jasonwillems.com/ai/llm/2025/08/01/Vibe-Coding/).


#### Are you using an LLM to grade _its own_ conversation with a user?

Yes. Though this may not be ideal, it works surprisingly well. The LLM is provided a grade (was the problem solved) along with the conversation chain. It has been able to pick up issues with the user prompts.

In a sense, this is no different than if you ask ChatGPT "Is this a good prompt for accomplishing XYZ?", refining it based on the feedback and then submit the final prompt to ChatGPT for execution.

#### Those questions in your screenshot could really use some work

Great! There's a YAML file where questions can be modified or added. Please let me know if you have any suggestions! Adding more complex questions, while still focusing on the fundamentals is planned.

Here's a sample to a question we viewed above - easy to modify right in the YAML tempalte
```yaml
- id: openapi-validate
  title: "OpenAPI: Spec validation"
  description: |
    You are provided with an OpenAPI spec written in YAML.
    Use the LLM to **determine if it is valid**, and if not determine what changes need to be made to make it valid.
    If any changes are made, determine the **best way to verify the spec is valid on your local system**
  files: ["specs/broken_openapi.yaml"]
  grading: "yaml"
  rubric: "Check if the user verified with openapi-cli and explained their process."
  tags: ["API", "YAML", "OpenAPI"]
  difficulty: "Medium"
  visible: true
```


## Availablity

AI Dojo is open source, MIT licensed, and [available now](https://github.com/at1as/AI-Dojo).