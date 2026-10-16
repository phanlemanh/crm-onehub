import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dir, "..", "..", "..");
const { z } = createRequire(join(GOC, "apps", "agent", "package.json"))(
	"zod",
) as typeof import("zod");

const SO = {
	evidence: resolve(import.meta.dir, "..", "evidence"),
	tepDo: resolve(import.meta.dir, "do-tac-nhan.ts"),
	chanDocLai: "if (doc.id !== model)",
	goiDat: "datModel(url, b.model);",
	goiEval: "await chay(",
	slug: "tac-nhan-glm-5-3-cham",
	tran: 180,
	tepBam: "bam.txt",
	bang: "bang.md",
	khongBam: ["bam.txt", "ket-luan.md"],
	choPhep: (f: string) =>
		f.startsWith("_acceptance/tac-nhan-glm-5-3-cham/") ||
		f === "_acceptance/config.yaml" ||
		f === "PRODUCT-MAP.md" ||
		f === "LO-TRINH.html",
	nhan: {
		thieu: "THIEU CAP",
		lech: "LECH AICHIPHI",
		chong: "CHONG GIO",
		lien: "LIEN NHAU CUNG BIEN THE",
		sauKetThuc: "PHIEN CON CHAY SAU HUY",
		biCat: "BI CAT",
		bang: "LECH bang.md",
		bam: "BAM",
		saiModel: "sai model",
		docLai: "THIEU DOC LAI MODEL",
		thieuLuot: "thieu luot",
		roSuyLuan: "RO SUY LUAN",
		doSuyLuan: "DO SUY LUAN THIEU",
	},
} as const;

const khuonKeHoach = z.object({
	bien_the: z.array(
		z.object({ ten: z.string(), model: z.string(), low: z.boolean() }),
	),
	so_luot: z.number().int().positive(),
	bam_agent_goc: z.string().length(64),
	bam_agent_low: z.string().length(64),
});
const khuonDong = z.object({
	bien_the: z.string(),
	luot: z.number().int().positive(),
	model: z.string(),
	bat_dau: z.string(),
	ket_thuc: z.string(),
	giay: z.number(),
	ket_qua: z.enum(["qua", "hong"]),
	ly_do: z.string().nullable(),
	bi_cat: z.boolean(),
	phien_goc: z.string().min(1),
	bam_agent: z.string().length(64),
	nhat_ky: z.string(),
	aichiphi: z.string(),
});
const khuonHang = z.object({
	id: z.string(),
	at: z.string(),
	sessionId: z.string(),
	phienCha: z.string().nullable(),
	modelId: z.string().nullable(),
	inputTokens: z.number().nullable(),
	outputTokens: z.number().nullable(),
});
const khuonMuc = z.object({
	status: z.number(),
	model: z.string().nullable(),
	token_ra: z.number().nullable(),
	token_suy_luan: z.number().nullable(),
});
const khuonDoSuyLuan = z.object({
	model: z.string(),
	muc: z.object({ low: khuonMuc.optional(), high: khuonMuc.optional() }),
});

type Ket = { ma: number; dong: string[]; bang: string };
type Dong = z.infer<typeof khuonDong>;

const sha = (chu: string | Buffer) =>
	new Bun.CryptoHasher("sha256").update(chu).digest("hex");
const doc = (ev: string, t: string) => readFileSync(join(ev, t), "utf8");

function tepBam(ev: string): string[] {
	return readdirSync(ev)
		.filter((f) => !(SO.khongBam as readonly string[]).includes(f))
		.sort();
}

function ghiBam(ev: string): string {
	return `${tepBam(ev)
		.map((f) => `${sha(readFileSync(join(ev, f)))}  ${f}`)
		.join("\n")}\n`;
}

function kiemBam(ev: string): string[] {
	if (!existsSync(join(ev, SO.tepBam)))
		return [`${SO.nhan.bam}: thieu ${SO.tepBam}`];
	const da = new Map(
		doc(ev, SO.tepBam)
			.split("\n")
			.filter(Boolean)
			.map((d) => {
				const [h, f] = d.split(/\s+/);
				return [f ?? "", h ?? ""] as const;
			}),
	);
	const ra: string[] = [];
	for (const f of tepBam(ev))
		if (da.get(f) !== sha(readFileSync(join(ev, f))))
			ra.push(`${SO.nhan.bam} ${f}`);
	for (const f of da.keys())
		if (!existsSync(join(ev, f))) ra.push(`${SO.nhan.bam} ${f} vang`);
	return ra;
}

type SoCon = {
	so_buoc: number;
	token_vao: number;
	token_ra: number;
	giay: number;
};

