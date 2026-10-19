import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { API, GOC, hong, loiGoiTest, quetLoiGoi, SPEC } from "./chung.mjs";
import { xetTran } from "./tran-co-ly-do.mjs";

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

const SPEC_TUONG_DOI = "apps/api/test/go-la-cat-quyen.spec.ts";
const GOI_TUONG_DOI = "apps/api/package.json";

function docNeuCo(tuongDoi) {
	const tep = join(GOC, tuongDoi);
	return existsSync(tep) ? readFileSync(tep, "utf8") : null;
}

function tepPreload(packageJson) {
	const lenh = JSON.parse(packageJson).scripts?.test ?? "";
	return [...lenh.matchAll(/--preload\s+(\S+)/g)].map((m) =>
		join("apps/api", m[1]).replace(/\\/g, "/"),
	);
}

function docVat() {
	const packageJson = readFileSync(join(API, "package.json"), "utf8");
	const vat = {
		[SPEC_TUONG_DOI]: readFileSync(SPEC, "utf8"),
		[GOI_TUONG_DOI]: packageJson,
	};
	for (const t of [...TEP_BUNFIG, ...TEP_WORKFLOW, ...tepPreload(packageJson)])
		vat[t] = docNeuCo(t);
	return vat;
}

function soiTran(vat) {
	const loi = [];
	const dat = [];
	const spec = vat[SPEC_TUONG_DOI];
	const cacCa = loiGoiTest(spec);
	if (cacCa.length !== SO_CA)
		loi.push(`tep co ${cacCa.length} loi goi test(, ky vong ${SO_CA}`);
	else dat.push(`tep co dung ${SO_CA} loi goi test(`);
	for (const ca of cacCa) {
		const x = xetTran(spec, ca);
		if (!x.dat) loi.push(`test ${ca.ten} co tran rieng (${ca.doiSo.length} doi so): ${x.chu}`);
		else if (x.ten) dat.push(`test ${ca.ten}: tran ${x.ten} co ly do — ${x.lyDo}`);
		else dat.push(`test ${ca.ten}: 2 doi so`);
	}
	const preload = tepPreload(vat[GOI_TUONG_DOI]);
	if (preload.length === 0)
		loi.push(
			"script test cua apps/api khong khai --preload nao — khong soat duoc tep thiet lap",
		);
	for (const t of [SPEC_TUONG_DOI, ...preload]) {
		const nd = vat[t];
		if (nd === null || nd === undefined) loi.push(`${t}: khong doc duoc`);
		else if (nd.includes("setDefaultTimeout"))
			loi.push(`${t} goi setDefaultTimeout`);
		else dat.push(`${t}: khong goi setDefaultTimeout`);
	}
	for (const t of TEP_BUNFIG) {
		const nd = vat[t];
		if (nd === null) dat.push(`${t}: vang`);
		else if (/^\s*timeout\s*=/m.test(nd)) loi.push(`${t} co khoa timeout`);
		else dat.push(`${t}: khong co timeout`);
	}
	const scripts = JSON.parse(vat[GOI_TUONG_DOI]).scripts ?? {};
	for (const [ten, lenh] of Object.entries(scripts)) {
		if (!lenh.includes("bun test")) continue;
		if (lenh.includes("--timeout"))
			loi.push(`apps/api/package.json script ${ten} co --timeout`);
		else dat.push(`apps/api/package.json script ${ten}: khong --timeout`);
	}
	for (const t of TEP_WORKFLOW) {
		const nd = vat[t];
		if (nd === null) {
			dat.push(`${t}: vang`);
			continue;
		}
		const dong = nd.split("\n");
		const chayTest = dong.filter((d) => /bun (run )?test/.test(d));
		dat.push(`${t}: da doc ${dong.length} dong, ${chayTest.length} dong chay test`);
		for (const d of dong.filter((x) => x.includes("--timeout")))
			loi.push(`${t} co --timeout: ${d.trim()}`);
		if (t === TEP_WORKFLOW[0] && chayTest.length === 0)
			loi.push(
				`${t}: khong thay dong nao chay test — bo soat khong nhin thay lenh CI`,
			);
		for (const d of chayTest)
			dat.push(`${t} chay test khong --timeout: ${d.trim()}`);
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

const vat = docVat();
const spec = vat[SPEC_TUONG_DOI];
const nhom = process.argv[2];
let that;
const tuKiemDong = [];

function tuKiemTran(ten, tep, doi, thongDiep) {
	const ban = { ...vat, [tep]: doi(vat[tep]) };
	tuKiemDong.push(
		tuKiem(ten, soiTran(ban).loi, thongDiep) ??
			`HONG tu kiem ${ten}: dot bien ${tep} ma khong bat "${thongDiep}"`,
	);
}

if (nhom === "khong-noi-tran") {
	that = soiTran(vat);
	tuKiemTran(
		"spec",
		SPEC_TUONG_DOI,
		(nd) => themVaoCuoiCa(nd, "khoa-con-bat", ", 15_000"),
		"test khoa-con-bat co tran rieng",
	);
	tuKiemTran(
		"tran so tran",
		SPEC_TUONG_DOI,
		(nd) => nd.replace("\t\tTRAN_MA_TRAN_MS,\n\t);", "\t\t60_000,\n\t);"),
		"co tran rieng (3 doi so): tran 60_000 khong nam trong bang tran co ly do",
	);
	tuKiemTran(
		"tran hang ngoai bang",
		SPEC_TUONG_DOI,
		(nd) => nd.replace("\t\tTRAN_MA_TRAN_MS,\n\t);", "\t\tTRAN_KHAC,\n\t);").replace("const TRAN_MA_TRAN_MS = 60_000;", "const TRAN_MA_TRAN_MS = 60_000;\nconst TRAN_KHAC = 90_000;"),
		"co tran rieng (3 doi so): tran TRAN_KHAC khong nam trong bang tran co ly do",
	);
	tuKiemTran(
		"package.json",
		GOI_TUONG_DOI,
		(nd) => {
			const goi = JSON.parse(nd);
			return JSON.stringify({
				...goi,
				scripts: {
					...goi.scripts,
					test: `${goi.scripts.test} --timeout 15000`,
				},
			});
		},
		"apps/api/package.json script test co --timeout",
	);
	tuKiemTran(
		"bunfig",
		TEP_BUNFIG[0],
		(nd) => `${nd ?? ""}[test]\ntimeout = 15000\n`,
		`${TEP_BUNFIG[0]} co khoa timeout`,
	);
	tuKiemTran(
		"workflow nhieu dong",
		TEP_WORKFLOW[0],
		(nd) =>
			`${nd}      - name: thu\n        run: |\n          bun test --timeout 15000\n`,
		`${TEP_WORKFLOW[0]} co --timeout`,
	);
	const [preloadDau] = tepPreload(vat[GOI_TUONG_DOI]);
	if (preloadDau)
		tuKiemTran(
			"preload",
			preloadDau,
			(nd) => `${nd}\nsetDefaultTimeout(15_000);\n`,
			`${preloadDau} goi setDefaultTimeout`,
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
