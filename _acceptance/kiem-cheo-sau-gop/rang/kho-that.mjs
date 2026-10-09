import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	cpSync,
	existsSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const require = createRequire(import.meta.url);
const { evalPathsOf, pathGlobToRe } = require(
	join(GOC, "lib", "evidence-core.cjs"),
);
const { parseEvals } = require(join(GOC, "lib", "eval-yaml.cjs"));

const DO = {
	tu: "feba7e77520d4414bf853881193c3ae82f3eb411",
	den: "b633a7e3bf45bfc3732e11014a240961f187e610",
	lanGop: [
		"c803963efcdc868cf28c57de20191eec9de039aa",
		"0b257e157f4245fbb7459fc9861578036cf725b5",
		"b633a7e3bf45bfc3732e11014a240961f187e610",
	],
	nhanh: "onehub",
	daKy: ["signed-off", "machine-cleared"],
	boQua: "_acceptance/",
	thuMucKet: ".acceptance-runs/kiem-cheo",
	loiBoDem: "ENOBUFS",
	maxBuffer: 64 * 1024 * 1024,
};

const HO_SO_TAI_CU = `function hoSoTai({ git, goc, sha }) {
	const dich = join(goc, KIEM_CHEO.thuMuc, \`ho-so-\${sha.slice(0, 12)}\`);
	rmSync(dich, { recursive: true, force: true });
	mkdirSync(dich, { recursive: true });
	const tar = execFileSync("git", ["-C", goc, "archive", sha, "_acceptance"]);
	execFileSync("tar", ["-x", "-C", dich], { input: tar });
	return dich;
}
`;

const loi = [];
const hong = (s) => loi.push(s);

