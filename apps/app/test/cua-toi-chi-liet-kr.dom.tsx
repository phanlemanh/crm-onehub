import { describe, expect, test } from "bun:test";
import { duongCapNhatKr } from "@crm/validation/okr-cap-nhat";
import {
	type CapNhatTuanOutput,
	capNhatTuanOutput,
	cyclesOutput,
	type MucTieuOutput,
	mineOutput,
	viecCuaToiOutput,
} from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	CuaToi,
	cho,
	daBoTu,
	dung,
	kho,
	kr,
	mucTieu,
	nhip,
	okrMessages,
	type San,
} from "./okr-don-san";

const { dichKrTrongBo } = await import("@/lib/okr-duong-kr");
const { giaTri } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { ViecOkrCuaToi } = await import("@/app/(app)/[slug]/okr/viec-cua-toi");
const { KhoiKrCuaToi } = await import("@/app/(app)/[slug]/okr/khoi-kr-cua-toi");

type Muc = CapNhatTuanOutput["items"][number];

function kiem(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function krTuan(
	id: string,
	o: { daGui?: boolean; don?: "pb" | "bp"; lastAt?: string | null } = {},
): Muc {
	const don = o.don ?? "pb";
	const daGui = o.daGui ?? false;
	return {
		keyResultId: id,
		title: `KR tuan ${id}`,
		objectiveId: `mt-${don}`,
		objectiveTitle: don === "pb" ? "Tăng trưởng quý 4" : "Mở rộng vùng",
		unitName: don === "pb" ? "Kinh doanh vùng 1" : "Kinh doanh",
		donOkr: don === "pb" ? "pb:pb-1" : "bp:bp-1",
		cycleId: "q4",
		kind: "tang-toi",
		unit: "khách",
		targetValue: 50,
		currentValue: 12,
		lastConfidence: daGui ? "cao" : "vua",
		lastAt:
			o.lastAt === undefined
				? daGui
					? "2026-10-13T03:00:00.000Z"
					: "2026-10-06T03:00:00.000Z"
				: o.lastAt,
		updatedThisWeek: daGui,
		nguon: "tay",
		doCanh: false,
		soMay: null,
	};
}

const tuan = (items: Muc[]) =>
	capNhatTuanOutput.parse({ items, weekStart: "2026-10-12", dueWeekday: 5 });

const BA_THIEU = tuan([krTuan("a"), krTuan("b", { don: "bp" }), krTuan("c")]);
const MOT_THIEU = tuan([
	krTuan("a"),
	krTuan("b", { daGui: true }),
	krTuan("c", { daGui: true }),
]);
const CHUA_LAN_NAO = tuan([krTuan("a", { lastAt: null })]);
const DU_HET = tuan([
	krTuan("a", { daGui: true }),
	krTuan("b", { daGui: true }),
	krTuan("c", { daGui: true }),
]);
const KHONG_KR = tuan([]);

function chuKy(id: string, name: string, phase: string) {
	return {
		id,
		kind: "quy",
		name,
		parentId: null,
		startsOn: "2026-07-01",
		endsOn: "2026-12-31",
		phase,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 5,
		cuaSoRa: null,
		anLuc: null,
		anLyDo: null,
		quyConHien: 0,
		viec: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: false,
		},
	};
}
const HAI_KY = cyclesOutput.parse({
	cycles: [
		chuKy("q4", "Quý 4/2026", "dang-chay"),
		chuKy("q3", "Quý 3/2026", "cham-diem"),
	],
	currentId: "q4",
});

function datCoBan(
	du: CapNhatTuanOutput | (() => CapNhatTuanOutput) = BA_THIEU,
) {
	kho.doc.set("okr.cycles", () => HAI_KY);
	kho.doc.set("okr.capNhatTuan", typeof du === "function" ? du : () => du);
}

const phan = (ten: string) =>
	document.body.querySelector<HTMLElement>(`[data-phan="${ten}"]`);
const daTaiPhan1 = () =>
	phan("can-cap-nhat") !== null &&
	phan("can-cap-nhat")?.querySelector("[data-khung-xuong]") === null;
const moPhien = () => kho.daGhi.filter((g) => g.duong === "okr.moCapNhat");
const dongKr = () => [
	...(phan("can-cap-nhat")?.querySelectorAll<HTMLElement>("[data-kr]") ?? []),
];

function lienKet(dong: HTMLElement): HTMLAnchorElement | null {
	return dong instanceof HTMLAnchorElement ? dong : dong.querySelector("a");
}

function ghiBam(): string[] {
	const da: string[] = [];
	document.addEventListener(
		"click",
		(e) => {
			const a = (e.target as Element | null)?.closest("a");
			if (a) {
				da.push(a.getAttribute("href") ?? "");
				e.preventDefault();
			}
		},
		{ capture: true },
	);
	return da;
}

