import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	defaultMessageReducer,
	EveAgentStore,
	type EveAgentStoreStatus,
} from "eve/client";

const HOST = "http://eve-that.test";
const CHO_TOI_DA_MS = 3_000;
const PHIEN = "phien-store-that";

const fetchThat = globalThis.fetch;
let soPost = 0;

function luongTreo(signal: AbortSignal | null | undefined): Response {
	const luong = new ReadableStream<Uint8Array>({
		start(dong) {
			const huy = () =>
				dong.error(signal?.reason ?? new DOMException("abort", "AbortError"));
			if (signal?.aborted) huy();
			else signal?.addEventListener("abort", huy);
		},
	});
	return new Response(luong, {
		status: 200,
		headers: { "content-type": "application/x-ndjson" },
	});
}

function fetchGia(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const url = String(input instanceof Request ? input.url : input);
	const method =
		init?.method ?? (input instanceof Request ? input.method : "GET");
	if (method === "POST") {
		soPost += 1;
		return Promise.resolve(
			Response.json(
				{ ok: true, sessionId: PHIEN, continuationToken: `eve:${PHIEN}` },
				{ status: 202, headers: { "x-eve-session-id": PHIEN } },
			),
		);
	}
	if (url.includes("/stream")) return Promise.resolve(luongTreo(init?.signal));
	return Promise.resolve(Response.json({ ok: true }));
}

beforeAll(() => {
	globalThis.fetch = fetchGia as typeof fetch;
});
afterAll(() => {
	globalThis.fetch = fetchThat;
});

type GhiKhep = { status: EveAgentStoreStatus; luc: number };

function taoStore() {
	const khep: GhiKhep[] = [];
	const store = new EveAgentStore({
		host: HOST,
		reducer: defaultMessageReducer(),
	});
	store.setCallbacks({
		onFinish: (snap) => khep.push({ status: snap.status, luc: khep.length }),
	});
	return { store, khep };
}

async function choDen(dieuKien: () => boolean, moTa: string): Promise<void> {
	const het = Date.now() + CHO_TOI_DA_MS;
	while (Date.now() < het) {
		if (dieuKien()) return;
		await new Promise((xong) => setTimeout(xong, 10));
	}
	throw new Error(moTa);
}

describe("store-eve-huy", () => {
	test("store-eve-huy: stop() dan toi onFinish voi trang thai ready, dung mot lan", async () => {
		const { store, khep } = taoStore();
		soPost = 0;
		const gui = store.send({ message: "tin dau" });
		await choDen(
			() => store.snapshot.status === "submitted" && soPost > 0,
			"chua gui",
		);
		store.stop();
		await gui;
		await choDen(() => khep.length > 0, "onfinish-khong-goi");
		expect(khep, "onfinish-khong-goi").toEqual([{ status: "ready", luc: 0 }]);
		expect(store.snapshot.status).toBe("ready");
	});

	test("store-eve-huy: gui ngay sau stop thi nem dung loi goc cua Ngoai-3", async () => {
		const { store } = taoStore();
		soPost = 0;
		const gui = store.send({ message: "tin dau" });
		await choDen(
			() => store.snapshot.status === "submitted" && soPost > 0,
			"chua gui",
		);
		store.stop();
		const loi = await store
			.send({ message: "gui lai som" })
			.then(() => null)
			.catch((e: Error) => e.message);
		expect(loi, "doi-chung-loi-goc").toBe(
			"eve session is already processing a turn.",
		);
		await gui;
	});

	test("store-eve-huy: gui trong onFinish sau stop thi khong nem", async () => {
		const { store } = taoStore();
		let loiTrongKhep: string | null = "chua-chay";
		let guiLai: Promise<void> | null = null;
		store.setCallbacks({
			onFinish: () => {
				if (guiLai) return;
				guiLai = store.send({ message: "gui lai sau khep" });
				loiTrongKhep = null;
				guiLai.catch((e: Error) => {
					loiTrongKhep = e.message;
				});
			},
		});
		soPost = 0;
		const gui = store.send({ message: "tin dau" });
		await choDen(
			() => store.snapshot.status === "submitted" && soPost > 0,
			"chua gui",
		);
		store.stop();
		await gui;
		await choDen(() => guiLai !== null, "onfinish-khong-goi");
		await choDen(
			() => store.snapshot.status === "submitted",
			"gui-lai-khong-chay",
		);
		expect(loiTrongKhep, "gui-trong-khep-nem").toBeNull();
		store.stop();
		await guiLai;
	});
});
