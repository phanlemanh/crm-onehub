import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = join(GOC, ".acceptance-runs", "cua-vao-dang-nhap", "thuoc-da-ky");
const HO_SO = [
	"logo-onehub",
	"man-xin-quyen-co-rang",
	"vao-bang-email-va-mat-khau",
];
const VUNG_SUA = [/auth-shell/, /\(landing\)/, /messages\/auth/, /sign-in/];
const LAN_MAY = new Set(["test", "script"]);
const DANH_SACH_HOP_DONG = [
	"logo-onehub/E11",
	...["E1", "E2", "E4", "E5", "E6", "E7", "E8", "E9", "E10"].map(
		(e) => `man-xin-quyen-co-rang/${e}`,
	),
	"vao-bang-email-va-mat-khau/E13",
	"vao-bang-email-va-mat-khau/E15",
];

function git(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();
}

function giaiRef(cauHinh, ref) {
	if (!ref?.startsWith("config:")) return ref;
	let nut = cauHinh;
	for (const k of ref.slice("config:".length).split(".")) nut = nut?.[k];
	if (nut === undefined || nut === null || nut instanceof Object) {
		throw new Error(`khong giai duoc ${ref}`);
	}
	return String(nut);
}

export function rutDanhSach(goc = GOC) {
	const cauHinh = Bun.YAML.parse(
		readFileSync(join(goc, "_acceptance/config.yaml"), "utf8"),
	);
	const may = [];
	const boQua = [];
	for (const hoSo of HO_SO) {
		const evals = Bun.YAML.parse(
			readFileSync(join(goc, "_acceptance", hoSo, "evals.yaml"), "utf8"),
		).evals;
		for (const ev of evals) {
			const cham = (ev.paths ?? []).some((p) =>
				VUNG_SUA.some((re) => re.test(p)),
			);
			if (!cham) continue;
			const ten = `${hoSo}/${ev.id}`;
			if (!LAN_MAY.has(ev.executor) || ev.status === "not-run") {
				boQua.push(
					`${ten} (${ev.executor}${ev.status ? `, ${ev.status}` : ""})`,
				);
				continue;
			}
			may.push({ ten, lenh: giaiRef(cauHinh, ev.cmd) });
		}
	}
	return { may, boQua };
}

export function soSanh(base, head) {
	if (base !== 0)
		return {
			dat: true,
			chu: `base ${base} -> head ${head} (base khong dat, khong tinh)`,
		};
	if (head === 0) return { dat: true, chu: "base 0 -> head 0" };
	return { dat: false, chu: `base 0 -> head ${head}` };
}

function chayTrenCay(cay, nhan, danhSach) {
	const thu = join(RA, nhan);
	rmSync(thu, { recursive: true, force: true });
	mkdirSync(thu, { recursive: true });
	const maFile = join(thu, "ma.txt");
	const dong = danhSach.map((e, i) => {
		const tep = join(thu, `lenh-${i}.sh`);
		writeFileSync(tep, `cd "${cay}" && ${e.lenh}\n`);
		return `bash "${tep}" > "${join(thu, `log-${i}.txt`)}" 2>&1; echo "${i} $?" >> "${maFile}"`;
	});
	const runner = join(thu, "chay.sh");
	writeFileSync(runner, `${dong.join("\n")}\n`);
	const r = spawnSync("bun", ["run", "do:man", "--chay", `bash ${runner}`], {
		cwd: cay,
		stdio: ["ignore", "inherit", "inherit"],
		env: { ...process.env, PHIEN_DO_TEN_CAY: `cvdn-thuoc-${nhan}` },
	});
	if (!existsSync(maFile))
		throw new Error(`${nhan}: phien do khong chay lenh nao (ma ${r.status})`);
	const ma = new Map();
	for (const l of readFileSync(maFile, "utf8").trim().split("\n")) {
		const [i, c] = l.split(" ");
		ma.set(Number(i), Number(c));
	}
	return danhSach.map((_, i) => ma.get(i) ?? -1);
}

function dungCayBase() {
	const goc = git("merge-base", "HEAD", "origin/onehub");
	const wt = join(RA, "cay-base");
	try {
		git("worktree", "remove", "--force", wt);
	} catch {}
	git("worktree", "add", "--detach", wt, goc);
	for (const nm of [
		".",
		...readdirSync(join(GOC, "apps")).map((a) => `apps/${a}`),
		...readdirSync(join(GOC, "packages")).map((p) => `packages/${p}`),
	]) {
		const nguon = join(GOC, nm, "node_modules");
		const dich = join(wt, nm, "node_modules");
		if (existsSync(nguon) && !existsSync(dich)) symlinkSync(nguon, dich);
	}
	if (existsSync(join(GOC, ".env")))
		symlinkSync(join(GOC, ".env"), join(wt, ".env"));
	return { wt, goc };
}

function main() {
	const { may, boQua } = rutDanhSach();
	console.log(`MA TRAN ${may.length} eval: ${may.map((e) => e.ten).join(" ")}`);
	for (const b of boQua) console.log(`BO QUA ${b} (ngoai lan may)`);
	const tenMay = new Set(may.map((e) => e.ten));
	const thieuTrongHopDong = [...tenMay].filter(
		(t) => !DANH_SACH_HOP_DONG.includes(t),
	);
	const thuaTrongHopDong = DANH_SACH_HOP_DONG.filter((t) => !tenMay.has(t));
	console.log(
		`GHI CHU so voi danh sach viet tay cua AC-13: them ${thieuTrongHopDong.join(" ") || "-"}; ngoai lan may ${thuaTrongHopDong.join(" ") || "-"}`,
	);
	const doiChung = soSanh(0, 1);
	if (doiChung.dat) {
		console.log("KHONG DO DUOC: ham so sanh khong bat duoc 0 -> 1");
		process.exit(2);
	}
	console.log("GHI CHU doi-chung so sanh: base 0 -> head 1 la SAI (dung)");

	let base;
	try {
		base = dungCayBase();
		console.log(`-- cay base ${base.goc.slice(0, 8)} o ${base.wt}`);
		const maBase = chayTrenCay(base.wt, "base", may);
		const maHead = chayTrenCay(GOC, "head", may);
		let sai = 0;
		may.forEach((e, i) => {
			const r = soSanh(maBase[i], maHead[i]);
			if (!r.dat) sai++;
			console.log(`${r.dat ? "DUNG" : "SAI"} ${e.ten}: ${r.chu}`);
		});
		console.log(
			`KET LUAN ${may.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
		);
		process.exitCode = sai ? 1 : 0;
	} finally {
		if (base) {
			try {
				git("worktree", "remove", "--force", base.wt);
			} catch {}
		}
	}
}

if (import.meta.main) {
	if (process.argv.includes("--liet-ke")) {
		const { may, boQua } = rutDanhSach();
		console.log(
			`MA TRAN ${may.length} eval: ${may.map((e) => e.ten).join(" ")}`,
		);
		for (const b of boQua) console.log(`BO QUA ${b}`);
	} else {
		try {
			main();
		} catch (loi) {
			console.log(`KHONG DO DUOC: ${loi.message}`);
			process.exit(2);
		}
	}
}
