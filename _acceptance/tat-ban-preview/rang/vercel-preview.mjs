import {
	BA_DU_AN,
	BA_TEP,
	git,
	LoiApi,
	ngu,
	statusGithub,
	timLanDay,
	trienKhaiCho,
} from "./vercel-doc.mjs";

const NHANH_MOC = "fix/gieo-nguoi-chiu-song-song";
const SHA_MOC = "1723dca25c205a7fd9cc7aa4a174797cfcf3e877";
const CHO_PHUT = 5;
const TRAN_PHUT = 10;

function coDuBaTep(sha) {
	if (git("cat-file", "-e", `${sha}^{commit}`).ma !== 0)
		git("fetch", "-q", "origin", sha);
	if (git("cat-file", "-e", `${sha}^{commit}`).ma !== 0) return null;
	return BA_TEP.every((tep) => git("cat-file", "-e", `${sha}:${tep}`).ma === 0);
}

function doMotSha(sha) {
	const dong = [];
	let co = 0;
	for (const duAn of BA_DU_AN) {
		const ds = trienKhaiCho(duAn, sha);
		co += ds.length;
		dong.push(
			ds.length
				? `${duAn} co deployment cho ${sha.slice(0, 9)}: ${ds.map((d) => `${d.id} ${d.readyState} ${d.target}`).join(", ")}`
				: `${duAn}: 0 deployment cho ${sha.slice(0, 9)}`,
		);
	}
	const status = statusGithub(sha).filter((s) =>
		s.context.startsWith("Vercel – crm-onehub-"),
	);
	for (const s of status)
		dong.push(`status ${s.context} ${s.state} cho ${sha.slice(0, 9)}`);
	return { co, status: status.length, dong };
}

async function xanh() {
	const nhanh = git("rev-parse", "--abbrev-ref", "HEAD").ra;
	const batDau = Date.now();
	for (;;) {
		const lanDay = timLanDay(nhanh);
		const giu = [];
		for (const lan of lanDay) {
			const du = coDuBaTep(lan.after);
			if (du === null) {
				console.log(`KHONG-CO-COMMIT: ${lan.after} cua lan day ${lan.luc}`);
				return 2;
			}
			if (du) giu.push(lan);
		}
		if (giu.length === 0) {
			console.log(`CHUA-DAY: nhanh ${nhanh} chua co lan day nao co ca ba tep`);
			return 2;
		}
		const moiNhat = Math.max(...giu.map((l) => Date.parse(l.luc)));
		const conPhut = CHO_PHUT - (Date.now() - moiNhat) / 60000;
		if (conPhut > 0) {
			if ((Date.now() - batDau) / 60000 + conPhut > TRAN_PHUT) {
				console.log(
					`HET-GIO-CHO: lan day moi nhat ${new Date(moiNhat).toISOString()} chua du ${CHO_PHUT} phut`,
				);
				return 2;
			}
			await ngu(Math.ceil(conPhut * 60) + 5);
			continue;
		}
		console.log(
			`${giu.length} lan day giu: ${giu.map((l) => l.after.slice(0, 9)).join(", ")}`,
		);
		let ma = 0;
		for (const lan of giu) {
			const kq = doMotSha(lan.after);
			for (const d of kq.dong) console.log(d);
			if (kq.co > 0 || kq.status > 0) ma = 1;
		}
		return ma;
	}
}

function doChieuDo() {
	const lan = timLanDay(NHANH_MOC).find((l) => l.after === SHA_MOC);
	if (!lan) {
		console.log(
			`khong thay lan day moc ${SHA_MOC.slice(0, 9)} tren ${NHANH_MOC}`,
		);
		return 1;
	}
	console.log(`lan day moc: ${lan.after.slice(0, 9)} (${lan.luc})`);
	const kq = doMotSha(lan.after);
	for (const d of kq.dong) console.log(d);
	const du = BA_DU_AN.every((duAn) =>
		kq.dong.some((d) =>
			d.startsWith(`${duAn} co deployment cho ${SHA_MOC.slice(0, 9)}: dpl_`),
		),
	);
	return du ? 0 : 1;
}

const cheDo = process.argv[2];
if (cheDo !== "xanh" && cheDo !== "do") {
	console.log("dung: vercel-preview.mjs xanh|do");
	process.exit(2);
}
try {
	process.exit(cheDo === "xanh" ? await xanh() : doChieuDo());
} catch (loi) {
	console.log(`LOI-API: ${loi instanceof LoiApi ? loi.message : String(loi)}`);
	process.exit(2);
}
