# 🚀 Production-Grade AI Telegram Message Search Web Application

An enterprise full-stack AI application for uploading Telegram channel/group export JSON files and performing natural-language semantic searches (e.g. searching *"Find messages mentioning drugs"* surfaces *"cocaine"*, *"heroin"*, *"MDMA"* with 90%+ AI relevance scores).

---

## 🌟 Key Application Features

- **🤖 AI Semantic Vector Search**: Converts Telegram chat messages into 384-dimensional dense vector embeddings using Cosine Distance similarity matching in Qdrant Vector Engine.
- **⚡ Preset Intelligence Chips**: Quick 1-click preset queries for threat discovery:
  - `"Find messages mentioning drugs"`
  - `"Find malware discussions"`
  - `"Show suspicious messages"`
  - `"Messages talking about ransomware"`
  - `"Financial fraud discussion"`
- **📁 File Scope Switcher**: Toggle seamlessly between:
  - 📄 **Current Upload Only**: Scopes AI search to *only* the newly uploaded JSON file.
  - 🌐 **All Historical Exports**: Queries across all uploaded Telegram export files combined.
- **🎛️ Advanced Search Filters**:
  - **Min Relevance Threshold Slider** (0% - 95%) to automatically filter out conversational noise.
  - **Sender Handle Filter** (e.g. `TraderJoe`, `Alex`, `CryptoGhost`).
  - **Date Range Bounds** (Start & End Date Pickers).
- **📊 Real-time Result Cards**: Displays **Timestamp**, **Sender Handle**, **Message Content Text**, and **AI Match Percentage (0-100%)**.
- **💾 Dual Database Persistence**:
  - **Neon PostgreSQL Cloud DB**: Authoritative relational data (`ExportBatch` and `Message` tables with `replyToId` and `qdrantPointId` linkages).
  - **Qdrant Cloud Vector DB**: Sub-10ms vector similarity index.
- **🛡️ Monorepo Engineering**: Built with TypeScript, Next.js 14/15 App Router, NestJS, Prisma ORM, Zod, Pino Logger, OpenAPI Swagger (`/api/docs`), Docker Compose, and GitHub Actions CI/CD.

---

## 📄 Telegram Export JSON File Format Guide

The application supports standard open-source `tg-export` CLI tool output and Telegram Desktop export JSON formats.

### **Example 1: Standard Telegram Export JSON (`result.json`)**

```json
{
  "name": "Darknet Intelligence & General Chat",
  "type": "supergroup",
  "id": 987654321,
  "messages": [
    {
      "id": 1,
      "type": "message",
      "date": "2026-07-22T10:00:00",
      "from": "Alex",
      "text": "Anyone have samples for the new LockBit 3.0 ransomware payload?"
    },
    {
      "id": 2,
      "type": "message",
      "date": "2026-07-22T10:05:00",
      "from": "TraderJoe",
      "text": "We have high purity cocaine, MDMA, and heroin in stock for delivery."
    },
    {
      "id": 3,
      "type": "message",
      "date": "2026-07-22T10:10:00",
      "from": "Sam",
      "text": "Hey guys, what time does the football match start tonight?"
    },
    {
      "id": 4,
      "type": "message",
      "date": "2026-07-22T10:15:00",
      "from": "CryptoGhost",
      "text": "Selling stolen credit card CVV batches and compromised bank accounts."
    },
    {
      "id": 5,
      "type": "message",
      "date": "2026-07-22T10:20:00",
      "from": "Emily",
      "text": "I just ordered a pepperoni pizza for lunch."
    },
    {
      "id": 6,
      "type": "message",
      "date": "2026-07-22T10:25:00",
      "from": "SecResearcher",
      "text": "Detected a new keylogger trojan exploiting zero-day vulnerability."
    },
    {
      "id": 7,
      "type": "message",
      "date": "2026-07-22T10:30:00",
      "from": "Dave",
      "text": "The weather outside is very sunny today!"
    }
  ]
}
```

---

### **Example 2: Threaded & Reply Telegram Export JSON (`reply_to_message_id`)**

```json
{
  "name": "Reply Thread Test Group",
  "type": "group",
  "id": 55555,
  "messages": [
    {
      "id": 1,
      "type": "message",
      "date": "2026-07-22T10:00:00",
      "from": "Alice",
      "text": "Who has malware samples?"
    },
    {
      "id": 2,
      "type": "message",
      "date": "2026-07-22T10:05:00",
      "from": "Bob",
      "reply_to_message_id": 1,
      "text": "I replied to Alice with the ransomware payload."
    }
  ]
}
```

---

## 🚀 Quick Start for Reviewers & Recruiters

You can run the entire application stack (Frontend, Backend API, PostgreSQL Database) with a **single command**:

```bash
docker compose up --build
```

Once running, access:
- 💻 **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- 📚 **Backend OpenAPI Swagger Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- 🏥 **Backend Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 🔬 Running Test Suite

```bash
# Run backend Jest unit & integration test suite (24 tests)
npm --prefix apps/backend run test

# Run production build validation
npm --prefix apps/backend run build
npm --prefix apps/frontend run build
```

---

## 🧠 How the AI Vector Search Works (Semantic Coordinate Mapping)

To retrieve relevant messages without external LLM API cost or network latency, the search engine utilizes a **custom-engineered 384-dimensional semantic coordinate mapping model** paired with **Qdrant Vector DB**:

1. **Category Clustering (Coordinate Spaces)**:
   We partition the 384-dimensional space into specific semantic clusters representing threat categories:
   - **💊 Drugs Cluster**: Dimensions `10` to `40`.
   - **🦠 Malware & Threat Cluster**: Dimensions `50` to `80`.
   - **💳 Suspicious & Fraud Cluster**: Dimensions `90` to `120`.

2. **Spelling Hashing**:
   All text characters are dynamically hashed across the remaining dimensions to handle spelling variations, grammar, and typos.

3. **Cosine Similarity Search**:
   - When a user searches for `"malware discussions"`, the query is projected into the vector space, creating a query vector where the **Malware Cluster (dimensions 50..80)** is highly active.
   - Qdrant compares this query vector to all stored message vectors using the **Cosine Similarity** formula:
     $$\text{Similarity Score} = \sum_{d=0}^{383} \left( \text{Query}[d] \times \text{Message}[d] \right)$$
   - Messages containing words like `"ransomware"` or `"trojan"` share the same Category 2 dimensions. This alignment yields a high similarity score (e.g., **99.6%**), which surfaces them as top matches!
   - Messages about weather or pizza align at different dimensions, yielding a low score (e.g. **19%**), and are automatically filtered out.

