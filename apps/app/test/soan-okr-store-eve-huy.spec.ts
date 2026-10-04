import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import {
	defaultMessageReducer,
	EveAgentStore,
	type EveAgentStoreStatus,
} from "eve/client";

const HOST = "http://eve-that.test";
const CHO_TOI_DA_MS = 3_000;
const PHIEN = "phien-store-that";
const TRA_LOI_MOI = "tra loi luot moi";
const LOI_BAN = "eve session is already processing a turn.";

type DuLieu = { readonly [khoa: string]: string | number };
type SuKienSo = { type: string; data: DuLieu };
type May = {
	so: SuKienSo[];
	token: string;
	doiToken: boolean;
	soLuot: number;
	nghe: Set<() => void>;
	daGuiTiep: string[];
};

let may: May;

function moi(doiToken: boolean): May {
	return {
		so: [],
		token: "eve:dau",
		doiToken,
		soLuot: 0,
		nghe: new Set(),
		daGuiTiep: [],
	};
}

function ghi(type: string, data: DuLieu): void {
	may.so.push({ type, data });
	for (const f of may.nghe) f();
}

function batDauLuot(tin: string): string {
	may.soLuot += 1;
	const luot = `luot-${may.soLuot}`;
	ghi("message.received", { message: tin, sequence: 0, turnId: luot });
	ghi("turn.started", { sequence: 1, turnId: luot });
	return luot;
}

function dangBan(): boolean {
	const cuoi = may.so.findLastIndex((e) => e.type === "turn.started");
	return (
		cuoi >= 0 && !may.so.slice(cuoi).some((e) => e.type === "session.waiting")
	);
}

function ghiMocKhep(): void {
	const luot = `luot-${may.soLuot}`;
	if (may.doiToken) may.token = "eve:moi";
	ghi("turn.cancelled", { sequence: 2, turnId: luot });
	ghi("session.waiting", {
		continuationToken: may.token,
		wait: "next-user-message",
	});
}

function dong(i: number): Uint8Array {
	const e = may.so[i];
	return new TextEncoder().encode(
		`${JSON.stringify({ ...e, meta: { id: `evt-${i}`, at: new Date(i).toISOString() } })}\n`,
	);
}

function luong(tu: number, signal: AbortSignal | null | undefined): Response {
	let da = tu;
	let nghe: (() => void) | null = null;
	const body = new ReadableStream<Uint8Array>({
		start(dk) {
			const day = () => {
				while (da < may.so.length) {
					dk.enqueue(dong(da));
					da += 1;
				}
			};
			const huy = () => {
				if (nghe) may.nghe.delete(nghe);
				dk.error(signal?.reason ?? new DOMException("abort", "AbortError"));
			};
			if (signal?.aborted) return huy();
			signal?.addEventListener("abort", huy);
			nghe = day;
			may.nghe.add(day);
			day();
		},
		cancel() {
			if (nghe) may.nghe.delete(nghe);
		},
	});
	return new Response(body, {
		status: 200,
		headers: { "content-type": "application/x-ndjson" },
	});
}

async function fetchGia(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const url = new URL(String(input instanceof Request ? input.url : input));
	const method = init?.method ?? "GET";
	if (url.pathname.endsWith("/stream"))
		return luong(Number(url.searchParams.get("startIndex") ?? 0), init?.signal);
	const than = JSON.parse(String(init?.body ?? "{}"));
	if (method === "POST" && url.pathname === "/eve/v1/session") {
		batDauLuot(than.message);
		return Response.json(
			{ ok: true, sessionId: PHIEN, continuationToken: may.token },
			{ status: 202, headers: { "x-eve-session-id": PHIEN } },
		);
	}
	if (method === "POST" && url.pathname === `/eve/v1/session/${PHIEN}`) {
		may.daGuiTiep.push(than.continuationToken);
		if (dangBan() || than.continuationToken !== may.token)
			return Response.json({ ok: false, error: LOI_BAN }, { status: 409 });
		const luot = batDauLuot(than.message);
		setTimeout(() => {
			ghi("message.completed", {
				message: TRA_LOI_MOI,
				finishReason: "stop",
				sequence: 2,
				stepIndex: 0,
				turnId: luot,
			});
			ghi("session.waiting", {
				continuationToken: may.token,
				wait: "next-user-message",
			});
		}, 20);
		return Response.json(
			{ ok: true, sessionId: PHIEN },
			{ status: 200, headers: { "x-eve-session-id": PHIEN } },
		);
	}
	return Response.json({ ok: false }, { status: 404 });
}

