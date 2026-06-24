// Long-form, SEO-focused articles for the Musk-IT blog.
// Each article powers /blog and /blog/[slug], plus Article + FAQ structured data.
//
// Body block types supported by the renderer (app/blog/[slug]/page.js):
//   { type: "paragraph", content }   content = string | array of (string | { href, text })
//   { type: "heading", text }        -> <h2>
//   { type: "subheading", text }     -> <h3>
//   { type: "list", items: [] }      items = string | array of (string | { href, text })
//   { type: "quote", text }          -> styled callout

export const blogArticles = [
  {
    slug: "custom-erp-software-guide",
    eyebrow: "ERP Strategy",
    title: "Custom ERP Software: A Practical Guide for Growing Businesses",
    description:
      "When spreadsheets and disconnected tools stop scaling, custom ERP software unifies your operations. A practical guide to scope, cost, and getting ERP right.",
    keywords: [
      "custom ERP software",
      "ERP development",
      "custom ERP system",
      "ERP for business",
      "ERP vs off-the-shelf",
    ],
    datePublished: "2026-05-12",
    dateModified: "2026-06-20",
    readingTime: "9 min read",
    heroTitle: "Custom ERP software,",
    heroHighlight: "explained without the jargon",
    cardText:
      "When spreadsheets and disconnected tools stop scaling, custom ERP unifies inventory, orders, finance, and production into one source of truth. Here is how to scope it.",
    cardBullets: [
      "The signs you have outgrown spreadsheets and point tools",
      "What a custom ERP actually includes — module by module",
      "How to scope, budget, and roll out without disrupting operations",
    ],
    intro:
      "Most businesses do not decide to build an ERP — they arrive at it. One spreadsheet becomes twelve. A tool for inventory does not talk to the tool for invoicing. Someone re-keys the same order into three systems a day. At some point the cost of all that glue work, and the errors it hides, becomes larger than the cost of fixing it properly. This guide explains what custom ERP software is, when it makes sense, and how to approach it without betting the business on a risky 18-month project.",
    body: [
      { type: "heading", text: "What ERP actually means" },
      {
        type: "paragraph",
        content:
          "ERP stands for Enterprise Resource Planning, but the acronym hides a simple idea: a single system that records what your business has, what it owes, what it is owed, and what it is doing right now. Instead of inventory living in one place, orders in another, and finance in a third, an ERP keeps them in one connected database so that an action in one area updates everything that depends on it. When a sales order is confirmed, stock is reserved, a picking task is created, and the revenue is recognised — all from one event, with no re-typing.",
      },
      {
        type: "paragraph",
        content:
          "Off-the-shelf ERP platforms exist and work well for businesses whose processes match the software's assumptions. The trouble is that the businesses most in need of an ERP are usually the ones whose processes do not match — they have a particular way of quoting, a non-standard approval chain, or an industry quirk the generic product cannot bend around. That is where custom ERP software earns its place.",
      },
      { type: "heading", text: "Signs you have outgrown spreadsheets and point tools" },
      {
        type: "paragraph",
        content:
          "You rarely need a formal analysis to know you have a problem. The symptoms are felt daily by the people doing the work:",
      },
      {
        type: "list",
        items: [
          "The same data is entered into more than one system, by hand, every day.",
          "Month-end reporting takes days because numbers have to be reconciled across tools.",
          "Nobody can answer \"what is our real-time stock / margin / pipeline\" without exporting and merging files.",
          "A handful of fragile spreadsheets are so critical that one person leaving would be a genuine risk.",
          "Customers or auditors ask for a history of a transaction that no single system can produce.",
        ],
      },
      {
        type: "paragraph",
        content: [
          "If three or more of these are true, the issue is no longer productivity — it is risk and trust in your own numbers. That is the moment ",
          { href: "/services/erp", text: "custom ERP development" },
          " moves from a nice-to-have to a sound investment.",
        ],
      },
      { type: "heading", text: "What a custom ERP actually includes" },
      {
        type: "paragraph",
        content:
          "A custom ERP is built from modules, and the right scope is the smallest set that removes your biggest sources of friction. You do not need every module on day one. The common building blocks are:",
      },
      {
        type: "list",
        items: [
          "Inventory and stock control — real-time quantities, locations, batches, and reorder points.",
          "Sales and order management — quotes, orders, fulfilment status, and customer history.",
          "Procurement and purchasing — supplier records, purchase orders, and goods receipts.",
          "Production or service delivery — bills of materials, job tracking, or project workflows.",
          "Finance — invoicing, payments, tax handling, and the ledger that ties it all together.",
          "Dashboards and reporting — the live view of the business that justified the project in the first place.",
        ],
      },
      {
        type: "paragraph",
        content: [
          "The advantage of a tailored build is that each module reflects how you actually operate. If your approvals depend on order value and customer tier, the system enforces exactly that. If you need a custom CRM pipeline feeding the same database, it is one system, not an integration. We cover that side in ",
          { href: "/services/crm", text: "custom CRM development" },
          " and ",
          { href: "/services/workflow-automation", text: "workflow automation" },
          ".",
        ],
      },
      { type: "heading", text: "Custom vs off-the-shelf: an honest comparison" },
      {
        type: "paragraph",
        content:
          "Custom is not automatically better. Off-the-shelf ERP wins when your processes are standard, you need to be live in weeks, and you are willing to adapt your operations to the software. It loses when the product forces workarounds that recreate the very spreadsheet chaos you were trying to escape, or when per-seat licensing costs climb faster than the value delivered.",
      },
      {
        type: "paragraph",
        content:
          "Custom ERP wins when your competitive edge lives in a process the generic product cannot model, when you need to own the data and the roadmap, and when integration with your other systems is a first-class requirement rather than an afterthought. The honest test is simple: list the five things your business does differently from a textbook competitor. If a packaged product can handle all five cleanly, buy it. If it cannot, a tailored build will pay for itself.",
      },
      {
        type: "quote",
        text: "The goal of an ERP is not more software. It is one trustworthy version of the truth that every team can act on without re-checking it.",
      },
      { type: "heading", text: "How to scope and budget without the horror stories" },
      {
        type: "paragraph",
        content:
          "ERP projects earn their bad reputation when they are scoped as a single, all-or-nothing delivery. The way to avoid that is to sequence the work around business pain, not around the software's module list. Start with the one process whose failure costs you the most — often inventory accuracy or order-to-cash — and deliver a working slice of the ERP that fixes it end to end. Then expand.",
      },
      {
        type: "list",
        items: [
          "Phase 1: model your core data (products, customers, suppliers) and digitise the single most painful workflow.",
          "Phase 2: connect the adjacent process so one event updates both — for example, orders driving stock and invoicing.",
          "Phase 3: add reporting and dashboards on the now-trustworthy data.",
          "Phase 4: automate the manual steps that remain, and integrate external tools.",
        ],
      },
      {
        type: "paragraph",
        content: [
          "Budget follows scope. A focused first phase is far cheaper and lower-risk than a big-bang rollout, and it starts returning value while later phases are still being built. If you want an indicative figure for your situation, our ",
          { href: "/estimate", text: "cost estimator" },
          " gives a ballpark in a couple of minutes, and a ",
          { href: "/consultation", text: "free consultation" },
          " will pressure-test the plan.",
        ],
      },
      { type: "heading", text: "Common ERP mistakes to avoid" },
      {
        type: "paragraph",
        content:
          "Most ERP disappointments trace back to a handful of avoidable mistakes, and knowing them in advance is half the battle. The first is automating a broken process instead of fixing it: if your approval flow is convoluted on paper, encoding it in software just makes the mess faster and harder to change. Map and simplify the process first, then build it.",
      },
      {
        type: "paragraph",
        content:
          "The second is migrating dirty data. Years of duplicate customers, inconsistent product codes, and half-finished records will undermine trust in the new system within days of launch. Cleaning data is unglamorous, but it is the foundation everything else stands on. The third is treating training as an afterthought — a system people do not understand will be quietly worked around, and you will end up with the new ERP and the old spreadsheets running side by side forever.",
      },
      {
        type: "list",
        items: [
          "Skipping the cleanup — migrate clean, current data, not your entire history of mess.",
          "Over-customising day one — encode the process you have agreed, not every exception anyone can imagine.",
          "No clear owner — ERP needs an internal champion who can make decisions and unblock the team.",
          "Big-bang go-live — switch over in phases with a parallel-run safety net, not all at once.",
        ],
      },
      { type: "heading", text: "How to choose an ERP delivery partner" },
      {
        type: "paragraph",
        content:
          "The partner you build with matters as much as the technology. The right one starts by understanding your operations rather than leading with a feature list, sequences the work so you see value early, and is transparent about what happens after launch. Ask any prospective partner how they handle data migration, how they train your team, and what ongoing support looks like — vague answers there are a warning sign, because those are exactly the phases where weak partners disappear.",
      },
      {
        type: "paragraph",
        content: [
          "Look, too, for a partner who treats the system as a living platform rather than a one-off delivery. Your business will change, and the ERP should change with it — new modules, new integrations, new reports. That is the philosophy behind how we approach ",
          { href: "/services/erp", text: "ERP development" },
          " and ",
          { href: "/services/managed-it-support", text: "ongoing support" },
          ": deliver a focused, working system, then grow it alongside the business it serves.",
        ],
      },
      { type: "heading", text: "Rolling out without disrupting operations" },
      {
        type: "paragraph",
        content:
          "The riskiest day of any ERP project is go-live. Reduce that risk by running the new system in parallel with the old process for a short, defined period, migrating clean data rather than years of accumulated mess, and training the people who will use it daily before — not after — switch-over. A good delivery partner treats data migration and user training as core work, not as a line item to compress when the timeline slips.",
      },
      {
        type: "paragraph",
        content:
          "It also helps to define what success looks like in numbers before you begin: stock accuracy above a target threshold, month-end close in hours instead of days, or order errors cut by a set percentage. With a baseline recorded, you can prove the ERP delivered rather than relying on a general sense that things feel better. Those numbers are also what justify funding the next phase.",
      },
      {
        type: "paragraph",
        content:
          "Done this way, ERP stops being a frightening mega-project and becomes a series of manageable improvements, each one paying for the next. The destination is the same trustworthy, single source of truth — you just arrive without betting the company to get there.",
      },
    ],
    faqs: [
      {
        q: "How long does it take to build a custom ERP?",
        a: "A focused first phase that fixes one core process typically takes a few weeks to a few months, not a year. Sequencing the work by business pain means you get value early instead of waiting for a single big-bang launch.",
      },
      {
        q: "Is custom ERP more expensive than off-the-shelf?",
        a: "It can be higher upfront, but packaged ERP often costs more over time through per-seat licensing and the workarounds needed when your processes do not match the product. A phased custom build spreads cost and returns value at each stage.",
      },
      {
        q: "Can a custom ERP integrate with our existing tools?",
        a: "Yes. Integration is a first-class requirement in a custom build — payments, email, e-commerce, logistics, and accounting tools can be connected with APIs and webhooks so data flows automatically instead of being re-keyed.",
      },
    ],
    related: [
      { label: "Custom ERP development", href: "/services/erp" },
      { label: "Workflow automation", href: "/services/workflow-automation" },
      { label: "Cost estimator", href: "/estimate" },
    ],
  },
  {
    slug: "business-workflow-automation-where-to-start",
    eyebrow: "Automation",
    title: "Business Workflow Automation: Where to Start and What to Automate First",
    description:
      "Workflow automation pays off fastest when you pick the right process first. A practical framework for choosing, scoping, and measuring business process automation.",
    keywords: [
      "workflow automation",
      "business process automation",
      "automate business processes",
      "process automation",
      "operational efficiency",
    ],
    datePublished: "2026-05-28",
    dateModified: "2026-06-22",
    readingTime: "8 min read",
    heroTitle: "Workflow automation:",
    heroHighlight: "start where it actually hurts",
    cardText:
      "Automation pays off fastest when you pick the right process first. A practical framework for choosing what to automate, scoping it, and measuring the return.",
    cardBullets: [
      "How to spot the processes worth automating first",
      "A simple scoring method to prioritise candidates",
      "What good automation looks like — and how to measure it",
    ],
    intro:
      "Automation has a marketing problem: it is sold as magic, then delivered as a brittle script that breaks the first time something unexpected happens. The businesses that get real value from workflow automation are not the ones with the fanciest tools — they are the ones that picked the right process to automate first and measured whether it actually helped. This article is a practical framework for doing exactly that.",
    body: [
      { type: "heading", text: "What workflow automation really is" },
      {
        type: "paragraph",
        content:
          "Workflow automation means letting software perform the repetitive, rule-based steps that a person currently does by hand: moving data between systems, sending notifications, generating documents, chasing approvals, and triggering the next task when the previous one finishes. The point is not to remove people — it is to remove the dull, error-prone work that stops people from doing the parts only they can do.",
      },
      {
        type: "paragraph",
        content:
          "Crucially, automation does not require replacing your systems. Most high-value automation sits between the tools you already use, connecting them so that an event in one reliably drives an action in another. That is why it is often the fastest, lowest-risk efficiency project a business can take on.",
      },
      { type: "heading", text: "How to spot the processes worth automating first" },
      {
        type: "paragraph",
        content:
          "The mistake most teams make is automating whatever is most visible, rather than what is most valuable. A process is a strong automation candidate when it is frequent, rule-based, and currently costing you in time or errors. Look for work that has these signatures:",
      },
      {
        type: "list",
        items: [
          "It happens many times a day or week — frequency multiplies every minute you save.",
          "The rules are clear enough to write down — \"if this, then that\" with few genuine exceptions.",
          "It moves data between systems — copy-paste and re-keying are pure waste and a common source of errors.",
          "A delay or mistake has a real cost — a missed follow-up, a late invoice, an unhappy customer.",
          "People dislike doing it — morale is a legitimate and often underrated return.",
        ],
      },
      { type: "heading", text: "A simple scoring method to prioritise" },
      {
        type: "paragraph",
        content:
          "Rather than argue about which process to start with, score your candidates. For each one, rate three factors from 1 to 5: how often it runs (frequency), how much time or money each run costs (impact), and how easy it is to automate given clear rules (feasibility). Multiply frequency by impact, then weight by feasibility. The highest score is your starting point — high value and genuinely achievable, not just appealing.",
      },
      {
        type: "quote",
        text: "Automate the boring thing that happens fifty times a day before the exciting thing that happens once a month.",
      },
      {
        type: "paragraph",
        content:
          "This method protects you from two classic traps: automating a rare, complex process because it is intellectually interesting, and automating something trivial because it is easy. The winners are almost always unglamorous — order confirmations, data sync between a CRM and an accounting tool, document generation, scheduled reports — and that is exactly why they pay back so quickly.",
      },
      { type: "heading", text: "What good automation looks like" },
      {
        type: "paragraph",
        content:
          "A well-built automation is boring in the best way: it runs quietly, handles the expected cases without supervision, and fails loudly and safely when it hits something it was not designed for. The difference between automation that lasts and automation that becomes a liability comes down to a few principles:",
      },
      {
        type: "list",
        items: [
          "It is observable — you can see what ran, what succeeded, and what failed, without guessing.",
          "It fails safely — when something unexpected happens, it stops and alerts a human rather than silently corrupting data.",
          "It is idempotent where it matters — running the same step twice does not create duplicate invoices or double-charge a customer.",
          "It has an owner — someone is responsible for it, so it does not rot the moment a connected system changes.",
        ],
      },
      {
        type: "paragraph",
        content: [
          "These properties are the difference between a weekend script and production-grade ",
          { href: "/services/workflow-automation", text: "workflow automation" },
          ". They are also why the reliability of the underlying integrations matters so much — automation is only as trustworthy as the connections it runs on, which is why signed, monitored ",
          { href: "/services/api-integrations", text: "API integrations" },
          " are worth the extra care.",
        ],
      },
      { type: "heading", text: "Measuring whether it actually helped" },
      {
        type: "paragraph",
        content:
          "Before you automate anything, write down the number you expect to move: hours saved per week, error rate, time-to-respond, invoices issued per day. After go-live, check it. This sounds obvious, yet most automation projects never measure their own success, which is why their value is so often disputed later. A baseline and a follow-up reading turn \"we think it helped\" into \"it saved nine hours a week and cut order errors by half\" — the kind of result that funds the next phase.",
      },
      {
        type: "paragraph",
        content:
          "Start small, prove the number, then expand. The compounding effect is real: each automated process frees the time and trust needed to tackle the next, and within a few cycles the manual glue work that used to define your operations simply disappears.",
      },
      { type: "heading", text: "No-code tools vs custom automation" },
      {
        type: "paragraph",
        content:
          "Off-the-shelf automation tools — the drag-and-drop connectors that link popular apps — are excellent for simple, standard hand-offs, and you should reach for them first when they fit. They are fast to set up and cheap to run. Their limits appear when your logic gets specific: conditional rules with many branches, data transformations the tool cannot express, high volumes that make per-task pricing painful, or steps that have to touch a system the connector does not support.",
      },
      {
        type: "paragraph",
        content: [
          "At that point, custom automation built around your actual systems becomes the better investment — it has no per-task ceiling, models your exact rules, and can be monitored and version-controlled like any other production software. A pragmatic strategy uses both: standard connectors for the simple cases, and ",
          { href: "/services/workflow-automation", text: "custom automation" },
          " for the workflows that are too specific, too high-volume, or too important to leave to a generic tool.",
        ],
      },
      { type: "heading", text: "Common automation mistakes" },
      {
        type: "paragraph",
        content:
          "Automation goes wrong in predictable ways. The most damaging is the silent failure — an automation that stops working but does not tell anyone, so bad or missing data accumulates unnoticed until something downstream breaks. Always build in alerting, so a failure is loud rather than hidden. A close second is the brittle automation tied so tightly to one system's quirks that the next minor change elsewhere breaks it; resilient automation is built to tolerate the small variations real systems throw at it.",
      },
      {
        type: "list",
        items: [
          "Automating the exception, not the rule — handle the common 90% reliably and let humans handle genuine edge cases.",
          "No alerting — if it fails silently, you will find out from an angry customer, not your system.",
          "No owner — an unowned automation rots the moment a connected tool changes.",
          "Skipping the measurement — without a before-and-after number, you cannot prove or defend the value.",
        ],
      },
      { type: "heading", text: "The compounding return" },
      {
        type: "paragraph",
        content:
          "The reason automation is worth approaching deliberately is that its returns compound. The first project frees a few hours a week and, just as importantly, builds the team's trust that automation can be reliable. That freed time and trust make the second project easier to justify and faster to deliver. Within a few cycles, the manual glue work that used to define a team's week — the copying, chasing, and reconciling — quietly disappears, and people spend their time on judgement and customers instead of data entry.",
      },
      {
        type: "paragraph",
        content:
          "This is why starting small is not a compromise but a strategy. A modest, well-measured first win earns the credibility and the budget for the larger programme. Teams that try to automate everything at once usually stall; teams that automate one high-scoring process, prove the number, and repeat tend to end up far more automated a year later.",
      },
      { type: "heading", text: "Document the process before you automate it" },
      {
        type: "paragraph",
        content:
          "Before a single line of automation is built, write the process down step by step: what triggers it, what each step does, who or what it touches, and what the exceptions are. This sounds bureaucratic, but it consistently pays off. The act of documenting almost always reveals steps that are unnecessary, duplicated, or out of order — and removing those is free efficiency you capture before automating anything.",
      },
      {
        type: "paragraph",
        content:
          "A clear written process also becomes the specification the automation is built against and the checklist you test it with, which is why well-documented workflows are automated faster and break less often. If you cannot describe a process clearly on paper, that is a strong sign it is not ready to automate yet — and a sign that the manual version is probably costing you more than you think.",
      },
      { type: "heading", text: "A sensible first project" },
      {
        type: "paragraph",
        content: [
          "If you want a concrete place to begin, pick the single hand-off between two systems that your team complains about most — leads that have to be copied from a form into a CRM, orders re-typed into accounting, or reports assembled by hand every Monday. Automate that one hand-off end to end, measure it, and let the result make the case for the rest. A short ",
          { href: "/consultation", text: "consultation" },
          " is usually enough to identify the highest-scoring candidate in your operation, and a focused first build is usually enough to prove the return.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do we need to replace our software to automate workflows?",
        a: "Usually not. Most high-value automation connects the tools you already use, so an event in one system reliably triggers an action in another. That makes it one of the lowest-risk efficiency projects available.",
      },
      {
        q: "What should we automate first?",
        a: "Score candidates by frequency, impact, and feasibility. The best first project is usually an unglamorous, high-frequency hand-off between two systems — like leads copied from a form into a CRM, or orders re-keyed into accounting.",
      },
      {
        q: "How do we know if automation is working?",
        a: "Decide the metric before you build — hours saved, error rate, or response time — record a baseline, then measure again after go-live. Without that, the value of automation is impossible to prove and easy to dispute.",
      },
    ],
    related: [
      { label: "Workflow automation services", href: "/services/workflow-automation" },
      { label: "API & integrations", href: "/services/api-integrations" },
      { label: "Book a consultation", href: "/consultation" },
    ],
  },
  {
    slug: "build-vs-buy-business-software",
    eyebrow: "Software Strategy",
    title: "Build vs Buy: How to Decide Between Custom Software and Off-the-Shelf Tools",
    description:
      "Should you build custom software or buy an off-the-shelf product? A clear, honest framework for the build vs buy decision — and the costs both sides ignore.",
    keywords: [
      "custom software development",
      "build vs buy software",
      "custom software vs off-the-shelf",
      "B2B software",
      "software for business",
    ],
    datePublished: "2026-06-09",
    dateModified: "2026-06-23",
    readingTime: "9 min read",
    heroTitle: "Build vs buy:",
    heroHighlight: "a decision framework that holds up",
    cardText:
      "Should you build custom software or buy off-the-shelf? A clear, honest framework for the decision — including the costs and risks both sides conveniently ignore.",
    cardBullets: [
      "The real question behind build vs buy",
      "Where each option genuinely wins",
      "The hidden costs nobody puts in the pitch",
    ],
    intro:
      "Every growing business eventually faces the same fork: buy a ready-made product and adapt to it, or build software shaped around the way you already work. The decision is usually made on instinct or on whoever argues loudest, when it deserves a framework. This article gives you one — including the costs and risks that both vendors and in-house enthusiasts tend to leave out of the pitch.",
    body: [
      { type: "heading", text: "The question behind the question" },
      {
        type: "paragraph",
        content:
          "\"Build or buy?\" is really asking: is this capability a source of advantage, or is it table stakes? Nobody should build their own email server or payroll engine — those are solved problems where a packaged product will be better, cheaper, and safer than anything you would make. But the process that makes your business distinctive, the one customers notice, is exactly the thing a generic product will force you to compromise. The art is telling the two apart.",
      },
      {
        type: "paragraph",
        content:
          "A useful test: if a competitor used the identical off-the-shelf tool, would it erase your edge? For commodity functions, the answer is no — buy it. For the workflow that is the reason customers choose you, the answer is often yes, and that is where a tailored build protects what makes you different.",
      },
      { type: "heading", text: "Where buying genuinely wins" },
      {
        type: "paragraph",
        content:
          "Off-the-shelf software is the right call more often than custom-software enthusiasts admit. Buy when:",
      },
      {
        type: "list",
        items: [
          "The process is standard and the product matches it closely — you adapt to good defaults rather than fighting them.",
          "You need to be live in days or weeks, not months.",
          "The capability is a commodity — accounting, email, calendaring, payroll — where reinventing it adds risk, not value.",
          "Your volumes are modest enough that per-seat pricing stays comfortably below the cost of building and maintaining your own.",
        ],
      },
      {
        type: "paragraph",
        content:
          "The strength of buying is that someone else carries the maintenance, security patching, and roadmap. You are renting the outcome of thousands of engineering hours you will never have to spend. When the fit is good, that is an excellent deal, and pride is a poor reason to turn it down.",
      },
      { type: "heading", text: "Where building genuinely wins" },
      {
        type: "paragraph",
        content: [
          "Custom software earns its cost when the fit is poor and the process matters. Build when your operations have a genuine quirk the product cannot model without ugly workarounds, when integration across several systems is central rather than incidental, or when you need to own the data and the roadmap outright. This is the home ground of ",
          { href: "/services", text: "custom software development" },
          " — software that bends to your process instead of bending your process to it.",
        ],
      },
      {
        type: "quote",
        text: "Buy to keep pace with everyone else. Build to do the one thing none of them can copy.",
      },
      {
        type: "paragraph",
        content:
          "There is also a subtler win. Off-the-shelf tools tend to multiply: one for this, another for that, each with its own login, export, and reconciliation overhead. A tailored system can collapse five disconnected products into one coherent platform, and the savings in glue work — the re-keying, the reconciling, the chasing — are frequently larger than the licence fees they replace.",
      },
      { type: "heading", text: "The hidden costs nobody puts in the pitch" },
      {
        type: "paragraph",
        content:
          "Both sides have costs the brochure omits. For buying, the hidden costs are integration work to make the product talk to your other tools, per-seat pricing that scales with your headcount whether or not usage grows, the workarounds your team invents when the product nearly-but-not-quite fits, and the strategic risk of building your operation on a roadmap and pricing model you do not control.",
      },
      {
        type: "paragraph",
        content: [
          "For building, the hidden costs are maintenance after launch, the discipline to keep the software secure and current, and the risk of scope creep if the project is not sequenced sensibly. These are real, but they are manageable with a phased approach and a partner who treats ",
          { href: "/services/managed-it-support", text: "ongoing support" },
          " and ",
          { href: "/services/cybersecurity", text: "security" },
          " as part of the deliverable rather than an upsell.",
        ],
      },
      { type: "heading", text: "A worked example" },
      {
        type: "paragraph",
        content:
          "Picture a distributor with a pricing model no off-the-shelf system handles: prices depend on customer tier, order volume, and a seasonal adjustment unique to their trade. They could buy a popular order-management product for a modest monthly fee per seat. On paper it is cheaper. In practice, the product cannot express their pricing, so the team exports orders, applies the pricing by hand in a spreadsheet, and re-imports them — recreating exactly the manual, error-prone work they hoped to remove, and adding reconciliation on top.",
      },
      {
        type: "paragraph",
        content:
          "A custom system that encodes their pricing rules costs more upfront, but it removes the daily spreadsheet step entirely, eliminates the pricing errors that were quietly costing margin, and scales to more customers without more seats. Over three years the custom build is not just better operationally — it is cheaper, once the hidden cost of the workaround is counted. The lesson is general: the sticker price rarely tells you which option is actually more expensive.",
      },
      { type: "heading", text: "How to run a build-vs-buy evaluation" },
      {
        type: "paragraph",
        content:
          "Turn the debate into a short, structured evaluation rather than an argument. Start by writing down the capability and the specific way your business needs it to work — including the quirks. Then assess the best off-the-shelf option honestly against that: what fits, what needs a workaround, and what is simply impossible. A capability that fits cleanly is a strong buy signal; one that requires several workarounds is pointing you toward a build.",
      },
      {
        type: "list",
        items: [
          "Define the capability and your non-negotiable requirements, quirks included.",
          "Score the best packaged option for fit — clean fit, workaround, or impossible for each requirement.",
          "Estimate three-year total cost for both paths, including integration, workarounds, and switching risk on the buy side.",
          "Ask the strategic question: is this table stakes, or is it your edge?",
          "Decide per capability — and write down why, so the decision can be revisited as things change.",
        ],
      },
      { type: "heading", text: "Total cost of ownership over three years" },
      {
        type: "paragraph",
        content:
          "Point-of-purchase comparisons flatter off-the-shelf software because they ignore everything that comes after the sale. A fair comparison runs over three years and counts the whole picture. For buying, that means licences multiplied by your expected headcount, the one-off and ongoing integration work to connect the product to your other systems, the time your team spends on workarounds where the fit is imperfect, and the risk and cost of switching if the vendor changes pricing or direction.",
      },
      {
        type: "paragraph",
        content: [
          "For building, it means the upfront build, ongoing maintenance, and the support and security work to keep it healthy. Set those totals side by side and the picture is often very different from the monthly-fee headline. Frequently the deciding factor is the glue work an off-the-shelf portfolio creates — the re-keying and reconciling between disconnected tools — which a single tailored system, backed by proper ",
          { href: "/services/managed-it-support", text: "support" },
          ", removes outright.",
        ],
      },
      { type: "heading", text: "The hybrid reality" },
      {
        type: "paragraph",
        content:
          "In practice, almost no business lands on a pure build-or-buy answer, and they should not try to. The mature approach is a deliberate portfolio: buy the commodities where packaged products are excellent — email, payroll, accounting, calendaring — and build the one or two workflows that actually distinguish you. The skill is not loyalty to a side; it is making a clear-eyed call for each capability and integrating the pieces so the seams do not show to your team or your customers.",
      },
      {
        type: "paragraph",
        content:
          "This is also why integration deserves to be a first-class part of the decision rather than an afterthought. A bought tool that cannot share data with the rest of your stack quietly imposes the cost of manual transfer; a custom system that ignores the tools you already rely on is just as much of a silo. The strongest setups treat their bought and built software as one connected platform, with data flowing automatically between them.",
      },
      { type: "heading", text: "When to revisit the decision" },
      {
        type: "paragraph",
        content:
          "A build-vs-buy decision is correct for a moment, not forever. Volumes grow, processes change, vendors raise prices or get acquired, and a capability that was table stakes can become a differentiator. Revisit each decision when something material shifts: a sharp rise in seat count, a vendor price increase, a new requirement the packaged product cannot meet, or a change in what your customers value. Writing down why you chose build or buy at the time makes these reviews fast, because you can check whether the reasons still hold rather than re-litigating from scratch.",
      },
      { type: "heading", text: "A decision you can defend" },
      {
        type: "paragraph",
        content:
          "Put the two options side by side over a three-year horizon, not just at the point of purchase. Add up licences, integration, internal workaround time, and switching risk for buying; add up build, maintenance, and support for custom. Then weigh the numbers against the strategic question — is this capability table stakes, or is it your edge? The right answer falls out of the combination, and it is one you can explain to a board without hand-waving.",
      },
      {
        type: "paragraph",
        content:
          "Most businesses end up with a portfolio, not a dogma: buy the commodities, build the differentiators, and integrate the two so they behave like one system. The skill is not picking a side permanently — it is making the right call for each capability, and revisiting it as the business changes.",
      },
      {
        type: "paragraph",
        content: [
          "If you are weighing a specific decision right now, an outside view helps cut through the internal debate. A short ",
          { href: "/consultation", text: "consultation" },
          " will map your situation against this framework, and our ",
          { href: "/estimate", text: "cost estimator" },
          " gives an indicative build figure to put next to the licence quotes you are comparing.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is custom software always more expensive than buying?",
        a: "Not over a realistic horizon. Off-the-shelf adds integration work, per-seat pricing that scales with headcount, and workaround time when the fit is imperfect. Compared over three years rather than at the point of purchase, a phased custom build is often competitive — and it removes the glue-work cost of stitching several products together.",
      },
      {
        q: "When should we buy instead of build?",
        a: "Buy when the process is standard, the product matches it closely, you need to be live quickly, and the capability is a commodity like accounting or payroll. Reinventing solved problems adds risk without adding advantage.",
      },
      {
        q: "Can we mix custom and off-the-shelf software?",
        a: "Yes, and most businesses should. Buy the commodity functions, build the workflow that makes you distinctive, and integrate them so they behave like one system. The decision is per-capability, not all-or-nothing.",
      },
    ],
    related: [
      { label: "Custom software services", href: "/services" },
      { label: "Managed IT support", href: "/services/managed-it-support" },
      { label: "Book a consultation", href: "/consultation" },
    ],
  },
];

export function getArticle(slug) {
  return blogArticles.find((article) => article.slug === slug);
}

export function getArticleSlugs() {
  return blogArticles.map((article) => article.slug);
}

// Card shape consumed by the /blog listing (FeatureGrid items).
export const blogCards = blogArticles.map((article) => ({
  eyebrow: article.eyebrow,
  title: article.title,
  text: article.cardText,
  bullets: article.cardBullets,
  footer: article.readingTime,
  href: `/blog/${article.slug}`,
  linkLabel: "Read the article",
}));