describe("ctlk-phan-mot", () => {
	const MA_TRAN: [string, CapNhatTuanOutput][] = [
		["3 thieu o 2 don vi", BA_THIEU],
		["1 thieu 2 du", MOT_THIEU],
		["1 KR chua co lan nao", CHUA_LAN_NAO],
	];
	for (const locale of ["vi", "en"] as const)
		for (const [ten, du] of MA_TRAN)
			test(`ctlk-phan-mot: ${ten} ${locale}`, async () => {
				datCoBan(du);
				const m = okrMessages(locale).baPhan;
				await dung(<CuaToi />, "", locale);
				await cho(daTaiPhan1, "phan 1 tai xong");
				const p1 = phan("can-cap-nhat");
				const conBang =
					(p1?.querySelector('[data-trang-thai^="ST-capnhat-"]') ?? null) !==
						null ||
					(document.body.querySelector('[data-nut="cap-nhat-tai-cho"]') ??
						null) !== null;
				kiem(!conBang, "ctlk-phan-mot: phan 1 con bang cap nhat hang loat");
				const mong = du.items.filter((k) => !k.updatedThisWeek);
				const dong = dongKr();
				kiem(
					dong.length === mong.length,
					`ctlk-phan-mot: phan 1 co ${dong.length} dong, mong ${mong.length}`,
				);
				const thay = dong.map((d) => ({
					id: d.getAttribute("data-kr"),
					laLienKet: lienKet(d) !== null,
					chu: d.textContent ?? "",
				}));
				expect(thay.map((d) => d.id)).toEqual(mong.map((k) => k.keyResultId));
				for (const [i, k] of mong.entries()) {
					const d = thay[i];
					const lan =
						k.lastAt === null ? m.chuaCapNhatLanNao : m.lanTruoc("06/10");
					expect({
						laLienKet: d?.laLienKet,
						ten: d?.chu.includes(k.title),
						donVi: d?.chu.includes(`${k.unitName} · ${k.objectiveTitle}`),
						so: d?.chu.includes(giaTri(k, k.currentValue, locale)),
						lan: d?.chu.includes(lan),
					}).toEqual({
						laLienKet: true,
						ten: true,
						donVi: true,
						so: true,
						lan: true,
					});
				}
				expect({
					o: document.body.querySelectorAll(
						'input, textarea, [role="spinbutton"]',
					).length,
					suaLanGui: document.body.querySelectorAll('[data-nut="sua-lan-gui"]')
						.length,
					moPhien: moPhien().length,
				}).toEqual({ o: 0, suaLanGui: 0, moPhien: 0 });
			});
});

describe("ctlk-khong-tu", () => {
	for (const tu of ["nhac", "viec-cua-toi", "cua-toi", "tab", "sheet", null])
		test(`ctlk-khong-tu: tu=${tu ?? "(vang)"}`, async () => {
			datCoBan(BA_THIEU);
			await dung(<CuaToi />, tu === null ? "" : `?tu=${tu}`);
			await cho(daTaiPhan1, "phan 1 tai xong");
			await nhip(3);
			const n = moPhien().length;
			if (tu === "nhac")
				kiem(n === 0, `ctlk-khong-tu: tu=nhac mo ${n} luot cap nhat, mong 0`);
			expect({
				moPhien: n,
				dong: dongKr().length,
				canhBao: document.body.querySelectorAll('[role="alert"]').length,
			}).toEqual({ moPhien: 0, dong: 3, canhBao: 0 });
		});
});

describe("ctlk-dong-kr", () => {
	test("ctlk-dong-kr: moi dong tro bo cua KR, bam khong mo tai cho", async () => {
		datCoBan(BA_THIEU);
		const san: San = await dung(<CuaToi />);
		await cho(daTaiPhan1, "phan 1 tai xong");
		const dong = dongKr();
		for (const d of dong) {
			const id = d.getAttribute("data-kr") ?? "";
			const k = BA_THIEU.items.find((x) => x.keyResultId === id);
			const href = lienKet(d)?.getAttribute("href") ?? "";
			const url = new URL(href, "http://x");
			kiem(
				!url.pathname.includes("/okr/kr/") && url.pathname !== "/",
				"ctlk-dong-kr: bam KR mo tai cho, mong sang /ws/okr/kr/<id>",
			);
			kiem(
				url.searchParams.get("record") === `kr:${id}`,
				"ctlk-dong-kr: href tro id sai",
			);
			if (id === "b")
				kiem(
					url.searchParams.get("donOkr") === "bp:bp-1",
					"ctlk-dong-kr: dong 2 tro bo sai don vi",
				);
			expect(href).toBe(
				dichKrTrongBo("ws", id, {
					donOkr: k?.donOkr ?? "",
					cycleId: k?.cycleId ?? "",
				}),
			);
			expect(url.pathname).toBe("/ws/okr/bo-okr");
		}
		const da = ghiBam();
		const thu2 = lienKet(dong[1] as HTMLElement);
		if (!thu2)
			throw new Error(
				"ctlk-dong-kr: bam KR mo tai cho, mong sang /ws/okr/kr/<id>",
			);
		await bamChuot(thu2);
		await nhip(2);
		kiem(
			san.url().get("record") === null,
			"ctlk-dong-kr: bam KR mo tai cho, mong sang /ws/okr/kr/<id>",
		);
		expect({ da, moPhien: moPhien().length }).toEqual({
			da: [thu2.getAttribute("href") ?? ""],
			moPhien: 0,
		});
	});
});

