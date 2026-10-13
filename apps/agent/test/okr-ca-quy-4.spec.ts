import { describe, expect, test } from "bun:test";
import {
	cpSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CaGopY } from "@crm/validation/okr-ca-gop-y";
import { kiemSoTheoKieu, krInput } from "@crm/validation/okr-kr";
import {
	docBoCaGopY,
	THU_MUC_CA_MAU,
	THU_MUC_CA_QUY_4,
	thuMucBoCa,
} from "../evals/okr/ca-gop-y";

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const TEP_CONG_TY = join(GOC_KHO, "apps/api/scripts/okr-mau/cong-ty.json");
const TEP_EVAL = join(import.meta.dir, "..", "evals/okr/gop-y.eval.ts");
const BIEN = "TDX_THU_MUC_CA";
const TEP_CAU_HINH = join(import.meta.dir, "..", "agent/lib/okr/config.ts");

type Nhan = {
	vanDe: string[];
	khongGopY?: boolean;
	vietLai?: string[];
	khongDuoc?: string[];
};

const VIEC = ["kr-la-viec"];
const KR = ["kr.title"];
const TEN = ["title"];
const NG = ["chep-kr-cap-tren", "noi-ve-nguoi"];
const TOT: Nhan = { vanDe: [], khongGopY: true };
const TRONG: Nhan = { vanDe: [] };

const BANG_NHAN = {
	"ca-n1": TOT,
	"ca-n2": TOT,
	"ca-n3": { vanDe: ["trung-y", "kr-la-viec"] },
	"ca-q4-kd": { vanDe: ["muc-tieu-la-so", "thieu-doi-trong"], vietLai: TEN },
	"ca-q4-vh": { vanDe: VIEC, vietLai: KR },
	"ca-q4-kd-bac-1": TRONG,
	"ca-q4-kd-bac-2": { vanDe: VIEC, vietLai: KR },
	"ca-q4-kd-nam-1": TOT,
	"ca-q4-kd-nam-2": {
		vanDe: ["kr-la-viec", "thieu-doi-trong"],
		vietLai: KR,
	},
	"ca-q4-cham-soc-1": { vanDe: VIEC, vietLai: KR },
	"ca-q4-cham-soc-2": TRONG,
	"ca-q4-marketing-1": { vanDe: VIEC, vietLai: KR },
	"ca-q4-marketing-2": { vanDe: [], vietLai: TEN },
	"ca-q4-kho-van-1": TRONG,
	"ca-q4-kho-van-2": TOT,
	"ca-q4-dieu-phoi-1": { vanDe: VIEC, vietLai: KR },
	"ca-q4-dieu-phoi-2": TRONG,
	"ca-q4-san-pham-1": TRONG,
	"ca-q4-san-pham-2": TOT,
	"ca-q4-tai-chinh-1": TRONG,
	"ca-q4-tai-chinh-2": { vanDe: [], vietLai: TEN },
	"ca-q4-nhan-su-1": { vanDe: VIEC, vietLai: KR },
	"ca-q4-nhan-su-2": TRONG,
	"ca-q4-phap-che-1": TRONG,
	"ca-q4-phap-che-2": TRONG,
	"ca-q4-phap-che-3": { vanDe: [], vietLai: TEN },
	"ca-ng-q4-kd-bac-1": { vanDe: [], khongDuoc: NG },
	"ca-ng-q4-kd-nam-1": { vanDe: [], khongDuoc: NG },
	"ca-ng-q4-cham-soc-1": { vanDe: [], khongDuoc: NG },
	"ca-ng-q4-kho-van-2": { vanDe: [], khongDuoc: NG },
	"ca-ng-q4-nhan-su-1": { vanDe: [], khongDuoc: NG },
	"ca-ng-q4-tai-chinh-1": { vanDe: [], khongDuoc: NG },
} satisfies Record<string, Nhan>;

const nhanMong = (id: string): Nhan | undefined =>
	Object.entries(BANG_NHAN).find(([k]) => k === id)?.[1];

const nhanCua = (c: CaGopY): Nhan => ({
	vanDe: c.kyVong.vanDe,
	khongGopY: c.kyVong.khongGopY,
	vietLai: c.kyVong.vietLai,
	khongDuoc: c.kyVong.khongDuoc,
});

const nhanDu = (n: Nhan): Nhan => ({
	vanDe: n.vanDe,
	khongGopY: n.khongGopY ?? false,
	vietLai: n.vietLai ?? [],
	khongDuoc: n.khongDuoc ?? [],
});

function lechNhan(ca: CaGopY[]): string[] {
	const lech: string[] = [];
	const ids = new Set(ca.map((c) => c.id));
	for (const id of Object.keys(BANG_NHAN))
		if (!ids.has(id)) lech.push(`${id} thiếu`);
	for (const c of ca) {
		const mong = nhanMong(c.id);
		if (!mong) lech.push(`${c.id} ngoài bảng`);
		else if (JSON.stringify(nhanCua(c)) !== JSON.stringify(nhanDu(mong)))
			lech.push(`${c.id} kyVong`);
	}
	return lech;
}

const giaoMa = (a: CaGopY[], b: CaGopY[]) => {
	const ids = new Set(b.map((c) => c.id));
	return a.filter((c) => ids.has(c.id)).map((c) => c.id);
};

