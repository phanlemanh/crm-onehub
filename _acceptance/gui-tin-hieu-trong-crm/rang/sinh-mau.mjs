import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	tepTuBanGhi,
	vietTep,
} from "../../../packages/validation/src/tin-hieu.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const GOC = path.resolve(HERE, "..", "..", "..");
export const MAU_RA = path.join(
	GOC,
	"apps",
	"app",
	"test",
	"fixtures",
	"tin-hieu",
);

const git = (d, ...a) =>
	execFileSync("git", ["-C", d, ...a], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();

export function layKit() {
	const kho =
		process.env.KIT_ROOT ?? path.join(homedir(), "dev", "acceptance-gate-kit");
	if (!existsSync(path.join(kho, ".git"))) {
		console.error(`khong co bo doc tin hieu cua kit: ${kho}`);
		process.exit(2);
	}
	const sha = git(kho, "rev-parse", "origin/main");
	const ra = mkdtempSync(path.join(tmpdir(), "gth-kit-"));
	execFileSync("bash", [
		"-c",
		`git -C "${kho}" archive origin/main | tar -x -C "${ra}"`,
	]);
	return { thuMuc: ra, sha };
}

function khoiMd(txt, ten) {
	const m = String(txt).match(
		new RegExp(
			`<!-- <<<${ten} -->\\n\`\`\`[a-z]*\\n([\\s\\S]*?)\`\`\`\\n<!-- ${ten}>>> -->`,
		),
	);
	if (!m) throw new Error(`khuôn kit thiếu khối ${ten}`);
	return m[1];
}

export function vietGom(kit, { dot, nhom, le, phu, den }) {
	const b = khoiMd(
		readFileSync(
			path.join(
				kit,
				"skills",
				"acceptance",
				"references",
				"tin-hieu-template.md",
			),
			"utf8",
		),
		"GOM-MAU",
	);
	const L = b.split("\n");
	const iN = L.findIndex((l) => l.startsWith("- `"));
	const k = {
		nhom: L[iN],
		th: L[iN + 1],
		le: L.find((l) => l.startsWith("- lẻ ")),
		phu: L.find((l) => l.startsWith("- đã phủ ")),
	};
	const dau = L.filter((l) => /^(dot|dang|nguon|truc|den):/.test(l)).map((l) =>
		l.replace(/^dot:.*/, `dot: ${dot}`).replace(/^den:.*/, `den: ${den}`),
	);
	const ra = [...dau, ""];
	for (const [ma, ten, ids] of nhom) {
		ra.push(
			k.nhom.replace(/`[^`]*`/, `\`${ma}\``).replace(/ — .*$/, ` — ${ten}`),
		);
		ra.push(k.th.replace(/:.*$/, `: ${ids.map((x) => `\`${x}\``).join(", ")}`));
	}
	ra.push("");
	for (const [id, ly] of le)
		ra.push(k.le.replace(/`[^`]*`/, `\`${id}\``).replace(/ — .*$/, ` — ${ly}`));
	for (const [id, slug] of phu)
		ra.push(
			k.phu.replace(/`[^`]*`/, `\`${id}\``).replace(/ — .*$/, ` — ${slug}`),
		);
	return `${ra.join("\n")}\n`;
}

const HD = (slug, status) =>
	`---\nschema_version: 1\nfeature: «việc ${slug}»\nslug: ${slug}\nowner: x@y.z\nrisk_tier: T2\nsurfaces: [cli]\nstatus: ${status}\napproved_by: M\napproved_at: 2026-09-01T00:00:00Z\n---\n\n## Criteria\n\n- AC-1: Given a, When b, Then c.\n\n## Out of scope\n\n- x\n- y\n`;
const EV = (slug) =>
	`---\nschema_version: 1\nfeature_slug: ${slug}\nverdict: PASS\nhuman_signoff: M 2026-09-02\n---\n\n## Evidence\n`;

const LUC_TRUOC = new Date("2026-10-20T00:00:00Z");
const LUC_SAU = new Date("2026-10-30T00:00:00Z");
const DEN = "2026-10-28T00:00:00Z";

export function tinMau(so, luc = LUC_TRUOC) {
	return {
		id: `crm-${so}`,
		tep: tepTuBanGhi({
			tieuDe: `điều gặp số ${so}`,
			muonLam: `việc muốn làm số ${so}`,
			daXayRa: `điều gặp số ${so}`,
			man: "/okr/kr",
			guiLuc: luc,
		}),
	};
}

