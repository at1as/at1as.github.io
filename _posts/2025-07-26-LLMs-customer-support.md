---
layout: post
title: "Building an AI Customer Support Agent: A Practical Guide to Prompting, RAG, and Fine-Tuning"
date: 2025-07-26 11:00:00 -0400
categories: [ai, llm]
tags: [ai, llm, technical]
hidden: false
---

Companies are rushing to integrate AI into their customer support workflows, generating a lot of interest in the latest models. However, the power of the model is only truly unlocked if the if system architecture around it is right — how you deliver context, handle private knowledge, and adapt over time are all key factors in building a successful AI customer support system.

This post walks through four common approaches, from basic prompting to full fine-tuning, and explains when each one makes sense:

1. Basic prompting
2. Prompting with context (direct injection)
3. Prompting with Retrieval-Augmented Generation (RAG)
4. Fine-tuning a custom model

Throughout this post, we'll answer questions like:

- What does fine-tuning actually do to the model, and when do we really need it?
- Can a retrieval system (RAG) replace the need for fine-tuning?
- When does each method make sense in practice?

### Requirements

Let's start with the requirements. As a customer support bot, here's what we want it to do:

- Answer questions about our product (including billing, compliance, sales, etc.)
- Handle questions about our company (mission, values)
- Avoid hallucination — if it doesn’t know something, it should clearly say so
- Work across multiple languages
- Avoid leaking private or internal data
- Avoid speculating on future events
- Refuse to answer off-topic questions

These are fairly standard goals for a support assistant, but they highlight an important point: some of the required behavior comes from data, but a lot of it comes from guardrails and architecture, as we'll discuss in the next section.


### Fine Tuning vs. Context Injection

“Context injection” (also known as **prompt engineering** or **in-context learning**) means we provide additional information to the model at runtime – for example, by prepending relevant documents or examples to the prompt. **Fine-tuning** means we actually train the model on examples so it internalizes the information in its weights.

1. Include it in the prompt (**context injection**)
2. **Fine-tune** the model on it

Here's how they compare, at a high level:

<div class="premium-table">
<table>
  <thead>
    <tr>
      <th></th>
      <th>Prompting / Context Injection</th>
      <th>Fine-Tuning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition</strong></td>
      <td>Pass info to the model at runtime</td>
      <td>Train the model on examples</td>
    </tr>
    <tr>
      <td><strong>Cost</strong></td>
      <td>Low upfront, higher per-call</td>
      <td>High upfront, lower per-call</td>
    </tr>
    <tr>
      <td><strong>Latency</strong></td>
      <td>Slightly higher (large prompts)</td>
      <td>Lower (no extra context)</td>
    </tr>
    <tr>
      <td><strong>Flexibility</strong></td>
      <td class="highlight-cell">Very flexible (swap context anytime)</td>
      <td>Static — requires retraining</td>
    </tr>
    <tr>
      <td><strong>Use Cases</strong></td>
      <td>Dynamic docs, iteration, small corpora</td>
      <td>Stable tone/patterns, large datasets</td>
    </tr>
    <tr>
      <td><strong>Info Access</strong></td>
      <td>Needs to be passed every time</td>
      <td class="highlight-cell">Baked into the model weights</td>
    </tr>
    <tr>
      <td><strong>Token Limits</strong></td>
      <td>Limited by prompt size</td>
      <td class="highlight-cell">Not constrained after training</td>
    </tr>
  </tbody>
</table>
</div>

As you can see, whether to fine-tune or to rely on prompts depends on factors like how often your information changes, how many requests you serve, cost sensitivity, and how much control or flexibility you need. Let's walk through an example, with this in mind.


## Approach 1. Basic Prompting

In the simplest case, you can start by using a base model (like GPT-4o) with a carefully crafted prompt. We'll ask it questions on behalf of our users, at our example company, `B2C2D2E2F Inc`:

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant for B2C2D2E2F Inc. that answers customer support questions. Only respond with accurate info. If unsure, say so."},
    {"role": "user", "content": "How do I reset my password?"}
]

response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)
```

Since we haven't given the model any additional data, it will answer based on its built-in knowledge (which includes a lot of public internet text). If our company has a public help page about password resets, a capable LLM might have seen similar content during training and produce the right steps. However, there are no guarantees: the model might mix in irrelevant or outdated information. All information in this approach is treated equally; we have no way to emphasize what's specific to our company. If the LLM mistakenly recalls a competitor’s product docs, it could give the wrong instructions.


## Approach 2. Prompting with Context

The basic approach might work for very common questions, but it fails if the user asks about something specific to your company’s unpublished knowledge (e.g. “What’s your SLA on the enterprise plan?”), and can be confused by irrelevant information in the training data. One improvement is to inject relevant documentation directly into the prompt.

Say we have a support document about password resets. We can include that text in the system message so the model has the exact steps on hand:

```python
support_doc = """
How to Reset Your Password:
1. Go to the login page.
2. Click “Forgot Password?”
3. Enter your email.
4. Check your inbox for the reset link.
5. Set a new password.
"""

