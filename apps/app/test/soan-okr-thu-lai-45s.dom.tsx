import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import {
	bam,
	batDongHoGia,
	CUOC,
	cho,
	daDung,
	daGui,
	datAgent,
	datDanhSach,
	datLai,
	don,
	m,
	moMan,
	q,
	SOAN_UI,
	tatDongHoGia,
	troi,
	tuyChonAgent,
} from "./khung-soan-okr";

const LOI_BAN = "eve session is already processing a turn.";
const pushThat = daGui.push;
function tuChoiGui(bat: boolean): void {
	daGui.push = bat
		? () => {
				throw new Error(LOI_BAN);
			}
		: pushThat;
}

const PHIEN = CUOC.sessionId;
const DUONG_HUY = `${OKR_SOAN_CUA.host}/eve/v1/session/${PHIEN}/cancel`;
const LUOT = "luot-1";

type Snap = Parameters<
	NonNullable<(typeof tuyChonAgent)[number]["onFinish"]>
>[0];
type SuKien = Snap["events"][number];

const SU_KIEN_DAU = [
	{ type: "turn.started", data: { sequence: 0, turnId: "luot-0" } },
	{
		type: "message.received",
		data: { message: "tin", sequence: 1, turnId: LUOT },
	},
	{ type: "turn.started", data: { sequence: 2, turnId: LUOT } },
];
const HUY = { type: "turn.cancelled", data: { sequence: 3, turnId: LUOT } };
const DO = {
	type: "session.waiting",
	data: { continuationToken: "eve:moi", wait: "next-user-message" },
};

type CheDoHuy = { kieu: "tra"; status: number; than: object } | { kieu: "nem" };
const HUY_NHAN: CheDoHuy = {
	kieu: "tra",
	status: 202,
	than: { ok: true, sessionId: PHIEN, status: "accepted" },
};

type YeuCauHuy = {
	url: string;
	method: string;
	cuoc: string | null;
	than: object;
};
const daHuy: YeuCauHuy[] = [];
let traHuy: Array<() => void> = [];
let giuHuy = false;
let cheDoHuy: CheDoHuy = HUY_NHAN;
const fetchThat = globalThis.fetch;

async function fetchGia(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const url = String(input);
	if (!url.endsWith("/cancel")) return Response.json({});
	const headers = new Headers(init?.headers);
	daHuy.push({
		url,
		method: init?.method ?? "GET",
		cuoc: headers.get(OKR_SOAN_CUA.header),
		than: JSON.parse(String(init?.body ?? "null")),
	});
	if (giuHuy) await new Promise<void>((xong) => traHuy.push(xong));
	if (cheDoHuy.kieu === "nem") throw new TypeError("Failed to fetch");
	return Response.json(cheDoHuy.than, { status: cheDoHuy.status });
}

beforeEach(() => {
	datLai();
	daHuy.length = 0;
	traHuy = [];
	giuHuy = false;
	cheDoHuy = HUY_NHAN;
	tuChoiGui(false);
	globalThis.fetch = fetchGia as typeof fetch;
});
afterEach(async () => {
	globalThis.fetch = fetchThat;
	tuChoiGui(false);
	tatDongHoGia();
	await don();
});

const moTa = () =>
	q('[data-luot="loi"] [aria-live="polite"]')?.textContent ?? "";
const nutThu = () => q('[data-nut="thu-lai"]') as HTMLButtonElement | null;
const coLoi = () => q('[data-luot="loi"]') !== null;

async function moManQua45s(suKien = SU_KIEN_DAU): Promise<void> {
	batDongHoGia();
	datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
	await moMan();
	await datAgent({
		status: "streaming",
		error: undefined,
		events: suKien,
		session: {
			sessionId: PHIEN,
			continuationToken: "eve:tiep",
			streamIndex: suKien.length,
		},
	});
	await troi(SOAN_UI.hanKhongSuKienMs + 200);
	await cho(() => moTa().includes(m.hoiThoai.loiMoTa), "cho qua 45 giay");
}

function snap(them: readonly object[], status: Snap["status"]): Snap {
	return {
		status,
		error: undefined,
		events: [...SU_KIEN_DAU, ...them] as SuKien[],
		data: { messages: [] },
		session: {
			sessionId: PHIEN,
			continuationToken: "eve:moi",
			streamIndex: SU_KIEN_DAU.length + them.length,
		},
	} as Snap;
}

const KHEP = {
	huy: () => snap([HUY, DO], "ready"),
	thuong: () => snap([DO], "ready"),
	loi: () => snap([], "error"),
};

async function khep(kieu: keyof typeof KHEP = "huy"): Promise<void> {
	await act(async () => {
		tuyChonAgent.at(-1)?.onFinish?.(KHEP[kieu]());
	});
	await troi(20);
}

async function traLoiHuy(): Promise<void> {
	await act(async () => {
		for (const tra of traHuy.splice(0)) tra();
		await Promise.resolve();
	});
	await troi(20);
}

