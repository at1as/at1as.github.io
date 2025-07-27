---
layout: post
title: "From Chaos to Clarity: How Embeddings and LLMs Unlock the Value of Unstructured Data"
date: 2025-07-26 11:00:00 -0400
categories: [ai, llm]
tags: [ai, llm, technical]
hidden: false
---

Every organization today is drowning in unstructured data: support messages, internal chats, user feedback, call transcripts. As our ability to collect more unstructured data within organizations grows, the need to understand that data in a scalable, cost-effective way is outpacing our ability to handle it.

The most commonly discussed method for making sense of unstructured data is to use LLMs. For many use cases, LLMs can outperform traditional techniques (such as multi-step NLP pipelines or rule-based systems). With proper prompting or fine-tuning, an LLM can even be tailored to the specific needs of an organization for better results.

Less discussed, but also important, are embeddings. Embeddings provide a powerful way to represent unstructured text as vectors, which can then be searched, clustered, or analyzed. By converting text into dense vectors, embeddings enable us to find patterns and insights that would be difficult or impossible to spot otherwise.

In this post, we'll explore how embeddings and LLMs complement each other for understanding unstructured data, with each playing to its strengths:

- **Vector embeddings:** turn text into numbers that reflect meaning and similarity.
- **Large language models (LLMs):** interpret, label, and summarize language with human-like fluency.

Each is powerful in its own way, but they solve different problems. Used together, they form a practical and scalable system for working with messy, unlabeled data.


## How They Work

- **Embeddings:** Each piece of text is converted into a numeric vector. Similar ideas result in nearby vectors. This makes embeddings ideal for semantic search, clustering, and pattern detection at scale.
- **LLMs:** Given a small chunk of text, an LLM (like GPT) can summarize, categorize, label, or explain it. However, LLMs are expensive, slow at scale, and limited by how much data they can "see" at once. They excel at tasks requiring rich context and understanding, but cannot efficiently analyze massive datasets in one go.

*Different tools for different tasks:*

<div class="premium-table">
<table>
  <thead>
    <tr>
      <th>Task</th>
      <th>Best Tool</th>
      <th>Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Search for semantically similar messages</td>
      <td><strong>Embeddings</strong></td>
      <td class="highlight-cell">Fast, flexible, works across entire corpus</td>
    </tr>
    <tr>
      <td>Group similar messages</td>
      <td><strong>Embeddings</strong></td>
      <td class="highlight-cell">Cluster by vector similarity</td>
    </tr>
    <tr>
      <td>Label a message as "user feedback" or "bug report"</td>
      <td><strong>LLM (Best), Embeddings (Possible)</strong></td>
      <td class="highlight-cell">Can infer subtle context</td>
    </tr>
    <tr>
      <td>Summarize what a group of messages is about</td>
      <td><strong>LLM</strong></td>
      <td class="highlight-cell">Turns examples into human-readable insight</td>
    </tr>
    <tr>
      <td>Visualize themes</td>
      <td><strong>Embeddings + LLM</strong></td>
      <td class="highlight-cell">Cluster first (via vectors), then explain</td>
    </tr>
  </tbody>
</table>
</div>


## Relative Strengths

The table below highlights the relative strengths of embeddings and LLMs:

<div class="premium-table">
<table>
  <thead>
    <tr>
      <th>Aspect</th>
      <th>Embeddings</th>
      <th>LLMs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Speed at scale</strong></td>
      <td><span class="check">✅</span> Extremely fast (especially with vector DBs)</td>
      <td><span class="x-mark">❌</span> Slow — must process one chunk at a time</td>
    </tr>
    <tr>
      <td><strong>Cost</strong></td>
      <td><span class="check">✅</span> Cheap once generated</td>
      <td><span class="x-mark">❌</span> Expensive to run repeatedly</td>
    </tr>
    <tr>
      <td><strong>Context awareness</strong></td>
      <td><span class="x-mark">❌</span> No true understanding (just patterns)</td>
      <td><span class="check">✅</span> Rich understanding of meaning</td>
    </tr>
    <tr>
      <td><strong>Reusability</strong></td>
      <td><span class="check">✅</span> Reusable for infinite queries</td>
      <td><span class="x-mark">❌</span> One-time output unless stored</td>
    </tr>
    <tr>
      <td><strong>Global analysis</strong></td>
      <td><span class="check">✅</span> Can structure entire dataset at once</td>
      <td><span class="x-mark">❌</span> Limited by context window</td>
    </tr>
    <tr>
      <td><strong>Human interpretability</strong></td>
      <td><span class="x-mark">❌</span> Opaque without clustering or inspection</td>
      <td><span class="check">✅</span> Fluent, explainable output</td>
    </tr>
  </tbody>