messages = [
    {"role": "system", "content": "You are a helpful assistant. Use the following documentation to answer questions:\n\n" + support_doc},
    {"role": "user", "content": "How do I reset my password?"}
]
```

Now the assistant’s prompt includes the exact steps for resetting a password, so it can answer with high accuracy. In essence, we gave the model open-book access to our support doc at runtime.

This approach is more reliable for questions covered in the provided context. The answer will be directly grounded in our documentation snippet. The downside is obvious: if we have many documents, we cannot stuff them all into the prompt every time. Prompts have size limits (even if some models support long prompts up to, say, 100k tokens, you pay in latency and cost for every token). Passing that support_doc text for each query can get expensive, and it doesn’t scale if the user asks about something else (billing, or company values) – we’d have to include those docs too, or the bot won’t know about them.

In a real system, we need an **efficient** way to select which documents are relevant to the user’s question and only provide those. This is where retrieval comes in.


## Approach 3. Retrieval-Augmented Generation (RAG)

Retrieval-Augmented Generation ("RAG") is a fancy term for a simple idea: rather than pre-loading all possible information, store your knowledge in a searchable index and fetch the relevant bits on the fly. The pattern looks like:

**User question → search knowledge base → get relevant text → stuff into prompt → get answer.**

Many developers implement RAG themselves using vector databases and embedding models (as we discussed in a previous post about embeddings). However, OpenAI’s platform now offers a managed way to do this via their **Assistants API** with a retrieval tool. Here’s how we could use it:

First, we upload our support document to OpenAI (this could be done once during a setup phase):
```python
import openai

uploaded_file = openai.files.create(
    file=open("password_reset_guide.txt", "rb"),
    purpose="assistants"
)
print("Uploaded file ID:", uploaded_file.id)
```

We specify `purpose="assistants"`, which tells the API we intend to use this file for retrieval-augmented answers. The response gives us a `file_id`. Next, we create an assistant that has retrieval abilities and link our file to it:

```python
assistant = openai.beta.assistants.create(
    name="Support Assistant",
    instructions=(
        "You are a helpful assistant for B2C2D2E2F Inc. "
        "Use the uploaded files to answer customer support questions. "
        "Only respond based on the files provided. If the answer is not found, say so."
    ),
    model="gpt-4o",
    tools=[{"type": "retrieval"}],
    file_ids=[uploaded_file.id]
)
print("Assistant ID:", assistant.id)
```
Here, we provided similar instructions as before, but importantly we’ve added `tools=[{"type": "retrieval"}]` and attached the file. This configures the assistant to use OpenAI’s retrieval system: when asked a question, it will automatically search within that uploaded file (and any others we add).

Now we can query our assistant. The workflow is a bit different with the Assistants API: we create a thread (conversation), send a user message, then run the assistant and get the answer:

```python
# Start a new conversation thread
thread = openai.beta.threads.create()

# Add a user message to the thread
openai.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="How do I reset my password?"
)

# Run the assistant on this thread (this will trigger retrieval + answer generation)
run = openai.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# Wait for the run to complete
import time
while True:
    status = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
    if status.status == "completed":
        break
    if status.status in {"failed", "cancelled", "expired"}:
        raise Exception(f"Assistant run {status.status}")
    time.sleep(1)