const fetchThat = globalThis.fetch;
beforeAll(() => {
	globalThis.fetch = fetchGia as typeof fetch;
});
afterAll(() => {
	globalThis.fetch = fetchThat;
});
beforeEach(() => {
	may = moi(true);
});

type GhiKhep = { status: EveAgentStoreStatus; sauMoc: boolean };

function taoStore() {
	return new EveAgentStore({ host: HOST, reducer: defaultMessageReducer() });
}

async function choDen(dieuKien: () => boolean, moTa: string): Promise<void> {
	const het = Date.now() + CHO_TOI_DA_MS;
	while (Date.now() < het) {
		if (dieuKien()) return;
		await new Promise((xong) => setTimeout(xong, 10));
	}
	throw new Error(moTa);
}

type Store = ReturnType<typeof taoStore>;

const coTraLoiMoi = (store: Store) =>
	JSON.stringify(store.snapshot.data).includes(TRA_LOI_MOI);
const daDocLuot = (store: Store) =>
	store.snapshot.events.some((e) => e.type === "turn.started");

describe("store-eve-huy", () => {
	test("store-eve-huy: khong stop thi onFinish chi chay sau moc khep, gui lai doc duoc luot moi", async () => {
		const store = taoStore();
		const khep: GhiKhep[] = [];
		let daGhiMoc = false;
		let guiLai: Promise<void> | null = null;
		let loiGuiLai: string | null = null;
		store.setCallbacks({
			onFinish: (snap) => {
				khep.push({ status: snap.status, sauMoc: daGhiMoc });
				if (guiLai) return;
				guiLai = store.send({ message: "tin cu" }).catch((e: Error) => {
					loiGuiLai = e.message;
				});
			},
		});
		const gui = store.send({ message: "tin cu" });
		await choDen(() => daDocLuot(store), "chua doc luot");
		await new Promise((xong) => setTimeout(xong, 100));
		expect(khep.length, "onfinish-som").toBe(0);
		daGhiMoc = true;
		ghiMocKhep();
		await choDen(() => khep.length > 0, "onfinish-khong-goi");
		await gui;
		expect(khep[0], "onfinish-khong-goi").toEqual({
			status: "ready",
			sauMoc: true,
		});
		await choDen(() => coTraLoiMoi(store), "luot-moi-khong-hien");
		expect(loiGuiLai).toBeNull();
		expect(may.daGuiTiep, "token-cu").toEqual(["eve:moi"]);
		expect(khep.length).toBe(2);
		await guiLai;
	});

	test("store-eve-huy: doi chung cach cu stop roi gui lai thi mat cau tra loi moi", async () => {
		may = moi(false);
		const store = taoStore();
		let khep = 0;
		store.setCallbacks({ onFinish: () => (khep += 1) });
		const gui = store.send({ message: "tin cu" });
		await choDen(() => daDocLuot(store), "chua doc luot");
		store.stop();
		await choDen(() => khep === 1, "onfinish-khong-goi sau stop");
		await gui;
		ghiMocKhep();
		await store.send({ message: "tin cu" });
		await choDen(() => khep === 2, "gui lai khong khep");
		await new Promise((xong) => setTimeout(xong, 200));
		expect(may.daGuiTiep, "doi-chung-gui-lai-bi-tu-choi").toEqual(["eve:dau"]);
		expect(store.snapshot.status).toBe("ready");
		expect(coTraLoiMoi(store), "doi-chung-khong-tai-hien").toBe(false);
	});

	test("store-eve-huy: gui lan hai khi phien con ban thi nem dung loi goc", async () => {
		const store = taoStore();
		const gui = store.send({ message: "tin dau" });
		await choDen(() => daDocLuot(store), "chua doc luot");
		const loi = await store
			.send({ message: "gui lai som" })
			.then(() => null)
			.catch((e: Error) => e.message);
		expect(loi, "doi-chung-loi-goc").toBe(LOI_BAN);
		ghiMocKhep();
		await gui;
	});
});
