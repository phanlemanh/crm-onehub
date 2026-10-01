import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { CHAY_DOM } from "./chay-dom-config";

export type TuyChonChayDom = {
	goc: string;
	co: readonly string[];
	tranMs: number;
	ghi: (dong: string) => void;
	loi: (dong: string) => void;
};

type ThoiLuongTep = { duong: string; ms: number };

function giay(ms: number): string {
	return (ms / CHAY_DOM.hienThi.msMoiGiay).toFixed(CHAY_DOM.hienThi.soLe);
}

function laQuaGio(loiSpawn: Error | undefined): boolean {
	return (loiSpawn as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT";
}

export function chayTungTep({
	goc,
	co,
	tranMs,
	ghi,
	loi,
}: TuyChonChayDom): number {
	const { thuMuc, duoi, maQuaGio } = CHAY_DOM.tep;
	const tep = readdirSync(join(goc, thuMuc), { recursive: true })
		.map(String)
		.filter((ten) => ten.endsWith(duoi))
		.sort();

	if (tep.length === 0) {
		loi(`chay-dom: không có tệp *${duoi} nào trong ${join(goc, thuMuc)}`);
		return 1;
	}

	const batDau = performance.now();
	const thoiLuong: ThoiLuongTep[] = [];

	for (const ten of tep) {
		const duong = `${thuMuc}/${ten}`;
		ghi(`chay-dom: ${duong}`);
		const truoc = performance.now();
		const kq = spawnSync("bun", ["test", ...co, `./${duong}`], {
			cwd: goc,
			stdio: "inherit",
			timeout: tranMs,
			killSignal: "SIGKILL",
		});
		const ms = performance.now() - truoc;

		if (laQuaGio(kq.error)) {
			loi(`chay-dom: ${duong} quá ${giay(tranMs)} s — đã cắt tiến trình`);
			return maQuaGio;
		}
		const ma = kq.status ?? 1;
		if (ma !== 0) {
			loi(`chay-dom: ${duong} đỏ (mã ${ma}) sau ${giay(ms)} s`);
			return ma;
		}
		ghi(`chay-dom: ${duong} xanh sau ${giay(ms)} s`);
		thoiLuong.push({ duong, ms });
	}

	ghi(
		`chay-dom: ${tep.length} tệp xanh sau ${giay(performance.now() - batDau)} s (giới hạn mỗi tệp ${giay(tranMs)} s)`,
	);
	const chamNhat = [...thoiLuong]
		.sort((a, b) => b.ms - a.ms)
		.slice(0, CHAY_DOM.tongKet.soTepChamNhat)
		.map(({ duong, ms }) => `${duong} ${giay(ms)} s`);
	ghi(`chay-dom: chậm nhất — ${chamNhat.join(" · ")}`);
	return 0;
}

if (import.meta.main) {
	process.exit(
		chayTungTep({
			goc: process.cwd(),
			co: process.argv.slice(2),
			tranMs: CHAY_DOM.tep.tranMs,
			ghi: console.log,
			loi: console.error,
		}),
	);
}
