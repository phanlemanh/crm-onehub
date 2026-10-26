import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { bam, ghiBaoCao, tinhBang } from "../../bo-cau-hoi-mau/rang/bang-do";
import { khuonBoMau } from "../../bo-cau-hoi-mau/rang/khuon";
import {
	type DongTungCau,
	docTungCau,
} from "../../tro-ly-doc-kho/rang/quyet-do";
import { docChiPhi, keHoach } from "./chi-phi";
import {
	bamCommit,
	DK,
	ghiTomTatKho,
	banSuaTam as suaKho,
	tomTatKho,
} from "./do-kho";
import { hoanTatSoan, banSuaTam as suaSoan } from "./do-soan";
import { banDo, ghiDoSuyLuan, type MucDo } from "./do-suy-luan";
import {
	banLow,
	DO,
	daCoLuot,
	dongTacNhan,
	ghiBangChungTacNhan,
	themDong,
} from "./do-tac-nhan";
import {
	DUONG,
	type Gia,
	GOC,
	giaCua,
	type HangChiPhi,
	type KeHoach,
	khoaChi,
	khuonDongTacNhan,
	khuonSoan,
	laLow,
	MTV,
	MUC_SUY_LUAN,
	modelCua,
	sha256,
	VAI_CHI,
	type VaiChi,
	z,
} from "./khuon";

export const GL = {
	nhan: "GIA LAP — khong phai luot that, chi de chay bo so truoc luot do",
	phien: "wrun_GIALAP",
	cachMs: 60_000,
	tacNhan: { luotMs: 70_000, buocMs: 4_000, soBuoc: 5, vao: 4_200, ra: 380 },
	kho: { soBuoc: 6, vao: 60_000, ra: 2_400 },
	soan: { soBuoc: 6, vao: 9_000, ra: 900, dat: [14, 15], hong: [2, 1] },
	dao: { ra: 120, suyLuan: { "mac-dinh": 40, low: 12, high: 80 } },
	luot: "gia-lap",
} as const;

type Dong = { gio: number };
const gioMoi = (dong: Dong, ms: number) => {
	dong.gio += ms;
	return dong.gio;
};
const atLech = (ms: number) => new Date(ms - MTV.lechKetXuatMs).toISOString();
const usdTheoGia = (gia: Gia, vao: number, ra: number) =>
	Number((vao * gia.vao + ra * gia.ra).toFixed(6));

function hang(
	id: string,
	ms: number,
	phien: string,
	cha: string | null,
	tinhNang: string,
	gia: Gia,
	vao: number,
	ra: number,
): HangChiPhi {
	return {
		id,
		at: atLech(ms),
		sessionId: phien,
		phienCha: cha,
		tinhNang,
		modelId: null,
		inputTokens: vao,
		cacheReadTokens: 0,
		outputTokens: ra,
		costUsd: usdTheoGia(gia, vao, ra),
	};
}

const dungTran = (ev: string, vai: VaiChi, khoa: string) =>
	docChiPhi(ev).luot.some(
		(l) => l.vai === vai && l.luot === khoa && l.trang_thai === "dung-vi-tran",
	);

function daoGia(ev: string, ke: KeHoach, ma: string, dong: Dong): string[] {
	if (existsSync(join(ev, DUONG.doSuyLuan(ma)))) return [];
	if (dungTran(ev, "dao", khoaChi("dao", ma, 1))) return [];
	const model = modelCua(ke, ma);
	const muc: MucDo = {};
	for (const m of MUC_SUY_LUAN)
		muc[m] = {
			status: 200,
			model,
			token_ra: GL.dao.ra + GL.dao.suyLuan[m],
			token_suy_luan: GL.dao.suyLuan[m],
			khong_tra_suy_luan: false,
		};
	const luc = new Date(gioMoi(dong, GL.cachMs)).toISOString();
	ghiDoSuyLuan(
		ev,
		ma,
		banDo(ma, model, muc, usdTheoGia(giaCua(ke, ma), 300, 400), luc),
	);
	return [`dao:${ma}`];
}

