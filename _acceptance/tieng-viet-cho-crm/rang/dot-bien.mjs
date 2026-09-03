import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "apps/app/lib/messages/companies.ts";
const DO = "_acceptance/tieng-viet-cho-crm/rang/ban-ve-man-cong-ty.mjs";
const CHAN = process.env.CHAN ?? "man";
const CHO_MS = Number(process.env.CHO_MS ?? 2500);

const goc = readFileSync(FILE, "utf8");

function khoi(ten) {
	const mo = goc.indexOf(`\t${ten}: {`);
	if (mo === -1) throw new Error(`khong tim thay khoi ${ten}`);
	const dong = goc.indexOf("\n\t},", mo);
	return goc.slice(mo, dong);
}

function capKhoa(ten) {
	const en = khoi("en");
	const vi = khoi("vi");
	const doc = (block) => {
		const out = new Map();
		for (const line of block.split("\n")) {
			const m = line.match(/^\t{3}(\w+): "(.*)",$/);
			if (m) out.set(m[1], m[2]);
		}
		return out;
	};
	const laySection = (block, section) => {
		const mo = block.indexOf(`\t\t${section}: {`);
		if (mo === -1) return "";
		return block.slice(mo, block.indexOf("\n\t\t},", mo));
	};
	const pairs = [];
	for (const section of ["headers", "labels", "facets"]) {
		const e = doc(laySection(en, section));
		const v = doc(laySection(vi, section));
		for (const [k, viVal] of v) {
			const enVal = e.get(k);
			if (enVal && enVal !== viVal) pairs.push({ khoa: `${section}.${k}`, viVal, enVal });
		}
	}
	const phang = (block) => {
		const out = new Map();
		for (const line of block.split("\n")) {
			const m = line.match(/^\t{2}(\w+): "(.*)",$/);
			if (m) out.set(m[1], m[2]);
		}
		return out;
	};
	const ep = phang(en);
	const vp = phang(vi);
	for (const [k, viVal] of vp) {
		const enVal = ep.get(k);
		if (enVal && enVal !== viVal) pairs.push({ khoa: k, viVal, enVal });
	}
	if (ten === undefined) return pairs;
	const muon = new Set(ten.split(","));
	return pairs.filter((p) => muon.has(p.khoa));
}

function doiViThanhEn({ khoa, viVal, enVal }) {
	const viStart = goc.indexOf("\tvi: {");
	const truoc = goc.slice(0, viStart);
	const sau = goc.slice(viStart);
	const phan = khoa.split(".");
	const ten = phan[phan.length - 1];
	let tu = 0;
	if (phan.length === 2) {
		tu = sau.indexOf(`\t\t${phan[0]}: {`);
		if (tu === -1) return null;
	}
	const can = new RegExp(`^(\\t+${ten}): "${viVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}",$`, "m");
	const doan = sau.slice(tu);
	const hit = doan.match(can);
	if (hit === null) return null;
	const at = tu + doan.indexOf(hit[0]);
	return (
		truoc +
		sau.slice(0, at) +
		`${hit[1]}: "${enVal}",` +
		sau.slice(at + hit[0].length)
	);
}

function soDongDoi(banMoi) {
	const a = goc.split("\n");
	const b = banMoi.split("\n");
	if (a.length !== b.length) return -1;
	let n = 0;
	for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) n += 1;
	return n;
}

function chay() {
	const r = spawnSync("node", [DO, CHAN], { encoding: "utf8" });
	const out = `${r.stdout}${r.stderr}`;
	const m = out.match(/ket qua: con lai=(\d+) · khong dau=(\d+) · lan=(\d+)/);
	return {
		code: r.status,
		out,
		du: m === null ? null : Number(m[3]),
	};
}

const chi = process.argv[2];
const danh = capKhoa(chi);
if (danh.length === 0) {
	console.log("khong co khoa nao de dot bien");
	process.exit(2);
}

let bat = 0;
let cun = 0;
const sot = [];

try {
	const sach = chay();
	if (sach.du === null) {
		console.log("RANG CUN: khong doc duoc so du cua ban ve nguyen ban");
		process.exit(2);
	}
	console.log(`-- nen: ban ve nguyen ban con ${sach.du} chuoi du`);

	for (const cap of danh) {
		const banMoi = doiViThanhEn(cap);
		if (banMoi === null || banMoi === goc) {
			console.log(`   ${cap.khoa.padEnd(22)} DOT BIEN RONG (khong sua duoc file)`);
			cun += 1;
			continue;
		}
		const dong = soDongDoi(banMoi);
		if (dong !== 1) {
			console.log(`   ${cap.khoa.padEnd(22)} RANG CUN: dot bien lech ${dong} dong, cho 1`);
			cun += 1;
			continue;
		}
		writeFileSync(FILE, banMoi);
		await new Promise((r) => setTimeout(r, CHO_MS));
		const r = chay();
		writeFileSync(FILE, goc);
		if (r.du !== null && r.du > sach.du) {
			bat += 1;
			console.log(
				`   ${cap.khoa.padEnd(22)} do  ${sach.du}->${r.du}  "${cap.viVal}" -> "${cap.enVal}"`,
			);
		} else {
			sot.push(cap.khoa);
			console.log(
				`   ${cap.khoa.padEnd(22)} SOT ${sach.du}->${r.du}  "${cap.viVal}" -> "${cap.enVal}"`,
			);
		}
	}
} finally {
	writeFileSync(FILE, goc);
}

console.log(
	`ket qua: bat ${bat}/${danh.length} · dot bien cun ${cun} · sot ${sot.length}${sot.length ? ` (${sot.join(", ")})` : ""}`,
);
process.exit(bat === danh.length ? 0 : 1);
