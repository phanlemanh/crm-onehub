import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bang, GOC, ghim, thoat } from "./chung.mjs";

const HO_SO = "nen-chat-ai-elements";
const BAO_CAO = `_acceptance/${HO_SO}/evidence-report.md`;
const EVALS = `_acceptance/${HO_SO}/evals.yaml`;

const bao = readFileSync(join(GOC, BAO_CAO), "utf8");
const m = /^verified_commit:\s*"?([0-9a-f]{7,40})"?/m.exec(bao);
if (!m) {
	thoat(2, `KHONG DO DUOC: ${BAO_CAO} khong co truong verified_commit.`);
}
const sha = m[1];

const evals = readFileSync(join(GOC, EVALS), "utf8");

function rutPaths(noi_dung) {
	const ra = [];
	let trong = false;
	let thut = 0;
	for (const d of noi_dung.split("\n")) {
		const mo = /^(\s*)paths:\s*$/.exec(d);
		if (mo) {
			trong = true;
			thut = mo[1].length;
			continue;
		}
		if (!trong) continue;
		const muc = /^(\s*)-\s*"?([^"]+?)"?\s*$/.exec(d);
		if (muc && muc[1].length > thut) {
			ra.push(muc[2]);
			continue;
		}
		if (d.trim() !== "") trong = false;
	}
	return ra;
}

const tho = rutPaths(evals);
const duong = [...new Set(tho)].sort();
console.log(
	'-- Mau "**" nghia la TOAN KHO, khong phai duong hong: no doi chieu bam cua CA CAY\n' +
		"   o hai moc. Ban cu vut tham no, nen packages/ui/package.json doi trong diff ma\n" +
		"   phep kiem hoa-cu khong nhin thay.\n" +
		"-- Rieng mau toan-kho BO _acceptance/ ra: chinh commit ghi bang chung ghim lai\n" +
		'   cung lam cay doi, nen neu tinh ca no thi mot ho so co "**" trong paths KHONG\n' +
		"   BAO GIO tuoi duoc. Day la dung luat luoi staleness cua kit: chi dem file doi\n" +
		"   NGOAI _acceptance/.",
);
console.log(
	`-- Rut duong TU KHOI "paths:" (neo theo thut dau dong), khong quet ca tep.\n` +
		`   ${tho.length} muc tho -> ${duong.length} duong rieng biet, KHONG loc bo muc nao.\n` +
		'   Ban cu quet moi dong dang - "..." trong CA tep roi loc thau muc khong chua "/":\n' +
		'   phep loc do vut tham muc "**" (paths cua E15 = TOAN KHO). Hoi dong S4 vong 1 bat.',
);
ghim("so duong rieng biet trong cac khoi paths", duong.length, 14);

const VANG = Symbol("vang");

console.log(
	`-- Ho so ${HO_SO} da ky, va vong nay sua .githooks/gate-shape.json —\n` +
		"   mot tep nam trong paths eval cua no. Bang chung da ky cua no vi the HOA CU.\n" +
		`-- verified_commit hien tai: ${sha}\n` +
		`-- ${duong.length} duong trong paths eval, doc TU ${EVALS}.`,
);

function bam(rev, d) {
	if (d.includes("*")) {
		try {
			const tienTo = d.replace(/\*+$/, "").replace(/\/+$/, "");
			const doiSo =
				tienTo === ""
					? ["-C", GOC, "ls-tree", "-r", rev]
					: ["-C", GOC, "ls-tree", "-r", rev, "--", tienTo];
			const ra = execFileSync("git", doiSo, { encoding: "utf8" }).trim();
			const boSoSach = tienTo === "";
			const dong = ra
				.split("\n")
				.filter((x) => x !== "")
				.map((x) => {
					const [mo, ten] = x.split("\t");
					return `${mo.split(" ")[2]} ${ten}`;
				})
				.filter((x) => !(boSoSach && x.includes(" _acceptance/")))
				.sort();
			return `${dong.length} tep · ${bamChuoi(dong.join("\n"))}`;
		} catch {
			return VANG;
		}
	}
	try {
		return execFileSync("git", ["-C", GOC, "rev-parse", `${rev}:${d}`], {
			encoding: "utf8",
		}).trim();
	} catch {
		return VANG;
	}
}

function bamChuoi(v) {
	return createHash("sha1").update(v).digest("hex").slice(0, 12);
}

const hang = [];
let hong = 0;

const in_ = (v) => (v === VANG ? "(khong doc duoc)" : String(v).slice(0, 14));

for (const d of duong) {
	const cu = bam(sha, d);
	const nay = bam("HEAD", d);
	if (cu === VANG && nay === VANG) {
		hang.push(
			`KHONG DOC DUOC [duong-khai-khong-doc-duoc:${d}] vang o CA HAI moc\n` +
				"        Hai lan hong tra cung mot chuoi moc thi so nhau BANG NHAU va bao\n" +
				'        "con tuoi" — mot duong go sai trong evals.yaml se im lang mai mai.',
		);
		hong += 1;
		continue;
	}
	if (cu !== nay) {
		hang.push(`HOA CU [bang-chung-hoa-cu:${d}] ${in_(cu)} -> ${in_(nay)}`);
		hong += 1;
	} else {
		hang.push(`con tuoi ${d} ${in_(nay)}`);
	}
}

bang("-- Tung duong, kem bam truoc/sau:", hang);
if (hong > 0) {
	console.log(
		"   Cach sua KHONG phai sua tay evidence-report: chay nghi thuc ghim lai\n" +
			"   (repin-lane.mjs) de mot lan chay bang MAY chong lung cho bam moi.",
	);
}
console.log(`ket qua: ${hong} duong hoa cu tren ${duong.length}`);
process.exit(hong > 0 ? 1 : 0);