function soCon(hang: z.infer<typeof khuonHang>[], phien: string): SoCon {
	const con = hang.filter((h) => h.phienCha === phien && h.sessionId !== phien);
	const t = con.map((h) => Date.parse(h.at)).sort((a, b) => a - b);
	return {
		so_buoc: con.length,
		token_vao: con.reduce((s, h) => s + (h.inputTokens ?? 0), 0),
		token_ra: con.reduce((s, h) => s + (h.outputTokens ?? 0), 0),
		giay:
			t.length > 1
				? Number((((t.at(-1) ?? 0) - (t[0] ?? 0)) / 1000).toFixed(1))
				: 0,
	};
}

function inBang(
	ke: z.infer<typeof khuonKeHoach>,
	hop: { d: Dong; c: SoCon }[],
	loai: string[],
): string {
	const thuTu = ke.bien_the.map((b) => b.ten);
	const sx = [...hop].sort(
		(a, b) =>
			thuTu.indexOf(a.d.bien_the) - thuTu.indexOf(b.d.bien_the) ||
			a.d.luot - b.d.luot,
	);
	const dong = sx.map(
		({ d, c }) =>
			`| ${d.bien_the} | ${d.luot} | ${d.ket_qua}${d.bi_cat ? " (quá trần)" : ""} | ${d.bi_cat ? `≥${SO.tran}` : d.giay} | ${c.so_buoc} | ${c.token_vao} | ${c.token_ra} | ${c.giay} | ${d.nhat_ky} |`,
	);
	const tom = thuTu.map((t) => {
		const r = sx.filter((x) => x.d.bien_the === t);
		const qua = r.filter((x) => x.d.ket_qua === "qua" && !x.d.bi_cat).length;
		return `| ${t} | ${qua}/${r.length} | ${r.map((x) => x.c.giay).join(", ")} | ${r.map((x) => x.c.so_buoc).join(", ")} | ${r.map((x) => x.c.token_ra).join(", ")} |`;
	});
	return [
		"# Bảng Tác nhân bộ dựng theo biến thể",
		"",
		"| biến thể | lượt | kết quả | giây cả lượt (gồm dựng kho) | bước phiên con | token vào con | token ra con | giây phiên con | nhật ký |",
		"| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
		...dong,
		"",
		"## Tóm theo biến thể",
		"",
		`| biến thể | qua eval (trần ${SO.tran} s của bài đo) | giây phiên con | bước phiên con | token ra con |`,
		"| --- | --- | --- | --- | --- |",
		...tom,
		"",
		"## Loại khỏi bảng",
		"",
		...(loai.length ? loai.map((l) => `- ${l}`) : ["- (không có)"]),
		"",
	].join("\n");
}

type KetSuyLuan = { dong: string[]; hong: string[] };

function kiemSuyLuan(ev: string): KetSuyLuan {
	if (!existsSync(join(ev, "do-suy-luan.json")))
		return { dong: [], hong: [`${SO.nhan.doSuyLuan}: tep`] };
	const d = khuonDoSuyLuan.parse(JSON.parse(doc(ev, "do-suy-luan.json")));
	const hong: string[] = [];
	if (!d.muc.low) hong.push(`${SO.nhan.doSuyLuan} low`);
	if (!d.muc.high) hong.push(`${SO.nhan.doSuyLuan} high`);
	const lo = d.muc.low?.token_suy_luan;
	const hi = d.muc.high?.token_suy_luan;
	const ket =
		lo === null || lo === undefined || hi === null || hi === undefined
			? "chua kiem duoc (Gateway khong tra token suy luan)"
			: lo < hi
				? "muc low toi nha cung cap"
				: "muc low KHONG lam giam token suy luan";
	return {
		dong: [
			`do suy luan ${d.model}: low ${lo ?? "?"} / high ${hi ?? "?"} token suy luan — ${ket}`,
		],
		hong,
	};
}

function kiemDocLai(maNguon: string): string[] {
	const chan = maNguon.indexOf(SO.chanDocLai);
	const dat = maNguon.indexOf(SO.goiDat);
	const evl = maNguon.indexOf(SO.goiEval, dat);
	const sauChan = maNguon.slice(chan, chan + 200);
	if (chan < 0 || !sauChan.includes("throw new Error"))
		return [`${SO.nhan.docLai}: thieu chan doc lai trong do-tac-nhan.ts`];
	if (dat < 0 || evl < 0)
		return [`${SO.nhan.docLai}: datModel khong dung truoc eval`];
	return [];
}

