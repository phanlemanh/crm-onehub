import { execFileSync, spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	openSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createServer as netCreateServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function congTrong() {
	const may = netCreateServer();
	may.listen(0, "127.0.0.1");
	const cong = may.address().port;
	may.close();
	return cong;
}

const CONG_SAO = Number(process.env.CONG_SAO ?? 0) || congTrong();
const CONG_API_SAO = Number(process.env.CONG_API_SAO ?? 0) || congTrong();
const APP_SAO = `http://localhost:${CONG_SAO}`;
const API_SAO = `http://localhost:${CONG_API_SAO}`;
const CHO_HMR = Number(process.env.CHO_HMR ?? 6000);
const CHO_MAY_CHU = Number(process.env.CHO_MAY_CHU ?? 120000);

import { CHAN_UI, chanHoSo, DOT_BIEN } from "./bang-dot-bien.mjs";

function cho(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

function dungCaySao() {
	const sao =
		process.env.CAY_SAO ??
		join(GOC, "..", `.pha-thu-khai-tieng-${process.pid}`);
	if (existsSync(sao)) rmSync(sao, { recursive: true, force: true });
	execFileSync(
		"git",
		["-C", GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD"],
		{
			encoding: "utf8",
		},
	);
	symlinkSync(join(GOC, ".env"), join(sao, ".env"));

	const canNhan = ["node_modules"];
	for (const g of ["apps", "packages"]) {
		for (const t of readdirSync(join(GOC, g), { withFileTypes: true })) {
			if (t.isDirectory() && existsSync(join(GOC, g, t.name, "node_modules"))) {
				canNhan.push(join(g, t.name, "node_modules"));
			}
		}
	}
	for (const them of ["packages/db/src/generated", "apps/app/.next/types"]) {
		if (existsSync(join(GOC, them))) canNhan.push(them);
	}
	for (const ten of canNhan) {
		const dich = join(sao, ten);
		if (existsSync(dich)) rmSync(dich, { recursive: true, force: true });
		execFileSync("mkdir", ["-p", dirname(dich)], { encoding: "utf8" });
		execFileSync("cp", ["-c", "-R", join(GOC, ten), dich], {
			encoding: "utf8",
		});
	}
	console.log(
		`   nhan ban ${canNhan.length} thu muc bang clonefile — node_modules cua goc va tung goi,\n` +
			"   cong packages/db/src/generated (client Prisma bi gitignore nen worktree khong mang theo).\n" +
			"   Khong dung symlink: Turbopack tu choi symlink tro ra ngoai goc du an.",
	);
	return sao;
}

function donCaySao(sao) {
	try {
		execFileSync("git", ["-C", GOC, "worktree", "remove", "--force", sao], {
			encoding: "utf8",
		});
	} catch {
		rmSync(sao, { recursive: true, force: true });
	}
	try {
		execFileSync("git", ["-C", GOC, "worktree", "prune"], { encoding: "utf8" });
	} catch {}
}

async function song(url) {
	try {
		await fetch(url, { method: "HEAD" });
		return true;
	} catch {
		return false;
	}
}

async function dungMayChu(sao) {
	const moi_truong = {
		...process.env,
		NEXT_PUBLIC_API_URL: API_SAO,
		API_URL: API_SAO,
	};
	const api = spawn("bun", ["run", "dev"], {
		cwd: join(sao, "apps/api"),
		env: { ...moi_truong, PORT: String(CONG_API_SAO) },
		stdio: [
			"ignore",
			openSync(join(sao, "api-sao.log"), "w"),
			openSync(join(sao, "api-sao.log"), "a"),
		],
		detached: false,
	});
	const app = spawn("bun", ["run", "dev"], {
		cwd: join(sao, "apps/app"),
		env: { ...moi_truong, PORT: String(CONG_SAO) },
		stdio: [
			"ignore",
			openSync(join(sao, "app-sao.log"), "w"),
			openSync(join(sao, "app-sao.log"), "a"),
		],
		detached: false,
	});

	const han = Date.now() + CHO_MAY_CHU;
	while (Date.now() < han) {
		if ((await song(APP_SAO)) && (await song(API_SAO))) {
			return { api, app };
		}
		await cho(2000);
	}
	api.kill();
	app.kill();
	const log = (t) => {
		try {
			return readFileSync(join(sao, t), "utf8")
				.split("\n")
				.slice(-12)
				.join("\n");
		} catch {
			return "(khong doc duoc)";
		}
	};
	throw new Error(
		`KHONG DUNG DUOC MAY CHU cho ban sao sau ${CHO_MAY_CHU / 1000} giay (${APP_SAO} · ${API_SAO})\n` +
			`--- api-sao.log ---\n${log("api-sao.log")}\n--- app-sao.log ---\n${log("app-sao.log")}`,
	);
}

function chay({ lenh, doi_so, duoi }, sao, moi_truong = {}) {
	const r = spawnSync(lenh, doi_so, {
		cwd: duoi ? join(sao, duoi) : sao,
		encoding: "utf8",
		env: { ...process.env, APP_URL: APP_SAO, API_URL: API_SAO, ...moi_truong },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const THU_MUC_BANG_CHUNG = "_acceptance/ho-so-khai-dung-tieng/evidence/";

function cayBan() {
	const r = spawnSync("git", ["-C", GOC, "status", "--porcelain"], {
		encoding: "utf8",
	});
	return (r.stdout ?? "")
		.split("\n")
		.filter((d) => d.trim() !== "")
		.filter((d) => !d.includes(THU_MUC_BANG_CHUNG))
		.join("\n");
}

console.log(
	"-- CHAN KHAI SINH: voi TUNG chan do, pha dung vat that ma no khai minh do,\n" +
		"   chay lai chan do do, va khang dinh no DO voi thong diep GHIM.\n" +
		"   Mot chan xanh ma khong do duoc o day la mot thuoc CHUA TUNG DO.\n" +
		"-- MOI PHEP PHA XAY RA TRONG MOT BAN SAO RIENG cua cay, voi may chu rieng.\n" +
		"   Cay dang xet KHONG bi cham mot byte nao, nen cac thuoc tinh chay song song\n" +
		"   voi chan nay khong doc phai ma da bi pha — va tep bang chung cua cay that\n" +
		"   khong bi ghi de bang so do cua ban da pha.\n",
);

const banDauBan = cayBan();

if (banDauBan !== "" && process.env.CHO_PHEP_CAY_BAN !== "1") {
	console.log(
		"KHONG DO DUOC: cay dang xet DANG BAN, ma ban sao duoc dung tai HEAD.\n" +
			"   Nghia la moi con so duoi day noi ve HEAD, KHONG noi ve cay anh sap ky.\n" +
			'   Cau "cay dang xet khong doi mot byte nao" van dung va van xanh khi cay ban tu dau,\n' +
			"   nen no KHONG bat duoc chuyen nay — day la tien de, phai chan o day.\n" +
			"   Commit roi chay lai, hoac dat CHO_PHEP_CAY_BAN=1 neu that su muon do HEAD.\n" +
			"   Cay dang ban:\n" +
			banDauBan
				.split("\n")
				.map((d) => "     " + d)
				.join("\n"),
	);
	process.exit(2);
}

console.log(
	"-- PHAM VI hai phep kiem cay: chi MA NGUON. Thu muc evidence/ bi loai ra vi cac\n" +
		"   chan do khac ghi vao do trong CHINH luot chay song song — do chung la bao\n" +
		"   ban gia. Bao dam rang chan nay khong cham bang chung la CAU TRUC (moi phep\n" +
		"   pha nam trong ban sao rieng), khong phai phep so diff nay.",
);
const bang = [];
let hong = 0;
let sao = null;
let mayChu = null;

try {
	sao = dungCaySao();
	console.log(
		`-- BAN SAO: ${sao} (git worktree tai HEAD, symlink node_modules + .env)`,
	);
	mayChu = await dungMayChu(sao);
	console.log(`-- MAY CHU CUA BAN SAO: ${APP_SAO} · ${API_SAO}`);

	const khoaLenh = (d) =>
		JSON.stringify([d.do.lenh, d.do.doi_so, d.do.duoi ?? ""]);
	const vangOLuotLanh = new Map();
	const lenhRieng = new Map();
	for (const d of DOT_BIEN) {
		if (!lenhRieng.has(khoaLenh(d))) lenhRieng.set(khoaLenh(d), d.do);
	}
	console.log(
		`\n-- LUOT LANH: ${lenhRieng.size} lenh rieng biet, chay trong ban sao CHUA pha gi.\n` +
			"   Dieu kien THU BA cua moi dot bien: chuoi ghim phai VANG o luot nay.\n" +
			'   Thieu no thi "thong diep CO ghim" khong chung duoc gi — ten chan van in o moi luot.',
	);
	for (const [k, lenh] of lenhRieng) {
		const r = chay(lenh, sao);
		if (r.ma !== 0) {
			console.log(
				`   KHONG DO DUOC luot lanh: thoat ${r.ma} tren ban sao chua pha —\n` +
					`      ${lenh.lenh} ${lenh.doi_so.join(" ")}\n` +
					"      Day la tien de hong, khong phai ket qua do.",
			);
			hong += 1;
		}
		for (const d of DOT_BIEN) {
			if (khoaLenh(d) === k) {
				vangOLuotLanh.set(d.chan, r.ma === 0 && !r.ra.includes(d.ghim));
			}
		}
	}
	for (const d of DOT_BIEN) {
		console.log(
			`   ${vangOLuotLanh.get(d.chan) ? "vang    " : "CO MAT  "} ${d.chan.padEnd(5)} ${JSON.stringify(d.ghim)}`,
		);
	}

	for (const d of DOT_BIEN) {
		const duong = join(sao, d.tep);
		const goc = readFileSync(duong, "utf8");
		const ket = { ma: null, ghim: false, vang: false, ap_dung: false };

		try {
			let sua = goc;
			if (!sua.includes(d.cu)) {
				console.log(
					`   ${d.chan}: PHEP PHA KHONG AP DUNG DUOC — khong tim thay doan can pha trong ${d.tep}.\n` +
						"      Dung tin mau nao ca: mot phep pha khong xay ra trong y het mot chan do khong bat duoc.",
				);
				bang.push({ chan: d.chan, ma: "-", ghim: "-", ap_dung: false });
				hong += 1;
				continue;
			}
			sua = sua.replace(d.cu, d.moi);
			if (d.cu2) {
				if (!sua.includes(d.cu2)) {
					console.log(`   ${d.chan}: PHEP PHA (ve thu hai) KHONG AP DUNG DUOC`);
					bang.push({ chan: d.chan, ma: "-", ghim: "-", ap_dung: false });
					hong += 1;
					continue;
				}
				sua = sua.replace(d.cu2, d.moi2);
			}
			writeFileSync(duong, sua);
			ket.ap_dung = true;

			await cho(CHO_HMR);
			const r = chay(d.do, sao);
			ket.ma = r.ma;
			ket.ghim = r.ra.includes(d.ghim);

			ket.vang = vangOLuotLanh.get(d.chan) === true;
			const dat = ket.ma !== 0 && ket.ghim && ket.vang;
			if (!dat) hong += 1;
			console.log(
				`   ${dat ? "dat     " : "KHONG DAT"} ${d.chan.padEnd(5)} ${d.mo_ta}\n` +
					`             -> ma thoat ${ket.ma}, thong diep ${ket.ghim ? "CO" : "KHONG"} ghim ${JSON.stringify(d.ghim)}, ghim vang o luot lanh: ${ket.vang ? "co" : "KHONG"}`,
			);
			if (!ket.vang) {
				console.log(
					`             -> [dem-roi-vut] chuoi ghim ${JSON.stringify(d.ghim)} CO mat o luot lanh\n` +
						'                (hoac luot lanh hong), nen "co ghim" khong chung duoc dieu gi.',
				);
			}
		} finally {
			writeFileSync(duong, goc);
		}

		bang.push({
			chan: d.chan,
			ma: ket.ma,
			ghim: ket.ghim ? "co" : "khong",
			vang_o_luot_lanh: ket.vang === true,
			ap_dung: ket.ap_dung,
		});
	}

	await cho(CHO_HMR);

	console.log(
		"\n-- DOT BIEN MOI TRUONG: tro APP_URL sang mot cong khong co may chu nao.",
	);
	console.log(
		"   Moi chan ui-check phai DO ma 2 va GOI TEN CAY, khong chan nao in ra mot con so.",
	);
	for (const c of CHAN_UI) {
		const r = chay(chanHoSo(c), sao, { APP_URL: "http://localhost:39997" });
		const goiTen = r.ra.includes(sao) || r.ra.includes("CAY KHAC");
		const inSo = /ket qua: chan=/.test(r.ra);
		const dat = r.ma === 2 && goiTen && !inSo;
		if (!dat) hong += 1;
		console.log(
			`   ${dat ? "dat     " : "KHONG DAT"} ${c.padEnd(18)} ma ${r.ma}, goi ten cay ${goiTen ? "co" : "khong"}, in con so ${inSo ? "CO (sai)" : "khong"}`,
		);
		bang.push({
			chan: `moi-truong:${c}`,
			ma: r.ma,
			ghim: goiTen ? "co" : "khong",
			ap_dung: true,
		});
	}

	console.log(
		"\n-- CHIEU DO CUA CHINH CHAN NAY: ban sao CHUA pha gi thi chan do phai xanh.",
	);
	const sach = chay(chanHoSo("gioi-thieu"), sao);
	if (sach.ma !== 0) {
		console.log(
			`   KHONG DAT: ban sao da tra ve nguyen trang ma chan do van do (ma ${sach.ma}).\n` +
				"   Hoac phep tra ban goc hong, hoac co thu khac dang do.",
		);
		hong += 1;
	} else {
		console.log("   dat     ban sao sach thi chan do xanh");
	}
} finally {
	if (mayChu) {
		mayChu.api.kill();
		mayChu.app.kill();
		console.log("-- DA TAT may chu cua ban sao");
	}
	if (sao) {
		donCaySao(sao);
		console.log("-- DA XOA ban sao");
	}
}

const sauBan = cayBan();
if (sauBan !== banDauBan) {
	console.log(
		`\n   KHONG DAT: cay dang xet DOI sau khi chay — phep pha da ro ri ra khoi ban sao.\n` +
			`   truoc:\n${banDauBan || "   (sach)"}\n   sau:\n${sauBan || "   (sach)"}`,
	);
	hong += 1;
} else {
	console.log("\n   dat     cay dang xet khong doi mot byte MA NGUON nao");
}

console.log("\n===== BANG DOT BIEN =====");
console.log(
	"chan            | ma thoat | thong diep co ghim | phep pha ap dung",
);
for (const b of bang) {
	console.log(
		`${String(b.chan).padEnd(15)} | ${String(b.ma).padEnd(8)} | ${String(b.ghim).padEnd(18)} | ${b.ap_dung ? "co" : "KHONG"}`,
	);
}

console.log(
	`\nket qua: ${hong} dot bien KHONG dat tren ${bang.length} dot bien`,
);
process.exit(hong > 0 ? 1 : 0);
