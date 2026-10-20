import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { ghiBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import {
	luuTruSanPham,
	suaSanPham,
	taoSanPham,
} from "@crm/db/san-pham-lo-trinh";
import { LO_TRINH_SAN_PHAM } from "@crm/db/san-pham-lo-trinh-danh-muc";
import {
	type LoTrinhDuLieu,
	phanTichLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";
import { maTuTen } from "@crm/validation/san-pham-lo-trinh";
import {
	type KhoGia,
	taoGithubGia,
} from "../../../scripts/lo-trinh-san-pham/github-gia";
import { docDuLieu } from "@crm/validation/doc-du-lieu-lo-trinh";
import { layLoTrinhSanPham } from "../agent/lib/lo-trinh-san-pham";
import { gieoNguoi, moXuong } from "./support/nhac-gieo";

const MAU = readFileSync(
	join(import.meta.dir, "mau", "lo-trinh-kit.html"),
	"utf8",
);
const ID_UNG_DUNG = "424242";
const URL_GIA = "http://github-gia.test";
const TIEN_TO = maTuTen(
	`ltsp ag ${process.env.TEST_RUN_ID ?? Date.now().toString(36)}`,
);
const NOW = new Date("2026-10-20T08:00:00Z");
const NHIP = LO_TRINH_SAN_PHAM.nhipKiemMs;
const sau = (ms: number) => new Date(NOW.getTime() + ms);
const sha = (c: string) => c.repeat(40);

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
	modulusLength: 2048,
});
const PEM = privateKey.export({ type: "pkcs1", format: "pem" }).toString();
const CONG_KHAI = publicKey.export({ type: "spki", format: "pem" }).toString();
const MANH_KHOA = PEM.split("\n")
	.filter((d) => !d.startsWith("-----"))
	.join("")
	.slice(40, 60);

const BIEN = [
	"GITHUB_APP_ID",
	"GITHUB_APP_PRIVATE_KEY",
	"GITHUB_API_URL",
] as const;
let khoiPhucBien: () => void = () => {};

function datBien(bien: Partial<Record<(typeof BIEN)[number], string>>) {
	const cu = BIEN.map((t) => [t, process.env[t]] as const);
	for (const t of BIEN) delete process.env[t];
	for (const [t, v] of Object.entries(bien)) process.env[t] = v;
	return () => {
		for (const [t, v] of cu) {
			if (v === undefined) delete process.env[t];
			else process.env[t] = v;
		}
	};
}

const BIEN_DU = {
	GITHUB_APP_ID: ID_UNG_DUNG,
	GITHUB_APP_PRIVATE_KEY: PEM.replace(/\n/g, "\\n"),
	GITHUB_API_URL: URL_GIA,
};

let nguoiTao = "";
let dem = 0;

async function taoSp(ten: string) {
	dem += 1;
	const ma = `${TIEN_TO}-${ten}-${dem}`;
	await taoSanPham(db, {
		ma,
		ten: `${TIEN_TO} ${ten}`,
		kho: `phanlemanh/${ma}`,
		nhanh: "main",
		duongTep: "LO-TRINH.html",
		taoBoiId: nguoiTao,
	});
	return { ma, kho: `phanlemanh/${ma}` };
}

function khoLanh(
	html = MAU,
	s = sha("a"),
	commitLuc = "2026-10-19T10:00:00Z",
): KhoGia {
	return {
		html: () => html,
		dauNhanh: { sha: s, commitLuc },
		caiLuc: "2026-10-18T09:00:00Z",
	};
}

function gia(kho: Record<string, KhoGia>) {
	return taoGithubGia({ khoaCongKhai: CONG_KHAI, kho, idUngDung: ID_UNG_DUNG });
}

const lay = (now: Date, f: typeof fetch) =>
	layLoTrinhSanPham(now, { f, tienTo: TIEN_TO });