function git(cwd, ...a) {
	return execFileSync("git", ["-C", cwd, ...a], {
		encoding: "utf8",
		maxBuffer: DO.maxBuffer,
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();
}

function bamCay() {
	return createHash("sha256")
		.update(git(GOC, "status", "--porcelain", "--untracked-files=all"))
		.digest("hex");
}

function dungBanSao(tam) {
	const kho = join(tam, "kho");
	execFileSync("git", ["clone", "-q", "--shared", "--no-checkout", GOC, kho]);
	git(kho, "update-ref", `refs/heads/${DO.nhanh}`, DO.den);
	git(kho, "remote", "set-url", "origin", kho);
	return kho;
}

function chayDem({ demTep, kho, tam }) {
	const lan = join(
		GOC,
		"_acceptance",
		"kiem-cheo-sau-gop",
		"rang",
		"lan-gia.mjs",
	);
	const r = spawnSync(process.execPath, [demTep, "--goc", kho, "--tu", DO.tu], {
		cwd: tam,
		encoding: "utf8",
		env: {
			...process.env,
			KIEM_CHEO_LAN: lan,
			KCS_XANH_HET: "1",
			KIEM_CHEO_DUNG_CAY: "true",
			KIEM_CHEO_THONG_BAO: "true",
		},
	});
	const thuMuc = join(kho, DO.thuMucKet);
	const tepNgay = existsSync(thuMuc)
		? execFileSync("ls", [thuMuc], { encoding: "utf8" })
				.split("\n")
				.filter((t) => /^\d{4}-\d{2}-\d{2}\.json$/.test(t))
		: [];
	const ket =
		tepNgay.length === 1
			? JSON.parse(readFileSync(join(thuMuc, tepNgay[0]), "utf8"))
			: null;
	const moc = existsSync(join(thuMuc, "moc.json"))
		? JSON.parse(readFileSync(join(thuMuc, "moc.json"), "utf8"))
		: null;
	return { ma: r.status, ra: `${r.stdout}${r.stderr}`, ket, moc, tepNgay };
}

function tapDocLap(kho) {
	const doi = git(kho, "diff", "--name-only", `${DO.tu}..${DO.den}`)
		.split("\n")
		.filter((t) => t && !t.startsWith(DO.boQua));
	const slugs = git(
		kho,
		"ls-tree",
		"-d",
		"--name-only",
		`${DO.den}:_acceptance`,
	)
		.split("\n")
		.filter(Boolean);
	const tap = [];
	const motDong = [];
	for (const slug of slugs) {
		const doc = (tep) => {
			try {
				return git(kho, "show", `${DO.den}:_acceptance/${slug}/${tep}`);
			} catch {
				return null;
			}
		};
		const evals = doc("evals.yaml");
		const hopDong = doc("contract.md");
		if (!evals || !hopDong) continue;
		const st = /^status:\s*(\S+)/m.exec(hopDong)?.[1];
		if (!DO.daKy.includes(st)) continue;
		const khuon = parseEvals(evals, [])
			.flatMap((e) => evalPathsOf(evals, e.id) ?? [])
			.map(pathGlobToRe);
		if (!doi.some((t) => khuon.some((k) => k.test(t)))) continue;
		tap.push(slug);
		if (/^\s*paths:\s*\[/m.test(evals) && !/^\s*paths:\s*$/m.test(evals)) {
			motDong.push(slug);
		}
	}
	return { tap, motDong };
}

function kiemChieuXanh(kho, tam) {
	const r = chayDem({
		demTep: join(GOC, "scripts", "kiem-cheo", "dem.mjs"),
		kho,
		tam,
	});
	if (r.ma !== 0) hong(`(a) dem.mjs thoat ${r.ma}: ${r.ra.slice(-400)}`);
	if (!r.ket) {
		hong(`(a) khong co dung mot tep ngay (thay ${r.tepNgay.length})`);
		return;
	}
	if ((r.ket.do ?? []).length > 0) {
		hong(
			`(a) lan xanh het ma tep ngay co ${r.ket.do.length} muc do: ${r.ket.do.map((d) => `${d.ho_so} ${d.eval} ${d.loai}`).join("; ")}`,
		);
	}
	if (r.ket.ket_qua !== "xanh") {
		hong(`(a) ket_qua ${r.ket.ket_qua}: ${r.ket.ly_do ?? ""}`);
	}
	if (JSON.stringify(r.ket.lan_gop) !== JSON.stringify(DO.lanGop)) {
		hong(`(b) lan_gop ${JSON.stringify(r.ket.lan_gop)}`);
	}
	const { tap, motDong } = tapDocLap(kho);
	const ra = [...(r.ket.ho_so ?? [])].sort();
	if (JSON.stringify(ra) !== JSON.stringify([...tap].sort())) {
		const thieu = tap.filter((s) => !ra.includes(s));
		const thua = ra.filter((s) => !tap.includes(s));
		hong(
			`(c) ho_so lech tap doc lap: thieu ${thieu.join(",")} thua ${thua.join(",")}`,
		);
	}
	if (tap.length === 0) hong("(c) tap doc lap rong — phep do vo nghia");
	if (motDong.length === 0) {
		hong("(c) tap khong co ho so nao chi khai paths kieu mot dong");
	}
	if (r.moc?.sha !== DO.den) hong(`(d) moc.json sha ${r.moc?.sha}`);
	return { tap: tap.length, motDong };
}

function kiemChieuDo(kho, tam) {
	const sao = join(tam, "sao");
	for (const d of ["scripts/kiem-cheo", "scripts/dieu-phoi", "lib"]) {
		cpSync(join(GOC, d), join(sao, d), { recursive: true });
	}
	const demTep = join(sao, "scripts", "kiem-cheo", "dem.mjs");
	const nguon = readFileSync(demTep, "utf8");
	const moi = nguon.replace(/function hoSoTai\([\s\S]*?\n}\n/, HO_SO_TAI_CU);
	if (moi === nguon && !nguon.includes(HO_SO_TAI_CU)) {
		hong("(do) khong thay ham hoSoTai de thay ban cu");
		return;
	}
	writeFileSync(demTep, moi);
	rmSync(join(kho, DO.thuMucKet), { recursive: true, force: true });
	const r = chayDem({ demTep, kho, tam });
	if (r.ket?.ket_qua !== "loi" || !String(r.ket?.ly_do).includes(DO.loiBoDem)) {
		hong(
			`(do) ban cu khong do ${DO.loiBoDem}: ket_qua ${r.ket?.ket_qua} ly_do ${r.ket?.ly_do} ma ${r.ma} tep ${r.tepNgay.join(",")} ra ${r.ra.slice(-300)}`,
		);
	}
}

const bamTruoc = bamCay();
const tam = mkdtempSync(join(realpathSync(tmpdir()), "kcs-kho-that-"));
let ghiChu = {};
try {
	const kho = dungBanSao(tam);
	ghiChu = kiemChieuXanh(kho, tam) ?? {};
	kiemChieuDo(kho, tam);
} catch (e) {
	hong(`loi bat ngo: ${String(e.message).split("\n")[0]}`);
} finally {
	try {
		rmSync(tam, { recursive: true, force: true });
	} catch {}
}
if (bamCay() !== bamTruoc) hong("(e) git status cua cay goi lenh da doi");

if (loi.length > 0) {
	for (const l of loi) console.error(`kho-that: ${l}`);
	process.exit(1);
}
console.log(
	`kho-that: xanh — ${DO.lanGop.length} lan gop, ${ghiChu.tap} ho so cham (mot dong: ${ghiChu.motDong.join(",")}), chieu do ban cu ra ${DO.loiBoDem}`,
);
