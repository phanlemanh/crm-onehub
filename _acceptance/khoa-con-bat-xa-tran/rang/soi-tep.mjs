import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { API, GOC, hong, loiGoiTest, quetLoiGoi, SPEC } from "./chung.mjs";

const SO_CA = 18;
const CHO_GOI_MA_TRAN = [
	{ ca: "ma-tran-dang-nhap-lai", ham: "maTranTrpc", songSong: false },
	{ ca: "ngoai-le-dung-tap-khai", ham: "maTranTrpc", songSong: false },
	{ ca: "doi-chung-thanh-vien", ham: "maTranTrpc", songSong: false },
	{ ca: "tab-dang-mo", ham: "maTranTrpc", songSong: false },
	{ ca: "khoa-con-bat", ham: "maTranTrpc", songSong: true },
	{ ca: "khoa-con-bat", ham: "maTranRest", songSong: true },
];
const TEP_BUNFIG = ["apps/api/bunfig.toml", "bunfig.toml"];
const TEP_WORKFLOW = [
	".github/workflows/ci.yml",
	".github/workflows/acceptance.yml",
];

function docNeuCo(tuongDoi) {
	const tep = join(GOC, tuongDoi);
	return existsSync(tep) ? readFileSync(tep, "utf8") : null;
}

function soiTran(spec, packageJson) {
	const loi = [];
	const dat = [];
	const cacCa = loiGoiTest(spec);
	if (cacCa.length !== SO_CA)
		loi.push(`tep co ${cacCa.length} loi goi test(, ky vong ${SO_CA}`);
	else dat.push(`tep co dung ${SO_CA} loi goi test(`);
	for (const ca of cacCa) {
		if (ca.doiSo.length !== 2)
			loi.push(`test ${ca.ten} co tran rieng (${ca.doiSo.length} doi so)`);
		else dat.push(`test ${ca.ten}: 2 doi so`);
	}
	if (spec.includes("setDefaultTimeout")) loi.push("tep goi setDefaultTimeout");
	else dat.push("tep khong goi setDefaultTimeout");
	for (const t of TEP_BUNFIG) {
		const nd = docNeuCo(t);
		if (nd === null) dat.push(`${t}: vang`);
		else if (/^\s*timeout\s*=/m.test(nd)) loi.push(`${t} co khoa timeout`);
		else dat.push(`${t}: khong co timeout`);
	}
	const scripts = JSON.parse(packageJson).scripts ?? {};
	for (const [ten, lenh] of Object.entries(scripts)) {
		if (!lenh.includes("bun test")) continue;
		if (lenh.includes("--timeout"))
			loi.push(`apps/api/package.json script ${ten} co --timeout`);
		else dat.push(`apps/api/package.json script ${ten}: khong --timeout`);
	}
	for (const t of TEP_WORKFLOW) {
		const nd = docNeuCo(t);
		if (nd === null) {
			dat.push(`${t}: vang`);
			continue;
		}
		for (const dong of nd.split("\n")) {
			if (!/\brun:/.test(dong) || !/bun (run )?test/.test(dong)) continue;
			if (dong.includes("--timeout"))
				loi.push(`${t} co --timeout: ${dong.trim()}`);
			else dat.push(`${t}: ${dong.trim()}`);
		}
	}
	return { loi, dat };
}

function soiTuanTu(spec) {
	const loi = [];
	const dat = [];
	const cacCa = loiGoiTest(spec);
	const tong = ["maTranTrpc", "maTranRest"].reduce(
		(n, ham) =>
			n +
			quetLoiGoi(spec, ham).filter((g) =>
				cacCa.some((c) => g.dau > c.dau && g.ket < c.ket),
			).length,
		0,
	);
	if (tong !== CHO_GOI_MA_TRAN.length)
		loi.push(
			`tep co ${tong} loi goi ma tran trong cac ca, ky vong ${CHO_GOI_MA_TRAN.length}`,
		);
	else
		dat.push(
			`tep co dung ${CHO_GOI_MA_TRAN.length} loi goi ma tran trong cac ca`,
		);
	for (const { ca, ham, songSong } of CHO_GOI_MA_TRAN) {
		const khung = cacCa.filter((c) => c.ten === ca);
		if (khung.length !== 1) {
			loi.push(`ca ${ca} co ${khung.length} lan trong tep`);
			continue;
		}
		const [c] = khung;
		const goi = quetLoiGoi(spec, ham).filter(
			(g) => g.dau > c.dau && g.ket < c.ket,
		);
		if (goi.length !== 1) {
			loi.push(`${ca} goi ${ham} ${goi.length} lan, ky vong 1`);
			continue;
		}
		const doiSo = goi[0].doiSo;
		const laSongSong = doiSo.length === 2 && doiSo[1] === "LO_SONG_SONG";
		if (songSong && !laSongSong)
			loi.push(`${ca} goi ${ham} khong song song: (${doiSo.join(", ")})`);
		else if (!songSong && doiSo.length !== 1)
			loi.push(`${ca} goi ma tran song song: ${ham}(${doiSo.join(", ")})`);
		else dat.push(`${ca}: ${ham}(${doiSo.join(", ")})`);
	}
	return { loi, dat };
}

