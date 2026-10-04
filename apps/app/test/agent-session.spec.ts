import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import type { MessageStreamEvent, SessionState } from "eve/client";
import { recordCopy, recordFilter, recordHeader } from "../lib/agent-record";
import {
	classify,
	composerState,
	eventsOf,
	loadThread,
} from "../lib/agent-session";
import { OKR_SOAN_CUA, okrSoanHeader } from "../lib/okr-soan-record";

const NOW = Date.parse("2026-08-01T12:00:00.000Z");

const event = (
	type: string,
	at: string = "2026-08-01T12:00:00.000Z",
): MessageStreamEvent =>
	({ type, data: {}, meta: { id: `evt_${type}`, at } }) as MessageStreamEvent;

const parked: SessionState = {
	sessionId: "wrun_1",
	continuationToken: "eve:live",
	streamIndex: 3,
};

const unparked: SessionState = { sessionId: "wrun_1", streamIndex: 3 };

describe("classify", () => {
	it("trusts the token over any reading of the events", () => {
		expect(classify(parked, [event("message.appended")], NOW)).toBe("ready");
	});

	it("knows a terminal session cannot be continued", () => {
		expect(classify(unparked, [event("session.completed")], NOW)).toBe("ended");
		expect(classify(unparked, [event("session.failed")], NOW)).toBe("ended");
	});

	it("reads a turn still emitting as working", () => {
		const recent = event("message.appended", "2026-08-01T11:59:30.000Z");

		expect(classify(unparked, [recent], NOW)).toBe("working");
	});

	it("retires a turn that stopped mid-sentence", () => {
		const stalled = event("message.appended", "2026-08-01T11:50:00.000Z");

		expect(classify(unparked, [stalled], NOW)).toBe("ended");
	});

	it("does not retire a live turn for want of a timestamp", () => {
		const undated = { type: "step.started", data: {}, meta: { id: "x" } };

		expect(classify(unparked, [undated as MessageStreamEvent], NOW)).toBe(
			"working",
		);
	});
});

describe("the composer", () => {
	it("takes input on a parked thread, and on one not started yet", () => {
		expect(
			composerState({ status: "ready", session: parked, events: [] }, false),
		).toEqual({ locked: false, ended: false });
		expect(composerState({ status: "new" }, false)).toEqual({
			locked: false,
			ended: false,
		});
		expect(composerState(undefined, false)).toEqual({
			locked: false,
			ended: false,
		});
	});

	it("holds input while a turn is in flight, from either side", () => {
		expect(
			composerState({ status: "ready", session: parked, events: [] }, true)
				.locked,
		).toBe(true);
		expect(
			composerState(
				{ status: "working", session: unparked, events: [] },
				false,
			),
		).toEqual({ locked: true, ended: false });
	});

	it("says an ended thread is ended rather than merely busy", () => {
		expect(
			composerState({ status: "ended", session: unparked, events: [] }, false),
		).toEqual({ locked: true, ended: true });
	});

	it("lets somebody type when the agent could not be reached", () => {
		expect(composerState({ status: "offline", events: [] }, false)).toEqual({
			locked: false,
			ended: false,
		});
	});
});

describe("eventsOf", () => {
	it("renders the transcript in every state that has one", () => {
		const events = [event("message.completed")];

		expect(eventsOf({ status: "offline", events })).toEqual(events);
		expect(eventsOf({ status: "ended", session: unparked, events })).toEqual(
			events,
		);
		expect(eventsOf({ status: "new" })).toEqual([]);
		expect(eventsOf(undefined)).toEqual([]);
	});
});

