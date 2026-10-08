import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
	bamDauVao,
	CHAM_BO_DO,
	type ChiSo,
	docBanGhi,
	docBanGhiHead,
	doModel,
	dongKetLuot,
	donLuotCu,
	ghiBanGhi,
	gop,
	type KetCucMot,
	keHoachHoiLai,
	ketLuan,
	moThuMucLuot,
	type NhomCau,
	nhanHaiCau,
	nhanMotCau,
	phamViBam,
	quyetDungLai,
	vungXam,
} from "./quyet-do";

const GOC = resolve(import.meta.dir, "..", "..", "..");
const NGAY_MS = 24 * 60 * 60 * 1000;
const BAY = new Date("2026-10-08T00:00:00Z");
const donDep: string[] = [];

afterEach(() => {
	for (const d of donDep.splice(0)) rmSync(d, { recursive: true, force: true });
});

function thuMucTam(): string {
	const d = mkdtempSync(join(tmpdir(), "quyet-do-"));
	donDep.push(d);
	return d;
}

type DongNhan = readonly [NhomCau, KetCucMot, string];

const BANG_NHAN = [
	["co-trang", "khong-co-ket-qua", "loi"],
	["co-trang", "LOI", "loi"],
	["co-trang", "TRA_LOI-du", "dung-trang"],
	["co-trang", "TRA_LOI-sai", "sai"],
	["co-trang", "TU_CHOI", "sai"],
	["khong-co", "khong-co-ket-qua", "loi"],
	["khong-co", "LOI", "loi"],
	["khong-co", "TRA_LOI-du", "sai"],
	["khong-co", "TRA_LOI-sai", "sai"],
	["khong-co", "TU_CHOI", "tu-choi-dung"],
	["khong-dau", "LOI", "loi"],
	["khong-dau", "TRA_LOI-du", "dung-trang"],
] as const satisfies readonly DongNhan[];

const cauMot = (id: string, nhom: NhomCau, nhan: string) => ({
	id,
	nhom,
	nhan,
});
const cauHai = (id: string, quyDinh: boolean, nhan: string) => ({
	id,
	quyDinh,
	nhan,
});

describe("nhan-loi", () => {
	test("bảng nhãn lượt một: lỗi hạ tầng ra loi, model sai vẫn ra sai", () => {
		let chay = 0;
		for (const [nhom, ketCuc, mong] of BANG_NHAN) {
			const nhan = nhanMotCau(nhom, ketCuc);
			if (ketCuc === "LOI" && nhan === "sai")
				throw new Error("loi bi tinh la sai");
			expect(`${nhom}/${ketCuc}:${nhan}`).toBe(`${nhom}/${ketCuc}:${mong}`);
			chay++;
		}
		expect(chay).toBe(BANG_NHAN.length);
	});

	test("nhãn lượt hai: lỗi ra loi, có hàng ZALO ra chuyen", () => {
		expect(nhanHaiCau("loi")).toBe("loi");
		expect(nhanHaiCau("co-hang")).toBe("chuyen");
		expect(nhanHaiCau("khong-hang")).toBe("khong-chuyen");
	});

	test("có câu loi thì kết luận mã 2, câu loi không vào tử hay mẫu số", () => {
		const mot = [
			cauMot("c1", "co-trang", "dung-trang"),
			cauMot("c2", "co-trang", "loi"),
			cauMot("c3", "co-trang", "dung-trang"),
			cauMot("k1", "khong-co", "tu-choi-dung"),
			cauMot("k2", "khong-co", "loi"),
		];
		const kl = ketLuan(mot, [], CHAM_BO_DO.nguong);
		expect(kl.ma).toBe(2);
		expect(kl.dong[0]).toBe("KHONG DO DUOC: 2 cau loi (c2, k2)");
		expect(kl.so.dungTrang).toEqual({ k: 2, n: 2 });
		expect(kl.so.tuChoiDung).toEqual({ k: 1, n: 1 });
	});
});

