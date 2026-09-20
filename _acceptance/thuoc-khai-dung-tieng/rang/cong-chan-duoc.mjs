import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { bang, chay, GOC, LoiKhongChay, thoat } from "./chung.mjs";

const TIEN_TO = ".cong-chan-duoc-";
const SAO = resolve(join(GOC, "..", `${TIEN_TO}${process.pid}`));
const CHO_THEM = "apps/app/components/crm/deal-stage.tsx";
const BIEN_BAN = join(
	GOC,
	".acceptance-runs",
	"thuoc-khai-dung-tieng",
	`E3-${process.pid}.txt`,
);

const bien_ban = [];

function ghiBienBan() {
	mkdirSync(dirname(BIEN_BAN), { recursive: true });
	writeFileSync(BIEN_BAN, `${bien_ban.join("\n")}\n`);
	console.log(`-- Bien ban day du cua hai luot: ${BIEN_BAN}`);
}

function ghiLuot(nhan, r) {
	bien_ban.push(
		`===== ${nhan} — ma thoat ${r.ma}, ${r.giay.toFixed(1)} giay =====`,
		r.ra,
	);
}

function kiemDuong(d) {
	if (!basename(d).startsWith(TIEN_TO)) {
		thoat(2, `[xoa-tu-choi] ${d} khong mang tien to ${TIEN_TO}`);
	}
	if (d === GOC || `${GOC}/`.startsWith(`${d}/`)) {
		thoat(2, `[xoa-tu-choi] ${d} bang hoac chua goc kho`);
	}
}

function don() {
	kiemDuong(SAO);
	try {
		execFileSync("git", ["-C", GOC, "worktree", "remove", "--force", SAO], {
			encoding: "utf8",
		});
	} catch {
		if (existsSync(SAO)) rmSync(SAO, { recursive: true, force: true });
	}
}

function cayBan() {
	return execFileSync("git", ["-C", GOC, "status", "--porcelain"], {
		encoding: "utf8",
	}).trim();
}

console.log(
	'-- AC-3 do HIEU LUC, khong do BAN KHAI. Khang dinh "thuoc co ten trong\n' +
		'   gate-shape.json" la doc lai to giay; cau hoi that la: them mot cho khai\n' +
		"   tieng THU MUOI vao apps/app thi `bun run test` co DO khong.\n" +
		`-- Moi viec xay ra trong ban sao ${SAO}; cay dang xet khong doi mot byte.`,
);

const banTruoc = cayBan();
const hang = [];
let hong = 0;

kiemDuong(SAO);
if (existsSync(SAO)) rmSync(SAO, { recursive: true, force: true });
execFileSync(
	"git",
	["-C", GOC, "worktree", "add", "--detach", "--quiet", SAO, "HEAD"],
	{ encoding: "utf8" },
);

try {
	try {
		symlinkSync(join(GOC, ".env"), join(SAO, ".env"));
		const canNhan = ["node_modules"];
		for (const g of ["apps", "packages"]) {
			for (const t of readdirSync(join(GOC, g), { withFileTypes: true })) {
				if (
					t.isDirectory() &&
					existsSync(join(GOC, g, t.name, "node_modules"))
				) {
					canNhan.push(join(g, t.name, "node_modules"));
				}
			}
		}
		for (const them of ["packages/db/src/generated", "apps/app/.next/types"]) {
			if (existsSync(join(GOC, them))) canNhan.push(them);
		}
		for (const ten of canNhan) {
			const dich = join(SAO, ten);
			if (existsSync(dich)) rmSync(dich, { recursive: true, force: true });
			execFileSync("mkdir", ["-p", dirname(dich)], { encoding: "utf8" });
			execFileSync("cp", ["-c", "-R", join(GOC, ten), dich], {
				encoding: "utf8",
			});
		}
		console.log(`   nhan ban ${canNhan.length} thu muc bang clonefile.`);

		const tep = join(SAO, CHO_THEM);
		const goc = readFileSync(tep, "utf8");
		const them = `${goc}\nexport function ChoKhaiTiengThuMuoi() {\n\treturn <span lang="en">Closed Won</span>;\n}\n`;
		writeFileSync(tep, them);

		const r = chay("bun", ["run", "test"], { cwd: SAO });
		ghiLuot("them cho khai tieng THU MUOI", r);
		const goiTen = r.ra.includes(CHO_THEM) || r.ra.includes("deal-stage.tsx");
		if (r.ma === 0) {
			hang.push(
				`[cong-khong-chan-duoc] them cho khai tieng THU MUOI ma \`bun run test\` van thoat 0`,
			);
			hong += 1;
		} else if (!goiTen) {
			hang.push(
				`[cong-khong-goi-ten] \`bun run test\` do (ma ${r.ma}) nhung khong nhac ${CHO_THEM}`,
			);
			hong += 1;
		} else {
			hang.push(
				`them cho thu muoi -> \`bun run test\` DO (ma ${r.ma}), va goi ten ${CHO_THEM} (${r.giay.toFixed(1)} giay)`,
			);
		}

		writeFileSync(tep, goc);
		const r2 = chay("bun", ["run", "test"], { cwd: SAO });
		ghiLuot("tra ban goc", r2);
		if (r2.ma !== 0) {
			hang.push(
				`[cong-do-oan] tra ban goc roi ma \`bun run test\` van do (ma ${r2.ma})`,
			);
			hong += 1;
		} else {
			hang.push(
				`tra ban goc      -> \`bun run test\` xanh (${r2.giay.toFixed(1)} giay)`,
			);
		}
	} finally {
		don();
	}
} catch (loi) {
	if (loi instanceof LoiKhongChay) {
		bien_ban.push("===== LUOT DUT GIUA CHUNG =====", loi.message, loi.ra);
		ghiBienBan();
		thoat(
			2,
			"KHONG DO DUOC: mot luot `bun run test` trong ban sao khong cho ra ma thoat,",
			"   nen chan nay khong noi duoc cong co chan duoc hay khong. Tien de hong,",
			"   khong phai mot phat hien ve cai cong.",
			loi.message,
		);
	}
	throw loi;
}

ghiBienBan();

const banSau = cayBan();
if (banSau !== banTruoc) {
	hang.push(
		"[cay-bi-cham] `git status --porcelain` cua cay dang xet da doi sau luot chay",
	);
	hong += 1;
} else {
	hang.push(
		"cay dang xet: `git status --porcelain` truoc va sau giong het nhau",
	);
}

bang("-- Ket qua:", hang);
console.log(`ket qua: ${hong} cho hong`);
process.exit(hong > 0 ? 1 : 0);
