import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { databaseName } from "../../../packages/db/src/test-database.ts";
import { bam, docBaoCao } from "../../bo-cau-hoi-mau/rang/bang-do";
import { ketXuatTinhNang } from "../../model-theo-vai-do-lai/rang/chi-phi";
import { DK } from "../../model-theo-vai-do-lai/rang/do-kho";
import {
	bamNguon,
	conTran,
	DUONG,
	datOCaiDatTrong,
	docKeHoach,
	GOC,
	ghiChi,
	ghiDungTran,
	type HangChiPhi,
	type KhoTom,
	khuonKetXuat,
	khuonKhoTom,
	MH2,
	tongCost,
} from "./khuon";

export const modelKhoTu = (traLoi: string) =>
	traLoi.match(DK.modelKho)?.[1] ?? null;
export const modelGocTu = (traLoi: string) =>
	traLoi.match(DK.modelGoc)?.[1] ?? null;

export type VaoTomKho = {
	luot: number;
	nhan?: string;
	luc: string;
	thuMuc: string;
	maDo: number;
	maGhi: number | null;
	baoCao: string | null;
	traLoi: string;
	boTho: string;
	oCaiDat: string | null;
	bamNguon: string;
	hangKho: HangChiPhi[];
	hangGoc: HangChiPhi[];
};

export function tomTatKho(v: VaoTomKho): KhoTom {
	const rel = DUONG.kho(v.luot);
	return khuonKhoTom.parse({
		luot: v.luot,
		nhan: v.nhan,
		luc: v.luc,
		thu_muc: v.thuMuc,
		ma_do: v.maDo,
		ma_ghi: v.maGhi,
		ma_cham: v.baoCao ? (docBaoCao(v.baoCao)?.maCham ?? null) : null,
		model_kho: modelKhoTu(v.traLoi),
		model_goc: modelGocTu(v.traLoi),
		o_cai_dat: v.oCaiDat,
		bam_bo_mau: bam(v.boTho),
		bam_nguon: v.bamNguon,
		usd: Number((tongCost(v.hangKho) + tongCost(v.hangGoc)).toFixed(6)),
		usd_vai: tongCost(v.hangKho),
		aichiphi: `${rel}/${MH2.tep.khoKetXuat}`,
		aichiphi_goc: `${rel}/${MH2.tep.khoKetXuatGoc}`,
	});
}

export function ghiLuotKho(
	ev: string,
	tom: KhoTom,
	hangKho: HangChiPhi[],
	hangGoc: HangChiPhi[],
) {
	const thu = join(ev, DUONG.kho(tom.luot));
	mkdirSync(thu, { recursive: true });
	writeFileSync(
		join(ev, tom.aichiphi),
		`${JSON.stringify(khuonKetXuat.parse(hangKho), null, 2)}\n`,
	);
	writeFileSync(
		join(ev, tom.aichiphi_goc),
		`${JSON.stringify(khuonKetXuat.parse(hangGoc), null, 2)}\n`,
	);
	writeFileSync(join(thu, MH2.tep.khoTom), `${JSON.stringify(tom, null, 2)}\n`);
	ghiChi(ev, {
		vai: "tro-ly-kho",
		luot: String(tom.luot),
		luc: tom.luc,
		trang_thai: "da-chay",
		usd: tom.usd,
		usd_vai: tom.usd_vai,
		tep: `${DUONG.kho(tom.luot)}/${MH2.tep.khoTom}`,
		nhan: tom.nhan,
	});
}

function chayLenh(doiSo: string[], env: NodeJS.ProcessEnv) {
	return new Promise<{ ma: number | null; ra: string }>((xong) => {
		const con = spawn("bun", [join(GOC, MH2.nguon.doBoMau), ...doiSo], {
			cwd: GOC,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let ra = "";
		con.stdout.on("data", (b: Buffer) => {
			ra += b.toString();
			process.stdout.write(b);
		});
		con.stderr.on("data", (b: Buffer) => {
			ra += b.toString();
			process.stderr.write(b);
		});
		con.on("close", (ma) => xong({ ma, ra }));
	});
}

const docNeuCo = (tep: string) =>
	existsSync(tep) ? readFileSync(tep, "utf8") : null;

async function motLuot(luot: number, url: string): Promise<KhoTom> {
	const ra = join(MH2.evidence, DUONG.kho(luot));
	mkdirSync(ra, { recursive: true });
	const oCaiDat = datOCaiDatTrong(url);
	if (oCaiDat !== null)
		throw new Error(`o cai dat model kho do doc lai ${oCaiDat}, khong trong`);
	const bamTruoc = bamNguon();
	const env = {
		...process.env,
		BCM_CHAY: join(MH2.chay, "kho"),
		BCM_EVIDENCE: ra,
	};
	const batDau = new Date();
	const r = await chayLenh(["--do"], env);
	const thuMuc = r.ra.match(DK.dongGhi)?.[1] ?? "";
	if (r.ma !== 0 || !thuMuc)
		throw new Error(`do-bo-mau --do thoat ${r.ma}, khong co thu muc luot`);
	const g = await chayLenh(["--ghi", thuMuc], env);
	if (g.ma !== 0) throw new Error(`do-bo-mau --ghi thoat ${g.ma}`);
	const hangKho = await ketXuatTinhNang(url, MH2.tinhNang.kho, batDau);
	const hangGoc = await ketXuatTinhNang(url, MH2.tinhNang.gocZalo, batDau);
	if (bamNguon() !== bamTruoc)
		throw new Error("ma nguon doi trong luc do — bang chung khong dung duoc");
	const tom = tomTatKho({
		luot,
		luc: new Date().toISOString(),
		thuMuc: relative(GOC, join(GOC, thuMuc)),
		maDo: r.ma,
		maGhi: g.ma,
		baoCao: docNeuCo(join(ra, MH2.tep.khoBaoCao)),
		traLoi: docNeuCo(join(ra, MH2.tep.khoTraLoi)) ?? "",
		boTho: readFileSync(join(GOC, MH2.nguon.boMau), "utf8"),
		oCaiDat,
		bamNguon: bamTruoc,
		hangKho,
		hangGoc,
	});
	ghiLuotKho(MH2.evidence, tom, hangKho, hangGoc);
	return tom;
}

export async function doKho() {
	const url = process.env.DATABASE_URL ?? "";
	if (!url || !isMeasureDatabase(databaseName(url)))
		throw new Error(
			"DATABASE_URL khong phai kho do dung-mot-lan — chay trong phien do: bun run do:man --chay 'bun _acceptance/re-mo-hinh-mac-dinh/rang/so-mh2.ts --do-kho'",
		);
	const ke = docKeHoach();
	mkdirSync(join(MH2.evidence, MH2.tep.kho), { recursive: true });
	for (let luot = 1; luot <= ke.tro_ly_kho.so_luot; luot++) {
		if (existsSync(join(MH2.evidence, DUONG.kho(luot), MH2.tep.khoTom))) {
			console.log(`kho luot ${luot}: da co, bo qua`);
			continue;
		}
		if (!conTran()) {
			ghiDungTran(MH2.evidence, "tro-ly-kho", luot);
			console.log(`kho luot ${luot}: dung vi tran`);
			continue;
		}
		const t = await motLuot(luot, url);
		console.log(
			`kho luot ${luot}: model kho ${t.model_kho ?? "?"} goc ${t.model_goc ?? "?"} o cai dat ${t.o_cai_dat ?? "null"} ma cham ${t.ma_cham ?? "?"} usd ${t.usd}`,
		);
	}
}
