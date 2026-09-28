import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC_KHO = join(dirname(TEP), "..", "..", "..");
const BIEN = "KHO_TAI_LIEU_AI_GATEWAY_API_KEY";
const ENV_VI_DU = ".env.example";
const TURBO = "turbo.json";
const NANG_LUC = "apps/agent/agent/lib/capabilities.ts";

function mangEnv(turbo) {
	const ra = [...(turbo.globalEnv ?? [])];
	for (const nv of Object.values(turbo.tasks ?? {})) ra.push(...(nv.env ?? []));
	return ra;
}

function kiem(goc) {
	const loi = [];
	const envViDu = readFileSync(join(goc, ENV_VI_DU), "utf8");
	const turbo = JSON.parse(readFileSync(join(goc, TURBO), "utf8"));
	const nangLuc = readFileSync(join(goc, NANG_LUC), "utf8");
	const nha = [
		[".env.example", new RegExp(`^#?\\s*${BIEN}=`, "m").test(envViDu)],
		[
			"turbo globalPassThroughEnv",
			(turbo.globalPassThroughEnv ?? []).includes(BIEN),
		],
		["capabilities.ts", nangLuc.includes(`"${BIEN}"`)],
	];
	for (const [ten, co] of nha) {
		if (co) console.log(`${BIEN}: co o ${ten}`);
		else loi.push(`thieu nha: ${ten}`);
	}
	if (mangEnv(turbo).includes(BIEN)) loi.push("bi mat nam trong env");
	for (const l of loi) console.log(l);
	return loi.length === 0 ? 0 : 1;
}

function banSao(sua) {
	const tam = mkdtempSync(join(tmpdir(), "msd-ba-nha-"));
	for (const t of [ENV_VI_DU, TURBO, NANG_LUC]) {
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		cpSync(join(GOC_KHO, t), join(tam, t));
	}
	const turbo = JSON.parse(readFileSync(join(tam, TURBO), "utf8"));
	writeFileSync(join(tam, TURBO), JSON.stringify(sua(turbo), null, "\t"));
	return tam;
}

const CA_DO = [
	[
		"thieu nha: turbo globalPassThroughEnv",
		(t) => ({
			...t,
			globalPassThroughEnv: t.globalPassThroughEnv.filter((b) => b !== BIEN),
		}),
	],
	[
		"bi mat nam trong env",
		(t) => ({
			...t,
			tasks: {
				...t.tasks,
				build: { ...t.tasks.build, env: [...(t.tasks.build.env ?? []), BIEN] },
			},
		}),
	],
];

function chieuDo() {
	let bat = 0;
	for (const [ghim, sua] of CA_DO) {
		const tam = banSao(sua);
		try {
			const r = spawnSync(process.execPath, [TEP, "--goc", tam], {
				encoding: "utf8",
			});
			const trung = r.status === 1 && r.stdout.includes(ghim);
			if (trung) bat += 1;
			console.log(
				`chieu do -> exit ${r.status} · ${trung ? ghim : `KHONG BAT (${r.stdout.trim()})`}`,
			);
		} finally {
			rmSync(tam, { recursive: true, force: true });
		}
	}
	return bat;
}

const [, , cheDo, duongDan] = process.argv;

if (cheDo === "--goc") process.exit(kiem(duongDan));

const bat = chieuDo();
if (bat !== CA_DO.length) {
	console.log(`doi chung: SAI — chieu do chi bat ${bat}/${CA_DO.length}`);
	process.exit(3);
}
console.log(`doi chung: do dung ${bat}/${CA_DO.length}`);
process.exit(kiem(GOC_KHO));
