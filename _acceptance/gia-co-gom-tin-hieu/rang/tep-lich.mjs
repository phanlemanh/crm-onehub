import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = join(GOC, ".github", "workflows", "tin-hieu-gom.yml");
const LENH = "bun scripts/tin-hieu/gom-lich.ts";
const TOI_THIEU = [2, 1, 302];

const soPhienBan = (s) => s.split(".").map(Number);
const khongCuHon = (a, b) => {
	for (let i = 0; i < b.length; i++) {
		if ((a[i] ?? 0) !== b[i]) return (a[i] ?? 0) > b[i];
	}
	return true;
};

export function phienBanClaude(chu) {
	const m = chu.match(/@anthropic-ai\/claude-code@(\d+\.\d+\.\d+)/);
	return m ? m[1] : null;
}

export function kiem(chu) {
	const y = Bun.YAML.parse(chu);
	const buoc = Object.values(y.jobs ?? {}).flatMap((j) => j.steps ?? []);
	const chay = buoc.map((b) => String(b.run ?? ""));
	const lay = buoc.filter((b) =>
		String(b.uses ?? "").startsWith("actions/checkout"),
	);
	const cai = buoc.find((b) => String(b.run ?? "").includes("plugin install"));
	const gom = buoc.find((b) => String(b.run ?? "").trim() === LENH);
	const pb = phienBanClaude(chu);
	return [
		[
			"1 buoc lay ma khong luu token",
			lay.length > 0 &&
				lay.every((b) => b.with?.["persist-credentials"] === false),
			"checkout luu token",
		],
		[
			"2 khong buoc nao ghi cau hinh git toan cuc",
			!chay.some(
				(r) =>
					r.includes("git config --global") ||
					r.includes("git config --system"),
			),
			"token vao cau hinh git toan cuc",
		],
		[
			"3 buoc cai goi kit dua token qua cau hinh git muc lenh cua chinh no",
			Boolean(cai) &&
				cai.env?.GIT_CONFIG_COUNT === "1" &&
				String(cai.env?.GIT_CONFIG_KEY_0 ?? "").startsWith("url.") &&
				String(cai.env?.GIT_CONFIG_KEY_0 ?? "").endsWith(".insteadOf") &&
				String(cai.env?.GIT_CONFIG_KEY_0 ?? "").includes(
					"secrets.TIN_HIEU_TOKEN",
				),
			"buoc cai goi khong dua token qua cau hinh muc lenh",
		],
		[
			"4 buoc gom khong nhan GH_TOKEN, nhan TIN_HIEU_TOKEN va ANTHROPIC_API_KEY",
			Boolean(gom) &&
				!Object.hasOwn(gom.env ?? {}, "GH_TOKEN") &&
				Object.hasOwn(gom.env ?? {}, "TIN_HIEU_TOKEN") &&
				Object.hasOwn(gom.env ?? {}, "ANTHROPIC_API_KEY"),
			"buoc gom nhan GH_TOKEN",
		],
		[
			"5 Claude Code ghim tu 2.1.302",
			pb !== null && khongCuHon(soPhienBan(pb), TOI_THIEU),
			"Claude Code cu hon 2.1.302",
		],
	];
}

function inRa(dong) {
	for (const [ten, dung, ghim] of dong)
		console.log(`${dung ? "DUNG" : "SAI"} ${ten}${dung ? "" : ` — ${ghim}`}`);
	return dong.every(([, d]) => d);
}

const TIEM = [
	[
		"1",
		(s) => s.replace("          persist-credentials: false\n", ""),
		"checkout luu token",
	],
	[
		"2",
		(s) =>
			s.replace(
				"          claude plugin marketplace add",
				'          git config --global url."https://x:t@github.com/".insteadOf "https://github.com/"\n          claude plugin marketplace add',
			),
		"token vao cau hinh git toan cuc",
	],
	[
		"5",
		(s) =>
			s.replace(
				/@anthropic-ai\/claude-code@\d+\.\d+\.\d+/,
				"@anthropic-ai/claude-code@2.1.281",
			),
		"Claude Code cu hon 2.1.302",
	],
];

if (import.meta.main) {
	const that = readFileSync(TEP, "utf8");
	const xanh = inRa(kiem(that));
	let tuKiem = true;
	if (process.argv.includes("--tu-kiem")) {
		const tam = mkdtempSync(join(tmpdir(), "gcg-tep-lich-"));
		try {
			for (const [so, tiem, ghim] of TIEM) {
				const ban = tiem(that);
				if (ban === that) {
					console.log(`SAI tu-kiem ${so}: nhat tiem khong doi tep`);
					tuKiem = false;
					continue;
				}
				writeFileSync(join(tam, "lich.yml"), ban);
				const dong = kiem(readFileSync(join(tam, "lich.yml"), "utf8"));
				const sai = dong.filter(([, d]) => !d);
				const dung =
					sai.length === 1 && sai[0][0].startsWith(so) && sai[0][2] === ghim;
				console.log(
					`${dung ? "DUNG" : "SAI"} tu-kiem ban tiem dong ${so} -> "${ghim}"`,
				);
				tuKiem &&= dung;
			}
		} finally {
			rmSync(tam, { recursive: true, force: true });
		}
	}
	console.log(`KET LUAN ${xanh && tuKiem ? 0 : 1}`);
	process.exit(xanh && tuKiem ? 0 : 1);
}
