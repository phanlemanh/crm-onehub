import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HO_SO = join(GOC, "_acceptance", "kara-mot-ten");
const RA = join(GOC, ".acceptance-runs", "kara-mot-ten");
const MOC = "4abc05e07";
const KHO = (t) =>
	t.startsWith("apps/app/lib/messages/") ||
	t === "packages/ui/src/lib/messages.ts";

const kk = JSON.parse(readFileSync(join(HO_SO, "kiem-ke.json"), "utf8")).filter(
	(m) => m.hanh_dong === "doi",
);
const app = join(GOC, "apps", "app");
const r = spawnSync(
	"bun",
	[
		"-e",
		`const m = await import(${JSON.stringify(join(app, "test", "kara-mot-ten-luat.ts"))}); process.stdout.write(JSON.stringify(m.mucKhoChu()));`,
	],
	{ cwd: app, encoding: "utf8", maxBuffer: 1 << 27 },
);
if (r.status !== 0) {
	process.stderr.write(
		`bang-chu: khong nap duoc kho chu\n${r.stderr.slice(-2000)}\n`,
	);
	process.exit(1);
}
const hien = new Map(
	JSON.parse(r.stdout).map((m) => [`${m.tep}#${m.khoa}#${m.nn}`, m.giaTri]),
);

const gitShow = (ref, tep) =>
	spawnSync("git", ["-C", GOC, "show", `${ref}:${tep}`], { encoding: "utf8" })
		.stdout;
const doan = (cu) =>
	cu
		.split(/(?<!\p{L})[XYZW](?!\p{L})/u)
		.map((s) => s.trim())
		.sort((a, b) => b.length - a.length)[0];
const tu = (d) =>
	new Set(
		d
			.toLowerCase()
			.split(/[^\p{L}\p{N}]+/u)
			.filter((x) => x.length > 1),
	);
const dongMoi = (tep, khoa, cu) => {
	const duoi = khoa.split(".").at(-1);
	const goc = gitShow(MOC, tep)
		.split("\n")
		.filter((d) => d.includes(doan(cu)));
	const cuDong = goc.find((d) => d.includes(duoi)) ?? goc[0];
	if (!cuDong) return "(khong tim thay dong goc)";
	const mau = tu(cuDong);
	const diem = (d) =>
		[...tu(d)].filter((x) => mau.has(x)).length / Math.max(mau.size, 1);
	const moi = readFileSync(join(GOC, tep), "utf8").split("\n");
	const laKhoa = (d) => d.includes(`${duoi}:`) || d.includes(`"${duoi}":`);
	const coKhoa = cuDong.includes(duoi)
		? moi.filter((d) => (laKhoa(cuDong) ? laKhoa(d) : d.includes(duoi)))
		: moi;
	return (coKhoa.length > 0 ? coKhoa : moi)
		.reduce((tot, d) => (diem(d) > diem(tot) ? d : tot), "")
		.trim();
};
const o = (s) => String(s).replaceAll("|", "\\|").replaceAll("\n", " ");

const dong = kk.flatMap((m) =>
	Object.entries(m.cu).map(([nn, cu]) => {
		const moi = KHO(m.tep)
			? (hien.get(`${m.tep}#${m.khoa}#${nn}`) ?? "(mat khoa)")
			: dongMoi(m.tep, m.khoa, cu);
		return `| ${m.be_mat} | ${o(`${m.tep}#${m.khoa}`)} | ${nn} | ${o(cu)} | ${o(moi)} |`;
	}),
);
const can = kk.reduce((n, m) => n + Object.keys(m.cu).length, 0);
if (dong.length !== can) {
	process.stderr.write(`bang-chu: ${dong.length} dong khac ${can}\n`);
	process.exit(1);
}
mkdirSync(RA, { recursive: true });
writeFileSync(
	join(RA, "bang-chu.md"),
	[
		"# Bảng chữ trước và sau — kara-mot-ten",
		"",
		`Chữ cũ: ${MOC} (origin/onehub lúc kiểm kê). Chữ mới: cây đang xét. Mục nguồn ngoài kho chữ in dòng mã mới ở cùng vị trí.`,
		"",
		"| Bề mặt | Khoá | Ngôn ngữ | Chữ cũ | Chữ mới |",
		"|---|---|---|---|---|",
		...dong,
		"",
	].join("\n"),
);
process.stdout.write(`bang-chu: ${dong.length} dong\n`);