function tuKiem(ten, loi, thongDiep) {
	if (loi.some((l) => l.includes(thongDiep)))
		return `OK tu kiem ${ten}: bat "${thongDiep}"`;
	return null;
}

function themVaoCa(spec, ca, ham, them) {
	const [c] = loiGoiTest(spec).filter((x) => x.ten === ca);
	if (!c) hong(2, `tu kiem: khong thay ca ${ca}`);
	const [g] = quetLoiGoi(spec, ham).filter(
		(x) => x.dau > c.dau && x.ket < c.ket,
	);
	if (!g) hong(2, `tu kiem: ca ${ca} khong goi ${ham}`);
	return spec.slice(0, g.ket) + them + spec.slice(g.ket);
}

function themVaoCuoiCa(spec, ca, them) {
	const [c] = loiGoiTest(spec).filter((x) => x.ten === ca);
	if (!c) hong(2, `tu kiem: khong thay ca ${ca}`);
	return spec.slice(0, c.ket) + them + spec.slice(c.ket);
}

const spec = readFileSync(SPEC, "utf8");
const packageJson = readFileSync(join(API, "package.json"), "utf8");
const nhom = process.argv[2];
let that;
const tuKiemDong = [];

if (nhom === "khong-noi-tran") {
	that = soiTran(spec, packageJson);
	const specTran = themVaoCuoiCa(spec, "khoa-con-bat", ", 15_000");
	tuKiemDong.push(
		tuKiem(
			"spec",
			soiTran(specTran, packageJson).loi,
			"test khoa-con-bat co tran rieng",
		) ??
			'HONG tu kiem spec: them 15_000 vao khoa-con-bat ma khong bat "test khoa-con-bat co tran rieng"',
	);
	const goi = JSON.parse(packageJson);
	const goiTran = JSON.stringify({
		...goi,
		scripts: { ...goi.scripts, test: `${goi.scripts.test} --timeout 15000` },
	});
	tuKiemDong.push(
		tuKiem(
			"package.json",
			soiTran(spec, goiTran).loi,
			"apps/api/package.json script test co --timeout",
		) ??
			'HONG tu kiem package.json: them --timeout ma khong bat "apps/api/package.json script test co --timeout"',
	);
} else if (nhom === "tuan-tu") {
	that = soiTuanTu(spec);
	const specSongSong = themVaoCa(
		spec,
		"doi-chung-thanh-vien",
		"maTranTrpc",
		", LO_SONG_SONG",
	);
	tuKiemDong.push(
		tuKiem(
			"doi-chung-thanh-vien",
			soiTuanTu(specSongSong).loi,
			"doi-chung-thanh-vien goi ma tran song song",
		) ??
			'HONG tu kiem: them LO_SONG_SONG vao doi-chung-thanh-vien ma khong bat "doi-chung-thanh-vien goi ma tran song song"',
	);
} else {
	hong(2, `nhom khong co: ${nhom} (co: khong-noi-tran, tuan-tu)`);
}

for (const d of that.dat) console.log(`OK ${d}`);
for (const l of that.loi) console.log(`HONG ${l}`);
for (const d of tuKiemDong) console.log(d);
const hongTuKiem = tuKiemDong.filter((d) => d.startsWith("HONG")).length;
console.log(
	`${nhom}: ${that.dat.length} dat, ${that.loi.length} hong, tu kiem ${tuKiemDong.length - hongTuKiem}/${tuKiemDong.length}`,
);
process.exit(that.loi.length || hongTuKiem ? 1 : 0);
