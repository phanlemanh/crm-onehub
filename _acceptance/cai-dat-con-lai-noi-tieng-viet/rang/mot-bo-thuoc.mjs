import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const DOT_MOT = `${GOC}/_acceptance/man-cai-dat-noi-tieng-viet/rang`;
const DOT_HAI = `${GOC}/_acceptance/cai-dat-con-lai-noi-tieng-viet/rang`;
const CAU_HINH = `${GOC}/_acceptance/config.yaml`;
const NGUONG = 12;
const IN_TOI_DA = 20;
const NOI_LA = tmpdir();

const MUI = [
	{
		ten: "chu-cung-lat.mjs",
		duong: `${DOT_MOT}/chu-cung-lat.mjs`,
		thamSo: [],
		doi: [{ nhan: "so file quet", mau: /bo quet doc (\d+) file/, cho: "10" }],
	},
	{
		ten: "chu-ngoai-jsx.mjs --chan toast",
		duong: `${DOT_MOT}/chu-ngoai-jsx.mjs`,
		thamSo: ["--chan", "toast"],
		doi: [
			{
				nhan: "loi goi toast",
				mau: /nhan ra (\d+\/\d+) loi goi/,
				cho: "12/12",
			},
		],
	},
	{
		ten: "chu-ngoai-jsx.mjs --chan tieu-de",
		duong: `${DOT_MOT}/chu-ngoai-jsx.mjs`,
		thamSo: ["--chan", "tieu-de"],
		doi: [{ nhan: "o nhan", mau: /(\d+) o nhan/, cho: "9" }],
	},
	{
		ten: "khai-sinh.mjs",
		duong: `${DOT_MOT}/khai-sinh.mjs`,
		thamSo: [],
		doi: [{ nhan: "cau ket", mau: /(XANH):/, cho: "XANH" }],
	},
];


function khoiSh(duong) {
	const dong = [];
	const tho = readFileSync(duong, "utf8").split("\n");
	for (let i = 0; i < tho.length; i++) {
		const chuan = tho[i].replace(/\s+/g, " ").trim();
		if (chuan !== "" && !chuan.startsWith("#"))
			dong.push({ so: i + 1, chuan });
	}
	return [{ ten: "than script", ham: false, dong }].filter(
		(k) => k.dong.length >= NGUONG,
	);
}

function chotTienDe() {
	const yaml = readFileSync(CAU_HINH, "utf8");
	const can = new Set();
	for (const d of yaml.split("\n")) {
		if (!/^\s+cd2_[a-z0-9_]+:/.test(d)) continue;
		for (const m of d.matchAll(
			/_acceptance\/cai-dat-con-lai-noi-tieng-viet\/rang\/([A-Za-z0-9._-]+)/g,
		))
			can.add(m[1]);
	}
	const ds = [...can].sort();
	const thieu = ds.filter((t) => !existsSync(`${DOT_HAI}/${t}`));
	if (thieu.length > 0) {
		console.log(
			`KHONG DO DUOC: o cam cd2_* tro toi ${ds.length} script trong rang/ cua lat nay, thieu ${thieu.length}: ${thieu.join(" · ")}.`,
		);
		console.log(
			"    So than ham khi thu muc chua du file la so mot file voi chinh no — khong noi len dieu gi.",
		);
		process.exit(2);
	}
	console.log(`tien de: ${ds.length} script o cam tro toi deu co mat`);
}

function khongDo(...dong) {
	for (const d of dong) console.log(d);
	process.exit(2);
}

let ts;
try {
	ts = createRequire(import.meta.url)("typescript");
} catch (e) {
	khongDo(
		`KHONG DO DUOC: khong nap duoc typescript (${e.message}). Chan nay lay than ham tu cay cu phap, khong so tho ca file.`,
	);
}

function trangThaiCay() {
	return execFileSync("git", ["status", "--porcelain"], {
		cwd: GOC,
		encoding: "utf8",
	});
}

let cayTruoc;
try {
	cayTruoc = trangThaiCay();
} catch (e) {
	khongDo(
		`KHONG DO DUOC: khong chay duoc git status tai ${GOC} — ${e.message}`,
	);
}

for (const d of [DOT_MOT, DOT_HAI])
	if (!existsSync(d))
		khongDo(`KHONG DO DUOC: khong co thu muc ${relative(GOC, d)} tren dia`);

function fileMjs(thuMuc) {
	return readdirSync(thuMuc)
		.filter((t) => t.match(/\.(mjs|sh)$/))
		.sort()
		.map((t) => `${thuMuc}/${t}`);
}

const fileMot = fileMjs(DOT_MOT);
const fileHai = fileMjs(DOT_HAI);

