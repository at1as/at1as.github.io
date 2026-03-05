---
layout: post
title: "AI Is Quietly Reversing 20 Years of Progress Toward an Open Internet"
date: 2026-03-04 12:00:00 -0400
categories: [technology]
tags: [tech, history, ai]
hidden: false
popular: false
---

_The End of the Crawlable Web_ : For most of the modern internet, there was an implicit contract between websites and search engines. Websites made their content accessible. Search engines indexed it. And in return, search engines sent users back to the original site.

It wasn't always perfect — news aggregators and social media links were persistent points of contention — but the incentives aligned well enough that the web became broadly searchable. You could discover obscure blogs, old research papers, forum discussions from fifteen years ago, or technical documentation buried deep in a site.

For researchers, developers, and curious people in general, this was an extraordinary capability. A few well-crafted queries could surface material that previously required access to specialized libraries or institutional databases.

But that contract is beginning to break, largely because of **AI**.


## The Internet Was Built to Be Indexed

The early web evolved around the assumption that machines would read it.

Pages were publicly accessible (and even _inspectable_) HTML. Links connected documents. Standards like `robots.txt` allowed site owners to signal what should and shouldn't be indexed (while not a legal contract, it was generally respected).

Search engines like Google built their entire model around crawling and ranking results. Entire industries emerged to help websites rank higher.

Even large institutions gradually moved toward openness. Academic publishing — once dominated by expensive closed journals accessible only to well-funded institutions — began shifting toward public access. Preprint servers like arXiv made research freely available before formal publication. Governments increasingly required that publicly funded research be published in open-access venues. The open-access movement was the result of real fights by researchers and librarians pushing back against gatekeeping, and it worked.

The overall direction was clear: more content online, more accessible, and more searchable. The web was becoming something close to a universal research library.


## The Golden Age of Search

At its peak, search provided something remarkable: _**breadth**_.

You could move fluidly between sources — academic papers, personal blogs, large institutional sites, forum threads, technical documentation, news articles, archived content.

Search engines also acted as a form of redundancy. If a page disappeared (or went temporarily offline), there was often still a cached copy. Services like the Internet Archive preserved historical snapshots of large portions of the web — something that, in retrospect, amounts to cultural preservation. Entire eras of the internet can still be revisited years later, even after the original sites have vanished.

Part of what made this valuable was that discovery was platform-agnostic. If you found a writer you liked, a search engine could surface their work wherever it lived — a personal blog, a contributor piece on a magazine site, a guest post somewhere obscure, or even one of their online accounts on popular platforms. You didn't need to follow them on a specific platform or already know where to look. The index did that work for you.

Even independent developers could build tools on top of this ecosystem. Crawlers, scrapers, research scripts, and aggregators were common weekend projects. The web wasn't just readable by humans, it was crawlable by anyone curious enough to try — with enough gray areas that there was room for experimentation.


## AI Changes the Incentives

The first place this shift becomes visible is in how the web is crawled.

Large language models now consume enormous amounts of web content — for training, and increasingly for real-time search and retrieval.

But unlike search engines, they don't reliably send traffic back.

A search engine surfaces a link and encourages the user to visit the source. An AI system often summarizes the content directly, meaning the user never clicks through. While some LLMs now provide sources, the marginal value of visiting them is much lower.

From the perspective of a website owner, this fundamentally changes the value exchange. If an AI system crawls your content, extracts information, and generates answers without directing users back to you, the original bargain disappears. The content that cost you time and money to produce gets consumed at scale, and you see nothing in return: no traffic, attribution, or revenue.

The rational response is to close the doors. For many sites, the open internet has ceased to be profitable anyway.

Bot protection systems are now standard. Services like Cloudflare increasingly sit between websites and any automated traffic — and at scale, that position comes with real power. They can define the terms on which information is accessed, and while they claim to be standing up for content creators, they have their own incentives too (which may not always align with the interests of content creators).

CAPTCHAs, rate limits, login requirements, and aggressive bot detection have become ubiquitous (and often frustrating for legitimate browsing). Scraping, once a broadly tolerated gray area, now risks immediate account suspension, often without any path to account recovery. The consequences escalated quickly once AI-scale crawling increased the stakes.

The web is gradually shifting from _**crawlable by default**_ to _**blocked by default**_.


## APIs Are Closing Too

The same defensive shift is happening at the level of developer access.

