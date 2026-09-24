import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NHANH_GOC = "origin/onehub";
const HO_SO = [
	"cau-truc-to-chuc",
	"sua-luu-tru-dieu-phoi",
	"noi-bon-nut-dieu-phoi",
];
const CAU_DUOC_MAT = new Set([
	"Thiếu email, phòng ban, hoặc bộ phận của trưởng bộ phận",
]);
const CHI_DEM = process.argv.includes("--chi-dem");
const BO_LAN = CHI_DEM || process.argv.includes("--bo-lan");

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();
const docTep = (t) => readFileSync(join(GOC, t), "utf8");
const docTai = (sha, t) => {
	try {
		return execFileSync("git", ["-C", GOC, "show", `${sha}:${t}`], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return null;
	}
};

const moc = git("merge-base", "HEAD", NHANH_GOC);

const lenh = new Map();
for (const dong of docTep("_acceptance/config.yaml").split("\n")) {
	const m = /^ {4}(\w+):\s*(.+)$/.exec(dong);
	if (m) lenh.set(m[1], m[2]);
}

function bai(chuoiLenh) {
	const thuMuc = /cd (apps\/\w+|packages\/\w+)/.exec(chuoiLenh)?.[1];
	const tep = /(?:\.\/)?(test\/[\w./-]+\.(?:spec|dom)\.tsx?)/.exec(
		chuoiLenh,
	)?.[1];
	if (!thuMuc || !tep) return null;
	const loc = /-t ([\w-]+)/.exec(chuoiLenh)?.[1] ?? null;
	return { tep: `${thuMuc}/${tep}`, loc };
}

function boQuaChuoi(chu, i) {
	const q = chu[i];
	let j = i + 1;
	while (j < chu.length) {
		if (chu[j] === "\\") {
			j += 2;
			continue;
		}
		if (q === "`" && chu[j] === "$" && chu[j + 1] === "{") {
			j = khopNgoac(chu, j + 1) + 1;
			continue;
		}
		if (chu[j] === q) return j;
		j += 1;
	}
	return j;
}

function khopNgoac(chu, mo) {
	let sau = 0;
	for (let i = mo; i < chu.length; i += 1) {
		const c = chu[i];
		if (c === '"' || c === "'" || c === "`") {
			i = boQuaChuoi(chu, i);
			continue;
		}
		if (c === "/" && chu[i + 1] === "/") {
			i = chu.indexOf("\n", i);
			if (i < 0) return chu.length;
			continue;
		}
		if (c === "{") sau += 1;
		if (c === "}") {
			sau -= 1;
			if (sau === 0) return i;
		}
	}
	return chu.length;
}

function cauKhangDinh(than) {
	const ra = [];
	for (const m of than.matchAll(/\bexpect\(/g)) {
		let sau = 0;
		let i = m.index;
		for (; i < than.length; i += 1) {
			const c = than[i];
			if (c === '"' || c === "'" || c === "`") {
				i = boQuaChuoi(than, i);
				continue;
			}
			if (c === "(" || c === "{" || c === "[") sau += 1;
			if (c === ")" || c === "}" || c === "]") sau -= 1;
			if (c === ";" && sau === 0) break;
		}
		ra.push(than.slice(m.index, i));
	}
	return ra;
}

function chuoiTrong(cau) {
	const ra = [];
	for (let i = 0; i < cau.length; i += 1) {
		const c = cau[i];
		if (c !== '"' && c !== "'" && c !== "`") continue;
		const het = boQuaChuoi(cau, i);
		const noi = cau.slice(i + 1, het);
		if (!(c === "`" && noi.includes("${"))) ra.push(noi);
		i = het;
	}
	return ra;
}

const laCau = (x) => x.length >= 6 && (/\s/.test(x) || /[^\x00-\x7f]/.test(x));

function cacBai(chu) {
	const ra = new Map();
	const nhom = [];
	for (const m of chu.matchAll(
		/\b(describe|test)\(\s*("(?:[^"\\]|\\.)*"|`[^`]*`)/g,
	)) {
		const ten = m[2].slice(1, -1);
		if (m[1] === "describe") {
			const mo = chu.indexOf("{", m.index);
			nhom.push({ ten, het: khopNgoac(chu, mo) });
			continue;
		}
		while (nhom.length > 0 && (nhom.at(-1)?.het ?? 0) < m.index) nhom.pop();
		const mo = chu.indexOf("{", chu.indexOf("=>", m.index));
		const than = chu.slice(mo, khopNgoac(chu, mo) + 1);
		const day = [...nhom.map((n) => n.ten), ten].join(" ");
		const khang = than.match(/\bexpect\(/g)?.length ?? 0;
		const chuoi = new Set(cauKhangDinh(than).flatMap(chuoiTrong).filter(laCau));
		ra.set(day, { ten, khang, chuoi });
	}
	return ra;
}

const hong = [];
let soBai = 0;
let soKhang = 0;
const daXet = new Set();
const daDem = new Set();
for (const hs of HO_SO) {
	const evals = docTep(`_acceptance/${hs}/evals.yaml`);
	for (const m of evals.matchAll(/cmd: config:executors\.test\.(\w+)/g)) {
		const b = bai(lenh.get(m[1]) ?? "");
		if (!b) {
			hong.push(`${hs}: khong doc duoc lenh cua ${m[1]}`);
			continue;
		}
		const khoa = `${b.tep}#${b.loc}`;
		if (daXet.has(khoa)) continue;
		daXet.add(khoa);
		const truoc = docTai(moc, b.tep);
		if (truoc === null) continue;
		const sau = existsSync(join(GOC, b.tep)) ? docTep(b.tep) : "";
		const cu = cacBai(truoc);
		const moi = cacBai(sau);
		const loc = b.loc ? new RegExp(b.loc) : null;
		for (const [day, x] of cu) {
			if (loc && !loc.test(day)) continue;
			const khoaBai = `${b.tep}::${day}`;
			if (daDem.has(khoaBai)) continue;
			daDem.add(khoaBai);
			soBai += 1;
			const y = moi.get(day);
			if (!y) {
				hong.push(`mat bai kiem da ky: ${x.ten} (${b.tep})`);
				continue;
			}
			soKhang += y.khang;
			if (CHI_DEM)
				console.log(`${b.tep} :: ${x.ten} — expect ${x.khang} -> ${y.khang}`);
			if (y.khang < x.khang)
				hong.push(`bai ${x.ten} mat khang dinh: ${x.khang} -> ${y.khang}`);
			for (const c of x.chuoi) {
				if (!y.chuoi.has(c) && !CAU_DUOC_MAT.has(c))
					hong.push(`bai ${x.ten} mat chuoi ghim: «${c}»`);
			}
		}
	}
}
console.log(`ba ho so: ${soBai} bai da ky, ${soKhang} loi goi expect tai HEAD`);
if (soBai === 0) {
	console.log(
		"KHONG DO DUOC: khong rut duoc bai nao tu evals.yaml cua ba ho so",
	);
	process.exit(2);
}
if (CHI_DEM) {
	for (const h of new Set(hong)) console.log(`HONG ${h}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

const vong = new Set(
	git("rev-list", `${moc}..HEAD`).split("\n").filter(Boolean),
);
for (const hs of HO_SO) {
	const tepLog = join(GOC, "_acceptance", hs, "run-log.jsonl");
	const may = docTep(`_acceptance/${hs}/evals.yaml`)
		.split(/\n(?= {2}- id: )/)
		.map((khoi) => ({
			id: /- id: (E\d+)/.exec(khoi)?.[1],
			loai: /\n\s+executor: (\S+)/.exec(khoi)?.[1],
		}))
		.filter((e) => e.id && (e.loai === "test" || e.loai === "script"))
		.map((e) => e.id);
	const dong = existsSync(tepLog)
		? readFileSync(tepLog, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((d) => {
					try {
						return JSON.parse(d);
					} catch {
						return null;
					}
				})
				.filter((d) => d?.kind === "repin" && vong.has(d.sha))
		: [];
	const moiNhat = dong.at(-1);
	if (!moiNhat) {
		hong.push(`${hs}: run-log khong co dong repin nao voi sha cua vong nay`);
		continue;
	}
	const thieu = may.filter((e) => !(e in (moiNhat.evals_exit ?? {})));
	const khac0 = Object.entries(moiNhat.evals_exit ?? {}).filter(
		([, v]) => v !== 0,
	);
	if (thieu.length > 0)
		hong.push(
			`${hs}: repin ${moiNhat.run_id} thieu eval may ${thieu.join(",")}`,
		);
	if (khac0.length > 0)
		hong.push(
			`${hs}: repin ${moiNhat.run_id} co eval khac 0: ${khac0.map(([k, v]) => `${k}=${v}`).join(",")}`,
		);
	console.log(
		`${hs}: repin ${moiNhat.run_id} sha ${moiNhat.sha.slice(0, 8)} evals ${Object.keys(moiNhat.evals_exit ?? {}).length}`,
	);
}

if (!BO_LAN) {
	const lan = execFileSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"feature-loop",
			"--require",
			"scripts/repin-lane.mjs",
		],
		{ encoding: "utf8" },
	).trim();
	const chayLan = () =>
		spawnSync(
			"node",
			[
				join(lan, "scripts", "repin-lane.mjs"),
				"--root",
				GOC,
				...HO_SO.flatMap((h) => ["--slug", h]),
				"--reason",
				"do khong hoi quy",
				"--allow-dirty",
			],
			{ cwd: GOC, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
		);
	const duoi = (r) => `${r.stdout}${r.stderr}`.trim().split("\n").slice(-6);
	let r = chayLan();
	console.log(`lan may ba ho so tai HEAD, luot 1: ma ${r.status}`);
	if (r.status !== 0) {
		for (const d of duoi(r)) console.log(`  ${d}`);
		r = chayLan();
		console.log(
			`lan may ba ho so tai HEAD, luot 2 (chay lai mot lan vi luot 1 do): ma ${r.status}`,
		);
	}
	if (r.status !== 0) {
		hong.push(`lan may ba ho so do: ma ${r.status}`);
		for (const d of duoi(r)) console.log(`  ${d}`);
	}
}

for (const h of new Set(hong)) console.log(`HONG ${h}`);
process.exit(hong.length === 0 ? 0 : 1);