async function khepVaHuy(): Promise<void> {
	await act(async () => {
		for (const tra of traHuy.splice(0)) tra();
		tuyChonAgent.at(-1)?.onFinish?.(KHEP.huy());
	});
	await troi(20);
}

describe("huy-truoc-gui", () => {
	test("huy-truoc-gui: bam khi ban thi huy dung luot qua cua, khong stop, chua gui lai", async () => {
		await moManQua45s();
		const guiTruoc = daGui.length;
		const dungTruoc = daDung;
		await bam(nutThu());
		await troi(20);
		expect(daHuy.length, "huy-truoc-gui khong huy").toBe(1);
		expect(daHuy[0]?.url).toBe(DUONG_HUY);
		expect(daHuy[0]?.method).toBe("POST");
		expect(daHuy[0]?.cuoc).toBe(CUOC.id);
		expect(daHuy[0]?.than, "thieu-turn-id").toEqual({ turnId: LUOT });
		expect(daDung, "goi-stop").toBe(dungTruoc);
		expect(daGui.length, "gui-lai-truoc-khi-khep").toBe(guiTruoc);
	});

	test("huy-truoc-gui: turn.started truoc message.received cuoi khong duoc dung", async () => {
		await moManQua45s(SU_KIEN_DAU.slice(0, 2));
		await bam(nutThu());
		await troi(20);
		expect(daHuy.length).toBe(1);
		expect(daHuy[0]?.than, "turn-id-cu").toEqual({});
	});

	test("huy-truoc-gui: doi chung phien khong ban thi gui lai ngay, khong huy", async () => {
		batDongHoGia();
		datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
		await moMan();
		await datAgent({
			status: "error",
			error: Object.assign(new Error("loi http"), { status: 502 }),
			session: {
				sessionId: PHIEN,
				continuationToken: "eve:tiep",
				streamIndex: 0,
			},
		});
		await cho(() => nutThu() !== null, "cho bao loi");
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(20);
		expect(daHuy.length, "huy-khi-khong-ban").toBe(0);
		expect(daGui.length).toBe(guiTruoc + 1);
	});
});

describe("gui-lai-sau-khep", () => {
	const THU_TU = [
		{ ten: "khep-truoc", buoc: ["khep", "huy"] },
		{ ten: "huy-truoc", buoc: ["huy", "khep"] },
		{ ten: "huy-treo", buoc: ["khep", "treo", "huy"] },
		{ ten: "cung-luc", buoc: ["ca-hai"] },
	] as const;
	for (const ca of THU_TU) {
		test(`gui-lai-sau-khep: ${ca.ten}`, async () => {
			giuHuy = true;
			await moManQua45s();
			const tin = daGui.at(-1);
			const guiTruoc = daGui.length;
			await bam(nutThu());
			await troi(20);
			const daXong = new Set<string>();
			for (const [i, buoc] of ca.buoc.entries()) {
				if (buoc === "khep") await khep();
				if (buoc === "huy") await traLoiHuy();
				if (buoc === "treo") await troi(SOAN_UI.choKhepMs / 2);
				if (buoc === "ca-hai") await khepVaHuy();
				daXong.add(buoc);
				if (i === ca.buoc.length - 1) continue;
				const thieu = daXong.has("huy") ? "khep" : "huy";
				expect(daGui.length, `gui-lai-truoc-khi-${thieu} ${ca.ten}`).toBe(
					guiTruoc,
				);
			}
			expect(daGui.length, `khong-gui-lai ${ca.ten}`).toBe(guiTruoc + 1);
			expect(daGui.at(-1)).toBe(tin);
			await khep();
			await traLoiHuy();
			expect(daGui.length, "gui-lai-hai-lan").toBe(guiTruoc + 1);
		});
	}

	test("gui-lai-sau-khep: no_active_turn cung la thanh cong", async () => {
		cheDoHuy = {
			kieu: "tra",
			status: 202,
			than: { ok: true, sessionId: PHIEN, status: "no_active_turn" },
		};
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(20);
		await khep();
		expect(daGui.length, "khong-gui-lai no-active-turn").toBe(guiTruoc + 1);
	});

	test("gui-lai-sau-khep: luot cu tu xong thi khong gui lai, bao loi tat", async () => {
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(20);
		await datAgent({ status: "ready", error: undefined });
		await khep("thuong");
		expect(daGui.length, "gui-lai-khi-khep-thuong").toBe(guiTruoc);
		expect(coLoi(), "bao-loi-con-khi-khep-thuong").toBe(false);
	});

	test("gui-lai-sau-khep: khep khong co moc thi khong gui lai, bao chua gui lai", async () => {
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(20);
		await khep("loi");
		expect(daGui.length, "gui-lai-khi-khep-loi").toBe(guiTruoc);
		expect(moTa(), "im-khi-khep-loi").toContain(m.hoiThoai.chuaGuiLai);
	});
});

