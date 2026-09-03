import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "../../..");
const BANG = resolve(
	RANG,
	"../../thuoc-cua-lat-3a-co-rang/evidence/khai-sinh-bang.md",
);

const chan = (() => {
	const i = process.argv.indexOf("--chan");
	return i === -1 ? "day-du" : process.argv[i + 1];
})();

function doc(duong, vi) {
	if (!existsSync(duong)) {
		console.log(`KHONG DO DUOC: thieu ${vi} tai ${duong}`);
		process.exit(2);
	}
	return JSON.parse(readFileSync(duong, "utf8"));
}

const danhSach = doc(join(RANG, "danh-sach-chan.json"), "ban khai chan do");
const so = doc(join(RANG, "khai-sinh.json"), "so khai sinh");

const DAN_SO = [...danhSach.chanNghiemThu, ...danhSach.chanSieuDo].map(
	(c) => c.ten,
);

const coTep = (ten) =>
	existsSync(join(RANG, ten)) || existsSync(join(GOC, ten));

function doiChieu(soKhai) {
	const loi = [];
	const tepCoMuc = new Set(soKhai.map((m) => m.tep));
	for (const ten of DAN_SO) {
		if (!tepCoMuc.has(ten)) loi.push(`CHAN KHONG CO KHAI SINH: ${ten}`);
	}
	for (const m of soKhai) {
		const co = coTep(m.tep);
		if (!co && !m.daXoa) loi.push(`MUC KHAI SINH MO COI: ${m.ten}`);
		if (co && m.daXoa) loi.push(`KHAI XOA NHUNG FILE VAN CON: ${m.ten}`);
		if (!m.daXoa && !m.vecTo && !m.chieuDoTrongBai)
			loi.push(`CHAN KHONG PHA DUOC MA VAN CON: ${m.ten}`);
	}
	return loi;
}

if (chan === "so") {
	const tuKiem = [
		{
			ten: "thieu mot muc",
			so: so.filter((m) => m.tep !== so[0].tep),
			cho: `CHAN KHONG CO KHAI SINH: ${so[0].tep}`,
		},
		{
			ten: "muc mo coi",
			so: [...so, { ten: "chan-khong-co-that.mjs", tep: "chan-khong-co-that.mjs", vecTo: {} }],
			cho: "MUC KHAI SINH MO COI: chan-khong-co-that.mjs",
		},
		{
			ten: "chan khong pha duoc",
			so: [...so, { ten: "mien-tru.mjs:gia", tep: "mien-tru.mjs", vecTo: null }],
			cho: "CHAN KHONG PHA DUOC MA VAN CON: mien-tru.mjs:gia",
		},
		{
			ten: "khai xoa nhung file van con",
			so: [...so, { ten: "mien-tru.mjs:xoa-gia", tep: "mien-tru.mjs", daXoa: true }],
			cho: "KHAI XOA NHUNG FILE VAN CON: mien-tru.mjs:xoa-gia",
		},
	];

	for (const t of tuKiem) {
		const ra = doiChieu(t.so);
		if (!ra.includes(t.cho)) {
			console.log(
				`BANH COC HONG: tu kiem "${t.ten}" khong sinh ra "${t.cho}".\n` +
					`   Nhan duoc: ${JSON.stringify(ra)}`,
			);
			process.exit(1);
		}
	}
	console.log(
		`   tu kiem banh coc: ${tuKiem.length}/${tuKiem.length} chieu do lat dung, NGAY TRONG luot chay nay`,
	);

	const that = doiChieu(so);
	for (const l of that) console.log(`   ${l}`);
	console.log(
		`-- dan so: ${DAN_SO.length} chan trong ban khai · ${so.length} muc trong so khai sinh`,
	);
	console.log(`ket qua: loi doi chieu=${that.length}`);
	process.exit(that.length > 0 ? 1 : 0);
}

