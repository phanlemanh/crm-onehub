import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
	const out = execFileSync("git", ["-C", SAO, "diff", "--numstat", "--", file], {
		encoding: "utf8",
	}).trim();
	if (out === "") return 0;
	const [them, bot] = out.split("\t");
	return Number(them) + Number(bot);
}

const CONG_SAO = Number(process.env.CONG_SAO ?? 3200);

async function doiMayChu(url, hanGiay = 180) {
	for (let i = 0; i < hanGiay; i += 1) {
		try {
			const r = await fetch(url, { redirect: "manual" });
			if (r.status > 0) return true;
		} catch {}
		await new Promise((r) => setTimeout(r, 1000));
	}
	return false;
}

function dungMayChuSao(sao) {
	const con = spawn("bun", ["run", "dev"], {
		cwd: join(sao, "apps/app"),
		env: {
			...process.env,
			PORT: String(CONG_SAO),
			APP_URL: `http://localhost:${CONG_SAO}`,
			API_URL: process.env.API_URL ?? "http://localhost:3001",
		},
		stdio: "ignore",
		detached: true,
	});
	con.unref();
	return con;
}

function chayChan(appUrl) {
	const ra = [];
	for (const c of CHAN) {
		const r = spawnSync("node", [`${RANG}/ban-ve.mjs`, c], {
			encoding: "utf8",
			env: { ...process.env, APP_URL: appUrl },
		});
		ra.push(`${r.stdout ?? ""}${r.stderr ?? ""}`);
	}
	return ra.join("\n");
}

const co = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : process.argv[i + 1];
};
const CHAN_CHAY = co("--chan");
const KIEU_CU = process.env.KIEU_CU === "1";

function md5(file) {
	return execFileSync("md5", ["-q", file], { encoding: "utf8" }).trim();
}

function sachChua(files) {
	const ra = execFileSync("git", ["status", "--porcelain", "--", ...files], {
		encoding: "utf8",
	});
	return ra.trim() === "";
}

function dungCaySao() {
	const sao = process.env.CAY_SAO ?? `/tmp/dot-bien-${process.pid}`;
	if (existsSync(sao)) rmSync(sao, { recursive: true, force: true });
	execFileSync("git", ["worktree", "add", "--detach", "--quiet", sao, "HEAD"], {
		encoding: "utf8",
	});
	for (const ten of ["node_modules", ".env"]) {
		const nguon = join(process.cwd(), ten);
		if (existsSync(nguon) && !existsSync(join(sao, ten)))
			symlinkSync(nguon, join(sao, ten));
	}
	return sao;
}

function donCaySao(sao) {
	try {
		execFileSync("git", ["worktree", "remove", "--force", sao], {
			encoding: "utf8",
		});
	} catch {
		rmSync(sao, { recursive: true, force: true });
	}
	try {
		execFileSync("git", ["worktree", "prune"], { encoding: "utf8" });
	} catch {}
}

const CHE_DO = process.env.KHOANH_CHE_DO ?? "";
const BAT_TAY_DIR = join(RANG, "../../thuoc-cua-lat-3a-co-rang/.anh-chup");
const BAT_TAY = {
	sanSang: join(BAT_TAY_DIR, "con-da-chup"),
	daSua: join(BAT_TAY_DIR, "nguoi-da-sua"),
};

if (CHAN_CHAY === "khoanh-vung" && CHE_DO !== "") {
	let sao = null;
	const donDep = () => {
		if (sao) donCaySao(sao);
		sao = null;
	};
	for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"]) {
		process.on(tin, () => {
			donDep();
			process.exit(130);
		});
	}
	process.on("uncaughtException", () => {
		donDep();
		process.exit(2);
	});

	const anhChup = new Map();
	for (const [, file] of KHO) anhChup.set(file, readFileSync(file, "utf8"));
	if (!KIEU_CU) sao = dungCaySao();

	writeFileSync(BAT_TAY.sanSang, "1");
	for (let i = 0; i < 200 && !existsSync(BAT_TAY.daSua); i += 1) {
		await new Promise((r) => setTimeout(r, 100));
	}

	if (!KIEU_CU) {
		for (const [, file] of KHO) {
			const trongSao = join(sao, file);
			writeFileSync(trongSao, `${readFileSync(trongSao, "utf8")}\nconst DOT_BIEN_GIA = 1;\n`);
		}
	} else {
		for (const [, file] of KHO)
			writeFileSync(file, `${readFileSync(file, "utf8")}\nconst DOT_BIEN_GIA = 1;\n`);
		process.on("exit", () => {
			for (const [file, noi] of anhChup) writeFileSync(file, noi);
		});
	}

	console.log(`   con: che do ${CHE_DO}, da dot bien`);
	if (CHE_DO === "sigint") {
		process.kill(process.pid, "SIGINT");
		await new Promise((r) => setTimeout(r, 3000));
	}
	if (CHE_DO === "loi") throw new Error("loi khong bat, co y");
	donDep();
	process.exit(0);
}

