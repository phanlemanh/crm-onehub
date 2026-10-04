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

type YeuCauHuy = { url: string; method: string; cuoc: string | null };
const daHuy: YeuCauHuy[] = [];
let traHuy: Array<() => void> = [];
let giuHuy = false;
const fetchThat = globalThis.fetch;

function fetchGia(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const url = String(input);
	if (!url.endsWith("/cancel")) return Promise.resolve(Response.json({}));
	const headers = new Headers(init?.headers);
	daHuy.push({
		url,
		method: init?.method ?? "GET",
		cuoc: headers.get(OKR_SOAN_CUA.header),
	});
	const tra = Response.json({ status: "accepted" });
	if (!giuHuy) return Promise.resolve(tra);
	return new Promise((xong) => {
		traHuy.push(() => xong(tra));
	});
}

const PHIEN = CUOC.sessionId;
const DUONG_HUY = `${OKR_SOAN_CUA.host}/eve/v1/session/${PHIEN}/cancel`;

beforeEach(() => {
	datLai();
	daHuy.length = 0;
	traHuy = [];
	giuHuy = false;
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

async function moManQua45s(): Promise<void> {
	batDongHoGia();
	datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
	await moMan();
	await datAgent({
		status: "streaming",
		error: undefined,
		session: {
			sessionId: PHIEN,
			continuationToken: "eve:tiep",
			streamIndex: 0,
		},
	});
	await troi(SOAN_UI.hanKhongSuKienMs + 200);
	await cho(() => moTa().includes(m.hoiThoai.loiMoTa), "cho qua 45 giay");
}

const KHEP = {
	status: "ready",
	error: undefined,
	events: [],
	data: { messages: [] },
	session: { sessionId: PHIEN, continuationToken: "eve:tiep", streamIndex: 0 },
} as const;

async function khep(): Promise<void> {
	await act(async () => {
		tuyChonAgent.at(-1)?.onFinish?.(KHEP);
	});
	await troi(20);
}

async function khepVaHuy(): Promise<void> {
	await act(async () => {
		for (const tra of traHuy.splice(0)) tra();
		tuyChonAgent.at(-1)?.onFinish?.(KHEP);
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

describe("huy-truoc-gui", () => {
	test("huy-truoc-gui: bam khi ban thi huy qua cua, dung luong, chua gui lai", async () => {
		await moManQua45s();
		const guiTruoc = daGui.length;
		const dungTruoc = daDung;
		await bam(nutThu());
		await troi(20);
		expect(daHuy, "huy-truoc-gui khong huy").toEqual([
			{ url: DUONG_HUY, method: "POST", cuoc: CUOC.id },
		]);
		expect(daDung, "huy-truoc-gui khong dung").toBe(dungTruoc + 1);
		expect(daGui.length, "gui-lai-truoc-khi-khep").toBe(guiTruoc);
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
		expect(daHuy, "huy-khi-khong-ban").toEqual([]);
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
});

describe("dang-cho-khep", () => {
	test("dang-cho-khep: trong luc cho van hien bao loi, nut khoa, dem 1", async () => {
		giuHuy = true;
		await moManQua45s();
		await bam(nutThu());
		await datAgent({ status: "ready", error: undefined });
		expect(q('[data-luot="loi"]'), "bao-loi-mat-khi-cho").not.toBeNull();
		expect(nutThu()?.disabled, "bao-loi-mat-khi-cho nut").toBe(true);
		expect(moTa()).toContain(m.hoiThoai.daThuLai("1"));
		expect(moTa()).toContain(m.hoiThoai.loiMoTa);
	});

	test("dang-cho-khep: qua tran cho khep thi bao chua gui lai va mo nut", async () => {
		giuHuy = true;
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await datAgent({ status: "ready", error: undefined });
		await troi(SOAN_UI.choKhepMs + 200);
		expect(moTa(), "khoa-mai").toContain(m.hoiThoai.chuaGuiLai);
		expect(nutThu()?.disabled, "khoa-mai nut").toBe(false);
		expect(daGui.length).toBe(guiTruoc);
	});
});

describe("gui-lai-bi-tu-choi", () => {
	async function guiLaiBiTuChoi(): Promise<number> {
		await moManQua45s();
		const guiTruoc = daGui.length;
		await bam(nutThu());
		await troi(20);
		tuChoiGui(true);
		await khep();
		tuChoiGui(false);
		await cho(() => moTa().includes(m.hoiThoai.chuaGuiLai), "cho chua gui lai");
		expect(moTa(), "gui-lai-im").toContain(m.hoiThoai.daThuLai("1"));
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
});
