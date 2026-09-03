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

function quetKhoa(dong, tu, den) {
	const ra = new Map();
	const ngan = [];
	for (let i = tu; i < den; i += 1) {
		const line = dong[i];
		const mo = line.match(/^(\t+)(\w+): \{$/);
		if (mo) {
			const sau = mo[1].length;
			ngan.length = Math.max(0, sau - 1);
			ngan[sau - 1] = mo[2];
			continue;
		}
		const la = line.match(/^(\t+)(\w+):/);
		if (!la) continue;
		const sau = la[1].length;
		let het = i;
		while (het < den - 1 && !/,$/.test(dong[het])) het += 1;
		const duongDan = [...ngan.slice(0, sau - 1), la[2]].filter(Boolean);
		if (duongDan[0] === "en" || duongDan[0] === "vi") duongDan.shift();
		const key = duongDan.join(".");
		if (!ra.has(key)) {
			ra.set(key, { hang: dong.slice(i, het + 1), dau: i, cuoi: het });
		}
		i = het;
	}
	return ra;
}

const giongHet = [];
let coCaHai = 0;

function capKhoa(goc) {
	const dong = goc.split("\n");
	const viStart = dong.findIndex((d) => d === "\tvi: {" || d === "const vi = {");
	if (viStart === -1) return [];
	const en = quetKhoa(dong, 0, viStart);
	const vi = quetKhoa(dong, viStart, dong.length);
	const ra = [];
	for (const [khoa, o] of vi) {
		const b = en.get(khoa);
		if (!b) continue;
		coCaHai += 1;
		const viChu = o.hang.join("\n");
		const enChu = b.hang.join("\n");
		if (viChu === enChu) {
			giongHet.push(khoa);
			continue;
		}
		ra.push({
			manh: manhDaiNhat(enChu),
			ten: khoa,
			viChu,
			enChu,
			viHang: o.hang,
			enHang: b.hang,
			dau: o.dau,
			cuoi: o.cuoi,
		});
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

let daTra = false;
function traLai(vi) {
	if (daTra) return;
	daTra = true;
	for (const [file, noiDung] of goc) writeFileSync(file, noiDung);
	if (vi) console.log(`\n-- ${vi}: da tra nam kho chuoi ve nguyen trang`);
}

for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"]) {
	process.on(tin, () => {
		traLai(tin);
		process.exit(130);
	});
}
process.on("uncaughtException", (loi) => {
	traLai("loi khong bat");
	console.log(String(loi));
	process.exit(2);
});

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
console.log(
	`-- kiem ke khoa: ${coCaHai} khoa co ca ban en lan ban vi tren ${KHO.length} kho chuoi`,
);
console.log(
	`   ${giongHet.length} khoa giong het nhau o hai ban — dao lai khong doi gi, nen khong dot bien duoc:`,
);
console.log(`   ${giongHet.join(" · ")}`);
console.log(`-- ${cap.length} khoa dot bien duoc (${coCaHai} - ${giongHet.length})`);

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
		const hang = goc.get(file).split("\n");
		const cuaKho = cap.filter((c) => c.file === file);
		if (cuaKho.length === 0) {
			console.log(`   ${ten.padEnd(14)} khong khoa nao duoc chon — bo qua`);
			continue;
		}
		for (const c of [...cuaKho].sort((x, y) => y.dau - x.dau)) {
			hang.splice(c.dau, c.cuoi - c.dau + 1, ...c.enHang);
		}
		writeFileSync(file, hang.join("\n"));

		const sauKhi = readFileSync(file, "utf8").split("\n");
		const viMoi = quetKhoa(
			sauKhi,
			sauKhi.findIndex((d) => d === "\tvi: {" || d === "const vi = {"),
			sauKhi.length,
		);
		const lech = [];
		for (const c of cuaKho) {
			const o = viMoi.get(c.ten);
			if (!o || o.hang.join("\n") !== c.enChu) lech.push(c.ten);
		}
		const dong = soDongDoi(file);
		if (lech.length > 0) {
			console.log(
				`   RANG CUN: ${ten} — ${lech.length} khoa doc lai KHONG ra ban tieng Anh: ${lech.slice(0, 5).join(" · ")}`,
			);
			cun += 1;
		} else if (dong === 0) {
			console.log(`   RANG CUN: ${ten} — file khong doi mot dong nao`);
			cun += 1;
		} else {
			console.log(
				`   ${ten.padEnd(14)} dot bien ${cuaKho.length} khoa, doc lai dung ban tieng Anh ca ${cuaKho.length}, git thay ${dong} dong doi`,
			);
		}
	}
	if (cun > 0) {
		throw new Error(
			"RANG CUN: co dot bien khong dung so dong — khong tin ket qua",
		);
	}

	await new Promise((r) => setTimeout(r, CHO_MS));
	console.log("-- do lai bon chan tren cay da dot bien");
	var sau = chayChan();
} catch (loi) {
	traLai("dut giua chung");
	console.log(String(loi instanceof Error ? loi.message : loi));
	console.log("-- kho chuoi da tra ve nguyen trang");
	process.exit(2);
} finally {
	traLai(null);
}

