---
layout: post
title: "Teaching GPT to Use Tools: Function Calling with OpenAI"
date: 2025-07-28 11:00:00 -0400
categories: [ai, llm]
tags: [ai, llm, technical]
hidden: false
---

Most developers start their journey with language models by prompting them: "Explain this code", "Summarize this thread", "Write a SQL query". But eventually, you hit a wall. You want your model to do something dynamic — like call an API, look something up, or trigger a workflow. This is not data that you can provide in advance, because it is constantly changing, and yet LLMs are trained on a static dataset.

This is where **function calling** comes in. It's the bridge between natural language and real-world actions.

In this post, we'll show how to use OpenAI’s function calling API to teach GPT to act more like a tool-using assistant — complete with structured inputs, more deterministic behavior, and useful responses.



## What is Function Calling

Function calling lets the model choose to call a defined function in response to a user's input. You define the function signature (name, description, parameters). The model returns a response indicating whether it should call the function and with what arguments.

This enables:

- More deterministic behavior (dramatically reduced hallucinations)
- Seamless integration with external systems
- Early forms of tool-using AI agents

You can pass multiple functions. The model will choose the most appropriate one to call — or none — depending on the prompt. (You can also *require* a tool call if you want to enforce it.)


## Example

Let's define two tools: `get_weather` and `get_time`.

First, create JSON Schemas for your functions and pass them as **tools** to the Chat Completions API:

```python
from openai import OpenAI
import json

client = OpenAI()

tools = [
  {
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Get the current weather for a city.",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {"type": "string", "description": "City name"}
        },
        "required": ["location"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "get_time",
      "description": "Get the current time for a city.",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {"type": "string", "description": "City name"}
        },
        "required": ["location"]
      }
    }
  }
]
```

Next, we create a series of prompts, each with a different question:

```python
# Asking about the weather
response_weather = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role": "user", "content": "What's the weather in Paris?"}],
  tools=tools,           # <-- modern API: use tools (not `functions`)
  tool_choice="auto"     # let the model decide
)

# Asking about the time
response_time = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role": "user", "content": "What time is it in Tokyo?"}],
  tools=tools,
  tool_choice="auto"
)

# Asking about something unrelated
response_unrelated = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role": "user", "content": "What is the meaning of life?"}],
  tools=tools,
  tool_choice="auto"
)
```

When a tool call is returned, the message includes a tool_calls array (each with a function name and JSON-stringified arguments). When no tool is needed, you just get natural language:

```python
// For weather
{
  "tool_calls": [
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\"location\": \"Paris\"}"
      }
    }
  ]
}

// For time
{
  "tool_calls": [
    {
      "id": "call_def456",
      "type": "function",
      "function": {
        "name": "get_time",
        "arguments": "{\"location\": \"Tokyo\"}"
      }
    }
  ]
}

// For unrelated questions
{
  "role": "assistant",
  "content": "The meaning of life is a profound philosophical question with many interpretations..."
}
```

Note that the response indicates how **we** should call the function, not how the model should call it. The model will not execute the function for us; it will only suggest the function call.

Assuming we’ve implemented the functions:

```python
def get_weather(location):
    # TODO: Call external API to determine the actual weather
    return f"It's currently 18°C and partly cloudy in {location}."

def get_time(location):
    # TODO: Call external API to determine the actual time
    return f"The current time in {location} is 3:45 PM."
```

Parse and execute tool calls, then send the tool outputs back to the model to get a final, well-formed answer:

```python
messages = [{"role": "user", "content": "What's the weather in Paris?"}]
resp = response_weather
msg = resp.choices[0].message

if msg.tool_calls:
    tool_results = []
    for call in msg.tool_calls:
        fn_name = call.function.name
        args = json.loads(call.function.arguments)

        if fn_name == "get_weather":
            output = get_weather(args["location"])
        elif fn_name == "get_time":
            output = get_time(args["location"])
        else:
            continue

        # Attach tool output using the special 'tool' role + tool_call_id
        tool_results.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": output
        })

    followup = client.chat.completions.create(
        model="gpt-4o",
        messages=messages + [msg] + tool_results
    )
    print(followup.choices[0].message.content)
else:
    # No tool call needed; print GPT's direct answer
    print(msg.content)
```

Sending the response back to OpenAI ensures that the formatting will be text-based, consistent with the the prompts that do not trigger a function call.


## Flow Diagram

