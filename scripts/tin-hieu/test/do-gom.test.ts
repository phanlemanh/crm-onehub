import { afterAll, describe, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { doGom, dongTong } from "../do-gom.ts";
import { GOM, GOM_DO } from "../gom-cau-hinh.ts";
import { chayGom } from "../gom-lich.ts";
import {
	claudeGia,
	commitNguoi,
	donTam,
	dungKhoGom,
	type GhGia,
	ghGia,
	giaiKit,
	gopDeXuat,
	KHOA_GIA,
	type KhoGom,
	quaNhanhHangCho,
	suaBanGomNguoi,
	TEN_NHOM,
	themTinHieu,
	thuMuc,
} from "./gom-kho-tam.ts";

const AG = giaiKit();
const LAU = 180_000;
const GIO = GOM_DO.gioMs;
const T0 = new Date(Math.floor((Date.now() - 200 * GIO) / 1000) * 1000);
const luc = (h: number) => new Date(T0.getTime() + h * GIO);
afterAll(donTam);

const gom = (
	kho: KhoGom,
	gh: GhGia,
	cheDo: Parameters<typeof claudeGia>[0],
	h: number,
) =>
	chayGom({
		goc: kho.goc,
		env: { AG, ANTHROPIC_API_KEY: KHOA_GIA },
		gh: gh.bin,
		claude: claudeGia(cheDo).bin,
		now: luc(h),
	});

const thuDo = (kho: KhoGom, gh: GhGia, h: number) =>
	doGom({ goc: kho.goc, env: { AG }, gh: gh.bin, now: luc(h) });

function themLuc(kho: KhoGom, so: number, h: number): void {
	themTinHieu(kho, so, { luc: luc(h - 1), ngayCommit: luc(h).toISOString() });
}

const gioCua = (dong: string[], id: string): number | null => {
	const d = dong.find((x) => x.startsWith(`${id}: `));
	const m = d?.match(/^[^:]+: ([\d.]+) giờ/);
	return m ? Number(m[1]) : null;
};

async function kiemSua(dem: typeof doGom): Promise<string[]> {
	const loi: string[] = [];
	const kho = dungKhoGom({ tinHieu: [] });
	const gh = ghGia();
	for (const so of [7, 8, 9, 10, 11, 16, 17]) themLuc(kho, so, 0);
	const kq = await gom(kho, gh, "ba-nhom", 30);
	if (kq.ma !== 0) return [`gom hong: ${kq.dong.join(" | ")}`];
	suaBanGomNguoi(kho, (txt) => {
		const dong = txt.split("\n");
		const iG1 = dong.findIndex((d) => d.startsWith("- `G1`"));
		const iG2 = dong.findIndex((d) => d.startsWith("- `G2`"));
		dong[iG1] = `- \`G1\` — ${TEN_NHOM.G1} ngay trên điện thoại`;
		const ds2 = (dong[iG2 + 1] ?? "").replace("  - tín hiệu: ", "").split(", ");
		const chuyen = ds2.shift() ?? "";
		dong[iG2 + 1] = `  - tín hiệu: ${ds2.join(", ")}`;
		dong[iG1 + 1] = `${dong[iG1 + 1]}, ${chuyen}`;
		return dong.join("\n");
	});
	gopDeXuat(kho, luc(40).toISOString());
	gh.doiTrangThai(1, "MERGED", luc(40).toISOString());
	const r = await dem({ goc: kho.goc, env: { AG }, gh: gh.bin, now: luc(60) });
	if (r.ma !== 0) return [`do hong: ${r.dong.join(" | ")}`];
	if (gioCua(r.dong, "crm-7") !== 30)
		loi.push(`o1 gio cho A ${gioCua(r.dong, "crm-7")}`);
	if (!r.dong.includes("đề xuất #1: đã sửa 2/3 nhóm"))
		loi.push("so sanh khong lay moc may");
	const tong = r.dong[r.dong.length - 1] ?? "";
	if (!tong.includes(`chờ lâu nhất 30 giờ — ${GOM_DO.dat}`))
		loi.push(`o3 gio ${tong}`);
	if (!tong.includes(`chủ kho sửa 2/3 nhóm — ${GOM_DO.chuaDat}`))
		loi.push(`o3 sua ${tong}`);
	return loi;
}

describe("gtc-do", () => {
	test(
		"gtc-do: o1-3 — gio cho, so nhom bi sua, dong tong",
		async () => {
			expect(await kiemSua(doGom)).toEqual([]);
		},
		LAU,
	);

	test(
		"gtc-do: o4 — khong co tin hieu",
		async () => {
			const kho = dungKhoGom({ tinHieu: [] });
			const r = await thuDo(kho, ghGia(), 0);
			expect(r.ma).toBe(0);
			expect(r.dong).toEqual([GOM_DO.khongCo]);
		},
		LAU,
	);

	test(
		"gtc-do: o5 — tin hieu cho sau PR co sua cua nguoi",
		async () => {
			const kho = dungKhoGom({ tinHieu: [] });
			const gh = ghGia();
			for (const so of [7, 8, 9, 10]) themLuc(kho, so, -5);
			await gom(kho, gh, "dung", -4);
			commitNguoi(kho);
			themLuc(kho, 12, 0);
			const kq = await gom(kho, gh, "dung", 1);
			expect(kq.dong[0]).toBe(GOM.thongDiep.nguoiSua);
			const r = await thuDo(kho, gh, 60);
			expect(gioCua(r.dong, "crm-12")).toBe(60);
			const tong = r.dong[r.dong.length - 1] ?? "";
			expect(tong).toContain(GOM_DO.chuaDat);
			expect(tong).toContain(`${GOM_DO.quaNguong}: crm-12`);
		},
		LAU,
	);

	test(
		"gtc-do: o6 — qua mot de xuat bi phu quyet",
		async () => {
			const kho = dungKhoGom({ tinHieu: [] });
			const gh = ghGia();
			for (const so of [7, 8, 9]) themLuc(kho, so, -2);
			themLuc(kho, 13, 0);
			expect((await gom(kho, gh, "dung", 10)).ma).toBe(0);
			gh.doiTrangThai(1, "CLOSED");
			themLuc(kho, 14, 45);
			expect((await gom(kho, gh, "dung", 50)).ma).toBe(0);
			const r = await thuDo(kho, gh, 60);
			expect(gioCua(r.dong, "crm-13")).toBe(10);
			expect(r.dong.find((d) => d.startsWith("crm-13: "))).toContain(
				GOM_DO.quaPhuQuyet,
			);
			expect(gioCua(r.dong, "crm-14")).toBe(5);
		},
		LAU,
	);

	test(
		"gtc-do: o7 — PR dung lai bang day ep so voi lan day cuoi cua may",
		async () => {
			const kho = dungKhoGom({ tinHieu: [] });
			const gh = ghGia();
			for (const so of [7, 8, 9]) themLuc(kho, so, 0);
			expect((await gom(kho, gh, "dung", 1)).ma).toBe(0);
			themLuc(kho, 10, 2);
			expect((await gom(kho, gh, "dung", 3)).ma).toBe(0);
			suaBanGomNguoi(kho, (txt) =>
				txt.replace(TEN_NHOM.G1, `${TEN_NHOM.G1} ngay`),
			);
			gopDeXuat(kho, luc(5).toISOString());
			gh.doiTrangThai(1, "MERGED", luc(5).toISOString());
			const r = await thuDo(kho, gh, 6);
			expect(r.dong).toContain("đề xuất #1: đã sửa 1/2 nhóm");
			expect(gioCua(r.dong, "crm-10")).toBe(1);
		},
		LAU,
	);

	test(
		"gtc-do: o8 — tin hieu vao qua commit gop, tinh tu commit gop",
		async () => {
			const kho = dungKhoGom({ tinHieu: [] });
			const gh = ghGia();
			for (const so of [7, 8, 9]) themLuc(kho, so, -1);
			quaNhanhHangCho(kho, 15, luc(-20).toISOString(), luc(0).toISOString());
			expect((await gom(kho, gh, "dung", 5)).ma).toBe(0);
			const r = await thuDo(kho, gh, 6);
			expect(gioCua(r.dong, "crm-15")).toBe(5);
		},
		LAU,
	);

	test("gtc-do: ma tran nguong 4 o", () => {
		const o = (choGio: number, daSua: number, tongNhom: number) =>
			dongTong({ choLonNhatMs: choGio * GIO, quaNguong: [], daSua, tongNhom });
		expect(o(48, 0, 5)).toContain(`48 giờ — ${GOM_DO.dat}`);
		expect(o(48.5, 0, 5)).toContain(`48.5 giờ — ${GOM_DO.chuaDat}`);
		expect(o(10, 0, 5)).toContain(`sửa 0/5 nhóm — ${GOM_DO.dat}`);
		expect(o(10, 1, 5)).toContain(`sửa 1/5 nhóm — ${GOM_DO.chuaDat}`);
	});

	test(
		"gtc-do: chieu do — so voi ban gom da gop thay vi moc may",
		async () => {
			const d = thuMuc("tiem-do");
			const goc = path.resolve(import.meta.dir, "..");
			const VAL = path.resolve(
				goc,
				"..",
				"..",
				"packages",
				"validation",
				"src",
				"tin-hieu-gom.ts",
			);
			for (const t of [
				"do-gom.ts",
				"gom-lich.ts",
				"gom-than-pr.ts",
				"gom-cau-hinh.ts",
			]) {
				let s = readFileSync(path.join(goc, t), "utf8").replaceAll(
					"../../packages/validation/src/tin-hieu-gom.ts",
					VAL,
				);
				if (t === "do-gom.ts") {
					const tu = "const sua = demSua(k.nhom, bg.nhom);";
					if (s.split(tu).length !== 2) throw new Error("nhát tiêm không khớp");
					s = s.replace(tu, "const sua = demSua(bg.nhom, bg.nhom);");
				}
				writeFileSync(path.join(d, t), s);
			}
			const m = (await import(path.join(d, "do-gom.ts"))) as {
				doGom: typeof doGom;
			};
			expect(await kiemSua(m.doGom)).toContain("so sanh khong lay moc may");
		},
		LAU,
	);
});
