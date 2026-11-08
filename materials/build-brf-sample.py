"""Build assets/brf-sample.js: the constructed Fernhollow Freight memo versions for the skim bench.

    python3 materials/build-brf-sample.py

Every memo is CONSTRUCTED for teaching (Fernhollow Freight is an invented company; the people are
the same as in learn-stakeholder-management-with-phoebe). No number in them is a measurement.
No real public decision memo with a clear reuse licence was added: see the course map.
Serialised with json.dumps, never string interpolation.
"""
import json
import os

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

DRAFT = """Customer data at Fernhollow Freight

Fernhollow has grown from four depots to eleven, and each step of that growth added its own customer list. Sales keeps accounts in the CRM that Rafe's team runs, configured around key accounts. The depots keep delivery contacts in the planning system, configured around delivery points. Billing keeps invoice addresses in the finance ledger, which is older than both. Each team chose the record that served its own work, and each record is accurate for the purpose it was built for.

In September my team matched the three lists against each other for the 2,140 accounts that ordered in the last year. We matched on company registration number where it existed and on a cleaned name and postcode where it did not. The lists agreed on name, address and contact for fewer than half of these accounts. Where they disagreed, the depot list was usually the most recent and the billing list the least.

The disagreement has costs we can see. Credit notes for deliveries to an address the customer had already corrected ran to about 310 last quarter. Five of the six account managers we asked keep a private spreadsheet of their accounts because they do not trust the CRM. Odile's planners re-key delivery exceptions by hand, roughly twenty minutes per planner per day across the network.

We looked at three ways forward. We could clean the three lists once and keep them separate, which is cheap but would drift back within a year on our measurements. We could make the CRM the master record, which Rafe's team would welcome and the depots would not, because the CRM is the least current list for delivery contacts. Or we could build one shared customer record that all three systems read from and write to, with each team owning the fields it already maintains.

The shared record is the option my team and Kenji support. It costs €1.4 million over two years, most of it in the first year, and Kenji's team would run it afterwards inside the existing infrastructure budget. The first depot could go live in Q3 if work starts in January, with the remaining depots following one at a time. The main risk is the account data in the CRM: if the account lists are not opened up early, the platform launches empty. A second risk is depot staff time during the cut-over, which is why the rollout moves one depot at a time.

Overall, the shared record is the only option that fixes the cause rather than the symptom. I recommend we build it, and I need your decision at the executive meeting on 14 November so the January start holds.
"""

BLUF = """# Decision needed by 14 November: approve the shared customer record

## The decision
**I recommend one shared customer record for sales, the depots and billing, at €1.4 million over two years, and I ask you to approve it at the executive meeting on 14 November.** That date lets work start in January and the first depot go live in Q3. Kenji supports the proposal and his team would run the platform inside the existing infrastructure budget.

## Why now
Our three customer lists disagree on name, address or contact for more than half of our 2,140 active accounts. Sales keeps accounts in the CRM, the depots keep delivery contacts in the planning system, and billing keeps invoice addresses in the finance ledger, and nothing links them.

The disagreement already costs us money we can count, in credit notes, in re-keying at the depots and in the private spreadsheets the account managers keep alongside the CRM. About 310 credit notes last quarter were for deliveries to an address the customer had already corrected, and five of the six account managers we asked keep a private spreadsheet because they do not trust the CRM.

## What it costs, and what it returns
| Item | Year 1 | Year 2 |
| Platform and build | €900,000 | €200,000 |
| Depot and sales time | €180,000 | €120,000 |
The return we can count today is fewer credit notes and less re-keying in the depots. The larger return, retention on key accounts, is plausible but not yet measured, so it is not in the case.

## What could go wrong
The main risk is that the CRM account lists are not opened up early, so the platform launches empty. Rafe has agreed to name a joint owner from his team before any build starts. A second risk is depot staff time during the cut-over, which is why the rollout moves one depot at a time and stops if the credit-note rate does not fall.

## The options we rejected
Cleaning the three lists once is cheapest, but on our measurements they would drift back within a year. Making the CRM the master would suit sales and leave the depots entering data into a system built for account management.

## What happens next
If you approve on 14 November, the joint owners are named in the first week of December and the build starts in January. The detailed plan and the matching method are in the appendix for anyone who wants them.
"""