function kiem(ev: string, maNguon: string): Ket {
	const ke = khuonKeHoach.parse(JSON.parse(doc(ev, "ke-hoach.json")));
	const dongTho = doc(ev, "tac-nhan.jsonl").split("\n").filter(Boolean);
	const ds = dongTho.map((d) => khuonDong.parse(JSON.parse(d)));
	const hong: string[] = [];
	const ra: string[] = [];
	const can = ke.bien_the.flatMap((b) =>
		Array.from({ length: ke.so_luot }, (_, i) => `${b.ten}#${i + 1}`),
	);
	const co = new Set(ds.map((d) => `${d.bien_the}#${d.luot}`));
	for (const k of can) if (!co.has(k)) hong.push(`${SO.nhan.thieu} ${k}`);
	const theoGio = [...ds].sort(
		(a, b) => Date.parse(a.bat_dau) - Date.parse(b.bat_dau),
	);
	for (let i = 1; i < theoGio.length; i++) {
		const a = theoGio[i - 1];
		const b = theoGio[i];
		if (!a || !b) continue;
		if (Date.parse(b.bat_dau) < Date.parse(a.ket_thuc))
			hong.push(
				`${SO.nhan.chong}: ${a.bien_the}#${a.luot} ${b.bien_the}#${b.luot}`,
			);
		if (a.bien_the === b.bien_the)
			hong.push(
				`${SO.nhan.lien}: ${a.bien_the}#${a.luot} ${b.bien_the}#${b.luot}`,
			);
	}
	const hop: { d: Dong; c: SoCon }[] = [];
	const loai: string[] = [];
	for (const d of ds) {
		const b = ke.bien_the.find((x) => x.ten === d.bien_the);
		const hang = z.array(khuonHang).parse(JSON.parse(doc(ev, d.aichiphi)));
		const c = soCon(hang, d.phien_goc);
		if (c.so_buoc < 1)
			hong.push(`${SO.nhan.lech} ${d.bien_the}#${d.luot}: so buoc phien con 0`);
		if (hang.some((h) => Date.parse(h.at) > Date.parse(d.ket_thuc)))
			hong.push(`${SO.nhan.sauKetThuc} ${d.bien_the}#${d.luot}`);
		if (
			d.ket_qua === "hong" &&
			(d.ly_do ?? "").includes("qua tran") &&
			!d.bi_cat
		)
			hong.push(`${SO.nhan.biCat} ${d.bien_the}#${d.luot}`);
		const bamDung = b?.low ? ke.bam_agent_low : ke.bam_agent_goc;
		if (d.bam_agent !== bamDung)
			hong.push(`${SO.nhan.roSuyLuan} ${d.bien_the}#${d.luot}`);
		if (!b || d.model !== b.model) {
			const tin = `${SO.nhan.saiModel} ${d.bien_the} luot ${d.luot} (${d.model})`;
			ra.push(tin);
			loai.push(tin);
			continue;
		}
		hop.push({ d, c });
	}
	for (const b of ke.bien_the) {
		const n = hop.filter((x) => x.d.bien_the === b.ten).length;
		if (n < ke.so_luot)
			ra.push(`${SO.nhan.thieuLuot} ${b.ten} (${n}/${ke.so_luot})`);
	}
	const bang = inBang(ke, hop, loai);
	if (!existsSync(join(ev, SO.bang)) || doc(ev, SO.bang) !== bang)
		hong.push(SO.nhan.bang);
	const sl = kiemSuyLuan(ev);
	hong.push(...sl.hong, ...kiemBam(ev), ...kiemDocLai(maNguon));
	return {
		ma: hong.length ? 1 : 0,
		dong: [
			...ra,
			...(kiemDocLai(maNguon).length
				? []
				: ["doc lai model: o model cua kho do doc lai truoc moi luot"]),
			...sl.dong,
			`luot hop le: ${hop.length}/${can.length}`,
			...hong,
			...(hong.length ? [] : ["dat: bang tinh lai khop bang chung"]),
		],
		bang,
	};
}

function phamVi(ds: string[], diffConfig: string): string[] {
	const ra = ds.filter((f) => !SO.choPhep(f)).map((f) => `NGOAI PHAM VI: ${f}`);
	if (
		diffConfig
			.split("\n")
			.some((d) => d.startsWith("-") && !d.startsWith("---"))
	)
		ra.push("NGOAI PHAM VI: config.yaml co dong xoa");
	return ra;
}

type PhamViTho = { ds: string[]; cfg: string };

