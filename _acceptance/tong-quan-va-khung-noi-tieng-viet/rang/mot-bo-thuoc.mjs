import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const AC = `${GOC}/_acceptance`;
const LAT = "tong-quan-va-khung-noi-tieng-viet";
const KHAC = [
	"nhan-ung-dung-noi-tieng-viet",
	"man-cai-dat-noi-tieng-viet",
	"cai-dat-con-lai-noi-tieng-viet",
	"agent-builder-noi-tieng-viet",
];
const NGUONG = 12;
const ts = createRequire(import.meta.url)("typescript");
const do_ = [];

function chuan(dong) {
	return dong.map((d) => d.replace(/\s+/g, " ").trim()).filter((d) => d !== "");
}

function laThanHam(n) {
	return (
		ts.isFunctionDeclaration(n) ||
		ts.isArrowFunction(n) ||
		ts.isFunctionExpression(n) ||
		ts.isMethodDeclaration(n) ||
		ts.isConstructorDeclaration(n) ||
		ts.isGetAccessorDeclaration(n) ||
		ts.isSetAccessorDeclaration(n)
	);
}

function thanHam(duong, chuThay) {
	const nguon = ts.createSourceFile(
		duong,
		chuThay ?? readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const ra = [];
	const di = (n) => {
		if (laThanHam(n) && n.body && ts.isBlock(n.body)) {
			const dong = chuan(n.body.getText(nguon).split("\n"));
			if (dong.length >= NGUONG)
				ra.push({ ten: n.name?.getText(nguon) ?? "(an danh)", dong });
		}
		ts.forEachChild(n, di);
	};
	di(nguon);
	const capMoDun = chuan(
		nguon.statements
			.filter((n) => !laThanHam(n))
			.map((n) => n.getText(nguon))
			.join("\n")
			.split("\n"),
	);
	if (capMoDun.length >= NGUONG)
		ra.push({ ten: "(than mo-dun)", dong: capMoDun });
	return ra;
}

function fileMjs(thuMuc) {
	return existsSync(thuMuc)
		? readdirSync(thuMuc)
				.filter((t) => t.endsWith(".mjs"))
				.map((t) => `${thuMuc}/${t}`)
		: [];
}

function cuaSo(dong) {
	const ra = new Set();
	for (let i = 0; i + NGUONG <= dong.length; i += 1)
		ra.add(dong.slice(i, i + NGUONG).join("\n"));
	return ra;
}

const fileLat = fileMjs(`${AC}/${LAT}/rang`);
const fileKhac = KHAC.flatMap((k) => fileMjs(`${AC}/${k}/rang`));
if (fileLat.length === 0) {
	console.log("KHONG DO DUOC: rang/ cua lat khong co file .mjs nao.");
	process.exit(2);
}

const cuaSoKhac = new Map();
for (const f of fileKhac)
	for (const h of thanHam(f))
		for (const w of cuaSo(h.dong))
			cuaSoKhac.set(w, `${relative(GOC, f)}:${h.ten}`);

function demTrung(them) {
	const ra = [];
	const bo = [...fileLat.map((f) => [f, undefined]), ...(them ?? [])];
	for (const [f, chu] of bo)
		for (const h of thanHam(f, chu))
			for (const w of cuaSo(h.dong))
				if (cuaSoKhac.has(w)) {
					ra.push(
						`TRUNG ≥${NGUONG} dong: ${relative(GOC, f)}:${h.ten} ~ ${cuaSoKhac.get(w)}`,
					);
					break;
				}
	return ra;
}

if (process.argv.includes("--chieu-do")) {
	const goc = `${AC}/${KHAC[2]}/rang/dot-bien.mjs`;
	if (!existsSync(goc)) {
		console.log(
			`KHONG DO DUOC: khong co ${relative(GOC, goc)} de chep lam vet.`,
		);
		process.exit(2);
	}
	const capMoDun = ts
		.createSourceFile(
			goc,
			readFileSync(goc, "utf8"),
			ts.ScriptTarget.Latest,
			true,
		)
		.statements.filter((n) => !laThanHam(n))
		.map((n) => n.getText())
		.join("\n");
	const vet = `${AC}/${LAT}/rang/(vet-chieu-do).mjs`;
	const sach = demTrung();
	const ban = demTrung([[vet, capMoDun]]);
	console.log(
		"--- ben trong: chep THAN MO-DUN cua mot lat truoc vao mot file gia cua lat nay ---",
	);
	for (const d of ban) console.log(`  | ${d}`);
	console.log(
		`--- het phan cam vao · cay sach trung=${sach.length} · cay cam vet trung=${ban.length} ---`,
	);
	if (sach.length !== 0) {
		console.log(
			"DO: cay dang co cho trung san — chieu do khong noi len dieu gi. Sua cho trung roi chay lai.",
		);
		process.exit(1);
	}
	if (!ban.some((d) => d.includes("(than mo-dun)"))) {
		console.log(
			"DO: chep ca than mo-dun cua mot lat truoc ma chan KHONG bat — ve 1 dang bo qua ma cap mo-dun.",
		);
		process.exit(1);
	}
	console.log(
		"\nXANH (chieu do): ma cap mo-dun cung nam trong tam ve 1, khong chi rieng than ham.",
	);
	console.log("Chan nay thoat 0. Cac dong tren la cua phep thu cam vao.");
	process.exit(0);
}

const trungRa = demTrung();
do_.push(...trungRa);
const trung = trungRa.length;
console.log(
	`ve 1: ${fileLat.length} file cua lat so voi ${fileKhac.length} file cua bon lat truoc · cua so ${NGUONG} dong trung=${trung}`,
);

for (const f of fileLat) {
	const chu = readFileSync(f, "utf8");
	if (/\/Users\/|\/home\//.test(chu))
		do_.push(`DUONG TUYET DOI: ${relative(GOC, f)} ghim /Users hoac /home`);
}
console.log(
	`ve 1b: ${fileLat.length} file suy goc tu import.meta.url — ${do_.filter((d) => d.startsWith("DUONG")).length} file ghim duong tuyet doi`,
);

const cauHinh = readFileSync(`${AC}/config.yaml`, "utf8");
const can = new Set();
for (const d of cauHinh.split("\n"))
	if (/^\s+tq_[a-z0-9_]+:/.test(d))
		for (const m of d.matchAll(
			new RegExp(`_acceptance/${LAT}/rang/([A-Za-z0-9._-]+)`, "g"),
		))
			can.add(m[1]);
const thieu = [...can].filter((t) => !existsSync(`${AC}/${LAT}/rang/${t}`));
if (thieu.length > 0) {
	console.log(
		`KHONG DO DUOC: o cam tq_* tro toi ${can.size} script, thieu ${thieu.join(" · ")}`,
	);
	process.exit(2);
}
console.log(`tien de: ${can.size} script ma o cam tq_* tro toi deu co mat`);

const MOC = `${AC}/man-cai-dat-noi-tieng-viet/rang`;
const MUI = [
	{
		lenh: [`${MOC}/chu-cung-lat.mjs`],
		mau: /bo quet doc (\d+) file/,
		cho: "10",
		nhan: "so file quet",
	},
	{
		lenh: [`${MOC}/chu-ngoai-jsx.mjs`, "--chan", "toast"],
		mau: /nhan ra (\d+\/\d+) loi goi/,
		cho: "12/12",
		nhan: "loi goi toast",
	},
];
for (const m of MUI) {
	let ra = "";
	let ma = 0;
	try {
		ra = execFileSync("node", m.lenh, {
			cwd: GOC,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (e) {
		ma = e.status ?? 1;
		ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
	}
	const thay = m.mau.exec(ra)?.[1] ?? null;
	console.log(
		`ve 2: ${relative(GOC, m.lenh[0])} ${m.lenh.slice(1).join(" ")} — ma ${ma} · ${m.nhan}=${thay} (ky: ${m.cho})`,
	);
	if (ma !== 0 || thay !== m.cho)
		do_.push(
			`MUI CU DOI KET QUA: ${relative(GOC, m.lenh[0])} ma ${ma}, ${m.nhan}=${thay}, ky ${m.cho}`,
		);
}

const gocThuoc = JSON.parse(readFileSync(`${HERE}/goc-thuoc.json`, "utf8"));
let raMan = "";
let maMan = 0;
try {
	raMan = execFileSync("node", [`${MOC}/man-that.mjs`, "hai-tieng"], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, NGUOI: process.env.NGUOI ?? "dev@localhost" },
		stdio: ["ignore", "pipe", "pipe"],
	});
} catch (e) {
	maMan = e.status ?? 1;
	raMan = `${e.stdout ?? ""}${e.stderr ?? ""}`;
}
const soRoute = {};
for (const m of raMan.matchAll(/-- man (\S+) · vi=(\d+) chuoi/g))
	soRoute[m[1]] = Number(m[2]);
console.log(
	`ve 2b: man-that.mjs hai-tieng cua ho so da ky, khong tham so — ma ${maMan} · ${JSON.stringify(soRoute)} · ghim lib truoc khi sua: ${JSON.stringify(gocThuoc.route)}`,
);
if (maMan === 2) {
	console.log(
		"KHONG DO DUOC: phep do man cua ho so da ky tu khai tien de thieu — khong tai lap duoc.",
	);
	process.exit(2);
}
if (maMan !== 0)
	do_.push(
		`PHEP DO MAN CUA HO SO DA KY DO (ma ${maMan}) sau khi sua man-that-lib.mjs`,
	);
for (const [r, so] of Object.entries(gocThuoc.route))
	if (soRoute[r] !== so)
		do_.push(
			`SO CHUOI LECH: ${r} lib moi=${soRoute[r]} · lib truoc khi sua=${so}`,
		);

let goiCoThamSo = 0;
const NOI_DINH_NGHIA = `${AC}/man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs`;
for (const f of readdirSync(AC, { withFileTypes: true })
	.filter((d) => d.isDirectory() && d.name !== LAT)
	.flatMap((d) => fileMjs(`${AC}/${d.name}/rang`))
	.filter((f) => f !== NOI_DINH_NGHIA)) {
	const nguon = ts.createSourceFile(
		f,
		readFileSync(f, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const di = (n) => {
		if (ts.isCallExpression(n)) {
			const chu = n.expression.getText(nguon);
			const laEval =
				/\.evaluate$/.test(chu) &&
				n.arguments.length >= 2 &&
				/^(GOM|DO_RONG)$/.test(n.arguments[0].getText(nguon));
			const laGoi =
				/^(gomTrang|doRongTrang)$/.test(chu) && n.arguments.length >= 2;
			if (laEval || laGoi) {
				goiCoThamSo += 1;
				do_.push(
					`MUI GOI NGOAI LAT TRUYEN THAM SO: ${relative(GOC, f)}:${nguon.getLineAndCharacterOfPosition(n.getStart(nguon)).line + 1}`,
				);
			}
		}
		ts.forEachChild(n, di);
	};
	di(nguon);
}
console.log(
	`ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = ${goiCoThamSo} (tru noi dinh nghia man-that-lib.mjs)`,
);

for (const d of do_) console.log(`DO: ${d}`);
console.log(
	`\nket qua: ${do_.length === 0 ? "XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi" : `${do_.length} cho do`}`,
);
process.exit(do_.length > 0 ? 1 : 0);