BURIED = """# Customer-data platform: update and proposal

## Where we are
Fernhollow's three customer lists disagree on name, address or contact for more than half of our 2,140 active accounts. Sales keeps accounts in the CRM, the depots keep delivery contacts in the planning system, and billing keeps invoice addresses in the finance ledger. Each team trusts its own list and works around the other two.

## What it is costing
The disagreement cost about 310 credit notes last quarter, for deliveries to an address the customer had already corrected. It is also why five of the six account managers we asked keep a private spreadsheet, and why Odile's planners re-key delivery exceptions by hand, roughly twenty minutes per planner per day.

## What we looked at
We compared three options: a one-off clean of the three lists, making the CRM the master, and one shared customer record that all three systems read from. A one-off clean is cheapest but drifts back within a year. Making the CRM the master would suit sales but leave the depots entering data into a system built for account management. The shared record is the only one that fixes the cause.

## Proposal
The shared record would cost €1.4 million over two years, with most of the spend in the first year. My team and Kenji support it, and his team would run it inside the existing infrastructure budget. The first depot could go live in Q3 if work starts in January. I recommend we go ahead, and I need your decision at the executive meeting on 14 November so that start date holds. Each team would own the fields it already maintains, so the depots would not change how they work.

## Risks and next steps
The main risk is that the CRM account lists are not opened up early, so the platform launches empty. A second risk is depot staff time during the cut-over. If approved, we name a joint owner from Rafe's team in the first week and agree depot cut-over dates with Odile.
"""

LONG = """# Proposal: a shared customer record for Fernhollow Freight

## Summary
I recommend a shared customer record that sales, the depots and billing all read from. This paper sets out the background, what the three lists look like today, what we measured, the options we compared, how we would build it, and what it would take from each part of the business.

## Background
Fernhollow has grown from four depots to eleven since the first depot system was installed, and each step of that growth added its own customer list. The CRM came in when the commercial team was reorganised under Rafe, and it was configured around key accounts rather than delivery points. The depot planning system came with the depot expansion and was configured around delivery points rather than accounts. The finance ledger is older than both and was configured around invoice addresses. None of these choices was wrong at the time. Each team chose the record that served its own work, and each record is accurate for the purpose it was built for. The difficulty is that a customer, to the rest of the business, is one company, and to our systems it is three records that rarely agree.

## The three lists today
The CRM holds 2,610 account records, of which 2,140 placed at least one order in the last twelve months. Account managers update the CRM when they win or renew an account, but they rarely update delivery contacts, because those belong to the depots in practice. The depot planning system holds 4,980 delivery points. Planners update these daily, because a wrong contact means a failed delivery, and they are the most current customer data we have. The finance ledger holds 2,390 billing entities. Billing updates an address when an invoice bounces, and only then. Each list has its own identifier, and there is no field that links a CRM account to its delivery points or to its billing entity. When someone needs the whole picture, they build it by hand in a spreadsheet, and the spreadsheet is out of date by the following week.

## What we measured
In September my team matched the three lists for the 2,140 accounts that ordered in the last year. We matched on company registration number where it existed and on a cleaned name and postcode where it did not. The lists agreed on name, address and contact for fewer than half of these accounts. Where they disagreed, the depot list was usually the most recent and the billing list the least. We then traced the last quarter's credit notes. About 310 were issued for deliveries to an address the customer had already told us was wrong, which is the clearest cost we can count. We also asked six account managers how they work. Five keep a private spreadsheet of their accounts because they do not trust the CRM, and all six said they check delivery contacts with the depot before a renewal meeting. Odile's planners re-key delivery exceptions into the planning system by hand, roughly twenty minutes per planner per day across the network.

## The options we compared
We compared three ways forward. The first is a one-off clean: reconcile the three lists once, fix the identifiers, and keep the three systems as they are. It is the cheapest option and it would fix the credit notes for a while, but nothing would stop the lists drifting apart again, and on our measurements they would be back where they are within a year. The second is to make the CRM the master record and have the depot system and the ledger copy from it. The commercial team would welcome this, but the CRM is the least current list for delivery contacts, and the depots would be asked to enter data into a system built for account management. The third is a shared customer record: one record per customer, with links to its delivery points and billing entities, that all three systems read from and write to. It is the most work, and it is the only option that does not drift back.

## How we would build it
The build has three stages. In the first stage, from January to March, we would set up the shared record, load the matched data from September, and agree the rules for who may change which field. Depot planners would own delivery contacts, account managers would own the account relationship, and billing would own invoice addresses, which is how the work already happens in practice. In the second stage, from April to June, we would connect the depot planning system so that planners read and write delivery contacts through the shared record, starting with one depot. In the third stage, from July onwards, we would connect the CRM and the ledger and roll out to the remaining depots one at a time, with the first depot fully live in Q3. Each stage ends with a check that the credit-note rate at the connected depots has fallen before the next stage starts.

## What it would take
The platform and the build would cost €900,000 in the first year and €200,000 in the second. Depot and sales time during the cut-over would cost about €180,000 in the first year and €120,000 in the second, mostly planners' time in the weeks their depot moves over. In total that is €1.4 million over two years. Kenji's team would run the platform afterwards inside the existing infrastructure budget. We would need one joint owner from Rafe's team, one from Odile's planning team, and one from billing, each for about a day a week during their stage.

## What it would change for each team
For the depots, the change is small: planners keep updating delivery contacts as they do today, through a different screen, and they stop re-keying exceptions. For sales, account managers would see current delivery contacts and billing status in the CRM without asking the depot, and the private spreadsheets would no longer be needed. For billing, invoice addresses would update when the depot or the account manager learns of a change, rather than only when an invoice bounces. For the executive team, the customer numbers in the monthly pack would come from one place.

## Lessons from earlier attempts
Fernhollow has tried to reconcile its customer lists twice before, in different forms. The first attempt was a one-off clean run by an external firm when the CRM was introduced, and it produced a clean list that was out of date within eighteen months because nothing changed in how the three teams kept their records. The second attempt was an internal working group that met monthly for most of a year, and it stopped when two of its members moved to other roles. Both attempts had sponsors, budgets and good intentions. What neither had was a rule about who owns which field, and a system that makes the owner's update visible to everyone else. The proposal is built around exactly those two things, which is the main reason my team believes it will hold where the earlier attempts did not.

## How we would know it is working
We would track three measures from the first month of the build. The first is the credit-note rate for wrong-address deliveries at each connected depot, measured monthly against the same month a year earlier. The second is the share of active accounts on which the three systems agree, measured with the same matching method we used in September, so the before and after numbers are comparable. The third is the number of private account spreadsheets still in use, which we would ask about in the same way we asked in September. We would report all three to the executive team each quarter, and we would treat a stage that does not move the first measure as a reason to pause rather than a reason to push on.

## Data protection and access
The shared record would hold the same personal contact details the three systems hold today, and no new categories of data. Access would follow the field ownership rules, so a planner could see and change delivery contacts but not credit terms, and an account manager could see delivery contacts but not change them. Kenji's team would run the access reviews they already run for the CRM and the ledger. We have walked the design through with the data protection lead, who has asked for a short record of processing before the build starts, which we would complete in December. Customers would see no change in how we contact them, and the privacy notice already covers every use the shared record would make of their details, so no new notice or consent would be needed.

## Other considerations
Several smaller questions remain open and are listed in the appendix with owners and dates. None of them changes the recommendation, but two of them are worth naming here. The first open question is whether the billing team needs its own copy of invoice addresses for the year-end audit, which finance is checking with the auditors. The second is how the depot planning system handles a customer whose delivery points belong to two different regions, which the planning team believes is a configuration change rather than a build. The main risk is that the CRM account lists are not opened up early, so the platform launches empty and the account managers keep their spreadsheets. A second risk is depot staff time during the cut-over, which is why the rollout moves one depot at a time and stops if the credit-note rate does not fall. The total cost of €1.4 million over two years assumes the build starts in January; a later start moves the first depot past Q3 and adds about a quarter of running both old and new processes in parallel.

## Decision
I need your decision at the executive meeting on 14 November so the January start holds.
"""