describe("ctlk-viec", () => {
	test("ctlk-viec: nut viec cap nhat theo so KR, khong tu=", async () => {
		const viec = viecCuaToiOutput.parse({
			lienQuanOkr: true,
			viec: [
				{ loai: "okr-cap-nhat", krIds: ["a"], nhan: "KR a", soKr: 1 },
				{
					loai: "okr-cap-nhat",
					krIds: ["a", "b", "c"],
					nhan: "KR a, KR b, KR c",
					soKr: 3,
				},
			],
		});
		kho.doc.set("okr.viecCuaToi", () => viec);
		await dung(
			<ViecOkrCuaToi anKhiLoi={false} khiHien="luon" noi="tong-quan" />,
		);
		await cho(
			() => document.body.querySelector('[data-khoi="viec-okr"] a') !== null,
			"khoi viec hien",
		);
		const href = [
			...document.body.querySelectorAll<HTMLAnchorElement>(
				'[data-khoi="viec-okr"] a',
			),
		].map((a) => a.getAttribute("href") ?? "");
		kiem(
			href.every((h) => !h.includes("tu=")),
			"ctlk-viec: nut viec cap nhat con tu=",
		);
		expect(href).toEqual([
			`/ws${duongCapNhatKr(["a"])}`,
			`/ws${duongCapNhatKr(["a", "b", "c"])}`,
		]);
		expect(href[0]).toBe("/ws/okr/kr/a");
	});
});

describe("ctlk-theo-doi", () => {
	test("ctlk-theo-doi: Cua toi khong con nhom Dang theo doi, Da bo nhu cu", async () => {
		datCoBan(BA_THIEU);
		kho.mine = mineOutput.parse({
			dangTheoDoi: [mucTieu("t1"), mucTieu("t2")],
			objectives: [],
			daBo: [daBoTu("d1")],
		});
		await dung(<CuaToi />);
		await cho(
			() => document.body.querySelector("[data-nhom-da-bo]") !== null,
			"nhom da bo hien",
		);
		const m = okrMessages("vi").khoiMucTieu;
		const conTheoDoi =
			document.body.querySelector("[data-nhom-dang-theo-doi]") !== null ||
			(document.body.textContent ?? "").includes(m.nhomDangTheoDoi(2));
		kiem(!conTheoDoi, "ctlk-theo-doi: Cua toi con nhom Dang theo doi");
		expect({
			daBo: document.body.querySelectorAll("[data-nhom-da-bo]").length,
			chuDaBo: (document.body.textContent ?? "").includes(m.nhomDaBo(1)),
		}).toEqual({ daBo: 1, chuDaBo: true });
	});
});

function mucTieuCuaToi(id: string, cycleId: string): MucTieuOutput {
	return mucTieu(id, {
		cycleId,
		keyResults: [1, 2, 3].map((i) => ({
			...kr(`${id}-kr${i}`, id),
			laCuaToi: true,
		})),
	});
}

function khoiDong(id: string) {
	return {
		keyResultId: id,
		objectiveId: "mt-1",
		tieuDe: `KR ${id}`,
		mucTieu: "Mở rộng đối tác",
		chuTen: "Trần An",
		progress: 40,
		expected: 50,
		laMoc: false,
		tuTin: "vua" as const,
		nhip: "cham-nhip" as const,
	};
}

async function bamTenKr(
	san: San,
	ds: HTMLAnchorElement[],
	nhan: string,
): Promise<void> {
	const da = ghiBam();
	const thu3 = ds[2];
	if (!thu3) throw new Error(`ctlk-phu-trach: ${nhan} thieu KR thu 3`);
	await bamChuot(thu3);
	await nhip(2);
	kiem(san.url().get("record") === null, `ctlk-phu-trach: ${nhan}`);
	expect(da).toEqual([thu3.getAttribute("href") ?? ""]);
}