function lenhPhamVi(): PhamViTho {
	const mb = spawnSync(
		"git",
		["-C", GOC, "merge-base", "HEAD", "origin/onehub"],
		{ encoding: "utf8" },
	).stdout.trim();
	const ds = spawnSync("git", ["-C", GOC, "diff", "--name-only", mb, "HEAD"], {
		encoding: "utf8",
	})
		.stdout.split("\n")
		.filter(Boolean);
	const cfg = spawnSync(
		"git",
		["-C", GOC, "diff", mb, "HEAD", "--", "_acceptance/config.yaml"],
		{ encoding: "utf8" },
	).stdout;
	return { ds, cfg };
}

const maGoc = () => readFileSync(SO.tepDo, "utf8");

const tam: string[] = [];
function banSao(): string {
	const t = mkdtempSync(join(tmpdir(), "tnc-so-"));
	tam.push(t);
	for (const f of readdirSync(SO.evidence))
		copyFileSync(join(SO.evidence, f), join(t, f));
	return t;
}
const capLai = (ev: string) => {
	writeFileSync(join(ev, SO.bang), kiem(ev, maGoc()).bang);
	writeFileSync(join(ev, SO.tepBam), ghiBam(ev));
	return ev;
};
function suaJsonl(ev: string, doi: (ds: Dong[]) => Dong[]) {
	const ds = doc(ev, "tac-nhan.jsonl")
		.split("\n")
		.filter(Boolean)
		.map((d) => khuonDong.parse(JSON.parse(d)));
	writeFileSync(
		join(ev, "tac-nhan.jsonl"),
		`${doi(ds)
			.map((d) => JSON.stringify(d))
			.join("\n")}\n`,
	);
	return ev;
}

type ChieuDo = {
	ten: string;
	chay: () => { ma: number; dong: string[]; mong: number; phaiCo: string[] };
};
const ket = (ev: string, ma = maGoc()) => kiem(ev, ma);

const CHIEU_DO: readonly ChieuDo[] = [
	{
		ten: "ban sao nguyen (doi chung duong)",
		chay: () => ({
			...ket(banSao()),
			mong: 0,
			phaiCo: ["dat: bang tinh lai khop"],
		}),
	},
	{
		ten: "xoa mot dong",
		chay: () => {
			const ev = capLai(suaJsonl(banSao(), (ds) => ds.slice(1)));
			const dau = JSON.parse(
				doc(SO.evidence, "tac-nhan.jsonl").split("\n")[0] ?? "{}",
			) as Dong;
			return {
				...ket(ev),
				mong: 1,
				phaiCo: [`${SO.nhan.thieu} ${dau.bien_the}#${dau.luot}`],
			};
		},
	},
	{
		ten: "hai luot chong gio",
		chay: () => {
			const ev = capLai(
				suaJsonl(banSao(), (ds) =>
					ds.map((d, i) => (i === 1 ? { ...d, bat_dau: ds[0]?.bat_dau } : d)),
				),
			);
			return { ...ket(ev), mong: 1, phaiCo: [SO.nhan.chong] };
		},
	},
	{
		ten: "luot qua tran thieu bi_cat",
		chay: () => {
			const ev = capLai(
				suaJsonl(banSao(), (ds) =>
					ds.map((d, i) =>
						i === 0
							? {
									...d,
									ket_qua: "hong",
									ly_do: "qua tran 180 giay",
									bi_cat: false,
								}
							: d,
					),
				),
			);
			return { ...ket(ev), mong: 1, phaiCo: [SO.nhan.biCat] };
		},
	},
	{
		ten: "doi bam agent cua luot glm53 thanh ban sua",
		chay: () => {
			const ke = khuonKeHoach.parse(
				JSON.parse(doc(SO.evidence, "ke-hoach.json")),
			);
			const ev = capLai(
				suaJsonl(banSao(), (ds) =>
					ds.map((d) =>
						d.bien_the === "glm53" && d.luot === 1
							? { ...d, bam_agent: ke.bam_agent_low }
							: d,
					),
				),
			);
			return { ...ket(ev), mong: 1, phaiCo: [`${SO.nhan.roSuyLuan} glm53#1`] };
		},
	},
	{
		ten: "doi model mot dong cua glm53",
		chay: () => {
			const ev = capLai(
				suaJsonl(banSao(), (ds) =>
					ds.map((d) =>
						d.bien_the === "glm53" && d.luot === 1
							? { ...d, model: "zai/glm-5.2-fast" }
							: d,
					),
				),
			);
			const k = ket(ev);
			const conTrongBang = k.bang
				.split("\n")
				.some((x) => x.startsWith("| glm53 | 1 |"));
			return {
				...k,
				ma: conTrongBang ? 1 : k.ma,
				mong: 0,
				phaiCo: [`${SO.nhan.saiModel} glm53 luot 1`],
			};
		},
	},
	{
		ten: "bo chan doc lai model",
		chay: () => ({
			...ket(
				banSao(),
				maGoc().replace(SO.chanDocLai, "if (false)"),
			),
			mong: 1,
			phaiCo: [SO.nhan.docLai],
		}),
	},
	{
		ten: "sua mot o bang.md",
		chay: () => {
			const ev = banSao();
			writeFileSync(
				join(ev, SO.bang),
				doc(ev, SO.bang).replace("| moc | 1 |", "| moc | 9 |"),
			);
			writeFileSync(join(ev, SO.tepBam), ghiBam(ev));
			return { ...ket(ev), mong: 1, phaiCo: [SO.nhan.bang] };
		},
	},
	{
		ten: "doi mot byte nhat ky khong cap bam",
		chay: () => {
			const ev = banSao();
			const f = readdirSync(ev).find((x) => x.startsWith("luot-")) ?? "";
			writeFileSync(join(ev, f), `${doc(ev, f)} `);
			return { ...ket(ev), mong: 1, phaiCo: [`${SO.nhan.bam} ${f}`] };
		},
	},
	{
		ten: "xoa muc low cua do suy luan",
		chay: () => {
			const ev = banSao();
			const d = khuonDoSuyLuan.parse(JSON.parse(doc(ev, "do-suy-luan.json")));
			delete d.muc.low;
			writeFileSync(
				join(ev, "do-suy-luan.json"),
				`${JSON.stringify(d, null, 2)}\n`,
			);
			writeFileSync(join(ev, SO.tepBam), ghiBam(ev));
			return { ...ket(ev), mong: 1, phaiCo: [`${SO.nhan.doSuyLuan} low`] };
		},
	},
	{
		ten: "pham vi: them tep san pham",
		chay: () => {
			const r = phamVi(
				[
					"_acceptance/tac-nhan-glm-5-3-cham/contract.md",
					"apps/agent/agent/subagents/agent_builder/agent.ts",
				],
				"",
			);
			return {
				ma: r.length ? 1 : 0,
				dong: r,
				mong: 1,
				phaiCo: ["apps/agent/agent/subagents/agent_builder/agent.ts"],
			};
		},
	},
	{
		ten: "pham vi: config.yaml co dong xoa",
		chay: () => {
			const r = phamVi(
				["_acceptance/config.yaml"],
				"--- a/x\n+++ b/x\n-  cu: 1\n+  moi: 2\n",
			);
			return {
				ma: r.length ? 1 : 0,
				dong: r,
				mong: 1,
				phaiCo: ["config.yaml"],
			};
		},
	},
];