describe("nhat-ky", () => {
	test("hai lượt liên tiếp có hai thư mục riêng, lượt sau không ghi đè lượt trước", () => {
		const goc = thuMucTam();
		const a = moThuMucLuot(goc, new Date("2026-10-08T01:00:00Z"), 11);
		writeFileSync(join(a, "ket-qua.jsonl"), "luot-1");
		const b = moThuMucLuot(goc, new Date("2026-10-08T01:00:00Z"), 12);
		expect(a).not.toBe(b);
		expect(existsSync(join(a, "ket-qua.jsonl"))).toBe(true);
	});

	test("dọn giữ đúng 10 thư mục lượt mới nhất", () => {
		const goc = thuMucTam();
		const ten = Array.from(
			{ length: 12 },
			(_, i) => `2026-10-08T${String(i).padStart(2, "0")}-00-00-000Z-1`,
		);
		for (const t of ten) mkdirSync(join(goc, t));
		donLuotCu(goc, CHAM_BO_DO.giuLuot);
		const con = readdirSync(goc).sort();
		if (con.length !== CHAM_BO_DO.giuLuot)
			throw new Error(
				`con ${con.length} thu muc luot, can ${CHAM_BO_DO.giuLuot}`,
			);
		expect(con).toEqual(ten.slice(2));
	});
});

const TEP_GOC = [
	{ duong: "apps/agent/agent/agent.ts", noiDung: "a" },
	{ duong: "apps/agent/agent/subagents/tro_ly_kho/agent.ts", noiDung: "b" },
	{ duong: "bun.lock", noiDung: "c" },
	{ duong: "_acceptance/tro-ly-doc-kho/bo-do/mam-tam.json", noiDung: "d" },
	{ duong: CHAM_BO_DO.banGhi, noiDung: "e" },
] as const;
const ID_GOC = { kho: "google/a", goc: "openai/b" } as const;

type DongBam = readonly [
	string,
	(
		t: typeof TEP_GOC,
		ids: typeof ID_GOC,
	) => [{ duong: string; noiDung: string }[], { kho: string; goc: string }],
	boolean,
];

const doiTep =
	(duong: string) =>
	(
		t: typeof TEP_GOC,
		ids: typeof ID_GOC,
	): [{ duong: string; noiDung: string }[], { kho: string; goc: string }] => [
		t.map((x) => (x.duong === duong ? { ...x, noiDung: `${x.noiDung}!` } : x)),
		ids,
	];

const MA_TRAN_BAM = [
	["apps/agent/agent", doiTep("apps/agent/agent/agent.ts"), true],
	["paths E15", doiTep("apps/agent/agent/subagents/tro_ly_kho/agent.ts"), true],
	["bun.lock", doiTep("bun.lock"), true],
	["bo cau", doiTep("_acceptance/tro-ly-doc-kho/bo-do/mam-tam.json"), true],
	["model id", (t, ids) => [[...t], { ...ids, goc: "openai/c" }], true],
	["tep ban ghi", doiTep(CHAM_BO_DO.banGhi), false],
] as const satisfies readonly DongBam[];

describe("bam", () => {
	test("ma trận sáu dòng: đổi riêng từng lớp đầu vào", () => {
		const goc = bamDauVao([...TEP_GOC], ID_GOC);
		expect(bamDauVao([...TEP_GOC], ID_GOC)).toBe(goc);
		let chay = 0;
		for (const [ten, doi, khac] of MA_TRAN_BAM) {
			const [tep, ids] = doi(TEP_GOC, ID_GOC);
			const moi = bamDauVao(tep, ids);
			if (khac && moi === goc) throw new Error(`doi ${ten} ma bam khong doi`);
			if (!khac && moi !== goc) throw new Error(`doi ${ten} ma bam doi`);
			chay++;
		}
		expect(chay).toBe(6);
	});

	test("phạm vi băm trên kho thật có lời dặn, gói, bộ câu; không có tệp bản ghi", () => {
		const ds = phamViBam(GOC);
		expect(ds).toContain("apps/agent/agent/agent.ts");
		expect(ds).toContain("bun.lock");
		expect(ds).toContain("_acceptance/tro-ly-doc-kho/bo-do/mam-tam.json");
		expect(ds).toContain("_acceptance/tro-ly-doc-kho/rang/quyet-do.ts");
		expect(ds).not.toContain(CHAM_BO_DO.banGhi);
	});
});

const banGhiMau = (o: { bam?: string; doLuc?: Date; dat?: boolean } = {}) =>
	docBanGhi(
		ghiBanGhi({
			bam: o.bam ?? "abc",
			doLuc: o.doLuc ?? new Date(BAY.getTime() - NGAY_MS),
			dat: o.dat ?? true,
			modelIds: ID_GOC,
			than: "## Tổng\n\n- dung trang: 85.0%",
		}),
	);