function tacNhanGia(ev: string, ke: KeHoach, ma: string, dong: Dong): string[] {
	const u = ke.tac_nhan.ung_vien.find((x) => x.ma === ma);
	if (!u) return [];
	const model = modelCua(ke, ma);
	const gia = giaCua(ke, ma);
	const goc = readFileSync(DO.tepAgent, "utf8");
	const daCo = daCoLuot(ev);
	const ra: string[] = [];
	for (let n = 1; n <= ke.tac_nhan.so_luot; n++)
		for (const [i, b] of u.bien_the.entries()) {
			const khoa = khoaChi("tac-nhan", b, n);
			if (daCo.has(khoa) || dungTran(ev, "tac-nhan", khoa)) continue;
			const bat = gioMoi(dong, GL.cachMs);
			const phien = `${GL.phien}${b.replace(/[^a-z0-9]/g, "").toUpperCase()}${n}`;
			const con = `${phien}CON`;
			const t = GL.tacNhan;
			const hangLuot = [
				hang(
					`${phien}-0`,
					bat + t.buocMs,
					phien,
					null,
					"crm",
					gia,
					t.vao,
					t.ra,
				),
				...Array.from({ length: t.soBuoc - i }, (_, k) =>
					hang(
						`${phien}-${k + 1}`,
						bat + t.buocMs * (k + 2),
						con,
						phien,
						"crm",
						gia,
						t.vao + 100 * n,
						t.ra - 10 * i,
					),
				),
			];
			const suKien = [{ sessionId: con, modelId: model }];
			const log = [
				GL.nhan,
				`▸ session ${phien} on channel:crm`,
				"✓ agent-builder (gia lap)",
				"",
			].join("\n");
			writeFileSync(join(ev, DUONG.nhatKy(b, n)), log);
			const d = dongTacNhan({
				ma,
				bienThe: b,
				luot: n,
				model,
				batDau: new Date(bat),
				ketThuc: new Date(gioMoi(dong, t.luotMs)),
				log,
				hang: hangLuot,
				suKien,
				bamAgent: sha256(laLow(b) ? banLow(goc) : goc),
			});
			ghiBangChungTacNhan(ev, d, hangLuot, suKien);
			themDong(ev, d);
			ra.push(`tac-nhan:${khoa}`);
		}
	return ra;
}

function soanGia(ev: string, ke: KeHoach, ma: string, dong: Dong): string[] {
	const model = modelCua(ke, ma);
	const gia = giaCua(ke, ma);
	const moc = khuonSoan.parse(
		JSON.parse(readFileSync(join(GOC, ke.soan_okr.moc), "utf8")),
	);
	const sua = suaSoan(
		readFileSync(join(GOC, MTV.suaTam.agentOkr), "utf8"),
		model,
	);
	const ra: string[] = [];
	for (let n = 1; n <= ke.soan_okr.so_luot; n++) {
		const khoa = khoaChi("soan-okr", ma, n);
		if (existsSync(join(ev, DUONG.soan(ma, n)))) continue;
		if (dungTran(ev, "soan-okr", khoa)) continue;
		const bat = gioMoi(dong, GL.cachMs);
		const s = GL.soan;
		const ketXuat = Array.from({ length: s.soBuoc }, (_, k) =>
			hang(
				`${GL.phien}SOAN${ma}${n}-${k}`,
				bat + 1000 * (k + 1),
				`${GL.phien}SOAN${ma}${n}`,
				null,
				MTV.tinhNang["soan-okr"],
				gia,
				s.vao,
				s.ra,
			),
		);
		writeFileSync(
			join(ev, DUONG.ketXuatSoan(ma, n)),
			`${JSON.stringify(ketXuat, null, 2)}\n`,
		);
		const dat = s.dat[n - 1] ?? s.dat[0];
		const hong = s.hong[n - 1] ?? s.hong[0];
		const tho = {
			...moc,
			nhan: DUONG.nhanSoan(ma, n),
			sha: GL.luot,
			luc: new Date(gioMoi(dong, GL.cachMs)).toISOString(),
			moHinh: model,
			lanChay: GL.luot,
			maEve: 0,
			dat,
			hong,
			duoiNguong: moc.tong - dat - hong,
			chotMaHong: hong,
			usd: ketXuat.reduce((a, h) => a + (h.costUsd ?? 0), 0),
			soDeXuat: 20,
			khongNopDeXuat: false,
			ung_vien: ma,
			aichiphi: DUONG.ketXuatSoan(ma, n),
		};
		writeFileSync(
			join(ev, DUONG.soan(ma, n)),
			`${JSON.stringify(tho, null, 2)}\n`,
		);
		hoanTatSoan(ev, ma, n, model, sua);
		ra.push(`soan-okr:${khoa}`);
	}
	return ra;
}

