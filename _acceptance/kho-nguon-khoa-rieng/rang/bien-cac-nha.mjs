import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC_KHO = join(dirname(TEP), "..", "..", "..");
const BIEN = "KHO_TAI_LIEU_BLOB_TOKEN";
const LOGO = "BLOB_READ_WRITE_TOKEN";
const CUM_KHONG_GAN = "không gắn";
const TIEU_DE_API = "## Kho tài liệu: nguồn";

const T = {
	envViDu: ".env.example",
	xacThuc: "apps/api/src/config/env.validation.ts",
	turboGoc: "turbo.json",
	turboApi: "apps/api/turbo.json",
	turboAgent: "apps/agent/turbo.json",
	moiTruong: "docs/environment.md",
	api: "docs/api.md",
	blobNguon: "packages/db/src/blob-nguon.ts",
	agent: "apps/agent/agent",
	dispatch: "apps/agent/agent/lib/dispatch.ts",
};

const doc = (goc, t) => readFileSync(join(goc, t), "utf8");
function boChuThich(van) {
	let ra = "";
	let i = 0;
	while (i < van.length) {
		const c = van[i];
		if (c === '"') {
			let j = i + 1;
			while (j < van.length && van[j] !== '"') j += van[j] === "\\" ? 2 : 1;
			ra += van.slice(i, j + 1);
			i = j + 1;
		} else if (van.startsWith("//", i)) {
			const het = van.indexOf("\n", i);
			i = het < 0 ? van.length : het;
		} else if (van.startsWith("/*", i)) {
			const het = van.indexOf("*/", i + 2);
			i = het < 0 ? van.length : het + 2;
		} else {
			ra += c;
			i += 1;
		}
	}
	return ra.replace(/,(\s*[}\]])/g, "$1");
}

const docJson = (goc, t) => JSON.parse(boChuThich(doc(goc, t)));

function ghiChuTren(van, dong) {
	const dongs = van.split("\n");
	const i = dongs.findIndex((d) => new RegExp(`^#?\\s*${dong}=`).test(d));
	if (i < 0) return null;
	const khoi = [];
	for (let j = i - 1; j >= 0 && dongs[j].startsWith("#"); j -= 1)
		khoi.unshift(dongs[j]);
	return khoi.join("\n");
}

function thanMuc(van, tieuDe) {
	const dau = van.indexOf(`${tieuDe}\n`);
	if (dau < 0) return null;
	const sau = van.indexOf("\n## ", dau + tieuDe.length);
	return van.slice(dau, sau < 0 ? undefined : sau);
}

function mangEnv(turbo) {
	const ra = [...(turbo.globalEnv ?? [])];
	for (const nv of Object.values(turbo.tasks ?? {})) ra.push(...(nv.env ?? []));
	return ra;
}

function tepTs(thuMuc) {
	const ra = [];
	for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) ra.push(...tepTs(duong));
		else if (muc.name.endsWith(".ts")) ra.push(duong);
	}
	return ra;
}

function kiemTurboCon(goc, t, loi) {
	const turbo = docJson(goc, t);
	let so = 0;
	for (const [ten, nv] of Object.entries(turbo.tasks ?? {})) {
		const qua = nv.passThroughEnv ?? [];
		if (!qua.includes(LOGO)) continue;
		so += 1;
		if (!qua.includes(BIEN)) loi.push(`thieu nha: ${t} ${ten}`);
	}
	if (so === 0) loi.push(`thieu nha: ${t} khong task nao khai ${LOGO}`);
	return so;
}

