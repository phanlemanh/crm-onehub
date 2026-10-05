import { CAU_HINH } from "./cau-hinh.mjs";
import { demCaVaKhangDinh } from "./cay.mjs";
import {
	banSao,
	chayBun,
	dongHong,
	nguonHienTai,
	nguonNeo,
	tongKet,
	xoaBanSao,
} from "./chay.mjs";

function chay() {
	const banSaoDaTao = [];
	try {
		let neo;
		let soCa;
		try {
			neo = nguonNeo();
			soCa = demCaVaKhangDinh(nguonHienTai()).soCa;
		} catch (e) {
			console.log(`khong doc duoc tep hoac ban neo: ${e.message}`);
			return 2;
		}
		const lap = ["--rerun-each", String(CAU_HINH.lanLapLai)];
		const tepCu = banSao("tcu-on-dinh-cu", neo);
		banSaoDaTao.push(tepCu);
		const cu = chayBun(tepCu, lap);
		const tkCu = tongKet(cu.ra);
		const hongCu = dongHong(cu.ra);
		const trongBa = hongCu.filter((h) =>
			CAU_HINH.caDocUrl.some((t) => h.endsWith(t)),
		);
		console.log(
			`doi chung (ban neo, lap ${CAU_HINH.lanLapLai} lan): ${tkCu.pass} pass, ${tkCu.fail} fail; ${trongBa.length} lan do o ba ca doc url`,
		);
		if (tkCu.fail === null || trongBa.length === 0) {
			console.log(
				"doi chung khong do — lenh lap khong phan biet duoc ban chap chon, khong ket luan",
			);
			return 2;
		}
		const moi = chayBun(CAU_HINH.tep.replace(`${CAU_HINH.goiApp}/`, ""), lap);
		const tk = tongKet(moi.ra);
		const mong = soCa * CAU_HINH.lanLapLai;
		console.log(
			`ban hien tai (lap ${CAU_HINH.lanLapLai} lan, ${soCa} ca): ${tk.pass} pass, ${tk.fail} fail, mong ${mong} pass`,
		);
		if (tk.pass === null || tk.fail === null) {
			console.log(
				`khong doc duoc tong ket bun (ma ${moi.ma}); ${moi.loi ?? ""}`,
			);
			return 2;
		}
		for (const h of dongHong(moi.ra)) console.log(`  do: ${h}`);
		if (tk.fail > 0 || tk.pass !== mong) return 1;
		console.log("XANH: 0 lan do trong lap lai, doi chung do");
		return 0;
	} finally {
		const sot = xoaBanSao(banSaoDaTao);
		if (sot.length > 0) {
			console.log(`ban sao con sot: ${sot.join(", ")}`);
			process.exitCode = 2;
		}
	}
}

const ma = chay();
process.exit(process.exitCode === 2 ? 2 : ma);