# Fetch the assistant's response message
messages = openai.beta.threads.messages.list(thread_id=thread.id)
answer = messages.data[-1].content[0].text.value  # last message, assistant's reply text
print("Assistant's answer:", answer)
```

Now we've created a persistent assistant with knowledge of our files. When the user asks “How do I reset my password?”, the assistant’s retrieval tool kicks in behind the scenes:

- It takes the **user’s query and embeds it into a vector** (using an OpenAI embedding model).
- It **searches through the vector index of the uploaded document** and finds the most relevant chunks (likely the section of the doc that contains the password reset steps).
- It then **injects those document chunks into the prompt** (as context) alongside the conversation, and the LLM (GPT-4o in this case) produces an answer referencing that context.

All of this is managed for you under the Assistants API; you don’t have to worry about calling a separate embedding model or setting up a vector database – OpenAI’s infrastructure handles it.

🔍 Under the hood: When we uploaded the file, OpenAI automatically:

- Split the file into smaller chunks (perhaps 200–500 tokens each, a typical range for RAG).
- Generated embeddings for each chunk using their text-embedding-3-small model (an efficient embedding model).
- Stored those embeddings in a private index tied to our assistant.

At query time, the user’s question is also embedded (very likely after being distilled into a shorter semantic representation to improve search). The system finds the top matching chunks and inserts them into the model’s context window. The model then sees a prompt that includes those snippets and the user question, and it crafts the answer.


## Approach 4: Fine-Tuning a Custom Model

Now for the more advanced route: **fine-tuning**. Instead of providing context at runtime, fine-tuning teaches the model how to respond by updating its internal weights using example conversations. Essentially, we show it many examples of our support Q&A style, and it learns to mimic that in general.

Why fine-tune when we have RAG? **Fine Tuning** does come with some major trade-offs:

- You need labeled training data — usually at least thousands of clean examples
- You will need to spend time validating the model after fine-tuning
- Retraining is required if policies or answers change, even slightly
- It can overfit or hallucinate if the data isn't well structured
- The upfront cost of fine-tuning can be high

However, it handles specific use cases very well:

- You want **extremely high consistency** in how answers are phrased or structured, beyond what you can easily enforce with a prompt (legal documentation, etc)
- Your support queries and answers follow a **stable pattern** that doesn’t change often (e.g. a scripted troubleshooting flow)
- **Low latency** is essential (ex. on-device agents)
- You want every answer to follow a **strict tone, format, or style** (e.g. legal, brand voice)
- You have a high volume of queries where every token matters for cost, and you want to **minimize prompt size**.

Let’s say we have a dataset of real support transcripts or a list of common questions and vetted answers. We can prepare that for fine-tuning. Each example needs to be formatted as a conversation. For instance, one training example might look like:

```python
{"messages": [
  {"role": "system", "content": "You are a helpful assistant."},
  {"role": "user", "content": "How do I reset my password?"},
  {"role": "assistant", "content": "Go to the login page and click 'Forgot Password?'."}
]}
```

We would have many such examples (covering billing questions, company info, etc.), each as a JSON line in a `.jsonl` file. Notice the format is essentially the same as the chat messages we’ve been using. Fine-tuning a chat model uses these role-based messages to incorporate both system instructions and multi-turn conversations.

The fine-tuning process with OpenAI’s API might look like this:

```python
# Step 1: Upload the prepared training data file
file_resp = openai.files.create(
    file=open("support_data.jsonl", "rb"),
    purpose="fine-tune"
)
training_file_id = file_resp.id

# Step 2: Create a fine-tuning job
fine_tune_job = openai.fine_tuning.jobs.create(
    training_file=training_file_id,
    model="gpt-4o-mini"
)
print("Fine-tune job ID:", fine_tune_job.id)

# Step 3: Wait for the job to complete (this could take minutes or hours)
import time
while True:
    job_status = openai.fine_tuning.jobs.retrieve(fine_tune_job.id)
    print(f"Status: {job_status.status}")
    if job_status.status == "succeeded":
        print("Fine-tuning complete. Model ID:", job_status.fine_tuned_model)
        break
    elif job_status.status in {"cancelled", "failed"}:
        raise Exception(f"Fine-tuning job {job_status.status}")
    time.sleep(10)
```

When the job finishes, it will output the ID of your new fine-tuned model, something like `ft:gpt-4o-mini-0613:org-xyz123:ft-abc9876543210`. You can now use this custom model just like any other model:

```python
response = openai_client.chat.completions.create(
    model="ft:gpt-4o-mini-0613:org-xyz123:ft-abc9876543210",
    messages=[
        {"role": "user", "content": "How do I reset my password?"}
    ]
)
```

Notice we no longer have to include the password reset document or even a system prompt – the fine-tuned model already knows it’s a B2C2D2E2F support assistant and has learned the password reset answer from the training data.

In practice, we may still want to include a system message to remind it of any policies (like “don’t reveal private info”), but the heavy lifting (the actual content of answers) is now coming from the model’s internal weights.

**Caution:** Once trained, a fine-tuned model is like a snapshot. It will not know about any changes after its training cutoff. If tomorrow you change the password reset procedure, the fine-tuned model will still be giving out the old steps until you retrain it. Similarly, it won’t know anything that wasn’t in the training data or the original base model’s knowledge. For example, if your fine-tuning data said “Reset links expire in 5 minutes” and later your policy changes that to 10 minutes, your fine-tuned model will confidently continue saying 5 minutes. This static knowledge issue is why fine-tuning alone is often not ideal for domains where information changes frequently.

The process of fine tuning is easy, but careful consideration needs to be paid to the initial data preparation and validation.


## Summary

Building an AI customer support agent is an iterative journey. We began with a straightforward prompt and gradually increased sophistication by adding context and retrieval, and finally considered fine-tuning.

The workflow we followed is a common one: **prompting → retrieval → selective fine-tuning**.

According to [Gartner](https://www.wsj.com/articles/from-rags-to-vectors-howbusinessesare-customizingai-models-beea4f11), the adoption split between RAG and fine-tuning is approximately 80% to 20%, respectively.

These techniques, however, are not mutually exclusive. In practice, many organizations combine them: starting with prompt engineering, layering in RAG to incorporate dynamic or proprietary knowledge, and selectively applying fine-tuning where tone, consistency, or structured output are critical (legal support, for instance).

Happy building!