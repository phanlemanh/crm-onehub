import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { tepTuBanGhi, vietTep } from "@crm/validation/tin-hieu";
import {
	type KhoiLoTrinhTho,
	khoiLoTrinhTho,
} from "@crm/validation/tin-hieu-cho";

export const GOC_KHO = path.resolve(import.meta.dir, "../../../..");

type DocDuLieu = (html: string) => {
	duLieu: object | null;
	canhBao: string[];
};
const { docDuLieu } = (await import(
	path.join(GOC_KHO, "apps/app/lib/lo-trinh/doc-du-lieu.js")
)) as { docDuLieu: DocDuLieu };

export type TrangThaiHangMau = "chua-bat-dau" | "dang-lam" | "da-giao";

export type DauVaoKit = {
	tinHieu: { ma: string; tieuDe?: string }[];
	nhom?: { ma: string; ten: string; tinHieu: string[] }[];
	le?: { ma: string; lyDo: string }[];
	daPhu?: { ma: string; hoSo: string }[];
	hang?: {
		ma: string;
		cauGiao: string;
		phu: string[];
		trangThai: TrangThaiHangMau;
	}[];
	chanTroi?: { ma: string; lyDo: string; phu: string[] }[];
};

const DOT_MAU = "dot-mau";
const TEP_LO_TRINH_MAU = "docs/plan/lo-trinh-mau.json";
const TRANG_THAI_HO_SO = {
	"chua-bat-dau": null,
	"dang-lam": "implemented",
	"da-giao": "signed-off",
} as const satisfies Record<TrangThaiHangMau, string | null>;

function chay(lenh: string[], cwd: string): string {
	const kq = Bun.spawnSync(lenh, { cwd, stdout: "pipe", stderr: "pipe" });
	if (kq.exitCode !== 0)
		throw new Error(
			`${lenh.join(" ")} thoát ${kq.exitCode}: ${kq.stderr.toString()}`,
		);
	return kq.stdout.toString();
}

function vietCauHinh(goc: string): void {
	const cauHinh = readFileSync(
		path.join(GOC_KHO, "_acceptance/config.yaml"),
		"utf8",
	).replace(
		/lo_trinh:\n {2}tep:\n(?: {4}- .*\n)+/,
		`lo_trinh:\n  tep:\n    - ${TEP_LO_TRINH_MAU}\n`,
	);
	if (!cauHinh.includes(TEP_LO_TRINH_MAU))
		throw new Error("khối mẫu: không thay được lo_trinh.tep trong config.yaml");
	writeFileSync(path.join(goc, "_acceptance/config.yaml"), cauHinh);
}

function vietBanGom(goc: string, vao: DauVaoKit): void {
	const dong = [`dot: ${DOT_MAU}`, ""];
	for (const n of vao.nhom ?? []) {
		dong.push(`- \`${n.ma}\` — ${n.ten}`);
		dong.push(`  - tín hiệu: ${n.tinHieu.map((m) => `\`${m}\``).join(", ")}`);
	}
	for (const l of vao.le ?? []) dong.push(`- lẻ \`${l.ma}\` — ${l.lyDo}`);
	for (const p of vao.daPhu ?? [])
		dong.push(`- đã phủ \`${p.ma}\` — ${p.hoSo}`);
	writeFileSync(
		path.join(goc, `tin-hieu/gom/${DOT_MAU}.md`),
		`${dong.join("\n")}\n`,
	);
}

function vietLoTrinh(goc: string, vao: DauVaoKit): void {
	const hang = (vao.hang ?? []).map((h) => ({
		ma: h.ma,
		slug: `viec-mau-${h.ma.toLowerCase()}`,
		ten: h.ma,
		cau_giao: h.cauGiao,
		dot: DOT_MAU,
		phu: h.phu,
	}));
	const chanTroi = (vao.chanTroi ?? []).map((c) => ({
		ma: c.ma,
		dot: DOT_MAU,
		cau_giao: `«${c.ma}»`,
		ly_do: c.lyDo,
		phu: c.phu,
		mo_lai_khi: "khi cần",
	}));
	writeFileSync(
		path.join(goc, TEP_LO_TRINH_MAU),
		`${JSON.stringify({ schema: 1, ten: "Mẫu", moc: [], hang, chan_troi: chanTroi }, null, 1)}\n`,
	);
	for (const [i, h] of (vao.hang ?? []).entries()) {
		const status = TRANG_THAI_HO_SO[h.trangThai];
		if (status === null) continue;
		const slug = hang[i]?.slug ?? "";
		mkdirSync(path.join(goc, "_acceptance", slug), { recursive: true });
		writeFileSync(
			path.join(goc, "_acceptance", slug, "contract.md"),
			`---\nschema_version: 1\nfeature: ${h.cauGiao}\nslug: ${slug}\nrisk_tier: T2\nstatus: ${status}\n---\n\n# ${slug}\n`,
		);
	}
}

export function dungTepMau(vao: DauVaoKit): string {
	const goc = mkdtempSync(path.join(tmpdir(), "khoi-tin-hieu-mau-"));
	for (const d of ["_acceptance", "docs/plan", "tin-hieu/crm", "tin-hieu/gom"])
		mkdirSync(path.join(goc, d), { recursive: true });
	vietCauHinh(goc);
	for (const t of vao.tinHieu)
		writeFileSync(
			path.join(goc, `tin-hieu/crm/${t.ma}.json`),
			vietTep(
				tepTuBanGhi({
					tieuDe: t.tieuDe ?? `Tín hiệu ${t.ma}`,
					muonLam: "Muốn lọc được danh sách",
					daXayRa: "Không lọc được",
					man: "/tin-hieu",
					guiLuc: new Date("2026-10-20T00:00:00.000Z"),
				}),
			),
		);
	vietBanGom(goc, vao);
	vietLoTrinh(goc, vao);
	chay(["git", "init", "-q"], goc);
	chay(["git", "add", "-A"], goc);
	chay(
		[
			"git",
			"-c",
			"user.email=mau@crm.test",
			"-c",
			"user.name=mau",
			"commit",
			"-qm",
			"mau",
		],
		goc,
	);
	chay(
		["node", path.join(GOC_KHO, "scripts/product-map.mjs"), "--root", goc],
		GOC_KHO,
	);
	return readFileSync(path.join(goc, "LO-TRINH.html"), "utf8");
}

export function dungKhoiMau(vao: DauVaoKit): KhoiLoTrinhTho {
	const { duLieu, canhBao } = docDuLieu(dungTepMau(vao));
	if (!duLieu)
		throw new Error(
			`khối mẫu: kit không vẽ được khối — ${canhBao.join(" · ")}`,
		);
	return khoiLoTrinhTho.parse(duLieu);
}