MEMOS = [
    {"id": "draft", "label": "Draft, in work-it-out order",
     "note": "Background first, the analysis in the order it was done, the recommendation and the ask at the end."},
    {"id": "bluf", "label": "The rewrite: decision on top",
     "note": "Title states the decision; the first paragraph carries the ask, the deadline and the cost."},
    {"id": "long", "label": "Over-long: everything in",
     "note": "Thorough and accurate, three and a half pages, the risk and the ask near the end."},
    {"id": "buried", "label": "Buried ask",
     "note": "Clear headings, but the ask sits inside paragraph 4 and the title names a topic, not a decision."},
]
TEXTS = {"draft": DRAFT, "bluf": BLUF, "long": LONG, "buried": BURIED}
for m in MEMOS:
    m["text"] = TEXTS[m["id"]]

sample = {
    "source": "Constructed Fernhollow Freight example: four versions of one decision memo from Sunniva Holm, "
              "head of data, to Marguerite Vance, CEO. Invented for teaching; no number in them is a measurement.",
    "memos": MEMOS,
}

head = ("/* brf-sample.js - generated by materials/build-brf-sample.py; do not edit by hand.\n"
        " * Constructed Fernhollow Freight memo versions for the skim-survival bench. */\n")
with open(os.path.join(REPO, "assets", "brf-sample.js"), "w", encoding="utf-8") as f:
    f.write(head + "window.BRF_SAMPLE = " + json.dumps(sample, ensure_ascii=True) + ";\n")
print("wrote", len(MEMOS), "memos;", {m["id"]: len(m["text"].split()) for m in MEMOS})
