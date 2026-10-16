import {
	copyFileSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { TAI_LIEU_AGENT } from "../../../apps/agent/agent/lib/tai-lieu-config";
import {
	type BaoCao,
	bam,
	ghiBaoCao,
	kiemBangChung,
	tinhBang,
} from "../../bo-cau-hoi-mau/rang/bang-do";
import { BO_MAU } from "../../bo-cau-hoi-mau/rang/bo-mau-config";
import { khuonBoMau } from "../../bo-cau-hoi-mau/rang/khuon";
import {
	CHAM_BO_DO,
	chamTungCau,
	type DongTungCau,
	docTungCau,
	ketLuan,
} from "../../tro-ly-doc-kho/rang/quyet-do";

const SO = {
	evidence: resolve(import.meta.dir, "..", "evidence"),
	daKy: BO_MAU.duong.evidence,
	baoCao: BO_MAU.bangChung.baoCao,
	tungCau: BO_MAU.bangChung.tungCau,
	chamMau: "cham-bo-do-mau.md",
	eveLog: "eve.log",
	ketQua: "ket-qua.jsonl",
	tepBam: "eve-log.txt",
	maModel: "google/gemini-3.8-flash",
	modelBaoCao: /model(?: agent gốc)? `([^`]+)` \(Gateway trả\)/g,
	soLuotModel: 2,
	threw: "Dynamic instructions resolver (session.started) threw",
	saiCho: TAI_LIEU_AGENT.hoi.dungLai.canhBao,
	lienKet: TAI_LIEU_AGENT.hoi.lienKet.dong,
	soLoiBa: 3,
	nhan: {
		vuotTran: "VUOT TRAN LOI MODEL",
		khongDat: "KHONG DAT",
		threw: "RESOLVER THREW",
		saiCho: "SAI CHO",
		model: "MODEL",
		bam: "BAM",
		thieuPhien: "EVE.LOG THIEU PHIEN",
		thieuLienKet: "THIEU LIEN KET",
	},
} as const;

type Ket = { ma: number; dong: string[] };

const doc = (tep: string) =>
	existsSync(tep) ? readFileSync(tep, "utf8") : null;

const sha = (chu: string) =>
	new Bun.CryptoHasher("sha256").update(chu).digest("hex");

const TEP_BAM = [SO.eveLog, SO.ketQua] as const;

function ghiBam(ev: string): string {
	return `${TEP_BAM.map((t) => `${sha(readFileSync(join(ev, t), "utf8"))}  ${t}`).join("\n")}\n`;
}

function kiemBam(ev: string): string[] {
	const ghi = doc(join(ev, SO.tepBam));
	if (ghi === null) return [`${SO.nhan.bam}: thieu ${SO.tepBam}`];
	const da = new Map(
		ghi
			.split("\n")
			.filter(Boolean)
			.map((d) => {
				const [h, t] = d.split(/\s+/);
				return [t ?? "", h ?? ""];
			}),
	);
	return TEP_BAM.filter((t) => {
		const chu = doc(join(ev, t));
		return chu === null || da.get(t) !== sha(chu);
	}).map((t) => `${SO.nhan.bam} ${t}`);
}

const phienCuaKetQua = (chu: string) =>
	chu
		.split("\n")
		.filter(Boolean)
		.map((d) => (JSON.parse(d) as { phienId?: string }).phienId ?? "")
		.filter(Boolean);

const demDong = (chu: string, mau: string) =>
	chu.split("\n").filter((d) => d.includes(mau)).length;

function kiemEveLog(ev: string): string[] {
	const log = doc(join(ev, SO.eveLog)) ?? "";
	const ketQua = doc(join(ev, SO.ketQua)) ?? "";
	const ra: string[] = [];
	const nThrew = demDong(log, SO.threw);
	if (nThrew > 0) ra.push(`${SO.nhan.threw}: ${nThrew} dong`);
	const nSai = demDong(log, SO.saiCho);
	if (nSai > 0) ra.push(`${SO.nhan.saiCho}: ${nSai} dong`);
	const dongLog = log.split("\n");
	for (const id of phienCuaKetQua(ketQua)) {
		if (!dongLog.some((d) => d.includes(`session ${id} on channel:`)))
			ra.push(`${SO.nhan.thieuPhien}: ${id}`);
		const lk = dongLog.filter(
			(d) => d.includes(SO.lienKet) && d.trimEnd().endsWith(`-> ${id}`),
		).length;
		if (lk !== 1) ra.push(`${SO.nhan.thieuLienKet}: ${id} (${lk} dong)`);
	}
	return ra;
}

function kiemModel(ev: string): string[] {
	const md = doc(join(ev, SO.chamMau)) ?? "";
	const ma = [...md.matchAll(SO.modelBaoCao)].map((m) => m[1] ?? "");
	const lech = ma.filter((m) => m !== SO.maModel);
	if (ma.length < SO.soLuotModel || lech.length > 0)
		return [
			`${SO.nhan.model}: bao cao ghi ${ma.join(", ") || "(khong co)"}, can ${SO.maModel} cho ${SO.soLuotModel} luot`,
		];
	return [];
}

const loiHaiLuot = (ds: readonly DongTungCau[]) => {
	const { mot, hai } = chamTungCau(ds, CHAM_BO_DO.nguong);
	return [...mot, ...hai].filter((c) => c.nhan === "loi").map((c) => c.id);
};

function kiem(ev: string): Ket {
	const boTho = readFileSync(BO_MAU.duong.bo, "utf8");
	const ky = kiemBangChung(
		boTho,
		doc(join(SO.daKy, SO.baoCao)),
		doc(join(SO.daKy, SO.tungCau)),
	);
	if (!ky.ok) return { ma: 2, dong: [`KHONG DO DUOC: ban da ky ${ky.loi}`] };
	const moi = kiemBangChung(
		boTho,
		doc(join(ev, SO.baoCao)),
		doc(join(ev, SO.tungCau)),
	);
	if (!moi.ok) return { ma: 1, dong: [`LECH: luot nay ${moi.loi}`] };
	const dong = docTungCau(doc(join(ev, SO.tungCau)) ?? "");
	const { mot, hai } = chamTungCau(dong, CHAM_BO_DO.nguong);
	const kiemSai = dong.filter((d) => d.luot === 1 && d.khongQuaKiem).length;
	const kl = ketLuan(
		mot.filter((c) => c.nhan !== "loi"),
		hai.filter((c) => c.nhan !== "loi"),
		CHAM_BO_DO.nguong,
		kiemSai,
	);
	const loiKy = loiHaiLuot(docTungCau(doc(join(SO.daKy, SO.tungCau)) ?? ""));
	const loiMoi = loiHaiLuot(dong);
	const hong = [
		...kl.dong
			.map((d) => d.match(/^(\w+): .* (xam|khong-dat)$/)?.[1])
			.filter((c): c is string => c !== undefined)
			.map((c) => `${SO.nhan.khongDat}: ${c}`),
		...(loiMoi.length > loiKy.length
			? [
					`${SO.nhan.vuotTran}: ${loiMoi.length} > ${loiKy.length} (${loiMoi.join(", ")})`,
				]
			: []),
		...kiemModel(ev),
		...kiemBam(ev),
		...kiemEveLog(ev),
	];
	const ra = [
		"bon chi so canh nguong cu (cau loi model tach rieng):",
		...kl.dong.map((d) => `  ${d}`),
		`loi model hai luot: ${loiMoi.join(", ") || "(khong co)"} — tran ${loiKy.length} theo luot da ky (${loiKy.join(", ") || "khong co"})`,
		`phien goc trong ket-qua.jsonl: ${phienCuaKetQua(doc(join(ev, SO.ketQua)) ?? "").length}`,
		...hong,
	];
	return kl.ma === 0 && hong.length === 0
		? {
				ma: 0,
				dong: [
					...ra,
					"dat: khong phien nao thieu chi dan, moi phien goc da gan, loi trong tran",
				],
			}
		: { ma: 1, dong: ra };
}

function dungLai(md: string, dong: DongTungCau[]): string {
	const boTho = readFileSync(BO_MAU.duong.bo, "utf8");
	const bo = khuonBoMau.parse(JSON.parse(boTho));
	const x: BaoCao = {
		bam: bam(boTho),
		bamTroLy: md.match(/^bam tro-ly: ([0-9a-f]{64})$/m)?.[1] ?? "",
		maCham: Number(md.match(/^ma thoat cham-bo-do: (\d+)$/m)?.[1] ?? "0"),
		luot: md.match(/^thu muc luot cham-bo-do: (.+)$/m)?.[1] ?? "",
		tong: md
			.slice(md.indexOf("## Tổng"), md.indexOf("## Bảng"))
			.split("\n")
			.filter((d) => d.startsWith("- "))
			.map((d) => d.slice(2)),
		bang: tinhBang(bo, dong),
		soLuot: {
			mot: dong.filter((d) => d.luot === 1).length,
			hai: dong.filter((d) => d.luot === 2).length,
		},
	};
	return ghiBaoCao(x);
}

const tam: string[] = [];

function banSao(): string {
	const t = mkdtempSync(join(tmpdir(), "zkd-so-do-"));
	tam.push(t);
	for (const f of readdirSync(SO.evidence)) {
		copyFileSync(join(SO.evidence, f), join(t, f));
	}
	return t;
}

const sua = (
	ev: string,
	tep: string,
	doi: (chu: string) => string,
	capBam = true,
) => {
	writeFileSync(join(ev, tep), doi(readFileSync(join(ev, tep), "utf8")));
	if (capBam) writeFileSync(join(ev, SO.tepBam), ghiBam(ev));
	return ev;
};

type ChieuDo = {
	ten: string;
	chay: () => { ket: Ket; mong: number; phaiCo: string[] };
};

const datMot = (d: DongTungCau) =>
	d.luot === 1 && d.nhom === "co-trang" && d.ketCuc === "TRA_LOI-du";

const CHIEU_DO: readonly ChieuDo[] = [
	{
		ten: "ban sao nguyen (doi chung duong)",
		chay: () => ({
			ket: kiem(banSao()),
			mong: 0,
			phaiCo: ["dat: khong phien nao thieu chi dan"],
		}),
	},
	{
		ten: "them mot dong resolver threw",
		chay: () => ({
			ket: kiem(
				sua(
					banSao(),
					SO.eveLog,
					(c) => `${c}[eve:dynamic-instructions] ${SO.threw} — skipping.\n`,
				),
			),
			mong: 1,
			phaiCo: [SO.nhan.threw],
		}),
	},
	{
		ten: "them mot dong sai cho",
		chay: () => ({
			ket: kiem(sua(banSao(), SO.eveLog, (c) => `${c}${SO.saiCho}\n`)),
			mong: 1,
			phaiCo: [SO.nhan.saiCho],
		}),
	},
	{
		ten: "ba cau dat thanh loi model",
		chay: () => {
			const ev = banSao();
			const ds = docTungCau(readFileSync(join(ev, SO.tungCau), "utf8"));
			const chon = ds
				.filter(datMot)
				.slice(0, SO.soLoiBa)
				.map((d) => d.id);
			const moi = ds.map((d) =>
				d.luot === 1 && chon.includes(d.id)
					? { ...d, ketCuc: "LOI" as const }
					: d,
			);
			writeFileSync(
				join(ev, SO.tungCau),
				`${moi.map((d) => JSON.stringify(d)).join("\n")}\n`,
			);
			writeFileSync(
				join(ev, SO.baoCao),
				dungLai(readFileSync(join(ev, SO.baoCao), "utf8"), moi),
			);
			return { ket: kiem(ev), mong: 1, phaiCo: [SO.nhan.vuotTran, ...chon] };
		},
	},
	{
		ten: "bao cao ghi model GLM",
		chay: () => ({
			ket: kiem(
				sua(
					banSao(),
					SO.chamMau,
					(c) => c.replaceAll(`\`${SO.maModel}\``, "`zai/glm-5.2-fast`"),
					false,
				),
			),
			mong: 1,
			phaiCo: [SO.nhan.model],
		}),
	},
	{
		ten: "doi mot byte eve.log khong cap bam",
		chay: () => ({
			ket: kiem(sua(banSao(), SO.eveLog, (c) => `${c} `, false)),
			mong: 1,
			phaiCo: [`${SO.nhan.bam} ${SO.eveLog}`],
		}),
	},
	{
		ten: "xoa dong lien ket cua mot phien",
		chay: () => {
			const ev = banSao();
			const id =
				phienCuaKetQua(readFileSync(join(ev, SO.ketQua), "utf8"))[0] ?? "";
			sua(ev, SO.eveLog, (c) =>
				c
					.split("\n")
					.filter(
						(d) =>
							!(d.includes(SO.lienKet) && d.trimEnd().endsWith(`-> ${id}`)),
					)
					.join("\n"),
			);
			return {
				ket: kiem(ev),
				mong: 1,
				phaiCo: [`${SO.nhan.thieuLienKet}: ${id}`],
			};
		},
	},
	{
		ten: "cat nua dau eve.log",
		chay: () => ({
			ket: kiem(
				sua(banSao(), SO.eveLog, (c) => {
					const ds = c.split("\n");
					return ds.slice(Math.floor(ds.length / 2)).join("\n");
				}),
			),
			mong: 1,
			phaiCo: [SO.nhan.thieuPhien],
		}),
	},
];

