---
title: "Bus factor: applying reliability thinking to teams"
excerpt: How to run a platform team so that nobody, including me, is a single point of failure
toc: true
toc_sticky: true
header:
  teaser: /images/ali-yasar-unsplash.jpg
tags:
  - leadership
created: 2026-11-27
updated: 2026-11-27
---

<figure class="gallery">
  <img src="/images/ali-yasar-unsplash.jpg" alt="A city bus blurred by motion at night" fetchpriority="high">
  <figcaption>Photo by <a href="https://unsplash.com/photos/a-car-driving-on-a-street-FbHzV30Q5xg">Ali Yasar</a></figcaption>
</figure>

Almost ten years ago I wrote a [guide to tech conferences](/2017/01/Survival-guide-to-tech-conferences.html), where I told the story of asking [Niall Murphy](https://www.linkedin.com/in/niallm/) about management, making it extremely clear I wasn't a manager because, from my own experience, I loathed the concept. He pointed me to [Liz Fong-Jones](https://www.linkedin.com/in/efong/) and her talk, [Managing Up and Sideways as an SRE](https://www.usenix.org/conference/srecon16europe/program/presentation/fong-jones-managing), and over lunch at SREcon I asked her what the real benefits of having a manager were. Both of them talked about <code style="white-space: nowrap">"sh1t "{umbrella,funnel}</code>. A good manager shields the team from the noise coming from above, and a bad one pours all of it straight down. Their answers gave me the push to make a very tough decision and quit my job. Ten years later I manage a high-performance platform engineering organisation, and I still think about that umbrella metaphor. Poetic, right?

I spent most of my career treating infrastructure as something you describe in code, review, test and run on a schedule. Unsurprisingly, at some point I noticed I was applying the same thinking to the team, and the idea that carries over best is the bus factor. That's the number of people who would have to be hit by a bus before a project stalls. In reliability terms, a bus factor of one is a single point of failure. Teams have plenty of them, like the engineer who knows how the secrets get rotated or the manager who holds the plan. It's often the manager, since a sh1t umbrella only works while someone is holding it.

A team with a bus factor of one can look like it's performing well, because the person holding everything together works very hard and everyone can see it. That effort leaves with them when they go on holiday or move on. What I care about is impact, the part that is still there the next morning without them.

On a platform team this matters more than usual. Ours runs more than 14,000 instances and ships around 15,000 deploys a month, all self-service, and it has held 99.99% reliability for five years. We do it with about 3% of the engineering organisation, which is what I mean by talent density, and a team that small has no room for single points of failure. A service can't be more reliable than the platform it runs on, so our SLOs are the baseline for every other SLO in the company. No pressure 😅

The goal I keep coming back to is that the team should keep working, at the same quality, when any one of us is away, especially me.

## If it isn't written down, it doesn't exist

<figure class="gallery">
  <img src="/images/tanja-tepavac-unsplash.jpg" alt="A tall stack of paper documents full of colourful sticky notes">
  <figcaption>Photo by <a href="https://unsplash.com/photos/stack-of-papers-marked-with-colorful-sticky-tabs-81ikZZG7_AA">Tanja Tepavac</a></figcaption>
</figure>

If the only copy of a decision, a meeting outcome, a runbook, an SLO, a rotation schedule or the reason behind a weird config flag lives in someone's memory, the team has a single point of failure and doesn't know it yet. Our two communication rules come from that.

The first is to write by default. A conversation in a call is fine, but it isn't finished until the outcome is written somewhere the rest of the team can find.

The second is public over private. Questions and answers go in public channels, not in direct messages. A DM helps one person once. The same answer in a public channel helps everyone who searches for it later, and it lets someone else jump in when the person you asked is busy or away.

We also treat a question asked twice as a documentation bug, and the fix is a change to the docs, so the next person doesn't need to ask.

In retrospect this approach had an awesome side effect. With the rise of AI, all this documentation now feeds our LLMs, which closes the knowledge gap for newcomers.

## Decision records

Every significant decision gets a short record that covers the problem we're solving, the requirements the solution has to meet and how we're solving it, including what we considered and rejected. A year later, when someone asks "why does this work like that?", we just send a link, greatly decreasing cognitive burden on the team.

Without this you pay for the same decision three times. You pay once when onboarding someone, again every time the debate restarts and a third time when someone reverts it without knowing it was deliberate.

Before a decision is final we go looking for the people it will affect, like the product teams whose workflow changes, security and compliance, and the teams who will inherit the consequences. We're not looking for consensus, just for where the decision will hurt or be wrong while it's still cheap to change it.

When a change affects people, overcommunicate. Otherwise, expect a flood of complaints and bad feedback.

## Prevention on a schedule

<figure class="gallery">
  <img src="/images/lukas-tennie-unsplash.jpg" alt="Close-up of the gears inside a mechanical watch">
  <figcaption>Photo by <a href="https://unsplash.com/photos/a-close-up-of-a-watch-face-showing-the-gears-DAWnMmUSMdU">Lukas Tennie</a></figcaption>
</figure>

A lot of our reliability work is boring and recurring, and it happens whether or not something is on fire.

* Every week we review all the alerts that fired. For each one we ask whether it was actionable and what we can change so it fires less. Every so often we also review the alert catalogue itself, retiring alerts that no longer earn their keep and adding the ones we found missing.
* Each area of the platform has a recurring task to keep its stack up to date, security fixes first. Skipped upgrades compound into the big, expensive migrations nobody wants to do.
* Secrets are grouped by sensitivity, and each group has its own rotation frequency. Some rotations are automated and some are slow and manual. We do them anyway, because a team that can't rotate its secrets can't recover quickly when one leaks.
* Someone from the team is at every game day across the company, including the ones testing other teams' systems, because failures rarely stay inside one team's boundaries.
* We watch cloud cost continuously, so a runaway job or a forgotten resource shows up while the damage is small, weeks before it would reach an invoice. When we design something, "what does this cost to run, and what would a cheaper version look like?" is a question we expect to have an answer to.

Each of these is a scheduled task with an owner, so when the owner is away it's still on the calendar for whoever covers.

## Alerts, SLOs and runbooks by default

<figure class="gallery" style="max-width: 24rem; margin-inline: auto">
  <img src="/images/marcus-woodbridge-unsplash.jpg" alt="A lighthouse at the end of a pier as a huge wave breaks next to it">
  <figcaption>Photo by <a href="https://unsplash.com/photos/a-lighthouse-surrounded-by-a-huge-wave-in-the-ocean-NcociWzk23A">Marcus Woodbridge</a></figcaption>
</figure>

Every component has alerts. Every P1 and P2 alert has a runbook explaining what it means, how to diagnose it and, where possible, how to mitigate it. Every component has SLOs, documented with the reasoning behind the numbers, and we review them periodically because last year's SLO is rarely still right.

Exceptions have to be argued for. Making observability the default moves that argument to before something ships, which is a lot cheaper than having it after the first incident.

The runbook is also the cheapest way I know to remove a single point of failure. At 4am the person holding the pager shouldn't need the person who built the thing.

## Time for other teams

<figure class="gallery">
  <img src="/images/daniele-franchi-unsplash.jpg" alt="An hourglass lit in red">
  <figcaption>Photo by <a href="https://unsplash.com/photos/clear-hour-glass-with-red-background-WyJ0rahs_2k">Daniele Franchi</a></figcaption>
</figure>

A platform team that becomes a bottleneck is failing at its job, so we put time aside for the rest of engineering and make it predictable:

* Every two weeks we run office hours to show what we've been working on. Designs get feedback before they harden, and our roadmap is visible without anyone having to ask.
* Every week we host "Ask Me Anything" (AMA) sessions where other teams bring us their problems, like an architecture to validate, a decision they're stuck on, or just thinking out loud with someone who has seen the failure modes before.
* Other teams can request improvements and features on a public discussion board. We review it periodically and every request either becomes a ticket or is rejected with a written reason, so filing one never feels like shouting into a void.
* Every quarter the managers send a feedback form to the entire engineering organisation, asking about the platform and how well we serve the product teams. We use the answers to cross-correct and improve.
* Everyone on the team answers questions in our public help channel, and that's a priority. Tickets are only for work that needs the "paperwork", like PCI DSS.

On a capacity spreadsheet this looks expensive. It costs far less than the alternative, which is a constant stream of small interruptions, no team visibility until something breaks or people hiding behind a ticket wall.

## Management on a schedule

Managers are the easiest single point of failure to miss, because the work looks like conversations and judgement calls. A lot of it is recurring, so we treat it like the rest.

Engineers have a 1:1 every two weeks with their engineering manager about the immediate context, and a monthly one with me about any topic I can help with. The split is deliberate, so the day-to-day conversation never crowds out everything else.

Planning happens every quarter. The team runs without project managers or product owners, so the backlog can't come from one person's head either. Feature requests are crowdsourced across engineering, through the discussion board, office hours, the AMA sessions and the quarterly survey, and the team raises its own from what it sees in alerts, incidents, cost and upgrades. The plan is written down, and anyone on the team can explain what we're doing this quarter and why.

Together, the quarterly plan and the public discussion board do a lot of the sh1t umbrella work Liz and Niall talked about. Requests land in one place, get weighed against what we've already committed to, and reach engineers as planned work. Because all of it is written down, the umbrella stays up when I'm away.

We also hold a retrospective at the end of every sprint, and every action that comes out of it gets an owner.

## Ownership and seniority

The rituals sit on top of individual ownership. Every engineer owns their components and is expected to keep them at the quality bar. Senior engineers extend that ownership across the company. They run coding and system design interviews for other teams, review other teams' code and post-mortems (and follow up until the action items are implemented), and take part in cross-team forums like the principal engineers' group.

That turns "senior engineers should have impact across the org" into a list of recurring activities that someone either does or doesn't do. It also keeps senior people close to real systems and real problems, which is where their judgement came from in the first place.

## Where to start

None of these practices are new, and most teams already do a few of them. I think the difference comes from doing all of them, consistently, and writing them down so they survive any one person leaving.

If you lead a team and want a place to start, list the things that would quietly stop if you were gone for a month. Each item on that list has a bus factor of one, and the list is your backlog. Easy 🌈

<figure class="gallery">
  <img src="/images/sarah-janelle-unsplash.jpg" alt="A neon sign that reads FUN TIME">
  <figcaption>Photo by <a href="https://unsplash.com/photos/a-neon-sign-that-says-fun-time-on-it-OpEpayfTcYc">Sarah Janelle</a></figcaption>
</figure>
