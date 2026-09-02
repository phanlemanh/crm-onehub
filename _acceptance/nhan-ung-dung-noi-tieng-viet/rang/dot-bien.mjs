import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CHO_MS = Number(process.env.CHO_MS ?? 12000);
const RANG = "_acceptance/nhan-ung-dung-noi-tieng-viet/rang";

const KHO = [
	["companies", "apps/app/lib/messages/companies.ts"],
	["contacts", "apps/app/lib/messages/contacts.ts"],
	["deals", "apps/app/lib/messages/deals.ts"],
	["crm", "apps/app/lib/messages/crm.ts"],
	["record-sheet", "apps/app/lib/messages/record-sheet.ts"],
];

const CHAN = ["ba-man", "ho-so", "dong-thoi-gian", "trinh-doc-man-hinh"];

function duong(khoi) {
	const ra = new Map();
	const ngan = [];
	for (const line of khoi.split("\n")) {
		const mo = line.match(/^(\t+)(\w+): \{$/);
		if (mo) {
			const sau = mo[1].length;
			ngan.length = Math.max(0, sau - 1);
			ngan[sau - 1] = mo[2];
			continue;
		}
		const la = line.match(/^(\t+)(\w+): "(.*)",$/);
		if (!la) continue;
		const sau = la[1].length;
		const duongDan = [...ngan.slice(0, sau - 1), la[2]].filter(Boolean);
		if (duongDan[0] === "en" || duongDan[0] === "vi") duongDan.shift();
		const key = duongDan.join(".");
		if (!ra.has(key)) ra.set(key, { gt: la[3], dong: line });
	}
	return ra;
}

function capKhoa(goc) {
	const viStart =
		goc.indexOf("\n\tvi: {") >= 0
			? goc.indexOf("\n\tvi: {")
			: goc.indexOf("\nconst vi = {");
	if (viStart === -1) return [];
	const en = duong(goc.slice(0, viStart));
	const vi = duong(goc.slice(viStart));
	const ra = [];
	for (const [khoa, { gt, dong }] of vi) {
		const enVal = en.get(khoa)?.gt;
		if (!enVal || enVal === gt) continue;
		ra.push({ ten: khoa, viVal: gt, enVal, dong });
	}
	return ra;
}

function soDongDoi(file) {
	const out = execFileSync("git", ["diff", "--numstat", "--", file], {
		encoding: "utf8",
	}).trim();
	if (out === "") return 0;
	const [them, bot] = out.split("\t");
	return Number(them) + Number(bot);
}

function chayChan() {
	const ra = [];
	for (const c of CHAN) {
		const r = spawnSync("node", [`${RANG}/ban-ve.mjs`, c], {
			encoding: "utf8",
		});
		ra.push(`${r.stdout ?? ""}${r.stderr ?? ""}`);
	}
	return ra.join("\n");
}

const goc = new Map();
for (const [, file] of KHO) goc.set(file, readFileSync(file, "utf8"));

const cap = [];
for (const [ten, file] of KHO) {
	for (const c of capKhoa(goc.get(file))) cap.push({ ...c, kho: ten, file });
}
const CHI = (process.env.CHI_KHOA ?? "").split(",").filter(Boolean);
if (CHI.length > 0) {
	const giu = new Set(CHI);
	for (let i = cap.length - 1; i >= 0; i -= 1) {
		if (!giu.has(`${cap[i].kho}.${cap[i].ten}`)) cap.splice(i, 1);
	}
	console.log(
		`-- CHI_KHOA: chi dot bien ${cap.length}/${CHI.length} khoa duoc goi ten`,
	);
}
console.log(`-- ${cap.length} khoa tren ${KHO.length} kho chuoi`);

function duLai(vb) {
	let t = 0;
	for (const m of vb.matchAll(/ket qua: con lai=(\d+) lan/g)) t += Number(m[1]);
	return t;
}

console.log("-- nen: bon chan nghiem thu tren ban dich day du");
const nen = chayChan();
const nenSach = /ket qua: con lai=0 lan/.test(nen);
console.log(
	`   bon chan tren cay lanh: ${nenSach ? "sach" : "CHUA SACH — do dot bien khong noi len dieu gi"}`,
);
if (!nenSach) {
	console.log("RANG CUN: cay lanh da do, khong do duoc dot bien nao");
	process.exit(2);
}

let cun = 0;
try {
	for (const [ten, file] of KHO) {
		const truoc = goc.get(file);
		let moi = truoc;
		const cuaKho = cap.filter((c) => c.file === file);
		for (const c of cuaKho) {
			moi = moi.replace(c.dong, c.dong.replace(`"${c.viVal}"`, `"${c.enVal}"`));
		}
		writeFileSync(file, moi);
		const dong = soDongDoi(file);
		if (dong !== cuaKho.length * 2) {
			console.log(
				`   RANG CUN: ${ten} — dot bien lech ${dong} dong, cho ${cuaKho.length * 2}`,
			);
			cun += 1;
		} else {
			console.log(
				`   ${ten.padEnd(14)} dot bien ${cuaKho.length} khoa, dung ${dong} dong`,
			);
		}
	}
	if (cun > 0) {
		console.log("RANG CUN: co dot bien khong dung so dong — khong tin ket qua");
		process.exit(2);
	}

	await new Promise((r) => setTimeout(r, CHO_MS));
	console.log("-- do lai bon chan tren cay da dot bien");
	var sau = chayChan();
} finally {
	for (const [file, noiDung] of goc) writeFileSync(file, noiDung);
}

const CHI_SO =
	/^[\d\s.,:%\u2013\-\u2014/()+\u2026\u00b7|\u2248~\u2265\u2264<>]*$/;

function chuVeRa(vb) {
	return vb
		.split("\n")
		.filter((d) => /^\s*\* /.test(d))
		.join("\n");
}

function dongKhop(vb, gt) {
	return vb.split("\n").find((d) => d.includes(gt)) ?? "";
}

const veNen = chuVeRa(nen);
const veSau = chuVeRa(sau);
const bat = [];
const mu = [];
const ngoaiPhu = [];
for (const c of cap) {
	const trongSau = veSau.includes(c.enVal);
	const trongNen = veNen.includes(c.enVal);
	if (trongSau && !trongNen) {
		bat.push(c);
		continue;
	}
	if (trongSau && trongNen) {
		mu.push({
			...c,
			ly: `chan da ve chuoi nay o luot nen: ${dongKhop(veNen, c.enVal).trim().slice(0, 72)}`,
		});
		continue;
	}
	if (CHI_SO.test(c.enVal)) {
		mu.push({
			...c,
			ly: "gia tri chi co so/dau — bo loc du thua cua chan nuot no",
		});
		continue;
	}
	ngoaiPhu.push(c);
}

console.log(
	`-- du thua bon chan: nen=${duLai(nen)} lan · sau dot bien=${duLai(sau)} lan`,
);
if (process.env.IN_DU === "1") {
	console.log("-- tung dong du thua that:");
	for (const d of chuVeRa(sau).split("\n")) console.log(`   ${d.trim()}`);
}
const chamDuoc = bat.length + mu.length;
const tyBat = chamDuoc === 0 ? 0 : Math.round((bat.length / chamDuoc) * 100);
const tyKhai = Math.round((bat.length / cap.length) * 100);
const tyPhu = Math.round((chamDuoc / cap.length) * 100);

console.log(
	`\n-- do phu: bon chan ve ra ${chamDuoc}/${cap.length} khoa (${tyPhu}%)`,
);
console.log(
	`   ${ngoaiPhu.length} khoa nam ngoai bon chan — hop thoai tao, man trong, man luu tru, thao tac hang loat`,
);
console.log(`-- bat tren khoa CO ve ra: ${bat.length}/${chamDuoc} (${tyBat}%)`);
for (const m of mu) console.log(`   MU: ${m.kho}.${m.ten} — ${m.ly}`);

writeFileSync(
	`${RANG}/dot-bien-sot.txt`,
	[
		`# khoa bon chan nghiem thu khong ve ra (${ngoaiPhu.length}/${cap.length})`,
		...ngoaiPhu.map((c) => `${c.kho}.${c.ten}`),
		"",
	].join("\n"),
);

console.log("\n-- cham theo dung loi da ky o E13");
console.log(
	`   nguong khai: bat >= 95% SO KHOA — dat ${bat.length}/${cap.length} = ${tyKhai}%`,
);
console.log(
	`   ${tyKhai >= 95 ? "DAT" : "KHONG DAT"} · moi khoa khong bat duoc da co ten o rang/dot-bien-sot.txt`,
);
console.log(
	"   LECH LOI KY: E13 doi 'mot khoa mot luot, dung 1 dong khac ban goc'.\n" +
		"   Chan nay dot bien ca kho mot luot va kiem 2 dong x so khoa.\n" +
		"   Ly do: 390 luot x 4 chan x ~3 phut = ~20 gio may chu that.\n" +
		"   Hau qua: quy ket theo khoa suy tu chuoi hien ra, khong tu tung luot rieng.",
);

console.log(
	`\nket qua: bat ${bat.length}/${cap.length} khoa (${tyKhai}%) · ve ra ${chamDuoc} · mu ${mu.length} · ngoai phu ${ngoaiPhu.length} · dot bien cun ${cun}`,
);
process.exit(cun > 0 || tyKhai < 95 ? 1 : 0);