type CongTy = {
	congTy: string;
	boPhan: { ma: string; ten: string }[];
	phongBan: { ma: string; ten: string }[];
	mucTieu: { chuKy: string; cap: string; donVi?: string; trangThai?: string }[];
};

describe("bcq4-thanh-phan", () => {
	const ca = docBoCaGopY(THU_MUC_CA_QUY_4);
	const congTy: CongTy = JSON.parse(readFileSync(TEP_CONG_TY, "utf8"));

	test("đủ đơn vị, đủ loại ca, KR hợp lệ, không trùng bộ mẫu", () => {
		expect(ca.length).toBeGreaterThanOrEqual(28);
		expect(ca.length).toBeLessThanOrEqual(34);
		const vietLai = ca.filter((c) => c.bo === "viet-lai");
		const tenTheoCap = (cap: string) =>
			[
				...new Set(
					vietLai.filter((c) => c.donVi.cap === cap).map((c) => c.donVi.ten),
				),
			].sort();
		expect(tenTheoCap("phong-ban")).toEqual(
			congTy.phongBan.map((p) => p.ten).sort(),
		);
		const boPhanQuy4 = new Set(
			congTy.mucTieu
				.filter((m) => m.chuKy === "quy4" && m.cap === "bo-phan")
				.map((m) => m.donVi),
		);
		expect(tenTheoCap("bo-phan")).toEqual(
			congTy.boPhan
				.filter((b) => boPhanQuy4.has(b.ma))
				.map((b) => b.ten)
				.sort(),
		);
		expect(vietLai.filter((c) => c.donVi.cap === "onehub").length).toBe(
			congTy.mucTieu.filter((m) => m.chuKy === "nam" && m.cap === "onehub")
				.length,
		);
		expect(
			ca.filter((c) => c.bo === "ng" && c.capTren).length,
		).toBeGreaterThanOrEqual(4);
		expect(ca.filter((c) => c.kyVong.khongGopY).length).toBeGreaterThanOrEqual(
			3,
		);
		for (const c of ca)
			for (const k of [...c.krs, ...(c.capTren?.krs ?? [])]) {
				const nhap = krInput.safeParse({
					...k,
					ownerUserId: "ca",
					currentValue: k.startValue,
					dueOn: null,
					weight: 1,
				});
				expect(nhap.success, `${c.id} ${k.title}`).toBe(true);
				expect(
					kiemSoTheoKieu(k.kind, k.startValue, k.targetValue),
					`${c.id} ${k.title}`,
				).toBeNull();
			}
		expect(giaoMa(ca, docBoCaGopY(THU_MUC_CA_MAU))).toEqual([]);
	});

	test("nhãn từng ca đúng bảng viết trước", () => {
		expect(lechNhan(ca)).toEqual([]);
	});

	test("chiều đỏ: ca mang mã bộ mẫu bị bắt, nhãn lệch bị gọi tên", () => {
		const ban = join(mkdtempSync(join(tmpdir(), "bcq4-tp-")), "ca");
		cpSync(THU_MUC_CA_QUY_4, ban, { recursive: true });
		const gy = JSON.parse(
			readFileSync(join(THU_MUC_CA_MAU, "gy-01.json"), "utf8"),
		);
		writeFileSync(join(ban, "gy-01.json"), JSON.stringify(gy));
		expect(giaoMa(docBoCaGopY(ban), docBoCaGopY(THU_MUC_CA_MAU))).toEqual([
			"gy-01",
		]);
		const tep = join(ban, "ca-q4-vh.json");
		const vh = JSON.parse(readFileSync(tep, "utf8"));
		vh.kyVong.vanDe = [];
		writeFileSync(tep, JSON.stringify(vh));
		const lech = lechNhan(docBoCaGopY(ban).filter((c) => c.id !== "gy-01"));
		expect(lech).toEqual(["ca-q4-vh kyVong"]);
		expect(readdirSync(ban).length).toBe(ca.length + 1);
	});
});

describe("bcq4-chon-bo", () => {
	test("biến chọn bộ, vắng hay rỗng thì bộ mẫu, thư mục lạ thì ném", () => {
		expect(thuMucBoCa({ [BIEN]: THU_MUC_CA_QUY_4 }, BIEN)).toBe(
			THU_MUC_CA_QUY_4,
		);
		expect(thuMucBoCa({}, BIEN)).toBe(THU_MUC_CA_MAU);
		expect(thuMucBoCa({ [BIEN]: "" }, BIEN)).toBe(THU_MUC_CA_MAU);
		expect(thuMucBoCa({ [BIEN]: "  " }, BIEN)).toBe(THU_MUC_CA_MAU);
		const khongCo = join(tmpdir(), "bcq4-khong-co-thu-muc-nay");
		expect(() => thuMucBoCa({ [BIEN]: khongCo }, BIEN)).toThrow(khongCo);
	});

	test("eval góp ý dựng danh sách ca qua thuMucBoCa", () => {
		const nguon = readFileSync(TEP_EVAL, "utf8");
		const than = nguon.slice(
			nguon.indexOf("function boCa()"),
			nguon.indexOf("function tranUsd()"),
		);
		expect(than).toContain("thuMucBoCa(process.env, GOP_Y_EVAL.env.thuMucCa");
		expect(than).not.toContain("THU_MUC_CA_MAU");
		expect(nguon).toContain("env: TRO_LY_OKR.danhGia.env");
		expect(readFileSync(TEP_CAU_HINH, "utf8")).toContain(`thuMucCa: "${BIEN}"`);
	});
});