function khoiCua(html: string) {
	const m = html.match(
		/(<script type="application\/json" id="lo-trinh-du-lieu">)([\s\S]*?)(<\/script>)/,
	);
	if (!m) throw new Error("mau khong co khoi");
	const kq = phanTichLoTrinh(docDuLieu(html).duLieu);
	if (!kq.ok) throw new Error(`mau khong qua khuon: ${kq.duongKhoa}`);
	return {
		json: kq.duLieu,
		ghep: (chu: string) => html.replace(m[0], `${m[1]}${chu}${m[3]}`),
	};
}

async function donSp() {
	const ds = await db.sanPhamLoTrinh.findMany({
		where: { ma: { startsWith: TIEN_TO } },
		select: { ma: true },
	});
	await db.banChupLoTrinh.deleteMany({
		where: { nguon: { in: ds.map((d) => d.ma) } },
	});
	await db.sanPhamLoTrinh.deleteMany({
		where: { ma: { startsWith: TIEN_TO } },
	});
}

async function crmTruoc() {
	return JSON.stringify(
		await db.banChupLoTrinh.findUnique({ where: { nguon: "crm" } }),
	);
}

beforeAll(async () => {
	await moXuong();
	nguoiTao = (await gieoNguoi(`${TIEN_TO} chu`)).id;
});

beforeEach(async () => {
	await donSp();
	khoiPhucBien = datBien(BIEN_DU);
});

afterEach(() => khoiPhucBien());

afterAll(async () => {
	await donSp();
	await db.member.deleteMany({ where: { userId: nguoiTao } });
	await db.user.deleteMany({ where: { id: nguoiTao } });
});

describe("ltsp-lay-dau", () => {
	test("nhịp đầu lấy đúng đầu nhánh và nguyên khối của kho", async () => {
		const kit = await taoSp("kit");
		const crm = await crmTruoc();
		const g = gia({ [kit.kho]: khoLanh() });
		await lay(NOW, g.fetch);
		const bc = await db.banChupLoTrinh.findUniqueOrThrow({
			where: { nguon: kit.ma },
		});
		expect(bc.sha).toBe(sha("a"));
		if (bc.commitLuc.toISOString() !== "2026-10-19T10:00:00.000Z")
			throw new Error("ban chup khong mang gio commit cua dau nhanh: kit");
		const doc = docDuLieu(MAU);
		expect(bc.duLieu).toEqual(JSON.parse(JSON.stringify(doc.duLieu)));
		expect(bc.canhBao).toEqual(doc.canhBao);
		const sp = await db.sanPhamLoTrinh.findUniqueOrThrow({
			where: { ma: kit.ma },
		});
		expect(sp.trangThaiLay).toBe("da-lay");
		expect(sp.layDauLuc?.toISOString()).toBe(NOW.toISOString());
		expect(sp.caiLuc?.toISOString()).toBe("2026-10-18T09:00:00.000Z");
		expect(sp.phienBanKhuon).toBe(2);
		expect(sp.kiemLuc?.toISOString()).toBe(NOW.toISOString());
		expect(
			await db.banChupLoTrinh.count({
				where: { nguon: { startsWith: TIEN_TO } },
			}),
		).toBe(1);
		expect(await crmTruoc()).toBe(crm);
	});

	test("đối chứng: ứng dụng chưa cài thì không có bản chụp", async () => {
		const kit = await taoSp("chua-cai");
		const g = gia({ [kit.kho]: { ...khoLanh(), caiLuc: null } });
		await lay(NOW, g.fetch);
		expect(await db.banChupLoTrinh.count({ where: { nguon: kit.ma } })).toBe(0);
	});
});

