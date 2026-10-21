import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { bam, ghiBaoCao, tinhBang } from "../../bo-cau-hoi-mau/rang/bang-do";
import { khuonBoMau } from "../../bo-cau-hoi-mau/rang/khuon";
import { MTV } from "../../model-theo-vai-do-lai/rang/khuon";
import {
	type DongTungCau,
	docTungCau,
} from "../../tro-ly-doc-kho/rang/quyet-do";
import { ghiLuotKho, tomTatKho } from "./do-kho";
import { docDong, dongTacNhan, ghiLuotTacNhan } from "./do-tac-nhan";
import {
	bamNguon,
	DUONG,
	docChiPhi,
	docKeHoach,
	GOC,
	type HangChiPhi,
	khuonDongTacNhan,
	MH2,
} from "./khuon";

export const GL = {
	phien: "wrun_GIALAPMH2",
	moc: Date.parse("2026-10-21T00:00:00.000Z"),
	cachMs: 60_000,
	tacNhan: {
		luotMs: 70_000,
		buocMs: 4_000,
		soBuoc: 5,
		vao: 4_200,
		ra: 380,
		gia: { vao: 0.00000015, ra: 0.0000005 },
	},
	kho: { soBuoc: 6, vao: 60_000, ra: 2_400 },
	goc: { soBuoc: 3, vao: 8_000, ra: 300 },
	thuMuc: "gia-lap",
} as const;

type Dong = { gio: number };
const gioMoi = (dong: Dong, ms: number) => {
	dong.gio += ms;
	return dong.gio;
};
const atLech = (ms: number) => new Date(ms - MTV.lechKetXuatMs).toISOString();
const usd = (gia: { vao: number; ra: number }, vao: number, ra: number) =>
	Number((vao * gia.vao + ra * gia.ra).toFixed(6));

type VaoHang = {
	id: string;
	ms: number;
	phien: string;
	cha: string | null;
	tinhNang: string;
	gia: { vao: number; ra: number };
	vao: number;
	ra: number;
};

function hang(v: VaoHang): HangChiPhi {
	return {
		id: v.id,
		at: atLech(v.ms),
		sessionId: v.phien,
		phienCha: v.cha,
		tinhNang: v.tinhNang,
		modelId: null,
		inputTokens: v.vao,
		cacheReadTokens: 0,
		outputTokens: v.ra,
		costUsd: usd(v.gia, v.vao, v.ra),
	};
}

const daDungTran = (ev: string, vai: string, luot: number) =>
	(docChiPhi(ev)?.luot ?? []).some(
		(l) =>
			l.vai === vai &&
			l.luot === String(luot) &&
			l.trang_thai === "dung-vi-tran",
	);

function tacNhanGia(ev: string, dong: Dong, bamNg: string): string[] {
	const ke = docKeHoach(ev);
	const co = new Set(
		docDong(ev).map((d) => khuonDongTacNhan.parse(JSON.parse(d)).luot),
	);
	const t = GL.tacNhan;
	const ra: string[] = [];
	for (let n = 1; n <= ke.tac_nhan.so_luot; n++) {
		if (co.has(n) || daDungTran(ev, "tac-nhan", n)) continue;
		const bat = gioMoi(dong, GL.cachMs);
		const phien = `${GL.phien}TN${n}`;
		const con = `${phien}CON`;
		const hangLuot = [
			hang({
				id: `${phien}-0`,
				ms: bat + t.buocMs,
				phien,
				cha: null,
				tinhNang: "crm.dung-tac-nhan",
				gia: t.gia,
				vao: t.vao,
				ra: t.ra,
			}),
			...Array.from({ length: t.soBuoc }, (_, k) =>
				hang({
					id: `${phien}-${k + 1}`,
					ms: bat + t.buocMs * (k + 2),
					phien: con,
					cha: phien,
					tinhNang: "crm.dung-tac-nhan",
					gia: t.gia,
					vao: t.vao + 100 * n,
					ra: t.ra,
				}),
			),
		];
		const suKien = [{ sessionId: con, modelId: ke.tac_nhan.model }];
		const log = [
			MH2.nhanGiaLap,
			`▸ session ${phien} on channel:crm`,
			"✓ agent-builder (gia lap)",
			"",
		].join("\n");
		writeFileSync(join(ev, DUONG.nhatKy(n)), log);
		const d = dongTacNhan({
			luot: n,
			nhan: MH2.nhanGiaLap,
			batDau: new Date(bat),
			ketThuc: new Date(gioMoi(dong, t.luotMs)),
			log,
			suKien,
			oCaiDat: null,
			bam: bamNg,
		});
		ghiLuotTacNhan(ev, d, hangLuot, suKien);
		ra.push(`tac-nhan:${n}`);
	}
	return ra;
}

