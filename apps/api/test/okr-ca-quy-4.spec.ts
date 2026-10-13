import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CaGopY } from "@crm/validation/okr-ca-gop-y";
import { sinhCaQuy4 } from "../scripts/okr-mau/ca-quy-4";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { type BoOkrMau, docBoOkrMau } from "../scripts/okr-mau/khuon";

const Q = OKR_MAU.caQuy4;
const DIR = join(import.meta.dir, "..", "scripts", "okr-mau");
const TEP_BO = join(DIR, Q.tepCongTy);
const TEP_NHAN = join(DIR, Q.tepNhan);
const LENH = join(import.meta.dir, "..", "scripts", "okr-ca-quy-4.ts");
const THU_MUC_CAY = join(import.meta.dir, "..", "..", ...Q.thuMucRa);

type DongNhan = {
	ma: string;
	bo: string;
	kyVong: CaGopY["kyVong"];
	ghiChu: string;
};
type TepNhan = { ca: DongNhan[] };

const bo = (): BoOkrMau => docBoOkrMau(readFileSync(TEP_BO, "utf8"));
const nhan = (): TepNhan => JSON.parse(readFileSync(TEP_NHAN, "utf8"));
const tam = (ten: string) => mkdtempSync(join(tmpdir(), `bcq4-${ten}-`));

function maKyVong(b: BoOkrMau): string[] {
	return b.mucTieu
		.filter(
			(m) =>
				m.trangThai === "cong-bo" &&
				((m.chuKy === "quy4" &&
					(m.cap === "bo-phan" || m.cap === "phong-ban")) ||
					(m.chuKy === "nam" && m.cap === "onehub")),
		)
		.map((m) => m.ma)
		.sort();
}

function tenDonViNguon(b: BoOkrMau, cap: string, donVi?: string): string {
	if (cap === "onehub") return b.congTy;
	const ds = cap === "bo-phan" ? b.boPhan : b.phongBan;
	return ds.find((d) => d.ma === donVi)?.ten ?? "";
}

function lechVoiNguon(b: BoOkrMau, ca: CaGopY): string[] {
	const ma = ca.id.replace(/^ca-(ng-)?/, "");
	const m = b.mucTieu.find((x) => x.ma === ma);
	if (!m) return [`${ca.id} không có nguồn`];
	const lech: string[] = [];
	const so = (truong: string, a: unknown, c: unknown) => {
		if (a !== c) lech.push(`${ca.id} ${truong}`);
	};
	so("donVi.cap", ca.donVi.cap, m.cap);
	so("donVi.ten", ca.donVi.ten, tenDonViNguon(b, m.cap, m.donVi));
	so("mucTieu.title", ca.mucTieu.title, m.ten);
	so("mucTieu.whyNow", ca.mucTieu.whyNow, m.viSao);
	so("mucTieu.kind", ca.mucTieu.kind, m.kieu);
	so("krs.length", ca.krs.length, m.krs.length);
	m.krs.forEach((k, i) => {
		const c = ca.krs[i];
		so(`krs[${i}].title`, c?.title, k.ten);
		so(`krs[${i}].kind`, c?.kind, k.kieu);
		so(`krs[${i}].startValue`, c?.startValue, k.khoi);
		so(`krs[${i}].targetValue`, c?.targetValue, k.dich);
		so(`krs[${i}].unit`, c?.unit, k.donVi);
	});
	return lech;
}

function dichCanChinh(b: BoOkrMau, ma: string) {
	const m = b.mucTieu.find((x) => x.ma === ma);
	const cc = m?.canChinh;
	if (!cc) return undefined;
	return cc.mucTieu
		? b.mucTieu.find((x) => x.ma === cc.mucTieu)
		: b.mucTieu.find((x) => x.krs.some((k) => k.ma === cc.kr));
}

function chayLenh(tepNhan: string, ra: string) {
	return spawnSync("bun", [LENH, "--nhan", tepNhan, "--ra", ra], {
		encoding: "utf8",
	});
}

function bam(d: string): string {
	const noiDung = readdirSync(d)
		.sort()
		.map((t) => `${t}:${readFileSync(join(d, t), "utf8")}`)
		.join("\n");
	return createHash("sha256").update(noiDung).digest("hex");
}