describe("ltsp-nhip", () => {
	test("nhánh đổi thì lấy bản mới, đứng yên thì không tải lại, chưa tới nhịp thì không gọi", async () => {
		const kit = await taoSp("nhip");
		const kho = khoLanh();
		const g = gia({ [kit.kho]: kho });
		await lay(NOW, g.fetch);
		kho.dauNhanh = { sha: sha("b"), commitLuc: "2026-10-20T07:00:00Z" };
		const t1 = sau(NHIP);
		await lay(t1, g.fetch);
		expect(
			(await db.banChupLoTrinh.findUniqueOrThrow({ where: { nguon: kit.ma } }))
				.sha,
		).toBe(sha("b"));
		const tai = g.goi.filter((x) => x.duong === "contents");
		expect(tai.length).toBe(2);
		expect(tai[1]?.url.endsWith(`ref=${sha("b")}`)).toBe(true);

		const t2 = sau(2 * NHIP);
		const nhanhTruoc = g.dem("branches");
		await lay(t2, g.fetch);
		if (g.dem("contents") !== 2)
			throw new Error("tai lai tep khi nhanh dung yen");
		expect(g.dem("branches")).toBe(nhanhTruoc + 1);
		expect(
			(
				await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: kit.ma } })
			).kiemLuc?.toISOString(),
		).toBe(t2.toISOString());

		const tong = g.goi.length;
		await lay(new Date(t2.getTime() + NHIP / 5), g.fetch);
		expect(g.goi.length).toBe(tong);
	});

	test("một nhịp không lấy quá trần số sản phẩm", async () => {
		const kho: Record<string, KhoGia> = {};
		for (let i = 0; i < LO_TRINH_SAN_PHAM.toiDaMoiNhip + 2; i += 1)
			kho[(await taoSp(`tran${i}`)).kho] = khoLanh();
		const g = gia(kho);
		await lay(NOW, g.fetch);
		expect(g.dem("branches")).toBe(LO_TRINH_SAN_PHAM.toiDaMoiNhip);
		await lay(NOW, g.fetch);
		expect(g.dem("branches")).toBe(LO_TRINH_SAN_PHAM.toiDaMoiNhip + 2);
	});

	test("hai nhịp chồng nhau không ghi hai lần", async () => {
		const kit = await taoSp("chong");
		const g = gia({ [kit.kho]: khoLanh() });
		await Promise.all([lay(NOW, g.fetch), lay(NOW, g.fetch)]);
		expect(await db.banChupLoTrinh.count({ where: { nguon: kit.ma } })).toBe(1);
		const sp = await db.sanPhamLoTrinh.findUniqueOrThrow({
			where: { ma: kit.ma },
		});
		expect(sp.trangThaiLay).toBe("da-lay");
		expect(sp.layDauLuc?.toISOString()).toBe(NOW.toISOString());
	});
});

async function coSan(ma: string) {
	await ghiBanChupLoTrinh(
		db,
		{
			nguon: ma,
			sha: sha("0"),
			commitLuc: "2026-10-01T00:00:00Z",
			duLieu: { khuon: "lo-trinh-du-lieu" },
			canhBao: [],
		},
		NOW,
	);
}

