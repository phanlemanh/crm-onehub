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
const SLUG = "so-do-quanh-muc-tieu";
const RA = join(GOC, ".acceptance-runs", SLUG, "dot-bien");
const HAM = "apps/api/src/okr/quanh-muc-tieu.ts";
const SV_OKR = "apps/api/src/okr/okr.service.ts";
const TRANG = "apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/quanh-muc-tieu.tsx";
const CHAN = ["dh5_len", "dh5_xuong", "dh5_quyen", "dh5_so_do"];

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
		throw new Error(`dot bien khong ap duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};

const VET = [
	{
		ten: "(a) bo khu trung nut muc tieu",
		sua: [
			{
				tep: HAM,
				cam: thay(
					"\t\tif (nut.has(m.id)) return;\n\t\tnut.set(m.id, {",
					"\t\tnut.set(`${m.id}#${nut.size}`, {",
				),
			},
		],
		chan: "dh5_len",
		ghim: "nut lap: ",
	},
	{
		ten: "(b) them moi KR cua muc tieu phia tren",
		sua: [
			{
				tep: HAM,
				cam: thay(
					'themKr(kr, chu, "tren");',
					'themKr(kr, chu, "tren");\n\t\t\t\tfor (const k2 of chu.keyResults) themKr(k2, chu, "tren");',
				),
			},
		],
		chan: "dh5_len",
		ghim: "kr ngoai duong: n1-k2",
	},
	{
		ten: "(c) di xuong de quy",
		sua: [
			{
				tep: HAM,
				cam: thay(
					'themMt(c, "duoi");\n\t\t\tnoi(den, c.id, "gop");',
					'themMt(c, "duoi");\n\t\t\tnoi(den, c.id, "gop");\n\t\t\tfor (const d of mts)\n\t\t\t\tfor (const b of d.alignments)\n\t\t\t\t\tif (!b.targetKeyResultId && b.targetObjectiveId === c.id) {\n\t\t\t\t\t\tthemMt(d, "duoi");\n\t\t\t\t\t\tnoi(c.id, d.id, "gop");\n\t\t\t\t\t}',
				),
			},
		],
		chan: "dh5_xuong",
		ghim: "xuong qua mot bac: D",
	},
	{
		ten: "(d) bo loc quyen khi doc muc tieu",
		sua: [
			{
				tep: SV_OKR,
				cam: thay(
					"const pham = { nguCanh: this.quyenOkr.nguCanhXem(q, userId) };",
					"const pham = { nguCanh: { ...this.quyenOkr.nguCanhXem(q, userId), quanTri: true } };",
				),
			},
		],
		chan: "dh5_quyen",
		ghim: "lo ten muc tieu gioi han",
	},
	{
		ten: "(e) bo nhan cong ty o KR",
		sua: [
			{
				tep: HAM,
				cam: thay(
					"\t\t\tcongTy: congTy(m),\n\t\t\ttienDo: k.progress,",
					"\t\t\tcongTy: false,\n\t\t\ttienDo: k.progress,",
				),
			},
		],
		chan: "dh5_so_do",
		ghim: "thieu nhan cong ty: n1-k1",
	},
	{
		ten: "(f) pha ca hai lop chan muc tieu gioi han phia tren",
		sua: [
			{
				tep: SV_OKR,
				cam: thay(
					"\talignments: {\n\t\twhere: {\n\t\t\tOR: [\n\t\t\t\t{ targetObjective: boGioiHan },\n\t\t\t\t{ targetKeyResult: { objective: boGioiHan } },\n\t\t\t],\n\t\t},\n",
					"\talignments: {\n",
				),
			},
			{
				tep: HAM,
				cam: thay(
					"\t\t\tif (!p) continue;",
					'\t\t\tif (!p) {\n\t\t\t\tconst id = a.targetObjectiveId ?? "";\n\t\t\t\tnut.set(id, { id, loai: "muc-tieu", phia: "tren", tieuDe: a.objectiveTitle, donVi: a.unitName, congTy: false, tienDo: 0, mucTieuId: id });\n\t\t\t\tnoi(id, x.id, "gop");\n\t\t\t\tcontinue;\n\t\t\t}',
				),
			},
		],
		chan: "dh5_quyen",
		ghim: "lo muc tieu gioi han phia tren",
	},
	{
		ten: "(g) dong gop len rut tu nut cap cong ty",
		sua: [
			{
				tep: TRANG,
				cam: thay(
					"q.gopLenCongTy.map((g) => (",
					'q.nut.filter((n) => n.congTy).map((n) => ({ kr: n.loai === "kr" ? { id: n.id, tieuDe: n.tieuDe } : null, mucTieu: { id: n.mucTieuId, tieuDe: "" } })).map((g) => (',
				),
			},
		],
		chan: "dh5_so_do",
		ghim: "dong gop len lech",
	},
	{
		ten: "(h) chi doc muc tieu cua ky tam",
		sua: [
			{
				tep: SV_OKR,
				cam: thay(
					"const mts = [...cha, ...cua, ...con];",
					"const mts = [...cua, ...con];",
				),
			},
		],
		chan: "dh5_len",
		ghim: "mat duong len ky cha",
	},
];

function dungBanSao() {
	const tam = mkdtempSync(join(tmpdir(), "dh5-dot-bien-"));
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
		if (existsSync(join(tam, d))) continue;
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
		const goc = v.sua.map((s) => {
			const duong = join(tam, s.tep);
			const truoc = readFileSync(duong, "utf8");
			const sau = s.cam(truoc);
			if (sau === truoc) throw new Error(`vet ${v.ten} khong doi gi`);
			writeFileSync(duong, sau);
			return { duong, truoc };
		});
		const r = chay(tam, lenhCua(v.chan));
		for (const g of goc) writeFileSync(g.duong, g.truoc);
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