function chayChieuDo(): boolean {
	let hong = false;
	for (const c of CHIEU_DO) {
		const { ket, mong, phaiCo } = c.chay();
		const thieu = phaiCo.filter((m) => !ket.dong.some((d) => d.includes(m)));
		const dat = ket.ma === mong && thieu.length === 0;
		console.log(
			`chieu do ${c.ten}: ${dat ? "dat" : "HONG"} (ma ${ket.ma}, mong ${mong}; ghim ${phaiCo.join(", ")}${thieu.length ? `; thieu ${thieu.join(", ")}` : ""})`,
		);
		if (!dat) hong = true;
	}
	for (const t of tam) rmSync(t, { recursive: true, force: true });
	return !hong;
}

const doiSo = process.argv.slice(2);
if (doiSo.includes("--ghi-bam")) {
	writeFileSync(join(SO.evidence, SO.tepBam), ghiBam(SO.evidence));
	console.log(`da ghi ${join(SO.evidence, SO.tepBam)}`);
	process.exit(0);
}
if (!existsSync(join(SO.evidence, SO.eveLog))) {
	console.log(
		`KHONG DO DUOC: chua co ${SO.eveLog} trong evidence — chay luot do truoc`,
	);
	process.exit(2);
}
const ket = kiem(SO.evidence);
for (const d of ket.dong) console.log(d);
if (!chayChieuDo()) {
	console.log("THUOC HONG: mot chieu do khong phan biet duoc");
	process.exit(1);
}
process.exit(ket.ma);
