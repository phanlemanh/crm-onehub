import {
	cpSync,
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TAI_LIEU_AGENT } from "../../../apps/agent/agent/lib/tai-lieu-config";
import { ghiBam } from "./bang-chung";
import {
	type Chuoi,
	type DongKetQua,
	docChuoi,
	docKetQua,
	docNguong,
	type Nguong,
	sha,
	ZCH,
} from "./khuon";

const LOG = {
	lienKet: TAI_LIEU_AGENT.hoi.lienKet.dong,
	saiCho: TAI_LIEU_AGENT.hoi.dungLai.canhBao,
	threw: "Dynamic instructions resolver (session.started) threw",
} as const;

const NHAN = {
	bam: "bam",
	thieuCau: "thieu cau",
	khacPhien: "khac phien",
	lechCau: "lech cau",
	chuaXong: "chua xong",
	khongGui: "khong gui zalo",
	thieuLienKet: "thieu lien ket",
	saiCho: "sai cho",
	threw: "resolver threw",
	loiModel: "qua tran loi model",
	chiPhi: "qua tran chi",
	boMau: "bam bo-mau",
} as const;

const doc = (tep: string) =>
	existsSync(tep) ? readFileSync(tep, "utf8") : null;

function kiemBam(thuMuc: string): string[] {
	const ghi = doc(join(thuMuc, ZCH.tep.bam));
	if (ghi === null) return [`${NHAN.bam}: thieu ${ZCH.tep.bam}`];
	const da = new Map(
		ghi
			.split("\n")
			.filter(Boolean)
			.map((d) => {
				const [h, t] = d.split(/\s+/);
				return [t ?? "", h ?? ""] as const;
			}),
	);
	return [ZCH.tep.eveLog, ZCH.tep.ketQua].flatMap((t) => {
		const chu = doc(join(thuMuc, t));
		if (chu === null) return [`${NHAN.bam} ${t}: thieu tep`];
		return da.get(t) === sha(chu) ? [] : [`${NHAN.bam} ${t}: lech`];
	});
}

const laLoi = (k: DongKetQua) => k.loi !== null || k.tlhTrangThai === "LOI";

function kiemKetQua(
	ketQua: readonly DongKetQua[],
	chuoi: Chuoi,
	nguong: Nguong,
): string[] {
	const loi: string[] = [];
	const can = chuoi.chuoi.flatMap((c) =>
		c.cau.map((maCau, i) => ({ nguoi: c.nguoi, thuTu: i + 1, maCau })),
	);
	if (ketQua.length !== can.length)
		loi.push(`${NHAN.thieuCau}: co ${ketQua.length} dong, can ${can.length}`);
	for (const c of can) {
		const so = ketQua.filter(
			(k) => k.nguoi === c.nguoi && k.thuTu === c.thuTu && k.maCau === c.maCau,
		).length;
		if (so !== 1)
			loi.push(
				`${NHAN.thieuCau}: ${c.nguoi} cau ${c.thuTu} ${c.maCau} co ${so} dong`,
			);
	}
	for (const c of chuoi.chuoi) {
		const phien = new Set(
			ketQua.filter((k) => k.nguoi === c.nguoi).map((k) => k.sessionId),
		);
		if (phien.size !== 1 || phien.has(null))
			loi.push(`${NHAN.khacPhien}: ${c.nguoi} co ${[...phien].join(", ")}`);
	}
	const soLoi = ketQua.filter(laLoi).length;
	if (soLoi > nguong.loiModelToiDa)
		loi.push(`${NHAN.loiModel}: ${soLoi} > ${nguong.loiModelToiDa}`);
	for (const k of ketQua) {
		if (laLoi(k)) continue;
		const ten = k.zaloHoiId ?? `${k.nguoi}/${k.thuTu}`;
		if (!ZCH.xong.some((x) => x === k.tlhTrangThai))
			loi.push(
				`${NHAN.chuaXong}: ${ten} ${k.tlhTrangThai ?? "khong co TaiLieuHoi"}`,
			);
		if (k.tlhZaloHoiId !== k.zaloHoiId)
			loi.push(`${NHAN.lechCau}: ${ten} gan TaiLieuHoi cua ${k.tlhZaloHoiId}`);
		if (!k.daGuiZalo) loi.push(`${NHAN.khongGui}: ${ten}`);
	}
	return loi;
}

