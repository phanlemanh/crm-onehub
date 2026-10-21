import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { ketXuatPhien } from "../../model-theo-vai-do-lai/rang/chi-phi";
import { DO, phienCuaLog } from "../../model-theo-vai-do-lai/rang/do-tac-nhan";
import { taoKho, xoaKho } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	bamNguon,
	conTran,
	type DongTacNhan,
	DUONG,
	datOCaiDatTrong,
	docKeHoach,
	GOC,
	ghiChi,
	ghiDungTran,
	type HangChiPhi,
	khuonDongTacNhan,
	khuonKetXuat,
	khuonSuKienChon,
	MH2,
	tongCost,
} from "./khuon";

type SuKien = { sessionId: string; modelId: string }[];

export type VaoDong = {
	luot: number;
	nhan?: string;
	batDau: Date;
	ketThuc: Date;
	log: string;
	suKien: SuKien;
	oCaiDat: string | null;
	bam: string;
};

export function ketQuaLog(log: string): "qua" | "hong" {
	return log.match(DO.ketQua)?.[1] === "✓" ? "qua" : "hong";
}

export function dongTacNhan(v: VaoDong): DongTacNhan {
	const kq = docKetQua(v.log);
	const model = [...new Set(v.suKien.map((s) => s.modelId))];
	return khuonDongTacNhan.parse({
		luot: v.luot,
		nhan: v.nhan,
		bat_dau: v.batDau.toISOString(),
		ket_thuc: v.ketThuc.toISOString(),
		giay: Number(
			((v.ketThuc.getTime() - v.batDau.getTime()) / 1000).toFixed(1),
		),
		ket_qua: kq.ketQua,
		ly_do: kq.lyDo,
		bi_cat: kq.biCat,
		phien_goc: phienCuaLog(v.log),
		model_gateway: model.length === 1 ? (model[0] ?? null) : null,
		o_cai_dat: v.oCaiDat,
		bam_nguon: v.bam,
		nhat_ky: DUONG.nhatKy(v.luot),
		aichiphi: DUONG.aichiphi(v.luot),
		su_kien: DUONG.suKien(v.luot),
	});
}

function docKetQua(log: string) {
	const ketQua = ketQuaLog(log);
	const biCat = ketQua === "hong" && log.includes(DO.quaTran);
	return {
		ketQua,
		biCat,
		lyDo:
			ketQua === "qua"
				? null
				: biCat
					? "qua tran 180 giay"
					: (log.match(DO.ketQua)?.[0] ?? "khong co dong ket qua"),
	};
}

export function docDong(ev: string): string[] {
	const tep = join(ev, MH2.tep.tacNhan);
	return existsSync(tep)
		? readFileSync(tep, "utf8").split("\n").filter(Boolean)
		: [];
}

export function ghiLuotTacNhan(
	ev: string,
	d: DongTacNhan,
	hang: HangChiPhi[],
	suKien: SuKien,
) {
	writeFileSync(
		join(ev, d.aichiphi),
		`${JSON.stringify(khuonKetXuat.parse(hang), null, 2)}\n`,
	);
	writeFileSync(
		join(ev, d.su_kien),
		`${JSON.stringify(khuonSuKienChon.parse(suKien), null, 2)}\n`,
	);
	const usd = tongCost(hang);
	ghiChi(ev, {
		vai: "tac-nhan",
		luot: String(d.luot),
		luc: d.ket_thuc,
		trang_thai: "da-chay",
		usd,
		usd_vai: usd,
		tep: d.aichiphi,
		nhan: d.nhan,
	});
	const dong = docDong(ev);
	dong.push(JSON.stringify(d));
	writeFileSync(join(ev, MH2.tep.tacNhan), `${dong.join("\n")}\n`);
}

function chay(lenh: string[], env: NodeJS.ProcessEnv, tep: string) {
	const ghi = createWriteStream(tep);
	return new Promise<number>((xong) => {
		const con = spawn(lenh[0] ?? "", lenh.slice(1), {
			cwd: join(GOC, "apps/agent"),
			env,
		});
		con.stdout.pipe(ghi, { end: false });
		con.stderr.pipe(ghi, { end: false });
		con.on("error", (loi) => {
			ghi.end(`\n${loi.message}\n`);
			xong(2);
		});
		con.on("close", (ma) => {
			ghi.end();
			ghi.on("finish", () => xong(ma ?? 2));
		});
	});
}

async function motLuot(luot: number, bam: string): Promise<DongTacNhan> {
	const tepLog = join(MH2.evidence, DUONG.nhatKy(luot));
	const kho = `mh2-tn-${luot}`;
	let url = "";
	try {
		url = taoKho(kho);
		const oCaiDat = datOCaiDatTrong(url);
		if (oCaiDat !== null)
			throw new Error(`o cai dat model kho do doc lai ${oCaiDat}, khong trong`);
		const batDau = new Date();
		await chay(
			[
				join(GOC, "apps/agent/node_modules/.bin/eve"),
				"eval",
				DO.eval,
				"--verbose",
			],
			{
				...process.env,
				DATABASE_URL: url,
				AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
				ZALO_BOT_TOKEN: "",
				CRM_TELEMETRY_DISABLED: "1",
			},
			tepLog,
		);
		const ketThuc = new Date();
		const log = readFileSync(tepLog, "utf8");
		const phien = phienCuaLog(log);
		const { hang, suKien } = phien
			? await ketXuatPhien(url, phien)
			: { hang: [], suKien: [] };
		const d = dongTacNhan({
			luot,
			batDau,
			ketThuc,
			log,
			suKien,
			oCaiDat,
			bam,
		});
		ghiLuotTacNhan(MH2.evidence, d, hang, suKien);
		return d;
	} finally {
		if (url && !xoaKho(kho)) console.log(`don hong: khong xoa duoc kho ${kho}`);
	}
}

export async function doTacNhan() {
	mkdirSync(MH2.evidence, { recursive: true });
	const ke = docKeHoach();
	const bam = bamNguon();
	const daCo = new Set(
		docDong(MH2.evidence).map(
			(d) => khuonDongTacNhan.parse(JSON.parse(d)).luot,
		),
	);
	for (let luot = 1; luot <= ke.tac_nhan.so_luot; luot++) {
		if (daCo.has(luot)) {
			console.log(`tac-nhan luot ${luot}: da co, bo qua`);
			continue;
		}
		if (!conTran()) {
			ghiDungTran(MH2.evidence, "tac-nhan", luot);
			console.log(`tac-nhan luot ${luot}: dung vi tran`);
			continue;
		}
		const d = await motLuot(luot, bam);
		console.log(
			`tac-nhan luot ${luot}: ${d.ket_qua} ${d.giay}s model gateway ${d.model_gateway ?? "?"} o cai dat ${d.o_cai_dat ?? "null"} phien ${d.phien_goc || "?"}`,
		);
	}
	if (bamNguon() !== bam)
		throw new Error("ma nguon doi trong luc do — bang chung khong dung duoc");
}