function kiem(goc) {
	const loi = [];
	const co = [];

	const ghiChu = ghiChuTren(doc(goc, T.envViDu), BIEN);
	if (ghiChu === null) loi.push("thieu nha: .env.example");
	else {
		co.push(".env.example");
		if (!/private/i.test(ghiChu))
			loi.push("ghi chu .env.example thieu store private");
		if (!ghiChu.includes(CUM_KHONG_GAN))
			loi.push("ghi chu .env.example thieu khong gan du an");
	}

	if (new RegExp(`${BIEN}\\?:\\s*string`).test(doc(goc, T.xacThuc)))
		co.push("env.validation.ts");
	else loi.push("thieu nha: env.validation.ts");

	const turboGoc = docJson(goc, T.turboGoc);
	if ((turboGoc.globalPassThroughEnv ?? []).includes(BIEN))
		co.push("turbo globalPassThroughEnv");
	else loi.push("thieu nha: turbo globalPassThroughEnv");

	for (const t of [T.turboApi, T.turboAgent]) {
		const truoc = loi.length;
		const so = kiemTurboCon(goc, t, loi);
		if (loi.length === truoc) co.push(`${t} (${so} task)`);
	}

	if (
		doc(goc, T.moiTruong)
			.split("\n")
			.some((d) => d.startsWith(`| \`${BIEN}\``))
	)
		co.push("docs/environment.md");
	else loi.push("thieu nha: docs/environment.md");

	const than = thanMuc(doc(goc, T.api), TIEU_DE_API);
	if (than?.includes(BIEN) && !than.includes(LOGO))
		co.push("docs/api.md muc nguon");
	else loi.push("thieu nha: docs/api.md muc nguon");

	for (const t of [T.turboGoc, T.turboApi, T.turboAgent])
		if (mangEnv(docJson(goc, t)).includes(BIEN))
			loi.push(`bi mat nam trong env: ${t}`);

	if (doc(goc, T.blobNguon).includes(LOGO))
		loi.push("kho nguon con doc khoa logo");

	const docNguon = tepTs(join(goc, T.agent)).filter((p) =>
		readFileSync(p, "utf8").includes("khoNguonVercel"),
	);
	console.log(`quet ${docNguon.length} tep agent doc nguon`);
	if (docNguon.length === 0)
		loi.push("khong quet duoc tep agent doc nguon nao");
	for (const p of docNguon) {
		const van = readFileSync(p, "utf8");
		if (van.includes(LOGO) || van.includes("blobEnabled"))
			loi.push(`agent doc nguon con doc khoa logo: ${relative(goc, p)}`);
	}

	for (const nha of co) console.log(`${BIEN}: co o ${nha}`);
	for (const l of loi) console.log(l);
	return loi.length === 0 && co.length === 7 ? 0 : 1;
}

function banSao(sua) {
	const tam = mkdtempSync(join(tmpdir(), "knr-cac-nha-"));
	for (const t of Object.values(T)) {
		if (t === T.dispatch) continue;
		const nguon = join(GOC_KHO, t);
		if (!existsSync(nguon)) continue;
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		cpSync(nguon, join(tam, t), { recursive: true });
	}
	sua(tam);
	return tam;
}

const suaJson = (goc, t, f) =>
	writeFileSync(join(goc, t), JSON.stringify(f(docJson(goc, t)), null, "\t"));
const suaChu = (goc, t, f) => writeFileSync(join(goc, t), f(doc(goc, t)));

const CA_DO = [
	[
		"thieu nha: turbo globalPassThroughEnv",
		(g) =>
			suaJson(g, T.turboGoc, (x) => ({
				...x,
				globalPassThroughEnv: x.globalPassThroughEnv.filter((b) => b !== BIEN),
			})),
	],
	[
		"bi mat nam trong env",
		(g) =>
			suaJson(g, T.turboGoc, (x) => ({
				...x,
				tasks: {
					...x.tasks,
					build: {
						...x.tasks.build,
						env: [...(x.tasks.build.env ?? []), BIEN],
					},
				},
			})),
	],
	[
		`thieu nha: ${T.turboAgent} dev`,
		(g) =>
			suaJson(g, T.turboAgent, (x) => ({
				...x,
				tasks: {
					...x.tasks,
					dev: {
						...x.tasks.dev,
						passThroughEnv: x.tasks.dev.passThroughEnv.filter(
							(b) => b !== BIEN,
						),
					},
				},
			})),
	],
	[
		"kho nguon con doc khoa logo",
		(g) => suaChu(g, T.blobNguon, (v) => `${v}\nconst cu = "${LOGO}";\n`),
	],
	[
		"thieu nha: docs/api.md muc nguon",
		(g) =>
			suaChu(g, T.api, (v) => {
				const than = thanMuc(v, TIEU_DE_API) ?? "";
				return v.replace(than, than.replaceAll(BIEN, "KHOA_KHAC"));
			}),
	],
	[
		"ghi chu .env.example thieu khong gan du an",
		(g) => suaChu(g, T.envViDu, (v) => v.replaceAll(CUM_KHONG_GAN, "")),
	],
	[
		"agent doc nguon con doc khoa logo",
		(g) =>
			suaChu(g, T.dispatch, (v) => `${v}\nconst cu = process.env.${LOGO};\n`),
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
				`chieu do -> exit ${r.status} · ${trung ? ghim : `KHONG BAT «${ghim}»`}`,
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
