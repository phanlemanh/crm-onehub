import { beforeAll, describe, expect, test } from "bun:test";
import {
	AI,
	type Ai,
	deXuat,
	donTaiLieu,
	dungSan,
	duyet,
	hoi,
	ok,
	taoTrang,
	traLai,
} from "./tai-lieu-san";

dungSan();

const TRANG_THAI = ["S1", "S2", "S3", "S4"] as const;
type TrangThai = (typeof TRANG_THAI)[number];
const DUONG = ["tim", "nhacToi", "sucKhoe"] as const;
type Duong = (typeof DUONG)[number];

const THAY_BAN_CHO: readonly Ai[] = ["tao", "chu", "owner", "admin"];
const TU_CAM = ["tulapcho", "tulapcho2", "tulaptralai"] as const;
const TEN_NHAP = "Trang nhap S1";

const slug: Record<string, string> = {};
const lk = () => `[quy trình D](/ws/tai-lieu/${slug.D})`;

type SucKhoe = {
	choDuyet: { rows: { slug: string; ten: string; soBan: number }[] };
	moCoi: { rows: { slug: string }[] };
};
type KetQua = {
	tim: Record<TrangThai, { slug: string }[]>;
	timJson: string;
	nhacToi: { slug: string }[];
	nhacToiJson: string;
	sucKhoe: SucKhoe;
	sucKhoeJson: string;
};

async function trangDuyet(k: string, ten: string, noiDung: string) {
	const moi = await taoTrang(ten, noiDung);
	await duyet(moi.deXuatId, "chu");
	slug[k] = moi.slug;
}

beforeAll(async () => {
	await donTaiLieu({});
	await trangDuyet("D", "Đích khong-ro", "Trang đích.\n");
	await trangDuyet("A", "Nguồn A khong-ro", `Xem ${lk()}.\n`);
	const s1 = await taoTrang(TEN_NHAP, "Nháp có tulapcho ở đây.\n");
	slug.S1 = s1.slug;
	await trangDuyet("S2", "Trang S2 khong-ro", "Bản đang dùng của S2.\n");
	await deXuat(slug.S2 as string, `Bản chờ có tulapcho2 và nhắc ${lk()}.\n`);
	await trangDuyet("S3", "Trang S3 khong-ro", "Bản đang dùng của S3.\n");
	await traLai(
		await deXuat(slug.S3 as string, "Bản trả lại có tulaptralai.\n"),
		"chu",
	);
	await trangDuyet("S4", "Trang S4 khong-ro", "Bản đang dùng có tulapdung.\n");
});

const TU_TIM = {
	S1: "tulapcho",
	S2: "tulapcho2",
	S3: "tulaptralai",
	S4: "tulapdung",
} satisfies Record<TrangThai, string>;

async function doc(ai: Ai): Promise<KetQua> {
	const tim = {} as Record<TrangThai, { slug: string }[]>;
	let timJson = "";
	for (const s of TRANG_THAI) {
		const ra = ok<{ rows: { slug: string }[] }>(
			await hoi("taiLieu.tim", { q: TU_TIM[s] }, ai),
			`tim ${s} ${ai}`,
		);
		tim[s] = ra.rows;
		if (s !== "S4") timJson += JSON.stringify(ra);
	}
	const nhac = ok<{ rows: { slug: string }[] }>(
		await hoi("taiLieu.nhacToi", { slug: slug.D }, ai),
		`nhacToi ${ai}`,
	);
	const sk = ok<SucKhoe>(
		await hoi("taiLieu.sucKhoe", undefined, ai),
		`sk ${ai}`,
	);
	return {
		tim,
		timJson,
		nhacToi: nhac.rows,
		nhacToiJson: JSON.stringify(nhac),
		sucKhoe: sk,
		sucKhoeJson: JSON.stringify(sk),
	};
}

function tenAi(ai: Ai): string {
	return ai === "khac" ? "member-khac" : ai;
}

function kiemO(ai: Ai, s: TrangThai, duong: Duong, kq: KetQua): void {
	const thayCho = THAY_BAN_CHO.includes(ai);
	const tai = `khong-ro: ${duong} x ${s} x ${tenAi(ai)}`;
	if (duong === "tim") {
		const coSlug = kq.tim[s].map((r) => r.slug);
		if (s === "S4") {
			expect(coSlug, `${tai}: doi chung duong`).toEqual([slug.S4 as string]);
			return;
		}
		if (coSlug.length > 0) {
			throw new Error(`khong-ro: tim lo ${TU_TIM[s]} cho ${tenAi(ai)}`);
		}
		expect(kq.timJson.includes(TEN_NHAP), tai).toBe(false);
		return;
	}
	if (duong === "nhacToi") {
		const coSlug = kq.nhacToi.map((r) => r.slug);
		if (!coSlug.includes(slug.A as string)) {
			throw new Error("khong-ro: nhacToi mat nguon A");
		}
		expect(coSlug, `${tai}: chi nguon da duyet`).toEqual([slug.A as string]);
		expect(kq.nhacToiJson.includes(slug[s] as string) && s !== "S4", tai).toBe(
			false,
		);
		for (const tu of TU_CAM)
			expect(kq.nhacToiJson.includes(tu), tai).toBe(false);
		return;
	}
	const cho = Object.fromEntries(
		kq.sucKhoe.choDuyet.rows.map((r) => [r.slug, r.soBan]),
	);
	for (const tu of TU_CAM) {
		expect(kq.sucKhoeJson.includes(tu), `${tai}: lo ${tu}`).toBe(false);
	}
	if (s === "S1") {
		const coTen = kq.sucKhoeJson.includes(TEN_NHAP);
		if (!thayCho && coTen) {
			throw new Error(`khong-ro: ${tenAi(ai)} thay ${TEN_NHAP}`);
		}
		expect(cho[slug.S1 as string], tai).toBe(thayCho ? 1 : undefined);
		return;
	}
	if (s === "S2") {
		expect(cho[slug.S2 as string], tai).toBe(thayCho ? 1 : undefined);
		return;
	}
	if (s === "S3") {
		expect(cho[slug.S3 as string], tai).toBeUndefined();
		return;
	}
	expect(
		kq.sucKhoe.moCoi.rows.map((r) => r.slug),
		`${tai}: doi chung duong`,
	).toContain(slug.S4 as string);
	expect(cho[slug.S4 as string], tai).toBeUndefined();
}

describe("khong-ro-tim", () => {
	test("khong-ro: 6 nguoi x 4 trang thai x 3 duong doc moi, ky vong tung o", async () => {
		let soO = 0;
		for (const ai of AI) {
			const kq = await doc(ai);
			for (const s of TRANG_THAI) {
				for (const duong of DUONG) {
					kiemO(ai, s, duong, kq);
					soO += 1;
				}
			}
		}
		expect(soO).toBe(72);
	});
});