describe("ctlk-phu-trach", () => {
	for (const ky of ["q4", "q3"])
		test(`ctlk-phu-trach: Cua toi o chu ky ${ky}`, async () => {
			datCoBan(BA_THIEU);
			kho.mine = mineOutput.parse({
				dangTheoDoi: [],
				objectives: [mucTieuCuaToi("o1", ky)],
				daBo: [],
			});
			const san = await dung(<CuaToi />, ky === "q4" ? "" : `?kyOkr=${ky}`);
			await cho(
				() =>
					(phan("kr-phu-trach")?.querySelectorAll("[data-mo-kr]").length ??
						0) === 3,
				"phan KR ban phu trach hien 3 KR",
			);
			const ds = [
				...(phan("kr-phu-trach")?.querySelectorAll<HTMLAnchorElement>(
					"a[data-mo-kr]",
				) ?? []),
			];
			kiem(ds.length === 3, "ctlk-phu-trach: ten KR mo tai cho");
			expect(ds.map((a) => a.getAttribute("href"))).toEqual(
				[1, 2, 3].map((i) => `/ws/okr/kr/o1-kr${i}`),
			);
			await bamTenKr(san, ds, "ten KR mo tai cho");
		});

	for (const ky of ["q4", "q3"])
		test(`ctlk-phu-trach: Tong quan o chu ky ${ky}`, async () => {
			kho.doc.set("okr.khoiCuaToi", () => ({
				kr: ["k1", "k2", "k3"].map(khoiDong),
				tong: 3,
			}));
			const san = await dung(<KhoiKrCuaToi cycleId={ky} />);
			await cho(
				() => document.body.querySelectorAll("[data-mo-kr]").length === 3,
				"khoi KR cua toi hien 3 KR",
			);
			const ds = [
				...document.body.querySelectorAll<HTMLAnchorElement>("a[data-mo-kr]"),
			];
			kiem(ds.length === 3, "ctlk-phu-trach: Tong quan mo KR tai cho");
			expect(ds.map((a) => a.getAttribute("href"))).toEqual(
				["k1", "k2", "k3"].map((id) => `/ws/okr/kr/${id}`),
			);
			await bamTenKr(san, ds, "Tong quan mo KR tai cho");
		});
});

describe("ctlk-trang-thai", () => {
	for (const locale of ["vi", "en"] as const) {
		test(`ctlk-trang-thai: dang tai ${locale}`, async () => {
			kho.doc.set("okr.cycles", () => HAI_KY);
			kho.doc.set(
				"okr.capNhatTuan",
				() => new Promise<never>(() => {}) as unknown as object,
			);
			await dung(<CuaToi />, "", locale);
			await nhip(5);
			const p1 = phan("can-cap-nhat");
			const m = okrMessages(locale).baPhan;
			kiem(
				(p1?.textContent ?? "").includes(m.phan1),
				"ctlk-trang-thai: dang tai mat tieu de phan",
			);
			expect(p1?.querySelector("[data-khung-xuong]") !== null).toBe(true);
		});

		test(`ctlk-trang-thai: hong ${locale}`, async () => {
			kho.doc.set("okr.cycles", () => HAI_KY);
			let lan = 0;
			kho.doc.set("okr.capNhatTuan", () => {
				lan += 1;
				throw new Error("loi gia");
			});
			await dung(<CuaToi />, "", locale);
			await cho(
				() =>
					document.body.querySelector(
						'[data-trang-thai="ST-ctbp-loi-phan"]',
					) !== null,
				"loi phan hien",
			);
			const m = okrMessages(locale).baPhan;
			const p1 = phan("can-cap-nhat");
			expect((p1?.textContent ?? "").includes(m.loiPhan)).toBe(true);
			const truoc = lan;
			const nut = p1?.querySelector('[data-nut="thu-lai-phan"]');
			if (!nut) throw new Error("ctlk-trang-thai: khong thay nut thu lai");
			await bamChuot(nut);
			await cho(() => lan > truoc, "thu lai goi lai");
			expect(lan - truoc).toBe(1);
		});

		test(`ctlk-trang-thai: rong ${locale}`, async () => {
			datCoBan(KHONG_KR);
			await dung(<CuaToi />, "", locale);
			await cho(daTaiPhan1, "phan 1 tai xong");
			const m = okrMessages(locale).baPhan;
			expect(
				(phan("can-cap-nhat")?.textContent ?? "").includes(m.khongKr),
			).toBe(true);
		});

		test(`ctlk-trang-thai: du tuan ${locale}`, async () => {
			datCoBan(DU_HET);
			await dung(<CuaToi />, "", locale);
			await cho(daTaiPhan1, "phan 1 tai xong");
			const m = okrMessages(locale).baPhan;
			const chu = phan("can-cap-nhat")?.textContent ?? "";
			expect({
				daDu: chu.includes(m.daDu("12/10")),
				suaThiMoKr: chu.includes(m.suaThiMoKr),
				nut: phan("can-cap-nhat")?.querySelectorAll("button").length,
			}).toEqual({ daDu: true, suaThiMoKr: true, nut: 0 });
		});
	}
});