if (fileMot.length === 0)
	khongDo(
		"KHONG DO DUOC: thu muc rang/ cua dot mot khong con file .mjs nao — tap quan sat rong khong bao gio la dat",
	);

if (fileHai.length === 0)
	khongDo(
		"KHONG DO DUOC: thu muc rang/ cua lat nay chua co file .mjs nao — chua co gi de so, va tap quan sat rong khong bao gio la dat",
		"  Chay lai chan nay sau khi cac chan do cua lat da nam tren dia.",
	);

function dongChuan(ma, batDau, ketThuc, cay) {
	const dauDong = cay.getLineAndCharacterOfPosition(batDau).line;
	const doan = ma.slice(batDau, ketThuc).split("\n");
	const ra = [];
	for (let i = 0; i < doan.length; i++) {
		const chuan = doan[i].replace(/\s+/g, " ").trim();
		if (chuan !== "") ra.push({ so: dauDong + i + 1, chuan });
	}
	return ra;
}

function laHam(n) {
	return (
		ts.isFunctionDeclaration(n) ||
		ts.isFunctionExpression(n) ||
		ts.isArrowFunction(n) ||
		ts.isMethodDeclaration(n) ||
		ts.isConstructorDeclaration(n) ||
		ts.isGetAccessorDeclaration(n) ||
		ts.isSetAccessorDeclaration(n)
	);
}

function tenHam(n, cay) {
	if (n.name) return n.name.getText(cay);
	const cha = n.parent;
	if (
		cha &&
		(ts.isVariableDeclaration(cha) || ts.isPropertyAssignment(cha)) &&
		cha.name
	)
		return cha.name.getText(cay);
	const dong = cay.getLineAndCharacterOfPosition(n.getStart(cay)).line + 1;
	return `khong ten @${dong}`;
}

function khoiCuaFile(duong) {
	const ma = readFileSync(duong, "utf8");
	const cay = ts.createSourceFile(
		duong,
		ma,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.JS,
	);
	const khoi = [];
	const banLe = cay.statements.filter(
		(n) => !ts.isImportDeclaration(n) && !ts.isExportDeclaration(n),
	);

	if (banLe.length > 0)
		khoi.push({
			ten: "than mo-dun",
			ham: false,
			dong: dongChuan(
				ma,
				banLe[0].getStart(cay),
				banLe[banLe.length - 1].end,
				cay,
			),
		});

	const di = (n) => {
		if (laHam(n) && n.body)
			khoi.push({
				ten: `than ham ${tenHam(n, cay)}`,
				ham: true,
				dong: dongChuan(ma, n.body.getStart(cay), n.body.end, cay),
			});
		ts.forEachChild(n, di);
	};
	ts.forEachChild(cay, di);

	return khoi.filter((k) => k.dong.length >= NGUONG);
}

function runChung(a, b) {
	let truoc = new Array(b.length + 1).fill(0);
	let tot = { dai: 0, i: 0, j: 0 };
	for (let i = 1; i <= a.length; i++) {
		const nay = new Array(b.length + 1).fill(0);
		for (let j = 1; j <= b.length; j++) {
			if (a[i - 1].chuan === b[j - 1].chuan) {
				nay[j] = truoc[j - 1] + 1;
				if (nay[j] > tot.dai)
					tot = { dai: nay[j], i: i - nay[j], j: j - nay[j] };
			}
		}
		truoc = nay;
	}
	return tot;
}

const bang = new Map();
for (const f of [...fileMot, ...fileHai]) {
	try {
		bang.set(f, f.endsWith(".sh") ? khoiSh(f) : khoiCuaFile(f));
	} catch (e) {
		khongDo(
			`KHONG DO DUOC: khong doc duoc than ham cua ${relative(GOC, f)} — ${e.message}`,
		);
	}
}

const soKhoi = [...bang.values()].reduce((t, k) => t + k.length, 0);
const trung = [];

for (const fa of fileMot)
	for (const fb of fileHai) {
		let tot = null;
		for (const A of bang.get(fa))
			for (const B of bang.get(fb)) {
				const r = runChung(A.dong, B.dong);
				if (r.dai < NGUONG) continue;
				const uu = A.ham && B.ham ? 1 : 0;
				if (
					tot === null ||
					r.dai > tot.r.dai ||
					(r.dai === tot.r.dai && uu > tot.uu)
				)
					tot = { A, B, r, uu };
			}
		if (tot !== null) trung.push({ fa, fb, ...tot });
	}