type DongDungLai = readonly [
	string,
	() => ReturnType<typeof docBanGhi>,
	boolean,
	boolean,
	string,
];

const BANG_DUNG_LAI = [
	[
		"cung bam con han",
		() => banGhiMau(),
		false,
		true,
		"DUNG LAI abc, do ngay 2026-10-07",
	],
	[
		"bam khac",
		() => banGhiMau({ bam: "xyz" }),
		false,
		false,
		"DO MOI: bam doi",
	],
	[
		"qua han",
		() => banGhiMau({ doLuc: new Date(BAY.getTime() - 8 * NGAY_MS) }),
		false,
		false,
		"DO MOI: qua han 7 ngay",
	],
	[
		"khong dat",
		() => banGhiMau({ dat: false }),
		false,
		false,
		"DO MOI: lan truoc khong dat",
	],
	["chua co", () => null, false, false, "DO MOI: chua co ban ghi"],
	["do lai", () => banGhiMau(), true, false, "DO MOI: --do-lai"],
] as const satisfies readonly DongDungLai[];

describe("dung-lai", () => {
	test("bảng sáu ca, bản ghi do chính hàm ghi viết", () => {
		let chay = 0;
		for (const [ten, banGhi, doLai, dungLai, dong] of BANG_DUNG_LAI) {
			const q = quyetDungLai(banGhi(), "abc", BAY, { doLai });
			if (ten === "qua han" && q.dungLai)
				throw new Error("dung lai ban ghi qua han");
			expect(`${ten}:${q.dungLai}:${q.dong}`).toBe(`${ten}:${dungLai}:${dong}`);
			chay++;
		}
		expect(chay).toBe(6);
	});

	test("bản ghi hỏng không ném, đọc ra null", () => {
		expect(docBanGhi("# không có khối")).toBeNull();
		expect(
			docBanGhi("<!-- ban-ghi-e15 -->\n{hong\n<!-- /ban-ghi-e15 -->"),
		).toBeNull();
	});

	test("chỉ đọc bản đã commit ở HEAD, không đọc bản sửa trên cây", () => {
		const kho = thuMucTam();
		const git = (...a: string[]) =>
			spawnSync("git", a, { cwd: kho, encoding: "utf8" });
		git("init", "-q");
		git("config", "user.email", "t@t");
		git("config", "user.name", "t");
		mkdirSync(join(kho, "e"), { recursive: true });
		writeFileSync(
			join(kho, "e", "b.md"),
			ghiBanGhi({
				bam: "da-commit",
				doLuc: BAY,
				dat: true,
				modelIds: ID_GOC,
				than: "",
			}),
		);
		git("add", ".");
		git("commit", "-q", "-m", "x");
		writeFileSync(
			join(kho, "e", "b.md"),
			ghiBanGhi({
				bam: "tren-cay",
				doLuc: BAY,
				dat: true,
				modelIds: ID_GOC,
				than: "",
			}),
		);
		expect(docBanGhi(docBanGhiHead(kho, "e/b.md") ?? "")?.bam).toBe(
			"da-commit",
		);
		expect(docBanGhiHead(thuMucTam(), "e/b.md")).toBeNull();
	});
});

type DongXam = readonly [
	number,
	number,
	number,
	">=" | "<=",
	ReturnType<typeof vungXam>,
];

const MA_TRAN_XAM = [
	[16, 20, 0.8, ">=", "dat"],
	[15, 20, 0.8, ">=", "xam"],
	[14, 20, 0.8, ">=", "khong-dat"],
	[19, 24, 0.8, ">=", "xam"],
	[5, 6, 0.8, ">=", "dat"],
	[4, 6, 0.8, ">=", "xam"],
	[3, 6, 0.8, ">=", "khong-dat"],
	[18, 20, 0.9, ">=", "dat"],
	[17, 20, 0.9, ">=", "xam"],
	[16, 20, 0.9, ">=", "khong-dat"],
	[2, 20, 0.1, "<=", "dat"],
	[3, 20, 0.1, "<=", "xam"],
	[4, 20, 0.1, "<=", "khong-dat"],
] as const satisfies readonly DongXam[];