Historically, many platforms exposed APIs that were inexpensive or free for developers. They encouraged experimentation. Hobbyists built tools and extensions. Researchers collected data.

As automated usage has increased — particularly from AI systems and agents — APIs have become more restrictive: dramatic price increases, smaller usage quotas, stricter authentication, and more opinionated terms of service about how the APIs can be used. Twitter's API went from a resource that researchers and developers built entire projects around to something priced for enterprise contracts almost overnight.

Companies no longer want to sell access to a developer, they want to license their archive to a major institution (_which increasingly means a major LLM provider_). APIs are increasingly treated as data licensing channels rather than developer tools.

In many cases, scraping was the fallback when APIs were limited. That option is increasingly difficult and risky too. The result is that large parts of the internet are becoming harder to programmatically explore, not because the information isn't there, but because every access point is being metered or blocked.


## The Paywall Problem

Increasingly, these restrictions affect ordinary readers as well.

More content is also moving behind authentication: login walls, subscription gates, and private APIs that prevent automated indexing entirely.

This has an important side effect: content behind authentication cannot easily be archived.

Search engines can't cache it. The Internet Archive can't preserve it. When a platform restructures, pivots, or shuts down, that content doesn't go behind a paywall where it remains technically accessible to those who pay, it simply disappears. Knowledge that once would have become part of the durable web instead becomes tied to specific platforms and accounts, existing only as long as the platform decides to keep it there.

In some ways this resembles the older academic publishing model, where access to knowledge depended on institutional subscriptions and much of it was effectively invisible to anyone outside a major university. The open-access movement spent years reversing that. What's happening now risks recreating it at a larger scale, without the benefit of even having the content preserved somewhere.

There's also a privacy cost that follows directly from authentication requirements. An open web let you read anonymously. A login-gated web requires you to identify yourself, and in doing so, to make a record of exactly what you're reading, when, and how often. When the web isn't profitable on its own, user data often becomes the product.


## Research May Become Platform Dependent

If more of the web becomes gated, discovery increasingly depends on the platforms that control access.

Instead of searching the open web, users rely on AI assistants, subscription search services, and whatever search capability the platform itself provides. Access to the underlying content increasingly depends on bespoke licensing deals rather than open crawling. That last point matters more than it might seem. Google built one of the most sophisticated search engines in history and refined it for decades. A content platform, by contrast, may offer only basic keyword matching. If that platform becomes the only way to access a category of content, you're trading a tool optimized for discovery for one that was never really designed for it.

There's a related problem for anyone trying to build an alternative. Google had dominant market share, but alternatives could be economically viable: you could crawl the open web and compete on the quality of your ranking and product. In a world where content is locked behind licensing deals, access to that content becomes a precondition for competing at all. The barrier to entry stops being technical and becomes financial. That changes the competitive dynamics considerably, and not in favor of new entrants.

The open web let users explore information directly and follow their own paths through it. A platform-mediated web changes that dynamic in ways that are easy to underestimate until the capability is already gone.


## The Crawlable Web Was an Accident

It's worth remembering that the crawlable web was never inevitable.

It emerged from a specific set of technological choices and economic incentives that happened to align for a couple of decades. Search engines sent traffic. Websites remained open. Developers built tools that explored and connected the web. The open-access movement pushed institutions toward transparency. All of it required the ongoing cooperation of many different actors with reasons to keep cooperating.

A useful way to think about what's changed is this: data only becomes a competitive advantage when access to it is restricted. When the web was open, no single company controlled access to the underlying corpus. Anyone could crawl it, index it, and build a search engine on top of it. As content moves behind walls, access to that corpus becomes proprietary. Whoever controls access to the data increasingly controls access to the market. That changes the competitive dynamics considerably.

AI is shifting those incentives. When automated systems consume content at massive scale without returning traffic, website operators respond rationally by tightening access. When platform economics change, APIs close. When authentication becomes the default, archives stop working.

The result may not be the complete disappearance of the searchable web, but it may be the gradual disappearance of the open, crawlable web that researchers, developers, and curious people came to rely on; replaced by a more mediated, platform-dependent version where what you can find depends increasingly on who you're paying and what they've decided to include.

That's a significant change in how information works on the internet. And it's happening quietly, as a side effect of decisions that each make sense individually, but aggregate into something most of us wouldn't have chosen if the choice had been made explicit.