const CHI_SO =
	/^[\d\s.,:%\u2013\-\u2014/()+\u2026\u00b7|\u2248~\u2265\u2264<>]*$/;

function manhDaiNhat(vung) {
	const than = vung.replace(/^\s*\w+:\s*/, "").replace(/,\s*$/, "");
	const trong = [...than.matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)]
		.map((m) => m[1] ?? m[2] ?? "")
		.join("\u0000");
	const manh = trong
		.split(/\$\{[^}]*\}|\u0000/)
		.map((x) => x.replace(/\\n/g, " ").trim())
		.filter((x) => x.length >= 4);
	return manh.sort((a, b) => b.length - a.length)[0] ?? "";
}

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
	const trongSau = c.manh !== "" && veSau.includes(c.manh);
	const trongNen = c.manh !== "" && veNen.includes(c.manh);
	if (trongSau && !trongNen) {
		bat.push(c);
		continue;
	}
	if (trongSau && trongNen) {
		mu.push({
			...c,
			ly: `chan da ve chuoi nay o luot nen: ${dongKhop(veNen, c.manh).trim().slice(0, 72)}`,
		});
		continue;
	}
	if (c.manh === "" || CHI_SO.test(c.manh)) {
		mu.push({
			...c,
			ly:
				c.manh === ""
					? "khong rut duoc manh chu nao dai >= 4 ky tu de doi chieu"
					: "gia tri chi co so/dau — bo loc du thua cua chan nuot no",
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
const tyPhu = Math.round((chamDuoc / cap.length) * 100);

console.log(
	`\n-- do phu: bon chan ve ra ${chamDuoc}/${cap.length} khoa (${tyPhu}%)`,
);
console.log(
	`   ${ngoaiPhu.length} khoa nam ngoai bon chan — hop thoai tao, man trong, man luu tru, thao tac hang loat`,
);
console.log(`-- bat tren khoa CO ve ra: ${bat.length}/${chamDuoc} (${tyBat}%)`);
for (const m of mu) console.log(`   MU: ${m.kho}.${m.ten} — ${m.ly}`);

let chuaGhiTen = false;
try {
	writeFileSync(
		`${RANG}/dot-bien-sot.txt`,
		[
			`# khoa bon chan nghiem thu khong ve ra (${ngoaiPhu.length}/${cap.length})`,
			...ngoaiPhu.map((c) => `${c.kho}.${c.ten}`),
			"",
		].join("\n"),
	);
} catch {
	chuaGhiTen = true;
	console.log("RANG CUN: khong ghi duoc danh sach khoa ngoai tam voi");
}

console.log("\n-- cham theo dung loi da ky o E13 (ban thu pham vi, Cong 2 S4-r2)");
console.log(
	`   nguong: bat 100% khoa BON CHAN CO VE RA — dat ${bat.length}/${chamDuoc} = ${tyBat}%`,
);
console.log(
	`   ${bat.length === chamDuoc ? "DAT" : "KHONG DAT"} · ${ngoaiPhu.length} khoa ngoai tam voi da co ten o rang/dot-bien-sot.txt`,
);
console.log(`   do phu de doi chieu, khong phai nguong: ${tyPhu}% (${chamDuoc}/${cap.length})`);
console.log(
	"   LECH DA KHAI (E13 ban thu pham vi chap nhan, va doi in ra):\n" +
		"   E13 goc doi 'mot khoa mot luot'.\n" +
		"   Chan nay dot bien ca kho mot luot va kiem 2 dong x so khoa.\n" +
		`   Ly do: ${cap.length} luot x ${CHAN.length} chan x ~3 phut = ~${Math.round((cap.length * CHAN.length * 3) / 60)} gio may chu that.\n` +
		"   Hau qua: quy ket theo khoa suy tu chuoi hien ra, khong tu tung luot rieng.",
);

console.log(
	`\nket qua: bat ${bat.length}/${chamDuoc} khoa ve ra (${tyBat}%) · do phu ${tyPhu}% · mu ${mu.length} · ngoai tam voi ${ngoaiPhu.length} · dot bien cun ${cun}`,
);
const thieuTen = ngoaiPhu.length > 0 && chuaGhiTen;
if (chamDuoc === 0) {
	console.log(
		`RANG CUN: khong khoa nao duoc bon chan ve ra — 0/0 KHONG phai dat.\n` +
			`   Dot bien co chay that (du thua doi tu ${duLai(nen)} sang ${duLai(sau)} lan)\n` +
			`   nhung khong quy ket duoc khoa nao. Phep quy ket hong, khong phai san pham sach.`,
	);
}
process.exit(
	cun > 0 || chamDuoc === 0 || bat.length !== chamDuoc || thieuTen ? 1 : 0,
);