describe("ltsp-hong", () => {
	const khoi = khoiCua(MAU);
	const maViecLaSo = JSON.stringify(khoi.json).replace(
		/"hang":\[\{"ma":"[^"]*"/,
		'"hang":[{"ma":123',
	);
	const CA: {
		ten: string;
		ky: string;
		bien?: Partial<typeof BIEN_DU>;
		kho: (k: KhoGia) => KhoGia;
		chiTiet?: string;
	}[] = [
		{
			ten: "thieu-id",
			ky: "chua-cau-hinh",
			bien: { ...BIEN_DU, GITHUB_APP_ID: "" },
			kho: (k) => k,
		},
		{
			ten: "thieu-khoa",
			ky: "chua-cau-hinh",
			bien: { ...BIEN_DU, GITHUB_APP_PRIVATE_KEY: "" },
			kho: (k) => k,
		},
		{ ten: "chua-cai", ky: "chua-cai", kho: (k) => ({ ...k, caiLuc: null }) },
		{
			ten: "khong-nhanh",
			ky: "khong-thay-kho",
			kho: (k) => ({ ...k, dauNhanh: null }),
		},
		{
			ten: "khong-tep",
			ky: "khong-thay-tep",
			kho: (k) => ({ ...k, html: () => null }),
		},
		{
			ten: "khong-khoi",
			ky: "khoi-hong",
			kho: (k) => ({ ...k, html: () => "<html><body>khong</body></html>" }),
		},
		{
			ten: "sai-khuon",
			ky: "khoi-hong",
			chiTiet: "lo_trinh",
			kho: (k) => ({
				...k,
				html: () => khoi.ghep(maViecLaSo),
			}),
		},
		{
			ten: "qua-tran",
			ky: "qua-tran",
			kho: (k) => ({
				...k,
				html: () => `${MAU}${" ".repeat(LO_TRINH_SAN_PHAM.tranTepByte)}`,
			}),
		},
		{
			ten: "loi-5xx",
			ky: "loi-github",
			kho: (k) => ({ ...k, loi: { branches: 502 } }),
		},
		{
			ten: "het-han-muc",
			ky: "loi-github",
			kho: (k) => ({ ...k, gioiHan: true }),
		},
	];

	test("mỗi ca hỏng gọi đúng chỗ, bản chụp đang lưu không đổi, sản phẩm khác vẫn được lấy", async () => {
		let soCa = 0;
		for (const ca of CA) {
			await donSp();
			const hong = await taoSp(`hong-${ca.ten}`);
			const ok = await taoSp(`ok-${ca.ten}`);
			await coSan(hong.ma);
			const crm = await crmTruoc();
			if (ca.bien) {
				khoiPhucBien();
				khoiPhucBien = datBien(
					Object.fromEntries(
						Object.entries(ca.bien).filter(([, v]) => v !== ""),
					),
				);
			}
			const g = gia({
				[hong.kho]: ca.kho(khoLanh(MAU, sha("c"))),
				[ok.kho]: khoLanh(MAU, sha("d")),
			});
			await lay(NOW, g.fetch);
			const sp = await db.sanPhamLoTrinh.findUniqueOrThrow({
				where: { ma: hong.ma },
			});
			expect(`${ca.ten}:${sp.trangThaiLay}`).toBe(`${ca.ten}:${ca.ky}`);
			if (ca.chiTiet) expect(sp.chiTietLay ?? "").toContain(ca.chiTiet);
			const bc = await db.banChupLoTrinh.findUniqueOrThrow({
				where: { nguon: hong.ma },
			});
			expect(`${ca.ten}:${bc.sha}`).toBe(`${ca.ten}:${sha("0")}`);
			if (ca.ky !== "chua-cau-hinh") {
				const bcOk = await db.banChupLoTrinh.findUnique({
					where: { nguon: ok.ma },
				});
				if (bcOk?.sha !== sha("d"))
					throw new Error("loi mot san pham chan san pham khac: ok");
			} else {
				expect(g.goi.length).toBe(0);
				expect(
					(await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: ok.ma } }))
						.trangThaiLay,
				).toBe("chua-cau-hinh");
			}
			expect(await crmTruoc()).toBe(crm);
			if (ca.bien) {
				khoiPhucBien();
				khoiPhucBien = datBien(BIEN_DU);
			}
			soCa += 1;
		}
		console.log(`ltsp-hong: ${soCa} o da xet`);
		expect(soCa).toBe(CA.length);
	});
});

describe("ltsp-vong-doi", () => {
	test("sản phẩm đã lưu trữ không được lấy", async () => {
		const kit = await taoSp("luu-tru");
		await luuTruSanPham(db, kit.ma, NOW);
		const g = gia({ [kit.kho]: khoLanh() });
		await lay(NOW, g.fetch);
		expect(g.goi.filter((x) => x.kho === kit.kho).length).toBe(0);
	});
});