function dongDat(dong: DongTungCau[], boTho: string): DongTungCau[] {
	const bo = khuonBoMau.parse(JSON.parse(boTho));
	const hong = new Set(
		tinhBang(bo, dong).khongDat.map((x) => {
			const m = x.match(/^(\S+) \(luot (\d)/);
			return `${m?.[2]}:${m?.[1]}`;
		}),
	);
	const tot = dong.filter((d) => !hong.has(`${d.luot}:${d.id}`));
	return dong.map((d) => {
		if (!hong.has(`${d.luot}:${d.id}`)) return d;
		const cho = tot.find((x) => x.luot === d.luot && x.nhom === d.nhom);
		return cho ? { ...cho, id: d.id, luot: d.luot, nhom: d.nhom } : d;
	});
}

function khoGia(ev: string, ke: KeHoach, ma: string, dong: Dong): string[] {
	const model = modelCua(ke, ma);
	const gia = giaCua(ke, ma);
	const nguon = join(ev, DUONG.kho(MTV.cu.ma, 1));
	const boTho = readFileSync(DK.boMau, "utf8");
	const ra: string[] = [];
	for (let n = 1; n <= ke.tro_ly_kho.so_luot; n++) {
		const khoa = khoaChi("tro-ly-kho", ma, n);
		const thu = join(ev, DUONG.kho(ma, n));
		if (existsSync(join(thu, MTV.tep.khoTom))) continue;
		if (dungTran(ev, "tro-ly-kho", khoa)) continue;
		mkdirSync(thu, { recursive: true });
		const bat = gioMoi(dong, GL.cachMs);
		const dongCau = dongDat(
			docTungCau(readFileSync(join(nguon, MTV.tep.khoTungCau), "utf8")),
			boTho,
		);
		writeFileSync(
			join(thu, MTV.tep.khoTungCau),
			`${dongCau.map((d) => JSON.stringify(d)).join("\n")}\n`,
		);
		const bcCu = readFileSync(join(nguon, MTV.tep.khoBaoCao), "utf8");
		writeFileSync(
			join(thu, MTV.tep.khoBaoCao),
			ghiBaoCao({
				bam: bam(boTho),
				bamTroLy: bcCu.match(/^bam tro-ly: (\S+)$/m)?.[1] ?? "gia-lap",
				maCham: 0,
				luot: GL.luot,
				tong: [GL.nhan],
				bang: tinhBang(khuonBoMau.parse(JSON.parse(boTho)), dongCau),
				soLuot: {
					mot: dongCau.filter((d) => d.luot === 1).length,
					hai: dongCau.filter((d) => d.luot === 2).length,
				},
			}),
		);
		const traLoi = [
			`# ${GL.nhan}`,
			"",
			`Lượt một: model \`${model}\` (Gateway trả), khoá chung. Lượt hai: model agent gốc \`zai/glm-5.2-fast\` (Gateway trả).`,
			"",
		].join("\n");
		writeFileSync(join(thu, MTV.tep.khoTraLoi), traLoi);
		const k = GL.kho;
		const ketXuat = Array.from({ length: k.soBuoc }, (_, i) =>
			hang(
				`${GL.phien}KHO${ma}${n}-${i}`,
				bat + 1000 * (i + 1),
				`${GL.phien}KHO${ma}${n}`,
				null,
				MTV.tinhNang["tro-ly-kho"],
				gia,
				k.vao,
				k.ra,
			),
		);
		const tong = ketXuat.reduce((a, h) => a + (h.costUsd ?? 0), 0);
		const truoc = 20;
		const tom = tomTatKho({
			ma,
			luot: n,
			luc: new Date(gioMoi(dong, GL.cachMs)).toISOString(),
			thuMuc: GL.luot,
			maDo: 0,
			traLoi,
			boTho,
			sua: suaKho(readFileSync(join(GOC, MTV.suaTam.taiLieu), "utf8"), model),
			commit: bamCommit(MTV.suaTam.taiLieu),
			truoc: { usd: truoc, luc: new Date(bat).toISOString() },
			sau: {
				usd: Number((truoc - tong * 1.2).toFixed(6)),
				luc: new Date(dong.gio).toISOString(),
			},
			hang: ketXuat,
			loi: null,
		});
		ghiTomTatKho(ev, ma, tom, ketXuat);
		ra.push(`tro-ly-kho:${khoa}`);
	}
	return ra;
}

const SINH = {
	dao: daoGia,
	"tac-nhan": tacNhanGia,
	"soan-okr": soanGia,
	"tro-ly-kho": khoGia,
} satisfies Record<VaiChi, typeof daoGia>;

function viecCan(ke: KeHoach): string[] {
	const tat = [
		...ke.do_suy_luan.ung_vien.map((m) => `dao:${m}`),
		...ke.tac_nhan.ung_vien.map((u) => `tac-nhan:${u.ma}`),
		...ke.soan_okr.ung_vien.map((m) => `soan-okr:${m}`),
		...ke.tro_ly_kho.ung_vien.map((m) => `tro-ly-kho:${m}`),
	];
	return [...ke.thu_tu, ...tat.filter((t) => !ke.thu_tu.includes(t))];
}

export function giaLap(ev: string): string[] {
	if (resolve(ev) === resolve(MTV.evidence))
		throw new Error("khong gia lap tren evidence that");
	const ke = keHoach(ev);
	const c = docChiPhi(ev);
	const tn = readFileSync(join(ev, MTV.tep.tacNhan), "utf8")
		.split("\n")
		.filter(Boolean)
		.map((d) => Date.parse(khuonDongTacNhan.parse(JSON.parse(d)).ket_thuc));
	const dong: Dong = {
		gio: Math.max(0, ...c.luot.map((l) => Date.parse(l.luc)), ...tn),
	};
	const ra: string[] = [];
	for (const v of viecCan(ke)) {
		const [vai, ma] = v.split(":");
		ra.push(...SINH[z.enum(VAI_CHI).parse(vai)](ev, ke, ma ?? "", dong));
	}
	return ra;
}

if (import.meta.main) {
	const dich = process.argv[2];
	if (!dich) {
		console.log("dung: bun gia-lap.ts <thu muc tam>");
		process.exit(2);
	}
	const ev = join(resolve(dich), "evidence");
	if (existsSync(ev)) {
		console.log(`KHONG GIA LAP: ${ev} da co`);
		process.exit(2);
	}
	cpSync(MTV.evidence, ev, { recursive: true });
	const ds = giaLap(ev);
	console.log(`gia lap ${ds.length} luot vao ${ev}`);
	for (const d of ds) console.log(`- ${d}`);
	console.log(
		`chay: bun ${join(MTV.rang, "so-do.ts")} --evidence ${ev} --docs ${join(resolve(dich), "model-theo-vai.md")} --ghi`,
	);
}