function soThuMuc(a: string, b: string): string[] {
	const ta = readdirSync(a).sort();
	const tb = readdirSync(b).sort();
	const lech = [
		...ta.filter((t) => !tb.includes(t)),
		...tb.filter((t) => !ta.includes(t)),
	];
	for (const t of ta.filter((x) => tb.includes(x)))
		if (readFileSync(join(a, t), "utf8") !== readFileSync(join(b, t), "utf8"))
			lech.push(t);
	return lech.sort();
}

describe("bcq4-sinh", () => {
	test("một ca viết lại cho mỗi mục tiêu được chọn, chép đúng nguồn", () => {
		const b = bo();
		const ca = sinhCaQuy4(b, nhan());
		const vietLai = ca.filter((c) => c.bo === "viet-lai");
		expect(vietLai.map((c) => c.id).sort()).toEqual(
			maKyVong(b).map((m) => `ca-${m}`),
		);
		for (const c of vietLai) expect(lechVoiNguon(b, c)).toEqual([]);
		const ids = new Set(ca.map((c) => c.id));
		for (const ma of ["q4-marketing-nhap", "q4-kho-van-bo", "q4-kd-nam-3"])
			expect(ids.has(`ca-${ma}`), ma).toBe(false);
	});

	test("chiều đỏ: ca của bộ gốc lệch với bộ đã đổi tên KR", () => {
		const goc = bo();
		const ca = sinhCaQuy4(goc, nhan()).find((c) => c.id === "ca-q4-kho-van-2");
		if (!ca) throw new Error("thiếu ca-q4-kho-van-2");
		const doi = structuredClone(goc);
		const m = doi.mucTieu.find((x) => x.ma === "q4-kho-van-2");
		const k = m?.krs[0];
		if (!k) throw new Error("thiếu KR đầu của q4-kho-van-2");
		k.ten = `${k.ten} đã đổi`;
		expect(lechVoiNguon(doi, ca)).toEqual(["ca-q4-kho-van-2 krs[0].title"]);
	});
});

describe("bcq4-ng", () => {
	test("ca NG mang đúng mục tiêu OneHub được căn chỉnh vào", () => {
		const b = bo();
		const ca = sinhCaQuy4(b, nhan());
		const dongNg = nhan().ca.filter((d) => d.bo === "ng");
		expect(dongNg.length).toBeGreaterThanOrEqual(4);
		for (const d of dongNg) {
			const c = ca.find((x) => x.id === `ca-ng-${d.ma}`);
			const dich = dichCanChinh(b, d.ma);
			expect(c?.capTren?.mucTieu.title, d.ma).toBe(dich?.ten);
			expect(c?.capTren?.krs.map((k) => k.title), d.ma).toEqual(
				dich?.krs.map((k) => k.ten),
			);
			expect(c?.kyVong.khongDuoc, d.ma).toEqual(
				expect.arrayContaining(["chep-kr-cap-tren", "noi-ve-nguoi"]),
			);
		}
		const n3 = b.mucTieu.find((x) => x.ma === "n3");
		expect(
			ca.find((x) => x.id === "ca-ng-q4-nhan-su-1")?.capTren?.mucTieu.title,
		).toBe(n3?.ten);
		expect(ca.some((x) => x.id === "ca-ng-q4-kd-bac-2")).toBe(false);
	});

	test("chiều đỏ: đổi căn chỉnh thì cấp trên đổi theo", () => {
		const doi = structuredClone(bo());
		const m = doi.mucTieu.find((x) => x.ma === "q4-nhan-su-1");
		if (!m) throw new Error("thiếu q4-nhan-su-1");
		m.canChinh = { kr: "n1-k1" };
		const ca = sinhCaQuy4(doi, nhan()).find(
			(x) => x.id === "ca-ng-q4-nhan-su-1",
		);
		const n1 = doi.mucTieu.find((x) => x.ma === "n1");
		const n3 = doi.mucTieu.find((x) => x.ma === "n3");
		expect(ca?.capTren?.mucTieu.title).toBe(n1?.ten);
		expect(ca?.capTren?.mucTieu.title).not.toBe(n3?.ten);
	});
});