function kiemLog(eveLog: string, ketQua: readonly DongKetQua[]): string[] {
	const dong = eveLog.split("\n");
	const loi: string[] = [];
	const saiCho = dong.filter((d) => d.includes(LOG.saiCho)).length;
	if (saiCho > 0) loi.push(`${NHAN.saiCho}: ${saiCho} dong`);
	const threw = dong.filter((d) => d.includes(LOG.threw)).length;
	if (threw > 0) loi.push(`${NHAN.threw}: ${threw} dong`);
	for (const k of ketQua) {
		if (!k.zaloHoiId || !k.sessionId) continue;
		const can = `${LOG.lienKet} zalo ${k.zaloHoiId} -> ${k.sessionId}`;
		if (!dong.some((d) => d.includes(can)))
			loi.push(
				`${NHAN.thieuLienKet}: ${k.zaloHoiId} (${k.nguoi} cau ${k.thuTu})`,
			);
	}
	return loi;
}

function kiemChiPhi(bao: string | null, nguong: Nguong): string[] {
	const m = bao
		?.split("\n")
		.find((d) => d.startsWith(ZCH.dongChiPhi))
		?.slice(ZCH.dongChiPhi.length)
		.trim();
	const usd = m === undefined ? Number.NaN : Number(m);
	if (!Number.isFinite(usd)) return [`${NHAN.chiPhi}: khong doc duoc chi phi`];
	return usd > nguong.tranUsd
		? [`${NHAN.chiPhi}: ${usd} > ${nguong.tranUsd}`]
		: [];
}

export function soDo(thuMuc: string, chuoi: Chuoi, nguong: Nguong): string[] {
	const loi = kiemBam(thuMuc);
	const chuKq = doc(join(thuMuc, ZCH.tep.ketQua));
	const eveLog = doc(join(thuMuc, ZCH.tep.eveLog));
	if (chuKq === null || eveLog === null)
		return [...loi, `${NHAN.thieuCau}: thieu tep bang chung`];
	const ketQua = docKetQua(chuKq);
	return [
		...loi,
		...kiemKetQua(ketQua, chuoi, nguong),
		...kiemLog(eveLog, ketQua),
		...kiemChiPhi(doc(join(thuMuc, ZCH.tep.bao)), nguong),
	];
}

type Pha = {
	ten: string;
	ghim: (k: DongKetQua[]) => string;
	pha: (thuMuc: string, k: DongKetQua[]) => void;
};

function ghiKq(thuMuc: string, k: readonly DongKetQua[]): void {
	writeFileSync(
		join(thuMuc, ZCH.tep.ketQua),
		k.map((x) => `${JSON.stringify(x)}\n`).join(""),
	);
	ghiBam(thuMuc);
}

const lanh = (k: DongKetQua[]) => k.filter((x) => !laLoi(x));
const thu = (k: DongKetQua[], thuTu: number) => {
	const d = lanh(k).find(
		(x) => x.thuTu === thuTu && x.zaloHoiId && x.sessionId,
	);
	if (!d)
		throw new Error(`so-do: bang chung khong co cau ${thuTu} lanh de pha`);
	return d;
};

