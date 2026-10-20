import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bam, bamTep, LOI_DAN_SOAN, NGUONG, VUNG_SOAN } from "./eval-soan-chung.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BANG = join(GOC, "_acceptance", "chu-may-sinh-ten-moi", "evidence");
const SAI_SO = 1e-9;
const git = (...a) => spawnSync("git", a, { cwd: GOC, encoding: "utf8" });

const docTom = (nhan) => {
	const duong = join(BANG, `eval-soan-${nhan}.json`);
	return existsSync(duong) ? JSON.parse(readFileSync(duong, "utf8")) : null;
};

export function lapDung(nen, lap, doiGiuaLapNen = []) {
	if (!lap) return "khong co nen-lap";
	if (lap.bam.thuoc !== nen.bam.thuoc) return "nen-lap khac thuoc";
	if (lap.bam.loiDan !== nen.bam.loiDan) return "nen-lap khac loi dan";
	if (lap.moHinh !== nen.moHinh || lap.judge !== nen.judge) return "nen-lap khac mo hinh";
	if (doiGiuaLapNen.length) return `nen-lap va nen cach nhau doi ${doiGiuaLapNen.join(", ")}`;
	return null;
}

export function daiNoi(nen, lap, doiGiuaLapNen = []) {
	if (lapDung(nen, lap, doiGiuaLapNen)) return { ...NGUONG };
	const lechTc = nen.tieuChiTrungBinh.map((d, i) =>
		d === null || lap.tieuChiTrungBinh[i] === null ? 0 : Math.abs(d - lap.tieuChiTrungBinh[i]),
	);
	return {
		dat: Math.max(NGUONG.dat, Math.abs(nen.dat - lap.dat)),
		chotMa: Math.max(NGUONG.chotMa, Math.abs(nen.chotMaHong - lap.chotMaHong)),
		tieuChi: Math.max(NGUONG.tieuChi, ...lechTc),
	};
}

export function soSanh(nen, sau, bamNenTaiSha, bamHead, laTienBoi, doiNgoaiLoiDan = [], lap = null, doiGiuaLapNen = []) {
	const dai = daiNoi(nen, lap, doiGiuaLapNen);
	const loi = [];
	if (!nen) return ["thieu eval-soan-nen.json"];
	if (!sau) return ["thieu eval-soan-sau.json"];
	if (nen.bam.thuoc !== sau.bam.thuoc) loi.push("thuoc lech: hai lan chay khong cung bo ca, judge hay tieu chi");
	if (nen.moHinh !== sau.moHinh || nen.judge !== sau.judge) loi.push(`mo hinh lech: ${nen.moHinh}/${nen.judge} khac ${sau.moHinh}/${sau.judge}`);
	if (nen.bam.loiDan !== bamNenTaiSha) loi.push(`nen khong chay tren loi dan cua ${nen.sha.slice(0, 9)}`);
	if (sau.bam.loiDan !== bamHead) loi.push("sau khong chay tren loi dan hien tai");
	if (nen.bam.loiDan === sau.bam.loiDan) loi.push("nen va sau cung mot loi dan: chua do lan doi");
	if (!laTienBoi) loi.push(`nen ${nen.sha.slice(0, 9)} khong nam truoc HEAD`);
	if (doiNgoaiLoiDan.length) loi.push(`doi tep ngoai loi dan giua nen va sau: ${doiNgoaiLoiDan.join(", ")}`);
	for (const [ten, t] of [["nen", nen], ["sau", sau]]) if (!(t.soDeXuat > 0)) loi.push(`${ten} khong co de xuat nao: chua do chu cu`);
	if (sau.judgeHong > nen.judgeHong + dai.chotMa) loi.push(`judge hong tang: ${sau.judgeHong} > ${nen.judgeHong} + ${dai.chotMa}`);
	if (sau.tieuChiTrungBinh.length !== nen.tieuChiTrungBinh.length) loi.push(`so tieu chi lech: ${sau.tieuChiTrungBinh.length} khac ${nen.tieuChiTrungBinh.length}`);
	if (sau.chuCu.length) loi.push(`Kara con viet chu cu: ${sau.chuCu.map((c) => c.cum).join(", ")}`);
	if (sau.dat < nen.dat - dai.dat) loi.push(`so ca dat tut: ${sau.dat} < ${nen.dat} - ${dai.dat}`);
	if (sau.chotMaHong > nen.chotMaHong + dai.chotMa) loi.push(`chot ma hong tang: ${sau.chotMaHong} > ${nen.chotMaHong} + ${dai.chotMa}`);
	for (const [i, d] of nen.tieuChiTrungBinh.entries()) {
		const s = sau.tieuChiTrungBinh[i];
		if (d === null) continue;
		if (s === null || s === undefined) {
			loi.push(`tc${i + 1} sau khong cham duoc`);
			continue;
		}
		if (s < d - dai.tieuChi - SAI_SO) loi.push(`tc${i + 1} tut: ${s.toFixed(2)} < ${d.toFixed(2)} - ${dai.tieuChi.toFixed(2)}`);
	}
	return loi;
}

if (import.meta.main ?? process.argv[1] === fileURLToPath(import.meta.url)) {
	const nen = docTom("nen");
	const sau = docTom("sau");
	const loiSom = !nen || !sau ? soSanh(nen, sau) : null;
	if (loiSom) {
		console.log(loiSom.join("\n"));
		process.exit(1);
	}
	const show = git("show", `${nen.sha}:${LOI_DAN_SOAN}`);
	const bamNen = show.status === 0 ? bam(show.stdout) : "";
	const laTienBoi = git("merge-base", "--is-ancestor", nen.sha, "HEAD").status === 0;
	const doiNgoai = git("diff", "--name-only", nen.sha, "HEAD", "--", ...VUNG_SOAN)
		.stdout.split("\n")
		.filter((t) => t && t !== LOI_DAN_SOAN);
	const lap = docTom("nen-lap");
	const doiGiuaLapNen = lap
		? git("diff", "--name-only", lap.sha, nen.sha, "--", ...VUNG_SOAN).stdout.split("\n").filter(Boolean)
		: [];
	const loi = soSanh(nen, sau, bamNen, bamTep(join(GOC, LOI_DAN_SOAN)), laTienBoi, doiNgoai, lap, doiGiuaLapNen);
	const dai = daiNoi(nen, lap, doiGiuaLapNen);
	const vi = lapDung(nen, lap, doiGiuaLapNen);
	if (vi) console.log(`khong noi dai theo nen-lap: ${vi}`);
	console.log(`dai dung: dat ${dai.dat}, chot ma ${dai.chotMa}, tieu chi ${dai.tieuChi.toFixed(2)} (khuyen ${NGUONG.dat}/${NGUONG.chotMa}/${NGUONG.tieuChi}, noi theo nen-lap neu lech hon)`);
	if (lap) console.log(`do dao dong nen: dat ${nen.dat}/${lap.dat}, chot ma ${nen.chotMaHong}/${lap.chotMaHong}`);
	console.log(`nen ${nen.dat}/${nen.tong} dat, chot ma hong ${nen.chotMaHong} · sau ${sau.dat}/${sau.tong} dat, chot ma hong ${sau.chotMaHong} · chu cu Kara viet: nen ${nen.chuCu.length}, sau ${sau.chuCu.length}`);
	if (loi.length) {
		console.log(loi.join("\n"));
		process.exit(1);
	}
	console.log("so-eval-soan: khong tut so voi nen");
}