describe("dang-cho-khep", () => {
	test("dang-cho-khep: hoi am huy muon cua chuoi truoc khong cham chuoi moi", async () => {
		giuHuy = true;
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(SOAN_UI.choKhepMs + 200);
		await datAgent({ status: "streaming", error: undefined });
		await bam(nutThu());
		await troi(20);
		expect(daHuy.length).toBe(2);
		const muon = traHuy.shift();
		await act(async () => {
			muon?.();
			await Promise.resolve();
		});
		await troi(20);
		await khep();
		expect(daGui.length, "hoi-am-muon-cham-chuoi-moi").toBe(guiTruoc);
		await traLoiHuy();
		expect(daGui.length).toBe(guiTruoc + 1);
	});

	test("dang-cho-khep: trong luc cho van hien bao loi, nut khoa, dem 1", async () => {
		giuHuy = true;
		await moManQua45s();
		await bam(nutThu());
		await troi(20);
		expect(coLoi(), "bao-loi-mat-khi-cho").toBe(true);
		expect(nutThu()?.disabled, "bao-loi-mat-khi-cho nut").toBe(true);
		expect(moTa()).toContain(m.hoiThoai.daThuLai("1"));
		expect(moTa()).toContain(m.hoiThoai.loiMoTa);
		expect(daDung, "goi-stop khi cho").toBe(0);
	});

	test("dang-cho-khep: qua tran thi dung luong, bao chua gui lai, bam tiep gui thang", async () => {
		giuHuy = true;
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(SOAN_UI.choKhepMs + 200);
		expect(moTa(), "khoa-mai").toContain(m.hoiThoai.chuaGuiLai);
		expect(nutThu()?.disabled, "khoa-mai nut").toBe(false);
		expect(daDung, "khong-loi-thoat").toBe(1);
		expect(daGui.length).toBe(guiTruoc);
		await datAgent({ status: "ready", error: undefined });
		await bam(nutThu());
		await troi(20);
		expect(daHuy.length, "lap-vong-huy").toBe(1);
		expect(daGui.length).toBe(guiTruoc + 1);
	});
});

describe("gui-lai-bi-tu-choi", () => {
	test("gui-lai-bi-tu-choi: luot mo dau bi tu choi khong bao chua gui lai", async () => {
		batDongHoGia();
		tuChoiGui(true);
		datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
		await moMan();
		await troi(50);
		tuChoiGui(false);
		expect(coLoi(), "bao-chua-gui-lai-oan").toBe(false);
	});

	async function guiLaiBiTuChoi(): Promise<number> {
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(20);
		tuChoiGui(true);
		await khep();
		tuChoiGui(false);
		await troi(50);
		expect(moTa(), "gui-lai-im").toContain(m.hoiThoai.chuaGuiLai);
		expect(moTa()).toContain(m.hoiThoai.daThuLai("1"));
		expect(nutThu()?.disabled).toBe(false);
		return guiTruoc;
	}

	test("gui-lai-bi-tu-choi: phien con ban thi bam tiep huy lai", async () => {
		const guiTruoc = await guiLaiBiTuChoi();
		await datAgent({ status: "streaming", error: undefined });
		await bam(nutThu());
		await troi(20);
		expect(daHuy.length, "khong-huy-lai-khi-ban").toBe(2);
		expect(daGui.length).toBe(guiTruoc);
		expect(moTa()).toContain(m.hoiThoai.daThuLai("2"));
	});

	test("gui-lai-bi-tu-choi: phien ranh thi bam tiep gui thang, khong huy", async () => {
		const guiTruoc = await guiLaiBiTuChoi();
		await datAgent({ status: "ready", error: undefined });
		await bam(nutThu());
		await troi(20);
		expect(daHuy.length, "huy-thua-khi-ranh").toBe(1);
		expect(daGui.length).toBe(guiTruoc + 1);
		expect(moTa(), "chua-gui-lai-con-sau-khi-gui").not.toContain(
			m.hoiThoai.chuaGuiLai,
		);
	});

	const HUY_HONG: Array<{ ten: string; che: CheDoHuy }> = [
		{
			ten: "status-500",
			che: {
				kieu: "tra",
				status: 500,
				than: { ok: false, error: "Failed to cancel the turn." },
			},
		},
		{
			ten: "than-la",
			che: { kieu: "tra", status: 202, than: { ok: true, status: "la" } },
		},
		{
			ten: "phien-khac",
			che: {
				kieu: "tra",
				status: 202,
				than: { ok: true, sessionId: "phien-khac", status: "accepted" },
			},
		},
		{ ten: "mat-mang", che: { kieu: "nem" } },
	];
	for (const ca of HUY_HONG) {
		test(`gui-lai-bi-tu-choi: huy hong ${ca.ten} thi bao chua gui lai, khong gui bua`, async () => {
			cheDoHuy = ca.che;
			await moManQua45s();
			const guiTruoc = daGui.length;
			await bam(nutThu());
			await troi(20);
			await khep();
			expect(daGui.length, `gui-bua-khi-huy-hong ${ca.ten}`).toBe(guiTruoc);
			expect(moTa(), `im-khi-huy-hong ${ca.ten}`).toContain(
				m.hoiThoai.chuaGuiLai,
			);
			expect(nutThu()?.disabled).toBe(false);
		});
	}
});
