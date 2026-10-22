import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chayLuoi, cayTach, DA_KY, docDauRaLuoi, evalsMay, git, GOC, HO_SO, kiemKe, trangThai } from "./chung.mjs";

function thamSo(argv) {
	const ra = { sha: null, ra: join(HO_SO, "kiem-ke.json"), tuKiem: false };
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--sha") ra.sha = argv[++i];
		else if (argv[i] === "--ra") ra.ra = argv[++i];
		else if (argv[i] === "--tu-kiem") ra.tuKiem = true;
		else {
			console.error(`kiem-ke: tham so la ${argv[i]}`);
			process.exit(3);
		}
	}
	return ra;
}

function kiemKeTaiSha(sha) {
	const dau = git(GOC, "rev-parse", "HEAD");
	const dich = git(GOC, "rev-parse", sha);
	if (dich === dau) return { sha: dich, ho_so: kiemKe({ root: GOC }) };
	const cay = cayTach(dich, `kiem-ke-${dich.slice(0, 12)}`);
	try {
		return { sha: dich, ho_so: kiemKe({ root: cay.goc }) };
	} finally {
		cay.don();
	}
}

function docDocLap(text) {
	const cu = new Set();
	const ly = new Map();
	for (const dong of text.split("\n")) {
		if (dong.startsWith("VIOLATION [") && dong.includes("]: evidence is stale")) cu.add(dong.slice(11, dong.indexOf("]")));
		const dau = "NOTE [";
		const giua = "]: bộ lọc paths không áp (";
		if (dong.startsWith(dau) && dong.includes(giua)) {
			const slug = dong.slice(dau.length, dong.indexOf("]"));
			const sau = dong.slice(dong.indexOf(giua) + giua.length);
			ly.set(slug, sau.slice(0, sau.indexOf(")")));
		}
	}
	return { cu, ly };
}

function tuKiem() {
	const text = chayLuoi(GOC);
	const hoSo = docDauRaLuoi(text);
	const doc = docDocLap(text);
	const loi = [];
	const tapKiem = new Set(hoSo.map((h) => h.slug));
	for (const s of doc.cu) if (!tapKiem.has(s)) loi.push(`thieu ${s}`);
	for (const s of tapKiem) if (!doc.cu.has(s)) loi.push(`thua ${s}`);
	for (const h of hoSo) {
		const mong = doc.ly.has(h.slug) ? `thieu-paths:${doc.ly.get(h.slug)}` : "loc-ap";
		if (h.nhom !== mong) loi.push(`nhom ${h.slug}: ${h.nhom} != ${mong}`);
	}
	const a = hoSo.filter((h) => h.nhom === "loc-ap").length;
	console.log(`kiem-ke: ${hoSo.length} ho so cu (${a} loc-ap, ${hoSo.length - a} thieu-paths)`);
	if (loi.length) {
		console.log(`KET LUAN: do — kiem ke lech dau ra luoi: ${loi.join("; ")}`);
		process.exit(1);
	}
	const chon = chonHoSoTuoi(tapKiem, doc.ly);
	if (!chon) {
		console.log("KET LUAN: khong do duoc — khong dung duoc ca do (khong ho so tuoi nao co eval may khai tep that)");
		process.exit(2);
	}
	const cay = cayTach("HEAD", "tu-kiem-lam-cu");
	try {
		appendFileSync(join(cay.goc, chon.tep), "\n");
		git(cay.goc, "-c", "user.name=kiem-ke", "-c", "user.email=kiem-ke@local", "commit", "-q", "-am", "lam cu gia");
		const sau = kiemKe({ root: cay.goc, slugs: [chon.slug] });
		if (!sau.some((h) => h.slug === chon.slug)) {
			console.log(`KET LUAN: do — thuoc hong: kiem-ke khong thay ho so vua lam cu ${chon.slug}`);
			process.exit(1);
		}
		console.log(`BAT lam-cu-${chon.slug} (tep ${chon.tep})`);
	} finally {
		cay.don();
	}
	console.log("KET LUAN: xanh");
}

function chonHoSoTuoi(cu, ly) {
	const ds = git(GOC, "ls-files", "_acceptance/*/contract.md").split("\n").filter(Boolean);
	for (const p of ds) {
		const slug = p.split("/")[1];
		if (cu.has(slug) || ly.has(slug) || !DA_KY.includes(trangThai(GOC, slug))) continue;
		for (const e of evalsMay(GOC, slug)) {
			const tep = e.paths.find((x) => !/[*?[\]]/.test(x) && !x.startsWith("_acceptance/") && existsSync(join(GOC, x)));
			if (tep) return { slug, tep };
		}
	}
	return null;
}

const ts = thamSo(process.argv.slice(2));
if (ts.tuKiem) tuKiem();
else {
	const kq = kiemKeTaiSha(ts.sha ?? "HEAD");
	writeFileSync(ts.ra, `${JSON.stringify({ sha: kq.sha, so: kq.ho_so.length, ho_so: kq.ho_so }, null, 2)}\n`);
	const a = kq.ho_so.filter((h) => h.nhom === "loc-ap").length;
	console.log(`kiem-ke ${kq.sha.slice(0, 9)}: ${kq.ho_so.length} ho so cu (${a} loc-ap, ${kq.ho_so.length - a} thieu-paths) -> ${ts.ra}`);
}
