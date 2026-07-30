# Developer Learning Roadmap — Janadri Yalla Yashwanth

**Your situation:** you've built real production systems (CV pipelines, backends, a flight-log analyzer) with AI help, but the *fundamentals underneath* feel shaky. That's a strong position — you're not learning theory in a vacuum; you're learning the theory *behind things you've already built*. This plan turns "I made it work with AI" into "I understand exactly why it works."

**Assumed pace:** ~1.5–2 hrs/day, ~6 months. Compress by doing more/day; extend if busy. Consistency > intensity.

---

## PHASE 0 — The mindset shift (read this first, it's the whole game)

You don't have a knowledge problem, you have a *method* problem. Fix the method:

1. **Understand every line before you move on.** If AI (or a tutorial) gives you code, don't paste-and-run. Read it, and be able to explain *what each line does and why*.
2. **Type it yourself.** Never copy-paste code you're learning from. Typing forces attention.
3. **Rebuild from memory.** After you understand something with AI's help, **close the chat and rebuild it from scratch alone**. If you can't, you didn't learn it — go back.
4. **Explain it out loud** (Feynman technique). If you can't explain a concept simply, you don't understand it yet.
5. **Build small, from zero, without AI.** For each topic, build a tiny thing *by hand first*. Use AI only after you've struggled — and use it as a **tutor**, not an autocomplete (see "How to use AI" at the end).
6. **Struggle is the point.** The 20 minutes you spend stuck is where learning happens. Don't shortcut it.

> Rule of thumb: **AI writes, you learn** is a trap. **You write, AI teaches** is the goal.

---

## THE PLAN (subject-wise, topic-wise)

### PHASE 1 (Weeks 1–6) — Python mastery + DSA start + Git
*Foundation. This is interview-critical AND makes you a real dev.*

**A. Python (deep — go past what you use daily)**
- [ ] Data types, mutability, references vs copies
- [ ] Control flow, functions, `*args/**kwargs`, scope (LEGB)
- [ ] Comprehensions, generators & `yield`, iterators
- [ ] Decorators, context managers (`with`)
- [ ] OOP: classes, `__init__`, `self`, dunder methods, inheritance, `@property`
- [ ] Error handling, modules/packages, virtual envs
- [ ] File I/O, JSON, the standard library (collections, itertools, functools)
- **Resources:** CS50P (you have the cert — revisit deeply), official Python docs, *Automate the Boring Stuff* (free), *Fluent Python* (for depth later)