if (chan === "tap-rong") {
	const GIEO = `${GOC}/_acceptance/thuoc-cua-lat-3a-co-rang/gieo-du-lieu-bien.mjs`;
	const chay = (lenh, doiSo, them = {}) =>
		spawnSync(lenh, doiSo, {
			cwd: GOC,
			encoding: "utf8",
			env: { ...process.env, ...them },
		});

	const CA = [
		{
			ten: "no-vong-1.mjs",
			chay: ["node", `${RANG}/no-vong-1.mjs`],
			ghim: "vang o CA HAI thu tieng",
		},
		{
			ten: "du-lieu-bien.mjs",
			chay: ["node", `${RANG}/du-lieu-bien.mjs`],
			ghim: "thieu hang cho trang thai",
			pha: ["--go-hoat-dong"],
			phuc: ["--phuc-hoat-dong"],
		},
	];

	console.log("-- chieu lanh: du lieu thu du trang thai");
	const gieo = chay("node", [GIEO]);
	if (gieo.status !== 0) {
		console.log(`KHONG DO DUOC: khong gieo duoc du lieu thu — ${gieo.stdout ?? ""}${gieo.stderr ?? ""}`);
		process.exit(2);
	}
	const lanh = CA.map((c) => chay(c.chay[0], c.chay.slice(1)));

	console.log("-- chieu pha: dung TAP RONG that bang mot cu doi DU LIEU cho tung ca");
	const bi = CA.map((c) => {
		const pha = chay("node", [GIEO, ...(c.pha ?? ["--tra-ve-pending"])]);
		if (pha.status !== 0) {
			console.log(`KHONG DO DUOC: khong pha duoc du lieu cho ${c.ten}`);
			process.exit(2);
		}
		const r = chay(c.chay[0], c.chay.slice(1));
		chay("node", [GIEO, ...(c.phuc ?? [])]);
		return r;
	});

	console.log("-- tra du lieu thu ve nguyen trang");
	chay("node", [GIEO]);

	let hong = 0;
	for (let i = 0; i < CA.length; i += 1) {
		const c = CA[i];
		const ra = `${bi[i].stdout ?? ""}${bi[i].stderr ?? ""}`;
		const dat =
			lanh[i].status === 0 && bi[i].status === 2 && ra.includes(c.ghim);
		if (!dat) hong += 1;
		console.log(
			`   ${dat ? "dat    " : "TRUOT  "} ${c.ten.padEnd(20)} lanh=${lanh[i].status} · tap rong=${bi[i].status}` +
				(ra.includes(c.ghim) ? ` · ghim "${c.ghim}"` : " · KHONG thay thong diep ghim"),
		);
	}
	console.log(`ket qua: ca tap-rong hong=${hong}/${CA.length}`);
	process.exit(hong > 0 ? 1 : 0);
}

const HA_TANG =
	/ECONNREFUSED|Failed to launch|Chrome|ENOENT|command not found|TimeoutError/i;

const bang = [];
let hong = 0;