export function dungKhoMau(kit, them = {}) {
	const WR = createRequire(import.meta.url)(
		path.join(kit, "lib", "workspace-record.cjs"),
	);
	const GIAO = WR.DA_THONG_CONG_2[0];
	const r = mkdtempSync(path.join(tmpdir(), "gth-kho-"));
	execFileSync("git", ["init", "-q", "-b", "main", r]);
	git(r, "config", "user.email", "x@y.z");
	git(r, "config", "user.name", "x");
	const s = [
		null,
		tinMau(1, LUC_SAU),
		...[2, 3, 4, 5, 6, 7, 8].map((i) => tinMau(i)),
	];
	const tins = them.tins ?? s.slice(1);
	mkdirSync(path.join(r, "_acceptance"), { recursive: true });
	writeFileSync(
		path.join(r, "_acceptance", "config.yaml"),
		`schema_version: 1\nrisk_tiers:\n  t1_skip_globs:\n    - "PRODUCT-MAP.md"\n    - "LO-TRINH.html"\nlo_trinh:\n  tep: docs/lo-trinh.json\n${them.khai ?? "tin_hieu:\n  nguon: [tin-hieu/crm]\n  gom: tin-hieu/gom\n"}`,
	);
	mkdirSync(path.join(r, "tin-hieu", "crm"), { recursive: true });
	mkdirSync(path.join(r, "tin-hieu", "gom"), { recursive: true });
	for (const t of tins)
		writeFileSync(
			path.join(r, "tin-hieu", "crm", `${t.id}.json`),
			vietTep(t.tep),
		);
	writeFileSync(
		path.join(r, "tin-hieu", "gom", "gom-1.md"),
		vietGom(kit, {
			dot: "gom-1",
			den: DEN,
			nhom: [
				["G1", "Trưởng phòng ban thấy số tuần trước", ["crm-4"]],
				["G2", "Nhân viên căn chỉnh OKR với phòng khác", ["crm-5"]],
				["G3", "Nhân viên tìm được quy trình", ["crm-6"]],
				["G4", "Nhân viên nhận nhắc đúng giờ", ["crm-7"]],
				["G5", "Trưởng phòng ban biết việc của phòng mình", ["crm-8"]],
			],
			le: [["crm-2", "lời cảm ơn, không đòi thay đổi gì"]],
			phu: [["crm-3", "giao-x"]],
		}),
	);
	const hoSo = { "giao-x": GIAO, "viec-h4": "approved", "viec-h5": GIAO };
	for (const [slug, st] of Object.entries(hoSo)) {
		const d = path.join(r, "_acceptance", slug);
		mkdirSync(d, { recursive: true });
		writeFileSync(path.join(d, "contract.md"), HD(slug, st));
		if (st === GIAO)
			writeFileSync(path.join(d, "evidence-report.md"), EV(slug));
	}
	mkdirSync(path.join(r, "docs"), { recursive: true });
	writeFileSync(
		path.join(r, "docs", "lo-trinh.json"),
		JSON.stringify(
			{
				schema: 1,
				ten: "Lộ trình mẫu",
				hang: [
					{ ma: "H3", cau_giao: "«việc ba»", dot: "gom-1", phu: ["G3"] },
					{
						ma: "H4",
						cau_giao: "«việc bốn»",
						dot: "gom-1",
						phu: ["G4"],
						slug: "viec-h4",
					},
					{
						ma: "H5",
						cau_giao: "«việc năm»",
						dot: "gom-1",
						phu: ["G5"],
						slug: "viec-h5",
					},
				],
				chan_troi: [
					{ ma: "CT1", dot: "gom-1", phu: ["G2"], ly_do: "chờ chu kỳ quý I" },
				],
			},
			null,
			2,
		),
	);
	git(r, "add", "-A");
	git(r, "-c", "commit.gpgsign=false", "commit", "-qm", "kho mau");
	const ve = spawnSync(
		process.execPath,
		[path.join(kit, "scripts", "product-map.mjs"), "--root", r],
		{ encoding: "utf8" },
	);
	if (ve.status !== 0)
		throw new Error(`bo ve kit hong: ${ve.stderr.slice(0, 400)}`);
	return r;
}

if (import.meta.main) {
	const { thuMuc, sha } = layKit();
	try {
		const r = dungKhoMau(thuMuc);
		mkdirSync(MAU_RA, { recursive: true });
		writeFileSync(
			path.join(MAU_RA, "LO-TRINH.mau.html"),
			readFileSync(path.join(r, "LO-TRINH.html"), "utf8"),
		);
		writeFileSync(
			path.join(MAU_RA, "nguon.json"),
			`${JSON.stringify({ kit_origin_main: sha }, null, "\t")}\n`,
		);
		rmSync(r, { recursive: true, force: true });
		console.log(`sinh-mau: LO-TRINH.mau.html tu kit ${sha.slice(0, 9)}`);
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}