**B. Data Structures & Algorithms — START (the #1 interview skill)**
- [ ] Big-O / time & space complexity (analyze *why*, not memorize)
- [ ] Arrays & strings; two pointers; sliding window
- [ ] Hash maps & sets (your most-used tool in interviews)
- [ ] Stacks & queues
- [ ] Recursion (master this — it unlocks trees/graphs/DP)
- [ ] Sorting & searching (binary search deeply)
- **Practice:** LeetCode **Easy → Medium daily** (start 1/day). Follow **NeetCode 150** roadmap (order matters).
- **Resources:** NeetCode.io (roadmap + videos), *Grokking Algorithms* (best beginner book), Abdul Bari (YouTube for theory)

**C. Git & version control (real workflow)**
- [ ] init, add, commit, log, diff
- [ ] Branching, merging, **rebase**, resolving conflicts
- [ ] Remotes, push/pull, PRs, `.gitignore`
- **Resources:** *Pro Git* (free book, ch. 1–3), **Learn Git Branching** (interactive game)

**🎯 Phase 1 project (no AI):** rebuild a small piece of your Flight Log Analyzer — e.g., the log parser or one diagnostic check — from scratch, by hand. Push to GitHub with a README.

---

### PHASE 2 (Weeks 7–12) — Core CS fundamentals + DSA deepens
*This is what separates a coder from a computer scientist. Interviewers probe all of these.*

**A. DSA — the hard half**
- [ ] Linked lists (single/double)
- [ ] Trees, Binary Search Trees, tree traversals (DFS/BFS)
- [ ] Heaps / priority queues
- [ ] Graphs: representation, BFS, DFS, shortest path (Dijkstra basics)
- [ ] Dynamic Programming (start with 1D, then 2D) — the interview boss level
- [ ] Backtracking, greedy
- **Practice:** keep the daily LeetCode habit; aim ~150 problems total over Phases 1–2.

**B. OOP & Design**
- [ ] 4 pillars: encapsulation, abstraction, inheritance, polymorphism
- [ ] **SOLID principles** (know all 5 with examples)
- [ ] Common design patterns: Singleton, Factory, Strategy, Observer
- **Resources:** *Head First Design Patterns*, refactoring.guru (free)

**C. Databases (DBMS)**
- [ ] SQL deep: SELECT, JOINs (all types), GROUP BY, subqueries, **window functions**
- [ ] Normalization (1NF–3NF), keys, ER modeling
- [ ] Indexes (how they work, when to use), transactions & **ACID**, isolation levels
- [ ] SQL vs NoSQL (when to use which)
- **Practice:** SQLBolt, Mode SQL tutorial, LeetCode SQL problems
- **Resources:** *Use The Index, Luke* (free), Gate Smashers DBMS (YouTube)

**D. Operating Systems**
- [ ] Processes vs threads; context switching
- [ ] Concurrency: race conditions, **locks/mutexes/semaphores**, deadlocks
- [ ] Memory: virtual memory, paging, stack vs heap
- [ ] CPU scheduling basics
- **Resources:** *OS: Three Easy Pieces* (free, gold-standard), Neso Academy (YouTube)

**E. Computer Networks**
- [ ] OSI & TCP/IP models; TCP vs UDP
- [ ] IP, DNS, HTTP/HTTPS (methods, status codes, headers)
- [ ] Sockets, ports, how a request travels end-to-end
- **Resources:** *Computer Networking: A Top-Down Approach* (ch. 1–2), Beej's Guide

**🎯 Phase 2 project (no AI):** design a small relational schema (e.g., for your Survey Platform) and write 15 SQL queries against it by hand. Explain each index choice.

---

### PHASE 3 (Weeks 13–18) — Real backend & software engineering
*Now you understand the "why" behind the FastAPI apps you built.*

- [ ] **HTTP deeply:** methods, status codes, headers, cookies, sessions
- [ ] **REST API design:** resources, versioning, idempotency, pagination, error contracts
- [ ] **Auth:** how JWT actually works, OAuth basics, hashing passwords
- [ ] **Async:** the event loop, `async/await`, when it helps (you use it — now understand it)
- [ ] **SQLAlchemy / ORMs:** how they map to SQL, N+1 problem
- [ ] **Caching (Redis)** and **message queues (Celery)** — the *why*, not just the how
- [ ] **Testing:** pytest, unit vs integration, mocking, a bit of TDD
- [ ] **Clean code:** SOLID applied, DRY, refactoring, naming, code review
- [ ] **System design basics:** load balancing, caching layers, DB scaling, CAP theorem; design a URL shortener / rate limiter
- **Resources:** *The System Design Primer* (GitHub, free), ByteByteGo (YouTube), FastAPI docs (read fully), *Grokking the System Design Interview* (later)

**🎯 Phase 3 project (minimal AI — only as tutor):** build a small REST API from scratch (Python or a Spring Boot one for the Cisco track) with auth, a database, tests, and Docker. Understand every layer.

---

### PHASE 4 (Weeks 19–24) — Deepen your domain (ML / AI)
*You use PyTorch/YOLO/SAM — now learn what's happening under the hood.*

**A. Math for ML (just enough, applied)**
- [ ] Linear algebra: vectors, matrices, dot products (3Blue1Brown series)
- [ ] Probability & statistics: distributions, mean/variance, Bayes, hypothesis testing
- [ ] Calculus basics: derivatives, gradients (for backprop intuition)

**B. Classical ML**
- [ ] Supervised vs unsupervised; classification vs regression
- [ ] Linear/logistic regression, decision trees, random forests, SVM, kNN, k-means
- [ ] **Evaluation:** accuracy, precision/recall, F1, ROC-AUC, confusion matrix
- [ ] Bias/variance, overfitting, train/val/test, cross-validation, feature engineering
- **Resources:** **Andrew Ng — Machine Learning Specialization** (Coursera), **StatQuest** (YouTube — the best), *Hands-On ML* book

**C. Deep Learning**
- [ ] Neurons, layers, activation functions, forward pass
- [ ] **Backpropagation & gradient descent** (build a tiny NN from scratch in NumPy — this one exercise teaches you more than 10 tutorials)
- [ ] CNNs (you use them — understand convolution, pooling)
- [ ] PyTorch fundamentals: tensors, autograd, training loop by hand
- **Resources:** Andrew Ng Deep Learning Specialization, 3Blue1Brown "Neural Networks", Karpathy's "Neural Networks: Zero to Hero" (YouTube — outstanding)

**D. (Optional, for Qualcomm/GenAI track):** LLMs, embeddings, RAG, prompt engineering — build a small RAG app.

**🎯 Phase 4 project (no AI):** build a neural network from scratch in NumPy (no PyTorch) that classifies digits. When it works, you'll *truly* understand deep learning.

---

## Weekly routine (sustainable)
- **Daily (45–60 min):** 1 LeetCode problem + review yesterday's.
- **Daily (45–60 min):** current phase's subject (read + type code + notes).
- **Weekend (2–3 hr):** work on the phase project; write/refactor real code.
- **Every 2 weeks:** teach one concept to someone (or write a short blog/README) — cements it.

## Milestones (know you're on track)
- **End of Month 2:** comfortable solving LeetCode Easy, most Mediums with effort; can explain Big-O.
- **End of Month 4:** can whiteboard trees/graphs/DP; explain ACID, threads vs processes, TCP/IP, REST.
- **End of Month 6:** can design a small system, build a tested API from scratch, and explain backprop.

## How to use AI (me) the RIGHT way from now on
Stop: *"Build me X."*
Start:
- *"Explain how X works, step by step."*
- *"I wrote this — review it and tell me what's wrong and why."*
- *"Quiz me on OS concepts. Ask one question at a time."*
- *"Give me a problem to solve on this topic (don't give the answer)."*
- *"I think X works like this — is my understanding correct?"*

Use AI to **learn faster**, never to **skip the learning**. You already have the projects; now earn the knowledge behind them.