describe("record context", () => {
	it("asks about the thing you are actually looking at", () => {
		expect(recordCopy("contact").title).toBe("Ask about this person");
		expect(recordCopy("company").title).toBe("Ask about this company");
		expect(recordCopy("deal").title).toBe("Ask about this deal");
	});

	it("offers questions that suit the record", () => {
		expect(recordCopy("company").suggestions.join(" ")).not.toContain("person");
		expect(recordCopy("deal").suggestions.join(" ")).not.toContain("person");
		expect(recordCopy("contact").suggestions[0]).toBe("Who is this person?");
	});

	it("tells the agent which record it is on", () => {
		expect(recordHeader({ kind: "contact", id: "c1" })).toEqual({
			"x-crm-contact": "c1",
		});
		expect(recordHeader({ kind: "company", id: "co1" })).toEqual({
			"x-crm-company": "co1",
		});
		expect(recordHeader({ kind: "deal", id: "d1" })).toEqual({
			"x-crm-deal": "d1",
		});
	});

	it("files a conversation under one record and no other", () => {
		expect(recordFilter({ kind: "deal", id: "d1" })).toEqual({ dealId: "d1" });
		expect(Object.keys(recordFilter({ kind: "company", id: "co1" }))).toEqual([
			"companyId",
		]);
	});
});

describe("the panel", () => {
	const source = () =>
		readFileSync(
			new URL("../components/crm/agent-panel.tsx", import.meta.url),
			"utf8",
		);

	it("takes its copy from the record, never from a literal", () => {
		for (const kind of ["contact", "company", "deal"] as const) {
			const copy = recordCopy(kind);
			for (const literal of [copy.title, copy.blurb, copy.placeholder]) {
				expect(source()).not.toContain(literal);
			}
		}
	});

	it("offers a way out of a thread that has ended", () => {
		expect(source()).toContain("Start a new conversation");
		expect(source()).toContain("onClick={onNewThread}");
	});
});

describe("the record sheet", () => {
	it("keeps the agent tab mounted behind the others", () => {
		for (const sheet of ["contact", "company", "deal"]) {
			const source = readFileSync(
				new URL(
					`../components/crm/record-sheet/${sheet}-sheet.tsx`,
					import.meta.url,
				),
				"utf8",
			);

			expect(source).toContain("keepMounted: true");
		}

		const sheet = readFileSync(
			new URL("../components/detail-sheet.tsx", import.meta.url),
			"utf8",
		);

		expect(sheet).toContain("tab.keepMounted && opened.has(tab.value)");
		expect(sheet).toContain("data-[state=inactive]:hidden");
	});
});

describe("loadThread through a gateway", () => {
	async function reads(
		host: string | undefined,
		headers: Record<string, string>,
	): Promise<{ path: string; headers: Record<string, string> }> {
		const real = globalThis.fetch;
		const seen: { path: string; headers: Record<string, string> }[] = [];
		globalThis.fetch = (async (
			input: RequestInfo | URL,
			init?: RequestInit,
		) => {
			const url = String(input instanceof Request ? input.url : input);
			seen.push({
				path: url.replace(/^https?:\/\/[^/]+/, "").split("?")[0] ?? "",
				headers: Object.fromEntries(
					new Headers(
						input instanceof Request ? input.headers : init?.headers,
					).entries(),
				),
			});
			return Response.json({ error: "nope" }, { status: 403 });
		}) as typeof fetch;
		try {
			const thread =
				host === undefined
					? await loadThread("wrun_1", headers)
					: await loadThread("wrun_1", headers, undefined, host);
			expect(thread.status).toBe("offline");
		} finally {
			globalThis.fetch = real;
		}
		const first = seen[0];
		if (!first) throw new Error("loadThread never reached the gateway");
		return first;
	}

	it("keeps the CRM agent on the old gateway when no host is given", async () => {
		const call = await reads(undefined, { "x-crm-deal": "d1" });

		expect(call.path).toBe("/eve/v1/session/wrun_1/stream");
		expect(call.headers["x-crm-deal"]).toBe("d1");
	});

	it("sends the drafting session through the OKR gateway with its cuộc", async () => {
		const call = await reads(OKR_SOAN_CUA.host, okrSoanHeader("c1"));

		expect(call.path).toBe("/eve/agents/okr/eve/v1/session/wrun_1/stream");
		expect(call.headers[OKR_SOAN_CUA.header]).toBe("c1");
	});
});
