import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../../../packages/validation/node_modules/zod/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "so-do-can-chinh-don-vi";
const RA = join(GOC, ".acceptance-runs", SLUG, "dot-bien");
const API = "apps/api/src/okr/so-do-don-vi.ts";
const SV_OKR = "apps/api/src/okr/okr.service.ts";
const SO_DO = "apps/app/app/(app)/[slug]/okr/toan-canh/so-do-don-vi.tsx";
const THE = "apps/app/app/(app)/[slug]/okr/toan-canh/the-don-vi.tsx";
const CHAN = [
	"dh4_du_lieu",
	"dh4_chu_y",
	"dh4_quyen",
	"dh4_ly_do",
	"dh4_the",
	"dh4_mo_the",
	"dh4_thu_gon",
];

const config = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);
const lenhCua = (khoa) => {
	const r = z.string().safeParse(config.executors.test[khoa]);
	if (!r.success) throw new Error(`khong co executors.test.${khoa}`);
	return r.data;
};

const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1)
		throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};

const VET = [
	{
		ten: "(a) moi day la lien",
		tep: API,
		cam: thay(
			'chaCua.get(x.den) === x.tu ? ("lien" as const) : ("dut" as const)',
			'"lien" as const',
		),
		chan: "dh4_du_lieu",
		ghim: "duong sai loai:",
	},
	{
		ten: "(b) truot bo loai muc tieu",
		tep: API,
		cam: thay(
			"tinhTrang(kr.progress, m.expected, m.kind)",
			'tinhTrang(kr.progress, m.expected, "cam-ket")',
		),
		chan: "dh4_chu_y",
		ghim: "tinh truot ngoai cam ket",
	},
	{
		ten: "(c) bo loc quyen",
		tep: SV_OKR,
		cam: thay(
			"const pham = { nguCanh: this.quyenOkr.nguCanhXem(q, userId) };",
			"const pham = { nguCanh: { ...this.quyenOkr.nguCanhXem(q, userId), quanTri: true } };",
		),
		chan: "dh4_quyen",
		ghim: "lo ten muc tieu gioi han",
	},
	{
		ten: "(d) ve day cho don vi chua noi",
		tep: SO_DO,
		cam: thay('data: { kind: "an" },', 'data: { kind: "lien" },'),
		chan: "dh4_the",
		ghim: "duong ve cho don vi chua noi",
	},
	{
		ten: "(e) ly do theo muc tieu o the",
		tep: THE,
		cam: thay("lyDo: g.lyDo,", "lyDo: mt.gop[0]?.lyDo ?? null,"),
		chan: "dh4_mo_the",
		ghim: "ly do sai cho noi",
	},
	{
		ten: "(f) bo tu mo nhanh khi loc",
		tep: SO_DO,
		cam: thay('(tt.loc === "chu-y" && ds.some((p) => p.canChuY))', "false"),
		chan: "dh4_thu_gon",
		ghim: "thu gon giau don vi can chu y",
	},
	{
		ten: "(g) ly do theo muc tieu o may chu",
		tep: API,
		cam: thay("lyDo: a.lyDo,", "lyDo: m.alignments[0]?.lyDo ?? null,"),
		chan: "dh4_ly_do",
		ghim: "ly do sai cho noi:",
	},
];

function dungBanSao() {
	const tam = mkdtempSync(join(tmpdir(), "dh4-dot-bien-"));
	execFileSync("bash", [
		"-c",
		`git -C "${GOC}" archive HEAD | tar -x -C "${tam}"`,
	]);
	const nm = execFileSync(
		"bash",
		[
			"-c",
			`cd "${GOC}" && ls -d node_modules apps/*/node_modules packages/*/node_modules 2>/dev/null`,
		],
		{ encoding: "utf8" },
	)
		.split("\n")
		.filter(Boolean);
	for (const d of nm) {
		mkdirSync(dirname(join(tam, d)), { recursive: true });
		symlinkSync(join(GOC, d), join(tam, d));
	}
	if (existsSync(join(GOC, ".env")))
		symlinkSync(join(GOC, ".env"), join(tam, ".env"));
	return tam;
}

const chay = (goc, lenh) => {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: goc,
		encoding: "utf8",
		maxBuffer: 256 << 20,
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};

mkdirSync(RA, { recursive: true });
const tam = dungBanSao();
let ma = 1;
try {
	const nen = CHAN.map((k) => ({ k, ...chay(tam, lenhCua(k)) }));
	const chuaXanh = nen.filter((x) => x.ma !== 0);
	if (chuaXanh.length) {
		for (const x of chuaXanh) writeFileSync(join(RA, `nen-${x.k}.txt`), x.ra);
		console.log(
			`ban lanh do: ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")}`,
		);
		throw new Error("ban lanh do");
	}
	console.log(
		`chieu xanh: ${CHAN.length}/${CHAN.length} chan xanh tren ban sao lanh (${tam})`,
	);
	let bat = 0;
	for (const v of VET) {
		const duong = join(tam, v.tep);
		const truoc = readFileSync(duong, "utf8");
		const sau = v.cam(truoc);
		if (sau === truoc) throw new Error(`vet ${v.ten} khong doi gi`);
		writeFileSync(duong, sau);
		const r = chay(tam, lenhCua(v.chan));
		writeFileSync(duong, truoc);
		writeFileSync(join(RA, `${v.ten.slice(1, 2)}.txt`), r.ra);
		const dung = r.ma !== 0 && r.ra.includes(v.ghim);
		if (dung) bat += 1;
		console.log(
			`${dung ? "DO DUNG" : "MU"} ${v.ten}: ${r.ma !== 0 ? "do" : "XANH"}${r.ra.includes(v.ghim) ? "" : ` (thieu «${v.ghim}»)`}`,
		);
	}
	console.log(`dot-bien: ${bat}/${VET.length} vet bi bat`);
	ma = bat === VET.length ? 0 : 1;
} finally {
	rmSync(tam, { recursive: true, force: true });
}
process.exit(ma);