for (const t of trung) {
	const dauA = t.A.dong[t.r.i];
	const cuoiA = t.A.dong[t.r.i + t.r.dai - 1];
	const dauB = t.B.dong[t.r.j];
	const cuoiB = t.B.dong[t.r.j + t.r.dai - 1];
	console.log(
		`TRUNG ${t.r.dai} dong: ${relative(GOC, t.fa)} [${t.A.ten}] dong ${dauA.so}-${cuoiA.so}`,
	);
	console.log(
		`             va: ${relative(GOC, t.fb)} [${t.B.ten}] dong ${dauB.so}-${cuoiB.so}`,
	);
	const doan = t.A.dong.slice(t.r.i, t.r.i + t.r.dai);
	for (const d of doan.slice(0, IN_TOI_DA)) console.log(`    | ${d.chuan}`);
	if (doan.length > IN_TOI_DA)
		console.log(`    | … con ${doan.length - IN_TOI_DA} dong nua`);
	console.log(
		"  Hai ban chep se troi nhau. Rut phan chung ra mot mo-dun, hai ben cung nhap.",
	);
}

function chay(duong, thamSo, noi) {
	try {
		return {
			ma: 0,
			ra: execFileSync("node", [duong, ...thamSo], {
				cwd: noi,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "pipe"],
			}),
		};
	} catch (e) {
		return { ma: e.status ?? 1, ra: `${e.stdout ?? ""}${e.stderr ?? ""}` };
	}
}

function rut(ra, doi) {
	const m = doi.mau.exec(ra);
	return m === null ? null : m[1];
}

const lech = [];

for (const m of MUI) {
	if (!existsSync(m.duong)) {
		khongDo(
			`KHONG DO DUOC: mui goi cua dot mot khong con tren dia: ${relative(GOC, m.duong)}`,
		);
	}

	const oGoc = chay(m.duong, m.thamSo, GOC);
	const oLa = chay(m.duong, m.thamSo, NOI_LA);

	if (oGoc.ma !== 0 || oLa.ma !== 0) {
		lech.push(
			`LECH: ${m.ten} thoat ${oGoc.ma} khi chay tu goc kho va ${oLa.ma} khi chay tu ${NOI_LA}, cho 0 ca hai. Bang chung da ky cua dot mot khong tai lap duoc.`,
		);
		for (const d of `${oGoc.ra}${oLa.ra}`
			.split("\n")
			.filter((d) => d.trim() !== ""))
			lech.push(`    | ${d}`);
		continue;
	}

	for (const d of m.doi) {
		const tuGoc = rut(oGoc.ra, d);
		const tuLa = rut(oLa.ra, d);

		if (tuGoc === null) {
			lech.push(
				`LECH: ${m.ten} khong in ra ${d.nhan} nao. Cho "${d.cho}". Ban khai cua chan do va dau ra da roi nhau.`,
			);
			continue;
		}
		if (tuGoc !== d.cho) {
			lech.push(
				`LECH: ${m.ten} cho ${d.nhan} "${d.cho}" nhung nhan "${tuGoc}". Con so trong evidence-report da ky cua dot mot khong con tai lap duoc.`,
			);
			continue;
		}
		if (tuLa !== tuGoc) {
			lech.push(
				`LECH: ${m.ten} cho ${d.nhan} "${tuGoc}" khi chay tu goc kho nhung "${tuLa}" khi chay tu ${NOI_LA}. Ban khai lat dang phan giai theo cwd chu khong theo thu muc script.`,
			);
			continue;
		}
		console.log(
			`ve 2: ${m.ten} → thoat 0 · ${d.nhan} ${tuGoc} · khong doi theo cwd`,
		);
	}
}

for (const l of lech) console.log(l);

let caySau;
try {
	caySau = trangThaiCay();
} catch (e) {
	khongDo(
		`KHONG DO DUOC: khong chay duoc git status sau luot do — ${e.message}`,
	);
}

if (caySau !== cayTruoc) {
	console.log(
		"KHONG DO DUOC: cay lam viec khac truoc va sau luot do — chan do da de lai vet, khong duoc tin ket qua.",
	);
	for (const d of caySau
		.split("\n")
		.filter((x) => !cayTruoc.includes(x) && x.trim() !== ""))
		console.log(`    them: ${d}`);
	for (const d of cayTruoc
		.split("\n")
		.filter((x) => !caySau.includes(x) && x.trim() !== ""))
		console.log(`    mat:  ${d}`);
	process.exit(2);
}

if (trung.length > 0 || lech.length > 0) process.exit(1);

chotTienDe();

console.log(
	`ve 1: ${fileMot.length} file .mjs/.sh cua dot mot va ${fileHai.length} cua lat nay, ${soKhoi} than ham va than mo-dun, ${fileMot.length * fileHai.length} cap file — 0 khoi trung tu ${NGUONG} dong tro len.`,
);
console.log(
	`XANH: mot bo thuoc, khong ban chep nao troi; ${MUI.length} mui goi cua dot mot chay khong tham so van dung con so da ky.`,
);