</table>
</div>


## Benchmarks

As an aside, you rarely see benchmarks that directly compare embedding models to LLMs. Their outputs are fundamentally different. An embedding model produces a fixed-length vector that can be compared quantitatively (e.g. computing cosine similarity between two inputs), whereas an LLM produces qualitative text (labels, summaries, explanations, etc.). Embeddings are typically used for similarity search, clustering, and pattern detection, while LLMs are used for classification, reasoning, and labeling. (Those labels can in turn be used for search or clustering, but the LLM's output format is very different.) This difference makes direct comparisons between the two approaches challenging.

With that said, it is generally accepted that LLMs tend to outperform embeddings on tasks requiring true "understanding" of content. In other words, if your task needs nuanced comprehension or reasoning, an LLM will usually do better than an embedding alone.


## Tagging Messages with LLMs

One common use of LLMs is to automatically tag or label messages. A typical prompt to have an LLM analyze a some text might look like this:

```text
Analyze the following text and return its sentiment score, sentiment category, tag, and language.

- Sentiment score: A number between -1 (very negative) and 1 (very positive). Neutral is 0.
- Sentiment category: Choose from the following list:
  ['negative', 'positive', 'neutral', 'mixed', 'ambiguous', 'hostile', 'optimistic', 'sarcastic', 'concerned', 'grateful', 'bored', 'excited', 'sympathetic', 'disappointed', 'humorous', 'encouraging', 'neutral-negative', 'neutral-positive', 'reassuring', 'critical'].
- Tag: Add a tag to the message based on its content, summarizing the message in a single word or phrase.
- Language: The language of the message (e.g., 'english', 'spanish', 'japanese'). If uncertain, return 'unknown'.

Respond only with the following YAML format without wrapping it in code block markers:
sentiment_score: <float>
sentiment_category: <string>
tag: <string>
language: <string>

Message: {message_text}
```

The above prompt asks the LLM to output a sentiment score, a sentiment category (from a predefined list), a tag (a single-word or brief summary), and the language of the message. The response is expected in a structured YAML-like format. By running each message through this prompt, we can generate tags, sentiment scores/categories, and language labels for every message. These structured labels can then be stored and later used to search, cluster, or analyze the data. (One thing to note: if you ever need to change what information is extracted or how it's formatted, you would have to re-run the LLM on all messages, since the output is not generated on the fly.)

For example, assuming the above prompt is saved as `SENTIMENT_PROMPT` and you have an openai_client for an LLM, you might call it like this in Python:

```python
from openai import AzureOpenAI

openai_client = AzureOpenAI()

response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are an assistant that analyzes text sentiment for classification."},
        {"role": "user",   "content": SENTIMENT_PROMPT.format(message_text=message_text)}
    ]
)
```

_(This example uses an Azure OpenAI client with an Azure Foundary hosted model, rather than OpenAI directly, however the semantics are the same)_


## Generating Vector Embeddings

Now, let's consider how we store and use vector embeddings for our messages. Below is a simplified example of a table schema for storing embeddings. We use PostgreSQL with a vector extension (in this case, `pgvector`) to store and query vector embeddings. At larger scales, one could migrate to a specialized vector database service (like Pinecone), but Postgres works for this demonstration (with some limitations, we'll discuss below).

In this design, each embedding model has its own column (since different models produce vectors of different dimensions). We can always add more columns as we incorporate additional models. For example:

```sql
CREATE TABLE IF NOT EXISTS conversation_session_message_embeddings (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    conversation_session_message_id BIGINT NOT NULL REFERENCES conversation_session_message(id),
    company_id BIGINT NOT NULL REFERENCES company(id),
    openai_text_embedding_3_large VECTOR(3072),
    date_created TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_message_id
  ON conversation_session_message_embeddings(conversation_session_message_id);

CREATE INDEX IF NOT EXISTS idx_embedding_company_id
  ON conversation_session_message_embeddings(company_id);
```

In the above schema, we have a table linking each message (`conversation_session_message_id`) to an embedding vector (`openai_text_embedding_3_large`). We also track a company_id (to use for filtering) and timestamps. We created indexes on the message ID and company ID for fast lookups. (Note that we did **not** index the vector column itself here, because of a limitation: the Postgres vector extension doesn't support indexing vectors with more than 2,000 dimensions. There [are workarounds](https://github.com/pgvector/pgvector/issues/442#issuecomment-2344048390), but for this demo we skip indexing the vector and instead rely on filter by company_id to narrow down search space enough for our use-case).

To generate and store embeddings for new text entries, you would call the embedding API and then insert the resulting vector into this table. For example:

```python
from openai import AzureOpenAI

openai_client = AzureOpenAI()

response = openai_client.embeddings.create(
    model=MODEL_NAME,
    input=[text]
)
embedding_vector = response.data[0].embedding
# ... insert embedding_vector into the database ...
```

## Testing Vector Embeddings

One nice property of embeddings is that they're deterministic: the model does not use randomness (there's no concept of "temperature" like with text generation). If you pass the exact same text to the same embedding model, you will get the exact same vector every time. (By contrast, an LLM might produce different outputs for the same input if a random sampling temperature is used.)

This determinism means we can test our embeddings easily. For example, we can verify that the cosine distance between an embedding we stored in the database and a newly generated embedding for the same text is essentially 0.0 (indicating a perfect match). Below is a Python script that demonstrates this verification process:

```python
import ast
import os
import psycopg2
import numpy as np
from openai import AzureOpenAI

# --- Configuration ---
DB_PARAMS = {
    'dbname':   os.getenv('DB_NAME'),
    'user':     os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host':     os.getenv('DB_HOST'),
    'port':     os.getenv('DB_PORT', '5432'),
    'sslmode':  os.getenv('DB_SSLMODE', 'require')
}

MODEL_NAME = "text-embedding-3-large"
TARGET_MSG_ID = 17

os.environ["AZURE_OPENAI_API_KEY"] = os.getenv("OPENAI_API_EMBEDDING_KEY")
os.environ["OPENAI_API_VERSION"] = "2024-02-01"

client = AzureOpenAI()

# --- Step 1: Retrieve the original message text from the DB ---
def get_message_content(conn, message_id):
    with conn.cursor() as cur:
        cur.execute("SELECT content FROM conversation_session_message WHERE id = %s;", (message_id,))
        row = cur.fetchone()
        return row[0] if row else None

# --- Step 2: Generate a fresh embedding from the text ---
def get_embedding(text):
    response = client.embeddings.create(model=MODEL_NAME, input=[text])
    return response.data[0].embedding

# --- Step 3: Find top matching messages via cosine distance ---
def search_similar(conn, query_embedding, limit=5):
    # Convert the embedding (a list of floats) to the Postgres vector literal format
    query_str = str(query_embedding)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT conversation_session_message_id,
                   openai_text_embedding_3_large <=> %s::vector AS cosine_distance
            FROM conversation_session_message_embeddings
            ORDER BY cosine_distance ASC
            LIMIT %s;
        """, (query_str, limit))
        return cur.fetchall()

# --- Step 4: Retrieve the stored embedding from the DB for comparison ---
def get_stored_embedding(conn, message_id):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT openai_text_embedding_3_large
            FROM conversation_session_message_embeddings
            WHERE conversation_session_message_id = %s;
        """, (message_id,))
        row = cur.fetchone()
        return row[0] if row else None

# --- Utility: Compare two embeddings (stored vs generated) ---
def compare_embeddings(stored, generated):
    stored_np = np.array(stored, dtype=np.float32)
    generated_np = np.array(generated, dtype=np.float32)
    dot = np.dot(stored_np, generated_np)
    norm_prod = np.linalg.norm(stored_np) * np.linalg.norm(generated_np)
    cosine_similarity = dot / norm_prod if norm_prod != 0 else 0.0
    cosine_distance = 1 - cosine_similarity
    max_diff = np.max(np.abs(stored_np - generated_np))
    avg_diff = np.mean(np.abs(stored_np - generated_np))
    return {
        "cosine_distance": cosine_distance,
        "cosine_similarity": cosine_similarity,
        "max_diff": max_diff,
        "avg_diff": avg_diff
    }

# --- Main test procedure ---
if __name__ == "__main__":
    with psycopg2.connect(**DB_PARAMS) as conn:
        print(f"\n🔍 Verifying embedding for message ID {TARGET_MSG_ID}...\n")

        # Step 1: Get the original message text
        text = get_message_content(conn, TARGET_MSG_ID)
        if not text:
            print(f"❌ No message found with ID {TARGET_MSG_ID}")
            exit(1)
        print(f"Message content: {text}\n")

        # Step 2: Generate embedding for the text
        regenerated_embedding = get_embedding(text)
        print("✅ Embedding generated.")

        # Step 3: Find the top 5 closest matches in the database
        print("\nTop 5 cosine matches in DB:")
        results = search_similar(conn, regenerated_embedding)
        for row in results:
            print(f" - ID {row[0]} → distance = {row[1]:.6f}")

        # Step 4: Retrieve the stored embedding for the target message
        stored_embedding_raw = get_stored_embedding(conn, TARGET_MSG_ID)
        stored_embedding = ast.literal_eval(stored_embedding_raw)  # convert text to list
        if not stored_embedding:
            print(f"\n❌ No stored embedding found for message ID {TARGET_MSG_ID}")
            exit(1)
        print("\n✅ Retrieved stored embedding from DB.")

        # Step 5: Compare the stored embedding to the newly generated embedding
        comparison = compare_embeddings(stored_embedding, regenerated_embedding)
        print("\n🔬 Comparison:")
        print(f"Cosine distance:    {comparison['cosine_distance']:.8f}")
        print(f"Cosine similarity:  {comparison['cosine_similarity']:.8f}")
        print(f"Max per-dim diff:   {comparison['max_diff']:.10f}")
        print(f"Avg per-dim diff:   {comparison['avg_diff']:.10f}")

        if comparison['cosine_distance'] < 1e-4:
            print("\n✅ Embeddings match perfectly.")
        else:
            print("\n⚠️ Embeddings differ — likely due to precision or normalization drift.")
```

When we run this test, we can see the expected result: the regenerated embedding for a message matches the stored embedding, and the nearest-neighbor search returns the message itself (and any identical messages) with a cosine distance of essentially 0:

```
🔍 Verifying embedding for message ID 17...

Message content: hello!

✅ Embedding generated.

Top 5 cosine matches in DB:
 - ID 13 → distance = 0.000000
 - ID 17 → distance = 0.000000
 - ID 18 → distance = 0.326789
 - ID 19 → distance = 0.437626
 - ID 10 → distance = 0.495133

✅ Retrieved stored embedding from DB.

🔬 Comparison:
Cosine distance:    -0.00000012
Cosine similarity:  1.00000012
Max per-dim diff:   0.0000000000
Avg per-dim diff:   0.0000000000

✅ Embeddings match perfectly.
```
*(Note that the negative cosine distance shown is effectively zero, just a floating-point quirk in Python.)*


## Hybrid Approaches

Empowered with both embeddings and LLMs, we can combine their strengths to analyze large datasets more effectively.

As discussed, the fundamental issue with using an LLM alone is its limited context window — an LLM can only "see" a certain amount of text at once. This makes it infeasible for an LLM to directly analyze millions of data points holistically.

Common approaches to get around this include:

- **One LLM call per record:** e.g. generate a summary or tags for each record individually.
- **Fine-tune or prompt the LLM with context:** e.g. train the LLM on the dataset's domain, or feed it small batches of records so it can incorporate some broader context.
- **Batch processing:** e.g. group records into batches and have the LLM produce an output for each batch of data.

Each of these approaches has limitations. They require some upfront understanding of the data (to decide how to prompt or fine-tune) and they effectively “lock in” a particular output format. If you later need a different analysis or new insights, you might have to re-run the LLM on all your data in a different way.

A more scalable strategy is to use embeddings and LLMs together. For example, you can use embeddings to cluster or organize the records first, and then use LLMs to interpret or label those clusters. Consider this scenario: we want to understand themes in a dataset that spans billions of records. Using embeddings, we can cluster similar records together across the whole dataset. What we get is structure, but not meaning — the clusters tell us which items are related, but not why (or how closely items relate to a provided phrase, but not directly what phrases represent the item).

That's where LLMs come in. We can take a representative sample from each cluster (say a few example records, or perhaps the record closest to the cluster's centroid, along with counter examples from other clusters) and feed that to an LLM. The LLM can then produce a description or label for the cluster. In this way, embeddings handle the heavy lifting of organizing the data at scale, and the LLM provides the human-readable insight about each group.

The beauty of this hybrid approach is that the embeddings are reusable. They form a persistent “map” of your data that you can query over and over as your needs evolve, without retraining or regenerating anything. The LLM can be used on-demand to annotate or explain parts of that map.

If tomorrow you have a new question, you can use the stored embeddings to quickly filter or find relevant records, then apply the LLM to just that subset for deeper analysis.


## 💡 Final Thoughts

In short, embeddings are a reusable structure — a persistent vector map of your data. LLMs, meanwhile, act like on-demand analysts — they can label or describe regions of that map in human terms.

To get the best of both worlds:

1. Use embeddings to navigate your unstructured data (fast similarity search, clustering, organization).
2. Use LLMs to understand the content (generate labels, summaries, or explanations in natural language).
3. Use both together to scale your insight pipeline from chaos to clarity.

Happy hacking!
