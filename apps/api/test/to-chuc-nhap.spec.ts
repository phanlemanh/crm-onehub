import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type {
	ImportApplyOutput,
	ImportPreviewOutput,
	TreeOutput,
} from "../src/to-chuc/to-chuc.contracts";
import { ToChucService } from "../src/to-chuc/to-chuc.service";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import { cay, dungSan, goi, ma, nguoiMoi, ok, pbMoi, tao } from "./to-chuc-san";

dungSan();

const N = TO_CHUC.thongDiep.nhap;

type Dong = [email: string, phongBan: string, boPhan: string, truong: string];

const emailCua = (id: string) => `${id}@thu.test`;

function tab(dong: Dong[], tieuDe = true): string {
	const dau = tieuDe ? ["email\tphòng ban\tbộ phận\ttrưởng"] : [];
	return [...dau, ...dong.map((d) => d.join("\t"))].join("\n");
}

function csv(dong: Dong[]): string {
	const o = (x: string) => (/[",]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x);
	return [
		"email,phòng ban,bộ phận,trưởng",
		...dong.map((d) => d.map(o).join(",")),
	].join("\n");
}

async function demBang() {
	const [division, department, orgPlacement, orgSecondaryDepartment] =
		await Promise.all([
			db.division.count(),
			db.department.count(),
			db.orgPlacement.count(),
			db.orgSecondaryDepartment.count(),
		]);
	return { division, department, orgPlacement, orgSecondaryDepartment };
}

type Lo = {
	dong: Dong[];
	ky: [nhan: string, loi: string | null][];
	nguoiHopLe: string[];
	nguoiHong: string[];
	tenPbMoi: string;
	tenBpMoi: string;
};

async function dungLo(): Promise<Lo> {
	const bpCo = await tao(
		"org.createDivision",
		{ name: ma("n-bp-co") },
		"bp co",
	);
	const bpKhac = await tao(
		"org.createDivision",
		{ name: ma("n-bp-khac") },
		"bp khac",
	);
	const c = await cay();
	const tenBp = (id: string) =>
		c.divisions.find((d) => d.id === id)?.name ?? "";
	const pbCo = await pbMoi("n-pb-co", bpCo);
	const pbCo2 = await pbMoi("n-pb-co2");
	const pbCo3 = await pbMoi("n-pb-co3");
	const pbCo4 = await pbMoi("n-pb-co4");
	const c2 = await cay();
	const tenPb = (id: string) =>
		[...c2.chuaXep, ...c2.divisions.flatMap((d) => d.departments)].find(
			(d) => d.id === id,
		)?.name ?? "";
	const n = await Promise.all(
		Array.from({ length: 13 }, (_, i) => nguoiMoi(`n${i}`)),
	);
	const e = (i: number) => emailCua(n[i] as string);
	const tenPbMoi = `${ma("n-pb-moi")}, vùng 1`;
	const tenBpMoi = ma("n-bp-moi");
	const tenPbHai = ma("n-pb-hai");
	const dong: Dong[] = [
		[e(1), tenPbMoi, tenBp(bpCo), ""],
		[e(2), tenPb(pbCo2), tenBpMoi, ""],
		[e(3), tenPb(pbCo3), "", "Phòng ban"],
		[e(4), tenPb(pbCo), "", "bộ phận"],
		["khong-phai-thanh-vien@thu.test", tenPb(pbCo3), "", ""],
		[e(5), "", "", ""],
		[e(6), tenPb(pbCo), tenBp(bpKhac), ""],
		[e(7), tenPb(pbCo3), "", "có"],
		[e(8), tenPb(pbCo3), "", ""],
		[e(8).toUpperCase(), tenPb(pbCo3), "", ""],
		[e(9), tenPbHai, ma("n-bp-x"), ""],
		[e(10), tenPbHai, ma("n-bp-y"), ""],
		[e(11), tenPb(pbCo4), "", "phong ban"],
		[e(12), tenPb(pbCo4), "", "Phòng Ban"],
	];
	return {
		dong,
		ky: [
			["hopLe-taoPhongBan", null],
			["hopLe-taoBoPhan", null],
			["hopLe-truongPhongBan", null],
			["hopLe-truongBoPhan", null],
			["khongThanhVien", N.emailKhongPhaiThanhVien],
			["thieuPhongBan", N.thieuCot],
			["pbBoPhanKhac", N.phongBanBoPhanKhac(tenPb(pbCo), tenBp(bpCo))],
			["truongLa", N.truongLa],
			["emailLap-1", N.emailLap],
			["emailLap-2", N.emailLap],
			["haiBoPhan-1", N.phongBanHaiBoPhan(tenPbHai)],
			["haiBoPhan-2", N.phongBanHaiBoPhan(tenPbHai)],
			["haiTruong-1", N.haiTruong(tenPb(pbCo4))],
			["haiTruong-2", N.haiTruong(tenPb(pbCo4))],
		],
		nguoiHopLe: [n[1], n[2], n[3], n[4]] as string[],
		nguoiHong: n.slice(5) as string[],
		tenPbMoi,
		tenBpMoi,
	};
}

function ketQua(kq: ImportPreviewOutput, lo: Lo): string[] {
	return lo.ky.map(([nhan], i) => `${nhan}: ${kq.rows[i]?.error ?? "hop le"}`);
}

function kyVong(lo: Lo): string[] {
	return lo.ky.map(([nhan, loi]) => `${nhan}: ${loi ?? "hop le"}`);
}

describe("xem-truoc", () => {
	test("xem-truoc: moi dong mot ket qua, loi cap hong ca cap, tom tat dung, khong ghi gi", async () => {
		const lo = await dungLo();
		for (const [dang, chu] of [
			["tab", tab(lo.dong)],
			["csv", csv(lo.dong)],
		] as const) {
			const truoc = await demBang();
			const kq = ok<ImportPreviewOutput>(
				await goi("org.previewImport", { text: chu }),
				`xem truoc ${dang}`,
			);
			expect(kq.rows.length).toBe(14);
			expect({ dang, dong: ketQua(kq, lo) }).toEqual({
				dang,
				dong: kyVong(lo),
			});
			expect({ dang, ...kq.summary }).toEqual({
				dang,
				valid: 4,
				invalid: 10,
				newDepartments: 1,
				newDivisions: 1,
			});
			expect(await demBang()).toEqual(truoc);
		}
	});

	test("xem-truoc: lo qua 1000 dong bi tu choi ca lo, 1000 dong thi xem duoc", async () => {
		const dong = (n: number) =>
			Array.from({ length: n }, (_, i) => `x${i}@thu.test,pb,,`).join("\n");
		const qua = await goi("org.previewImport", { text: dong(1001) });
		expect(`1001 dong: HTTP ${qua.status} ${qua.loi}`).toBe(
			"1001 dong: HTTP 400 Lô có quá 1000 dòng — chia nhỏ rồi nhập lại.",
		);
		const vua = await goi("org.previewImport", { text: dong(1000) });
		expect(`1000 dong: HTTP ${vua.status}`).toBe("1000 dong: HTTP 200");
	});

	test("xem-truoc: nhap-khoang-trang — dong trong, email viet hoa, khoang trang hai dau van khop", async () => {
		const a = await nguoiMoi("kt");
		const pb = await pbMoi("kt-pb");
		const ten = (await cay()).chuaXep.find((d) => d.id === pb)?.name ?? "";
		const chu = `\n  ${emailCua(a).toUpperCase()}  \t  ${ten}  \t\t\n\n`;
		const kq = ok<ImportPreviewOutput>(
			await goi("org.previewImport", { text: chu }),
			"xem",
		);
		expect(kq.rows.map((r) => r.error)).toEqual([null]);
		expect(kq.summary.newDepartments).toBe(0);
	});

	test("xem-truoc: nhap-trung-ten-cu — khop phong ban chua luu tru, khong chon ban da luu tru", async () => {
		const a = await nguoiMoi("tt");
		const ten = ma("tt-pb");
		const cu = await tao(
			"org.createDepartment",
			{ name: ten, divisionId: null },
			"cu",
		);
		ok(await goi("onboarding.archiveDepartment", { id: cu }), "luu cu");
		const moi = await tao(
			"org.createDepartment",
			{ name: ten, divisionId: null },
			"moi",
		);
		ok(
			await goi("org.applyImport", {
				text: tab([[emailCua(a), ten, "", ""]], false),
			}),
			"ghi",
		);
		const c = await cay();
		expect(c.people.find((p) => p.id === a)?.primaryDepartmentId).toBe(moi);
	});

	test("xem-truoc: nhap-csv-ngoac-kep — o co dau phay trong ngoac kep la mot o", async () => {
		const a = await nguoiMoi("nk");
		const ten = `${ma("nk-pb")}, vùng 2`;
		const kq = ok<ImportPreviewOutput>(
			await goi("org.previewImport", {
				text: csv([[emailCua(a), ten, "", ""]]),
			}),
			"xem",
		);
		expect(kq.rows.map((r) => [r.department, r.error])).toEqual([[ten, null]]);
	});
});

function chieuNguoi(c: TreeOutput, ids: string[]) {
	const pb = [...c.chuaXep, ...c.divisions.flatMap((d) => d.departments)];
	return ids.map((id) => {
		const p = c.people.find((x) => x.id === id);
		const d = pb.find((x) => x.id === p?.primaryDepartmentId);
		const bp = c.divisions.find((x) => x.id === d?.divisionId);
		return {
			id,
			phongBan: d?.name ?? null,
			boPhan: bp?.name ?? null,
			truongPhongBan: d?.head?.id === id,
			truongBoPhan: bp?.head?.id === id,
		};
	});
}

describe("ghi", () => {
	test("ghi: dung cac dong hop le cua ban xem truoc, dong hong khong de lai gi, ghi lan hai khong doi", async () => {
		const lo = await dungLo();
		const chu = tab(lo.dong);
		const xem = ok<ImportPreviewOutput>(
			await goi("org.previewImport", { text: chu }),
			"xem",
		);
		const kq = ok<ImportApplyOutput>(
			await goi("org.applyImport", { text: chu }),
			"ghi",
		);
		expect(kq).toEqual({ written: 4, newDepartments: 1, newDivisions: 1 });

		const c = await cay();
		const hopLe = xem.rows.filter((r) => r.error === null);
		const theoEmail = new Map(lo.nguoiHopLe.map((id) => [emailCua(id), id]));
		const kyVong = hopLe.map((r) => {
			const id = theoEmail.get(r.email.toLowerCase()) as string;
			const hienTai = chieuNguoi(c, [id])[0];
			return {
				id,
				phongBan: r.department,
				boPhan: r.division === "" ? (hienTai?.boPhan ?? null) : r.division,
				truongPhongBan: /phong ban|phòng ban/i.test(r.head),
				truongBoPhan: /bo phan|bộ phận/i.test(r.head),
			};
		});
		expect(chieuNguoi(c, lo.nguoiHopLe)).toEqual(kyVong);

		const soViTriHong = await db.orgPlacement.count({
			where: { userId: { in: lo.nguoiHong } },
		});
		expect(`dong hong de lai ${soViTriHong} vi tri`).toBe(
			"dong hong de lai 0 vi tri",
		);

		const dem1 = await demBang();
		ok(await goi("org.applyImport", { text: chu }), "ghi lan hai");
		const dem2 = await demBang();
		expect({ division: dem2.division, department: dem2.department }).toEqual({
			division: dem1.division,
			department: dem1.department,
		});
		expect(chieuNguoi(await cay(), lo.nguoiHopLe)).toEqual(
			chieuNguoi(c, lo.nguoiHopLe),
		);

		const hongHet = await goi("org.applyImport", {
			text: tab([["khong-ai@thu.test", "x", "", ""]], false),
		});
		expect(`hong het: HTTP ${hongHet.status} ${hongHet.loi}`).toBe(
			"hong het: HTTP 400 Không có dòng hợp lệ nào để ghi.",
		);
	});

	test("ghi: tiem loi o dong hop le thu ba thi khong dong nao duoc ghi", async () => {
		const n = await Promise.all([0, 1, 2, 3].map((i) => nguoiMoi(`tl${i}`)));
		const chu = tab(
			n.map((id, i) => [emailCua(id), ma(`tl-pb${i}`), "", ""] as Dong),
			false,
		);
		const boc = <T extends object>(
			goc: T,
			sua: (k: PropertyKey, v: unknown) => unknown,
		): T =>
			new Proxy(goc, {
				get(t, k) {
					const v = Reflect.get(t, k);
					const moi = sua(k, v);
					if (moi !== undefined) return moi;
					return typeof v === "function" ? v.bind(t) : v;
				},
			});
		let lan = 0;
		const bocUpsert = (dauMoi: object) =>
			boc(dauMoi, (k2, v2) =>
				k2 === "orgPlacement"
					? boc(v2 as object, (k3, v3) =>
							k3 === "upsert"
								? async (...a: unknown[]) => {
										lan += 1;
										if (lan === 3) throw new Error("tiem loi dong 3");
										return (v3 as (...x: unknown[]) => unknown).apply(v2, a);
									}
								: undefined,
						)
					: undefined,
			);
		const dbLoi = boc(db, (k, v) => {
			if (k === "$transaction") {
				return (viec: (tx: unknown) => Promise<unknown>) =>
					(v as typeof db.$transaction).call(db, (tx) => viec(bocUpsert(tx)));
			}
			if (k === "orgPlacement") return Reflect.get(bocUpsert(db), k);
			return undefined;
		});
		let loi = "";
		try {
			await new ToChucService(dbLoi).applyImport({ text: chu });
		} catch (e) {
			loi = (e as Error).message;
		}
		const daGhi = await db.orgPlacement.count({ where: { userId: { in: n } } });
		expect(loi).toBe("tiem loi dong 3");
		expect(`tiem loi dong 3: ${daGhi} dong da ghi`).toBe(
			"tiem loi dong 3: 0 dong da ghi",
		);
	});
});