function chayChieuDo(chi?: (c: ChieuDo) => boolean): boolean {
	let hong = false;
	for (const c of CHIEU_DO.filter(chi ?? (() => true))) {
		const { ma, dong, mong, phaiCo } = c.chay();
		const thieu = phaiCo.filter((m) => !dong.some((d) => d.includes(m)));
		const dat = ma === mong && thieu.length === 0;
		console.log(
			`chieu do ${c.ten}: ${dat ? "dat" : "HONG"} (ma ${ma}, mong ${mong}${thieu.length ? `; thieu ${thieu.join(", ")}` : ""})`,
		);
		if (!dat) hong = true;
	}
	for (const t of tam) rmSync(t, { recursive: true, force: true });
	return !hong;
}

const doiSo = process.argv.slice(2);
if (doiSo.includes("--pham-vi")) {
	const { ds, cfg } = lenhPhamVi();
	const r = phamVi(ds, cfg);
	for (const d of r) console.log(d);
	console.log(`tep doi: ${ds.length}`);
	const ok = chayChieuDo((c) => c.ten.startsWith("pham vi"));
	process.exit(!ok ? 1 : r.length ? 1 : 0);
}
if (!existsSync(join(SO.evidence, "tac-nhan.jsonl"))) {
	console.log("KHONG DO DUOC: chua co tac-nhan.jsonl — chay luot do truoc");
	process.exit(2);
}
if (doiSo.includes("--ghi-bam")) {
	writeFileSync(join(SO.evidence, SO.bang), kiem(SO.evidence, maGoc()).bang);
	writeFileSync(join(SO.evidence, SO.tepBam), ghiBam(SO.evidence));
	console.log(`da ghi ${SO.bang} va ${SO.tepBam}`);
	process.exit(0);
}
const k = kiem(SO.evidence, maGoc());
for (const d of k.dong) console.log(d);
if (!chayChieuDo()) {
	console.log("THUOC HONG: mot chieu do khong phan biet duoc");
	process.exit(1);
}
process.exit(k.ma);