if (CHAN_CHAY === "khoanh-vung") {
	const MOC = "apps/app/lib/messages/crm.ts";
	const DAU_HIEU = "\nconst BAN_SUA_CUA_NGUOI_DANG_LAM = 1;\n";
	const TEP_KHO = KHO.map(([, f]) => f);

	if (!sachChua(TEP_KHO)) {
		console.log("KHONG DO DUOC: nam kho chuoi dang ban truoc khi do — kiem git status roi chay lai");
		process.exit(2);
	}

	const banGoc = readFileSync(MOC, "utf8");
	const truocHet = md5(MOC);
	const DUONG_THOAT = ["binh-thuong", "sigint", "loi"];
	let hong = 0;

	try {
		for (const che of DUONG_THOAT) {
			mkdirSync(BAT_TAY_DIR, { recursive: true });
			for (const f of [BAT_TAY.sanSang, BAT_TAY.daSua])
				if (existsSync(f)) unlinkSync(f);

			const con = spawn("node", [`${RANG}/dot-bien.mjs`, "--chan", "khoanh-vung"], {
				stdio: "ignore",
				env: { ...process.env, KHOANH_CHE_DO: che },
			});
			const xong = new Promise((ok) => con.on("exit", (ma) => ok(ma)));

			for (let i = 0; i < 300 && !existsSync(BAT_TAY.sanSang); i += 1)
				await new Promise((r) => setTimeout(r, 100));
			if (!existsSync(BAT_TAY.sanSang)) {
				console.log(`KHONG DO DUOC: con khong bao da chup o duong thoat ${che}`);
				process.exit(2);
			}

			writeFileSync(MOC, banGoc + DAU_HIEU);
			const sauNguoiSuaThat = md5(MOC);
			writeFileSync(BAT_TAY.daSua, "1");
			const maCon = await xong;

			const sauLuot = md5(MOC);
			const giuDuoc = sauLuot === sauNguoiSuaThat;
			const conSao =
				execFileSync("git", ["worktree", "list"], { encoding: "utf8" }).includes(
					"/dot-bien-",
				);
			const sach = sachChua(TEP_KHO.filter((f) => f !== MOC));

			if (!giuDuoc) {
				console.log(`   DOI THAY BI NUOT o duong thoat ${che}: ${MOC} md5 ${sauNguoiSuaThat} -> ${sauLuot}`);
				hong += 1;
			}
			if (conSao) {
				console.log(`   CAY SAO SOT LAI o duong thoat ${che}`);
				hong += 1;
			}
			if (!sach) {
				console.log(`   KHO CHUOI BAN o duong thoat ${che}`);
				hong += 1;
			}
			if (giuDuoc && !conSao && sach) {
				console.log(
					`   duong thoat ${che.padEnd(12)} doi thay CON NGUYEN · khong sot cay sao · kho chuoi sach (con thoat ${maCon})`,
				);
			}
			writeFileSync(MOC, banGoc);
		}
	} finally {
		writeFileSync(MOC, banGoc);
	}

	const veGoc = md5(MOC) === truocHet;
	const sachHet = sachChua(TEP_KHO);
	console.log(`   file moc ve nguyen trang: ${veGoc ? "co" : "KHONG"}`);
	console.log(`   nam kho chuoi sach:       ${sachHet ? "co" : "KHONG"}`);
	if (!veGoc || !sachHet) hong += 1;

	console.log(`ket qua: hong=${hong} tren ${DUONG_THOAT.length} duong thoat`);
	process.exit(hong > 0 ? 1 : 0);
}

const goc = new Map();
for (const [, file] of KHO) goc.set(file, readFileSync(join(SAO, file), "utf8"));

let mayChu = null;
let daTra = false;
function traLai(vi) {
	if (daTra) return;
	daTra = true;
	if (mayChu?.pid) {
		try {
			process.kill(-mayChu.pid, "SIGTERM");
		} catch {}
	}
	donCaySao(SAO);
	if (vi) console.log(`\n-- ${vi}: da go cay sao, cay lam viec khong bi cham`);
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

mayChu = dungMayChuSao(SAO);
console.log(`-- cho may chu cua cay sao len o ${APP_SAO}`);
if (!(await doiMayChu(APP_SAO))) {
	console.log(
		`KHONG DO DUOC: may chu cua cay sao khong len o ${APP_SAO} sau 180 giay.\n` +
			"   Day la loi ha tang, khong phai loi san pham — khong duoc doc thanh mot lan do dat.",
	);
	traLai("may chu khong len");
	process.exit(2);
}

console.log("-- nen: bon chan nghiem thu tren ban dich day du, do TREN CAY SAO");
const nen = chayChan(APP_SAO);
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
		writeFileSync(join(SAO, file), hang.join("\n"));

		const sauKhi = readFileSync(join(SAO, file), "utf8").split("\n");
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
	var sau = chayChan(APP_SAO);
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
const khongQuyKet = [];
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
		khongQuyKet.push({
			...c,
			ly:
				c.manh === ""
					? "gia tri tieng Anh khong co manh chu co dinh nao dai >= 4 ky tu"
					: "gia tri chi co so va dau cau",
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
console.log(
	`-- ${khongQuyKet.length} khoa KHONG QUY KET DUOC: phep do khong noi duoc bon chan co ve ra hay khong,\n` +
		"   vi gia tri tieng Anh cua chung qua ngan hoac gan nhu toan bien. Chung khong nam trong\n" +
		"   mau so cua nguong, va tung cai phai co ten ngay duoi day:",
);
for (const k of khongQuyKet) console.log(`   KHONG QUY KET  ${k.kho}.${k.ten} — ${k.ly}`);

let chuaGhiTen = false;
try {
	writeFileSync(
		`${RANG}/dot-bien-sot.txt`,
		[
			`# khoa bon chan nghiem thu khong ve ra (${ngoaiPhu.length}/${cap.length})`,
			...ngoaiPhu.map((c) => `${c.kho}.${c.ten}`),
			"",
			`# khoa khong quy ket duoc (${khongQuyKet.length}/${cap.length}) — gia tri qua ngan hoac toan bien`,
			...khongQuyKet.map((c) => `${c.kho}.${c.ten}  # ${c.ly}`),
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
	`\nket qua: bat ${bat.length}/${chamDuoc} khoa ve ra (${tyBat}%) · do phu ${tyPhu}% · mu ${mu.length} · khong quy ket ${khongQuyKet.length} · ngoai tam voi ${ngoaiPhu.length} · dot bien cun ${cun}`,
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