const CA_HONG: {
	ten: string;
	sua: (n: TepNhan) => TepNhan;
	co: [string, string];
}[] = [
	{
		ten: "thieu",
		sua: (n) => ({ ca: n.ca.filter((d) => d.ma !== "q4-tai-chinh-1") }),
		co: ["q4-tai-chinh-1", "thiếu nhãn"],
	},
	{
		ten: "khong-co",
		sua: (n) => ({ ca: [...n.ca, { ...(n.ca[0] as DongNhan), ma: "q4-khong-co" }] }),
		co: ["q4-khong-co", "không có"],
	},
	{
		ten: "nhap",
		sua: (n) => ({
			ca: [...n.ca, { ...(n.ca[0] as DongNhan), ma: "q4-marketing-nhap" }],
		}),
		co: ["q4-marketing-nhap", "không được chọn"],
	},
	{
		ten: "trung",
		sua: (n) => ({
			ca: [
				...n.ca,
				n.ca.find(
					(d) => d.ma === "q4-kd-bac-2" && d.bo === "viet-lai",
				) as DongNhan,
			],
		}),
		co: ["q4-kd-bac-2", "trùng"],
	},
	{
		ten: "ng-khong-can-chinh",
		sua: (n) => ({
			ca: [
				...n.ca,
				{
					...(n.ca.find((d) => d.ma === "q4-phap-che-3") as DongNhan),
					bo: "ng",
				},
			],
		}),
		co: ["q4-phap-che-3", "căn chỉnh"],
	},
	{
		ten: "ky-vong",
		sua: (n) => ({
			ca: n.ca.map((d) =>
				d.ma === "q4-vh" && d.bo === "viet-lai"
					? {
							...d,
							kyVong: { ...d.kyVong, vanDe: ["la"] },
						} as unknown as DongNhan
					: d,
			),
		}),
		co: ["ca-q4-vh", "kyVong"],
	},
];

describe("bcq4-nhan-hong", () => {
	for (const c of CA_HONG) {
		test(`${c.ten}: thoát 4, nêu chỗ hỏng, không đổi thư mục`, () => {
			const d = tam(c.ten);
			const tep = join(d, "nhan.json");
			writeFileSync(tep, JSON.stringify(c.sua(nhan())));
			const ra = join(d, "ra");
			mkdirSync(ra);
			writeFileSync(join(ra, "ca-cu.json"), "{}\n");
			const truoc = bam(ra);
			const r = chayLenh(tep, ra);
			expect(r.status).toBe(OKR_MAU.ma.sai);
			for (const chu of c.co) expect(r.stderr).toContain(chu);
			expect(bam(ra)).toBe(truoc);
		});
	}

	test("đối chứng dương: nhãn gốc thoát 0 và thư mục đổi", () => {
		const ra = join(tam("goc"), "ra");
		mkdirSync(ra);
		writeFileSync(join(ra, "ca-cu.json"), "{}\n");
		const truoc = bam(ra);
		const r = chayLenh(TEP_NHAN, ra);
		expect(r.status).toBe(0);
		expect(bam(ra)).not.toBe(truoc);
	});
});

describe("bcq4-dong-bo", () => {
	test("bộ ca trong cây giống từng byte kết quả sinh lại, tệp cũ bị xoá", () => {
		const ra = join(tam("dong-bo"), "ra");
		mkdirSync(ra);
		writeFileSync(join(ra, "ca-cu.json"), "{}\n");
		const r = chayLenh(TEP_NHAN, ra);
		expect(r.status).toBe(0);
		expect(readdirSync(ra)).not.toContain("ca-cu.json");
		expect(soThuMuc(ra, THU_MUC_CAY)).toEqual([]);
	});

	test("chiều đỏ: sửa một chữ trong ca-n2.json thì hàm so gọi tên tệp", () => {
		const ban = join(tam("ban-sao"), "ca");
		cpSync(THU_MUC_CAY, ban, { recursive: true });
		const tep = join(ban, "ca-n2.json");
		writeFileSync(tep, readFileSync(tep, "utf8").replace("Giao", "Gửi"));
		expect(soThuMuc(ban, THU_MUC_CAY)).toEqual(["ca-n2.json"]);
	});
});