export type DauBaoCao = {
	bamTroLy: string;
	maCham: number;
	luot: string;
	tong: string[];
};

export function vietBaoCao(
	boTho: string,
	dongCau: DongTungCau[],
	dau: DauBaoCao,
): string {
	return ghiBaoCao({
		bam: bam(boTho),
		bamTroLy: dau.bamTroLy,
		maCham: dau.maCham,
		luot: dau.luot,
		tong: dau.tong,
		bang: tinhBang(khuonBoMau.parse(JSON.parse(boTho)), dongCau),
		soLuot: {
			mot: dongCau.filter((d) => d.luot === 1).length,
			hai: dongCau.filter((d) => d.luot === 2).length,
		},
	});
}

export const traLoiGiaLap = (modelKho: string, modelGoc: string) =>
	[
		`# ${MH2.nhanGiaLap}`,
		"",
		`Lượt một: model \`${modelKho}\` (Gateway trả), khoá chung. Lượt hai: model agent gốc \`${modelGoc}\` (Gateway trả).`,
		"",
	].join("\n");

function khoGia(ev: string, dong: Dong, bamNg: string): string[] {
	const ke = docKeHoach(ev);
	const boTho = readFileSync(join(GOC, MH2.nguon.boMau), "utf8");
	const nguon = join(GOC, MH2.nguon.giaLapKho, MH2.tep.khoTungCau);
	const giaKho = {
		vao: (ke.gia_kho.vao_moi_trieu[ke.tro_ly_kho.model] ?? 0) / MH2.trieu,
		ra: (ke.gia_kho.ra_moi_trieu[ke.tro_ly_kho.model] ?? 0) / MH2.trieu,
	};
	const ra: string[] = [];
	for (let n = 1; n <= ke.tro_ly_kho.so_luot; n++) {
		const thu = join(ev, DUONG.kho(n));
		if (existsSync(join(thu, MH2.tep.khoTom))) continue;
		if (daDungTran(ev, "tro-ly-kho", n)) continue;
		mkdirSync(thu, { recursive: true });
		const bat = gioMoi(dong, GL.cachMs);
		const dongCau = docTungCau(readFileSync(nguon, "utf8"));
		writeFileSync(
			join(thu, MH2.tep.khoTungCau),
			`${dongCau.map((d) => JSON.stringify(d)).join("\n")}\n`,
		);
		const baoCao = vietBaoCao(boTho, dongCau, {
			bamTroLy: GL.thuMuc,
			maCham: 0,
			luot: GL.thuMuc,
			tong: [MH2.nhanGiaLap],
		});
		writeFileSync(join(thu, MH2.tep.khoBaoCao), baoCao);
		const traLoi = traLoiGiaLap(ke.tro_ly_kho.model, ke.tac_nhan.model);
		writeFileSync(join(thu, MH2.tep.khoTraLoi), traLoi);
		const phien = `${GL.phien}KHO${n}`;
		const hangKho = Array.from({ length: GL.kho.soBuoc }, (_, i) =>
			hang({
				id: `${phien}-${i}`,
				ms: bat + 1000 * (i + 1),
				phien,
				cha: null,
				tinhNang: MH2.tinhNang.kho,
				gia: giaKho,
				vao: GL.kho.vao,
				ra: GL.kho.ra,
			}),
		);
		const hangGoc = Array.from({ length: GL.goc.soBuoc }, (_, i) =>
			hang({
				id: `${phien}GOC-${i}`,
				ms: bat + 1000 * (GL.kho.soBuoc + i + 1),
				phien: `${phien}GOC`,
				cha: null,
				tinhNang: MH2.tinhNang.gocZalo,
				gia: GL.tacNhan.gia,
				vao: GL.goc.vao,
				ra: GL.goc.ra,
			}),
		);
		const tom = tomTatKho({
			luot: n,
			nhan: MH2.nhanGiaLap,
			luc: new Date(gioMoi(dong, GL.cachMs)).toISOString(),
			thuMuc: GL.thuMuc,
			maDo: 0,
			maGhi: 0,
			baoCao,
			traLoi,
			boTho,
			oCaiDat: null,
			bamNguon: bamNg,
			hangKho,
			hangGoc,
		});
		ghiLuotKho(ev, tom, hangKho, hangGoc);
		ra.push(`tro-ly-kho:${n}`);
	}
	return ra;
}

export function giaLap(ev: string): string[] {
	if (resolve(ev) === resolve(MH2.evidence))
		throw new Error("khong gia lap tren evidence that");
	const c = docChiPhi(ev);
	const dong: Dong = {
		gio: Math.max(GL.moc, ...(c?.luot ?? []).map((l) => Date.parse(l.luc))),
	};
	const bamNg = bamNguon();
	return [...tacNhanGia(ev, dong, bamNg), ...khoGia(ev, dong, bamNg)];
}