const PHA: readonly Pha[] = [
	{
		ten: "xoa dong lien-ket-hoi cua cau hai",
		ghim: (k) => thu(k, 2).zaloHoiId ?? "",
		pha: (m, k) => {
			const d = thu(k, 2);
			const tep = join(m, ZCH.tep.eveLog);
			const can = `${LOG.lienKet} zalo ${d.zaloHoiId} -> ${d.sessionId}`;
			writeFileSync(
				tep,
				readFileSync(tep, "utf8")
					.split("\n")
					.filter((x) => !x.includes(can))
					.join("\n"),
			);
			ghiBam(m);
		},
	},
	{
		ten: "them dong chi dan dung",
		ghim: () => NHAN.saiCho,
		pha: (m) => {
			const tep = join(m, ZCH.tep.eveLog);
			writeFileSync(tep, `${readFileSync(tep, "utf8")}\n${LOG.saiCho}\n`);
			ghiBam(m);
		},
	},
	{
		ten: "doi phien cau ba",
		ghim: () => NHAN.khacPhien,
		pha: (m, k) => {
			const d = thu(k, 3);
			ghiKq(
				m,
				k.map((x) =>
					x === d ? { ...x, sessionId: `${x.sessionId}-khac` } : x,
				),
			);
		},
	},
	{
		ten: "cau hai gan TaiLieuHoi cua cau mot",
		ghim: () => NHAN.lechCau,
		pha: (m, k) => {
			const d = thu(k, 2);
			const mot = k.find((x) => x.nguoi === d.nguoi && x.thuTu === 1);
			ghiKq(
				m,
				k.map((x) =>
					x === d ? { ...x, tlhZaloHoiId: mot?.zaloHoiId ?? "khac" } : x,
				),
			);
		},
	},
	{
		ten: "xoa mot dong ket qua",
		ghim: () => NHAN.thieuCau,
		pha: (m, k) => ghiKq(m, k.slice(1)),
	},
	{
		ten: "doi mot byte eve.log khong cap nhat bam",
		ghim: () => `${NHAN.bam} ${ZCH.tep.eveLog}`,
		pha: (m) => {
			const tep = join(m, ZCH.tep.eveLog);
			writeFileSync(tep, `${readFileSync(tep, "utf8")}x`);
		},
	},
	{
		ten: "loi model vuot nguong",
		ghim: () => NHAN.loiModel,
		pha: (m, k) => {
			const n = docNguong().loiModelToiDa + 1;
			const chon = new Set(lanh(k).slice(0, n));
			ghiKq(
				m,
				k.map((x) => (chon.has(x) ? { ...x, loi: "loi-model" } : x)),
			);
		},
	},
	{
		ten: "chi phi vuot tran",
		ghim: () => NHAN.chiPhi,
		pha: (m) => {
			const tep = join(m, ZCH.tep.bao);
			const chu = readFileSync(tep, "utf8");
			writeFileSync(
				tep,
				chu
					.split("\n")
					.map((d) =>
						d.startsWith(ZCH.dongChiPhi)
							? `${ZCH.dongChiPhi} ${docNguong().tranUsd + 1}`
							: d,
					)
					.join("\n"),
			);
		},
	},
];

export function chayPha(
	thuMuc: string,
	chuoi: Chuoi,
	nguong: Nguong,
): string[] {
	const k = docKetQua(readFileSync(join(thuMuc, ZCH.tep.ketQua), "utf8"));
	const truot: string[] = [];
	for (const p of PHA) {
		const tam = mkdtempSync(join(tmpdir(), "zch-so-do-"));
		try {
			cpSync(thuMuc, tam, { recursive: true });
			p.pha(tam, k);
			const ghim = p.ghim(k);
			const ra = soDo(tam, chuoi, nguong);
			const bat = ra.some((d) => d.includes(ghim));
			console.log(`${bat ? "do dung" : "TRUOT"} · ${p.ten} · ghim «${ghim}»`);
			if (!bat) truot.push(p.ten);
		} finally {
			rmSync(tam, { recursive: true, force: true });
		}
	}
	return truot;
}

if (import.meta.main) {
	const chuoi = docChuoi();
	const boMau = sha(readFileSync(ZCH.boMau));
	if (boMau !== chuoi.bamBoMau) {
		console.error(
			`KHONG DAT: ${NHAN.boMau} lech (${boMau} != ${chuoi.bamBoMau})`,
		);
		process.exit(1);
	}
	const nguong = docNguong();
	const loi = soDo(ZCH.evidence, chuoi, nguong);
	for (const d of loi) console.error(`KHONG DAT: ${d}`);
	if (loi.length > 0) process.exit(1);
	console.log(
		`DAT: ${ZCH.evidence} — 24 cau, 8 nguoi, khong dong dung, lien ket du`,
	);
	const truot = chayPha(ZCH.evidence, chuoi, nguong);
	if (truot.length > 0) {
		console.error(
			`KHONG DAT: thuoc khong bat duoc ${truot.length} ca pha: ${truot.join("; ")}`,
		);
		process.exit(1);
	}
	console.log(`DAT: ${PHA.length}/${PHA.length} ca pha deu do`);
}