for (const m of so) {
	if (m.daXoa) {
		bang.push({ ten: m.ten, lanh: "-", pha: "-", ket: "da xoa", ly: m.lyDo });
		continue;
	}
	if (m.chieuDoTrongBai) {
		const r = spawnSync(m.chay[0], m.chay.slice(1), {
			cwd: GOC,
			encoding: "utf8",
			env: process.env,
		});
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		if (r.error || r.status === null || (r.status !== 0 && HA_TANG.test(ra))) {
			console.log(`KHONG DO DUOC: ${m.ten} — ${(r.error?.message ?? ra).slice(0, 200)}`);
			process.exit(2);
		}
		const duBai = m.chieuDoTrongBai.every((b) => ra.includes(b));
		if (r.status !== 0 || !duBai) hong += 1;
		bang.push({
			ten: m.ten,
			lanh: String(r.status),
			pha: "trong bai",
			ket: r.status === 0 && duBai ? "dat" : "TRUOT",
			ly: `${m.chieuDoTrongBai.length} bai mang chieu do, ${duBai ? "co mat du" : "THIEU BAI"}`,
		});
		continue;
	}
	if (!m.vecTo) {
		hong += 1;
		bang.push({
			ten: m.ten,
			lanh: "-",
			pha: "KHONG CO",
			ket: "TRUOT",
			ly: m.lyDo ?? "khong khai vec-to pha nao",
		});
		console.log(`   CHAN KHONG PHA DUOC MA VAN CON: ${m.ten}`);
		continue;
	}

	const doiSo = [...m.chay.slice(1), ...(m.vecTo.doiSo ?? [])];
	const lanh = spawnSync(m.chay[0], m.chay.slice(1), {
		cwd: GOC,
		encoding: "utf8",
		env: process.env,
	});
	const raLanh = `${lanh.stdout ?? ""}${lanh.stderr ?? ""}`;
	if (lanh.error || lanh.status === null || (lanh.status !== 0 && HA_TANG.test(raLanh))) {
		console.log(
			`KHONG DO DUOC: ${m.ten} — ${(lanh.error?.message ?? raLanh).slice(0, 300)}`,
		);
		process.exit(2);
	}

	const bi = spawnSync(m.chay[0], doiSo, {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, ...(m.vecTo.moiTruong ?? {}) },
	});
	const raBi = `${bi.stdout ?? ""}${bi.stderr ?? ""}`;
	if (bi.error || bi.status === null) {
		console.log(`KHONG DO DUOC: ${m.ten} o chieu pha — ${bi.error?.message ?? ""}`);
		process.exit(2);
	}

	const imLanh = lanh.status === 0;
	const doDung = bi.status === m.ma && raBi.includes(m.ghim);
	if (!imLanh || !doDung) {
		hong += 1;
		console.log(
			`   CHAN KHONG DO DUOC: ${m.ten} — cho lanh=0 va pha=${m.ma} kem ${JSON.stringify(m.ghim)},` +
				` nhan lanh=${lanh.status} pha=${bi.status}${raBi.includes(m.ghim) ? "" : " (KHONG thay thong diep ghim)"}`,
		);
	}
	bang.push({
		ten: m.ten,
		lanh: String(lanh.status),
		pha: `${bi.status} · ${m.vecTo.kieu}`,
		ket: imLanh && doDung ? "dat" : "TRUOT",
		ly: m.ghim,
	});
}

if (bang.length !== so.length) {
	console.log(
		`KHONG DO DUOC: bang co ${bang.length} dong, so khai sinh co ${so.length} muc`,
	);
	process.exit(2);
}

const dong = (c) => `| ${c.ten} | ${c.lanh} | ${c.pha} | ${c.ket} | ${c.ly ?? ""} |`;
const vb = [
	"# Bang khai sinh — moi chan, hai chieu, trong chinh luot chay nay",
	"",
	`Sinh boi \`rang/khai-sinh.mjs\` luc ${new Date().toISOString()}.`,
	`Dan so: ${DAN_SO.length} chan trong ban khai · ${so.length} muc trong so.`,
	"",
	"| Chan | Chieu lanh | Chieu pha | Ket | Thong diep ghim |",
	"| --- | --- | --- | --- | --- |",
	...bang.map(dong),
	"",
	`Chan chua chung minh do duoc: ${bang.filter((c) => c.ket === "TRUOT").length}`,
	"",
].join("\n");

mkdirSync(dirname(BANG), { recursive: true });
writeFileSync(BANG, vb);

console.log("");
for (const c of bang) {
	console.log(
		`   ${c.ket.padEnd(6)} ${c.ten.padEnd(38)} lanh=${c.lanh} pha=${c.pha}`,
	);
}
console.log(`\n-- bang ghi ra ${BANG}`);
console.log(`ket qua: chan chua chung minh do duoc=${hong}/${so.length}`);
process.exit(hong > 0 ? 1 : 0);