describe("ltsp-danh-ba", () => {
	test("lần lấy đầu của nguồn mới thay hẳn bản của nguồn cũ, rồi ghi một chiều trở lại", async () => {
		const kit = await taoSp("nguon");
		const khoCu = khoLanh(MAU, sha("e"), "2026-10-19T12:00:00Z");
		const g1 = gia({ [kit.kho]: khoCu });
		await lay(NOW, g1.fetch);
		const khoMoi = "phanlemanh/kho-moi-" + kit.ma;
		await suaSanPham(db, kit.ma, { kho: khoMoi }, NOW);
		const vanCu = await db.banChupLoTrinh.findUniqueOrThrow({
			where: { nguon: kit.ma },
		});
		expect(vanCu.sha).toBe(sha("e"));
		const khoSau = khoLanh(MAU, sha("f"), "2026-10-10T00:00:00Z");
		const g2 = gia({ [khoMoi]: khoSau });
		await lay(sau(1), g2.fetch);
		const moi = await db.banChupLoTrinh.findUniqueOrThrow({
			where: { nguon: kit.ma },
		});
		if (moi.sha !== sha("f"))
			throw new Error(`nguon moi khong thay ban chup cua nguon cu: ${kit.ma}`);
		expect(
			(await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: kit.ma } }))
				.nguonDoiLuc,
		).toBeNull();
		khoSau.dauNhanh = { sha: sha("9"), commitLuc: "2026-10-01T00:00:00Z" };
		await lay(sau(NHIP + 1), g2.fetch);
		expect(
			(await db.banChupLoTrinh.findUniqueOrThrow({ where: { nguon: kit.ma } }))
				.sha,
		).toBe(sha("f"));
	});

	test("nguồn đổi giữa lúc đang lấy thì kết quả của nguồn cũ không được ghi", async () => {
		const kit = await taoSp("doi-giua");
		const g = gia({ [kit.kho]: khoLanh(MAU, sha("c")) });
		const khoMoi = "phanlemanh/kho-giua-" + kit.ma;
		let daDoi = false;
		const f = (async (url: string | URL | Request, init?: RequestInit) => {
			if (!daDoi && String(url).includes("/contents/")) {
				daDoi = true;
				await suaSanPham(db, kit.ma, { kho: khoMoi }, sau(1));
			}
			return g.fetch(url, init);
		}) as typeof fetch;
		await lay(NOW, f);
		expect(daDoi).toBe(true);
		const sp = await db.sanPhamLoTrinh.findUniqueOrThrow({
			where: { ma: kit.ma },
		});
		const banChup = await db.banChupLoTrinh.findUnique({
			where: { nguon: kit.ma },
		});
		if (sp.nguonDoiLuc === null || banChup?.sha === sha("c"))
			throw new Error(
				`luot lay nguon cu ghi de thay doi nguon: ${kit.ma} trangThai=${sp.trangThaiLay}`,
			);
		expect(sp.kho).toBe(khoMoi);
		expect(sp.trangThaiLay).toBe("chua-lay");
		expect(sp.kiemLuc).toBeNull();
	});
});