```
User prompt
   │
   ▼
OpenAI ChatCompletion API
   │
   ▼
+------------------------------------------+
| GPT evaluates prompt and available tools |
+------------------------------------------+
   │           │
   │           └──► If relevant tool found:
   │                    │
   │                    ▼
   │           GPT returns tool_calls JSON
   │                    │
   │                    ▼
   │         Your app parses the call + arguments
   │                    │
   │                    ▼
   │         You execute the real function (e.g. get_weather)
   │                    │
   │                    ▼
   │         You pass the result back as a 'function' role
   │                    │
   │                    ▼
   │         GPT generates final natural language response
   │
   ▼
Else:
   GPT replies directly without calling a tool
```

## Why Use Function Calling?

Function calling is a lightweight but powerful way to make GPT dynamic. You don’t have to manually parse intent or stuff volatile data into the prompt; the model decides if it needs a tool, and how to call it, based on the user’s request.

Using tools enables precise output behavior:

- Avoids hallucinated APIs or CLI commands (by constraining to your schemas)
- Easy to plug into your own backend or services
- Precise, debuggable, and inspectable traces

This is not a full agent framework (we'll cover that later), but it’s extremely effective for singular tasks like:

- Schedule meetings
- Fetch documents
- Search a database
- Answer questions with live data


## Going Further: Assistants API

OpenAI also offers an orchestration layer: the Assistants API — with persistent threads and built-in tools like Code Interpreter and File Search, plus function calling. For simple tool calls, Chat Completions is often simplest; for heavier, multi-turn workflows, Assistants can help.

> Note: OpenAI has been moving functionality toward the Responses API and an Agents SDK, and has stated that the Assistants API is on a deprecation path (targeting a sunset in the first half of 2026). It still works today, but for new builds consider Responses or Agents (which we'll cover in a future post).
ll
Below is an outline of function use with Assistants. (We reuse the schemas from above.)

```python
from openai import OpenAI
import json
client = OpenAI()

get_weather_schema = tools[0]["function"]
get_time_schema = tools[1]["function"]

# Step 1: Define your assistant with tools
assistant = client.beta.assistants.create(
    name="Tool-Using Assistant",
    model="gpt-4o",
    tools=[
        {"type": "function", "function": get_weather_schema},
        {"type": "function", "function": get_time_schema}
    ]
)

# Step 2: Start a thread and add a message
thread = client.beta.threads.create()
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="What time is it in Tokyo?"
)

# Step 3: Run the assistant
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# Step 4: If tools are required, execute and submit outputs
run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

if run.status == "requires_action":
    tool_outputs = []
    for tool_call in run.required_action.submit_tool_outputs.tool_calls:
        name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)

        if name == "get_weather":
            output = get_weather(args["location"])
        elif name == "get_time":
            output = get_time(args["location"])

        tool_outputs.append({"tool_call_id": tool_call.id, "output": output})

    client.beta.threads.runs.submit_tool_outputs(
        thread_id=thread.id,
        run_id=run.id,
        tool_outputs=tool_outputs
    )

# Step 5: Read the final response
messages = client.beta.threads.messages.list(thread_id=thread.id)
final_message = messages.data[-1]
if final_message.role == "assistant" and getattr(final_message, "content", None):
    print(final_message.content[0]["text"]["value"])
else:
    print("Assistant did not respond directly — check tool outputs.")
```

With Assistants, the core idea is the same — OpenAI returns tool calls, you execute them, and then you submit tool outputs for a final answer. The big difference is that threads are persistent and managed for you, which helps on longer, multi-turn tasks.


## When to Use the Assistants API for Function Calls

If you're building lightweight assistants or tool-invoking endpoints, Chat Completions is often simpler and more explicit. For heavier conversational logic, persistent threads, or advanced tools, the Assistants API is a solid option (keeping the deprecation timeline in mind).

| Use Case                                              | Use Assistants API? |
|-------------------------------------------------------|----------------------|
| Stateless API-style prompts                          | ❌ Not necessary     |
| You want full control of logic + flow                | ❌ Stick to chat API |
| You use many tools and want minimal glue code        | ✅ Yes               |
| You need long-term memory or multi-turn conversations| ✅ Yes               |
| You want access to Code Interpreter or file upload   | ✅ Yes               |


## What’s Next

In a future post, we’ll look at chaining multiple tools, integrating with search or databases, and error handling. This is where real, semi-autonomous assistants begin to emerge.

In the meantime, want to explore more? I've also written about:

- [RAG vs Fine-Tuning](/posts/2025-07-26-LLMs-customer-support)
- [Embedding + LLM workflows](/posts/2025-07-25-LLMs-and-Embeddings)
- [LLM Benchmarks](/posts/2025-07-18-LLM-Benchmarks)