describe("vung-xam", () => {
	test("ma trận mười ba dòng", () => {
		let chay = 0;
		for (const [k, n, t, chieu, mong] of MA_TRAN_XAM) {
			expect(`${k}/${n}@${t}${chieu}:${vungXam(k, n, t, chieu)}`).toBe(
				`${k}/${n}@${t}${chieu}:${mong}`,
			);
			chay++;
		}
		expect(chay).toBe(13);
	});

	test("nhóm rỗng không vào vùng xám", () => {
		expect(vungXam(0, 0, 0.8, ">=")).toBe("dat");
	});

	test("lượt một có câu loi thì không hỏi lại", () => {
		const mot = [
			...Array.from({ length: 15 }, (_, i) =>
				cauMot(`c${i}`, "co-trang", "dung-trang"),
			),
			...Array.from({ length: 4 }, (_, i) =>
				cauMot(`s${i}`, "co-trang", "sai"),
			),
			cauMot("l0", "co-trang", "loi"),
		];
		const kl = ketLuan(mot, [], CHAM_BO_DO.nguong);
		if (kl.xam.length > 0) throw new Error("hoi lai khi luot 1 co loi");
		expect(kl.ma).toBe(2);
		expect(keHoachHoiLai(kl, mot, [])).toEqual([]);
	});

	test("lượt một không loi, dung trang xám: hỏi lại đúng bộ câu của chỉ số đó, một lần", () => {
		const mot = [
			...Array.from({ length: 15 }, (_, i) =>
				cauMot(`c${i}`, "co-trang", "dung-trang"),
			),
			...Array.from({ length: 5 }, (_, i) =>
				cauMot(`s${i}`, "co-trang", "sai"),
			),
			cauMot("k0", "khong-co", "tu-choi-dung"),
		];
		const kl = ketLuan(mot, [], CHAM_BO_DO.nguong);
		expect(kl.xam).toEqual(["dungTrang"] satisfies ChiSo[]);
		const hoi = keHoachHoiLai(kl, mot, []);
		expect(hoi).toEqual([
			{
				chiSo: "dungTrang",
				ids: [
					...Array.from({ length: 15 }, (_, i) => `c${i}`),
					...Array.from({ length: 5 }, (_, i) => `s${i}`),
				],
			},
		]);
	});
});

describe("gop", () => {
	test("gộp 15/20 và 17/20 thành 80% đạt, ghi đủ ba tỉ lệ", () => {
		const g = gop({ k: 15, n: 20 }, { k: 17, n: 20 }, 0.8, ">=");
		expect(g.dat).toBe(true);
		expect(g.dong).toContain("luot 1 75.0%");
		expect(g.dong).toContain("luot 2 85.0%");
		expect(g.dong).toContain("gop 80.0%");
	});

	test("kết luận trên tỉ lệ gộp, không trên lượt hai", () => {
		const a = gop({ k: 17, n: 20 }, { k: 15, n: 20 }, 0.8, ">=");
		if (!a.dat) throw new Error("ket luan khong tren ti le gop");
		const b = gop({ k: 15, n: 20 }, { k: 15, n: 20 }, 0.8, ">=");
		expect(b.dat).toBe(false);
		expect(b.hoiLanBa).toBe(false);
	});

	test("cuối lượt đạt thì in lệnh ghi bản ghi, không đạt thì không", () => {
		expect(dongKetLuot(0, "/t/cham-bo-do.md")).toEqual([
			`GHI BAN GHI: bun _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts --ghi-ban-ghi /t/cham-bo-do.md`,
		]);
		expect(dongKetLuot(1, "/t/cham-bo-do.md")).toEqual([]);
	});
});

describe("do-model", () => {
	test("hai lời dò trả hai id thật", async () => {
		const kq = await doModel(async (vai) => ({
			modelId: vai === "kho" ? "a/x" : "b/y",
		}));
		if (kq.ma === 0 && !("goc" in kq.ids))
			throw new Error("thieu model_id cua goc");
		expect(kq).toEqual({ ma: 0, ids: { kho: "a/x", goc: "b/y" } });
	});

	test("lời dò model gốc ném 402 thì không đo được", async () => {
		const kq = await doModel(async (vai) => {
			if (vai === "goc") throw new Error("402 budget exceeded");
			return { modelId: "a/x" };
		});
		expect(kq).toEqual({
			ma: 2,
			dong: "KHONG DO DUOC: do model goc loi: 402 budget exceeded",
		});
	});

	test("modelId rỗng thì không đo được", async () => {
		const kq = await doModel(async () => ({ modelId: "" }));
		expect(kq).toEqual({
			ma: 2,
			dong: "KHONG DO DUOC: do model kho khong co modelId",
		});
	});
});