describe("ltsp-khuon", () => {
	const khoi = khoiCua(MAU);
	const khongMoHinh = (o: LoTrinhDuLieu) => ({
		...o,
		lo_trinh: o.lo_trinh.map(({ chua_hen_moc: _a, ...t }) => ({
			...t,
			hang: t.hang.map(({ ten_hien_thi: _b, ...h }) => h),
			moc: t.moc.map(({ hien: _c, viec_hien: _d, con_lai: _e, ...m }) => m),
		})),
	});
	const banMot = (o: LoTrinhDuLieu) => ({
		...o,
		phien_ban: 1,
		lo_trinh: o.lo_trinh.map((t) => ({
			...t,
			hang: t.hang.map(({ tom_tat: _t, ...h }) => h),
		})),
	});
	const phienMau = khoi.json.phien_ban;

	test("khuôn khác bị từ chối; ba đời khuôn đều được lấy với đúng số bản", async () => {
		const la = await taoSp("khuon-la");
		const g = gia({
			[la.kho]: khoLanh(
				khoi.ghep(
					JSON.stringify(khoi.json).replace(
						'"khuon":"lo-trinh-du-lieu"',
						'"khuon":"khac"',
					),
				),
			),
		});
		await lay(NOW, g.fetch);
		expect(
			(await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: la.ma } }))
				.trangThaiLay,
		).toBe("khoi-hong");
		expect(await db.banChupLoTrinh.count({ where: { nguon: la.ma } })).toBe(0);

		const doi: [string, string, number][] = [
			["k1", JSON.stringify(banMot(khoi.json)), 1],
			["k2", JSON.stringify(khongMoHinh(khoi.json)), phienMau],
			[
				"k3",
				JSON.stringify({ ...khoi.json, phien_ban: phienMau + 1 }),
				phienMau + 1,
			],
		];
		for (const [ten, o, ky] of doi) {
			const sp = await taoSp(ten);
			const html = khoi.ghep(o);
			if (
				ten === "k3" &&
				!docDuLieu(html).canhBao.some((c: string) =>
					c.includes("mới hơn bộ đọc"),
				)
			)
				throw new Error("mau k3 khong moi hon bo doc");
			const gk = gia({ [sp.kho]: khoLanh(html) });
			await lay(NOW, gk.fetch);
			const hang = await db.sanPhamLoTrinh.findUniqueOrThrow({
				where: { ma: sp.ma },
			});
			if (hang.trangThaiLay !== "da-lay")
				throw new Error(`khuon moi hon bi tu choi: ${ten.toUpperCase()}`);
			expect(`${ten}:${hang.phienBanKhuon}`).toBe(`${ten}:${ky}`);
			expect(await db.banChupLoTrinh.count({ where: { nguon: sp.ma } })).toBe(
				1,
			);
		}
	});
});

describe("ltsp-khoa", () => {
	test("token chỉ đọc, đúng một kho; JWT ngắn hạn; khoá và token không lọt ra ngoài", async () => {
		const kit = await taoSp("khoa");
		const hong = await taoSp("khoa-hong");
		const dong: string[] = [];
		const nghe = (...a: unknown[]) => void dong.push(a.map(String).join(" "));
		const spies = [
			spyOn(console, "log").mockImplementation(nghe),
			spyOn(console, "warn").mockImplementation(nghe),
			spyOn(console, "error").mockImplementation(nghe),
		];
		try {
			const g = gia({
				[kit.kho]: khoLanh(),
				[hong.kho]: { ...khoLanh(), html: () => null },
			});
			await lay(NOW, g.fetch);
			const xin = g.goi.filter(
				(x) => x.duong === "access_tokens" && x.kho === kit.kho,
			);
			expect(xin.length).toBe(1);
			const ky = {
				repositories: [kit.kho.split("/")[1]],
				permissions: { contents: "read", metadata: "read" },
			};
			if (JSON.stringify(xin[0]?.than) !== JSON.stringify(ky))
				throw new Error("token khong thu hep theo kho");
			for (const x of g.goi.filter(
				(y) => y.duong === "installation" || y.duong === "access_tokens",
			)) {
				expect(x.jwt).not.toBeNull();
				expect((x.jwt?.exp ?? 0) - (x.jwt?.iat ?? 0)).toBeLessThanOrEqual(600);
				expect(x.jwt?.iss).toBe(ID_UNG_DUNG);
			}
		} finally {
			for (const s of spies) s.mockRestore();
		}
		expect(dong.length).toBeGreaterThan(0);
		for (const d of dong) {
			expect(d.includes(MANH_KHOA)).toBe(false);
			expect(d.includes("ghs_token-gia")).toBe(false);
		}
		const hang = JSON.stringify([
			await db.sanPhamLoTrinh.findMany({
				where: { ma: { startsWith: TIEN_TO } },
			}),
			await db.banChupLoTrinh.findMany({
				where: { nguon: { startsWith: TIEN_TO } },
				select: { nguon: true, sha: true, canhBao: true },
			}),
			await db.agentTask.findMany({
				where: { createdAt: { gte: new Date(Date.now() - 60_000) } },
				select: { payload: true },
			}),
		]);
		expect(hang.includes(MANH_KHOA)).toBe(false);
		expect(hang.includes("ghs_token-gia")).toBe(false);
	});
});
