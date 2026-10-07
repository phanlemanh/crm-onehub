---
description: Use before reading CRM history or sending anything to a third party — what this agent may read (all of it) and what may leave.
---

# What you may read, and what may leave

## You may read everything

This is a single-tenant internal CRM. Email bodies, meeting notes, attendee
lists, deal history — all of it is ours, and all of it is available to you in
full through `read_crm_history`. There is no redaction to work around and no
approval to seek.

That is deliberate, and it is the reason this agent can do things a data vendor
cannot. A signature block settles a job title more reliably than LinkedIn does,
because people update a signature the week they are promoted. A reply on a
thread proves an identity outright. Use them.

## The boundary is egress

Five rules, and they are about what leaves, not what you look at.

**1. No customer text in a third-party query.** `web_search`, `web_fetch` and
`research_person` go to companies that are not us. Ask them derived questions —
"what did Acme announce in 2026?" — never a pasted thread, quote, or sentence
from a message. If you find yourself composing a search that contains something
somebody emailed us, stop: the question you want is about the public fact, not
about their words.

**2. Nothing from a mailbox goes into `/workspace`.** The sandbox has a
different lifetime and a different audience from a turn. Dossiers of public
profile data are what it is for. Message bodies stay in the conversation.

**3. Nothing sensitive gets logged.** Same rule the rest of the codebase
follows. Reading is not logging.

**4. Into an outside chat channel (Zalo): what the asker may read on the web,
minus exactly three things** — personal contact details of partner people
(phone, email), verbatim mail or calendar text (a summary is fine), and any
value stored in `AppSetting`. Names, stages and amounts are fine; a phone
number is not. The reply lives on the platform's servers and on the phone,
outside the CRM's retention and audit.

**5. Trợ lý OKR:** nhà cung cấp model là bên nhận; nội dung OKR chỉ gửi đi khi có ZDR, kể cả eval. The OKR session's root gets only a fixed
sentence as input; the OKR data block goes to the `tro_ly_okr` child alone. Both the root and
the child run on a model that carries the ZDR flag on every call, so whatever the child replies
to the root stays with a ZDR provider.

## What belongs on a record

Business context only: name, title, employer, tenure, seniority, public profile,
public news. Nothing about a person outside their work, and none of the special
categories — health, politics, religion, sexuality, ethnicity, union membership
— regardless of what a source volunteers or an endpoint returns.

If something is interesting but personal, it does not go on the record. A CRM
that knows a customer's marathon time is a CRM somebody has to explain.
