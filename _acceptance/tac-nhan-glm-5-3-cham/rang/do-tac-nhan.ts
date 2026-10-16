import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	createWriteStream,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { taoKho, xoaKho } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GOC = resolve(import.meta.dir, "..", "..", "..");
const pg = createRequire(join(GOC, "packages/db/package.json"))("pg");

export const DO = {
	evidence: resolve(import.meta.dir, "..", "evidence"),
	tepAgent: join(GOC, "apps/agent/agent/subagents/agent_builder/agent.ts"),
	moDau: "export default defineAgent({",
	chenLow: 'export default defineAgent({\n\treasoning: "low",',
	eval: "agent-builder",
	soLuot: 3,
	cuaSo: 1_000_000,
	bienThe: [
		{ ten: "moc", model: "zai/glm-5.2-fast", low: false },
		{ ten: "glm53", model: "zai/glm-5.3", low: false },
		{ ten: "glm53-fast", model: "zai/glm-5.3-fast", low: false },
		{ ten: "glm53-low", model: "zai/glm-5.3", low: true },
	],
	phienGoc: /▸ session (wrun_\S+) on channel:crm/,
	ketQua: /^(✓|✗)\s+agent-builder\b.*$/mu,
	quaTran: "aborted due to timeout",
} as const;

type BienThe = (typeof DO.bienThe)[number];

const sha = (chu: string) =>
	new Bun.CryptoHasher("sha256").update(chu).digest("hex");

function chay(
	lenh: string[],
	env: NodeJS.ProcessEnv,
	cwd: string,
	tep: string,
) {
	const ghi = createWriteStream(tep);
	return new Promise<number>((xong) => {
		const con = spawn(lenh[0] ?? "", lenh.slice(1), { cwd, env });
		con.stdout.pipe(ghi, { end: false });
		con.stderr.pipe(ghi, { end: false });
		con.on("error", (loi) => {
			ghi.end(`\n${loi.message}\n`);
			xong(2);
		});
		con.on("close", (ma) => {
			ghi.end();
			ghi.on("finish", () => xong(ma ?? 2));
		});
	});
}

function datModel(url: string, model: string): string {
	const r = spawnSync(
		"bun",
		[
			"-e",
			`import { db } from ${JSON.stringify(join(GOC, "packages/db/src/client.ts"))};
import { readAgentModel, writeAgentModel } from ${JSON.stringify(join(GOC, "packages/db/src/settings.ts"))};
try {
	await writeAgentModel(db, ${JSON.stringify({ id: model, contextWindowTokens: DO.cuaSo })});
	console.log(JSON.stringify(await readAgentModel(db)));
} finally {
	await db.$disconnect();
}`,
		],
		{ cwd: GOC, encoding: "utf8", env: { ...process.env, DATABASE_URL: url } },
	);
	if (r.status !== 0)
		throw new Error(
			`khong ghi duoc o model: ${(r.stderr || r.stdout).trim().split("\n").at(-1)}`,
		);
	const doc = JSON.parse(r.stdout.trim().split("\n").at(-1) ?? "{}") as {
		id?: string;
	};
	if (doc.id !== model)
		throw new Error(`o model doc lai ${doc.id}, khong phai ${model}`);
	return doc.id;
}

type HangPg = {
	id: string;
	at: Date | string;
	sessionId: string;
	phienCha: string | null;
	modelId: string | null;
	inputTokens: number | null;
	outputTokens: number | null;
	costUsd: string | number | null;
};

async function ketXuat(url: string, phien: string) {
	const c = new pg.Client({ connectionString: url });
	await c.connect();
	try {
		const r = await c.query(
			`select id, at, "sessionId", "phienCha", "modelId", "inputTokens", "outputTokens", "costUsd" from "aiChiPhi" where "sessionId" = $1 or "phienCha" = $1 order by at asc`,
			[phien],
		);
		return (r.rows as HangPg[]).map((h) => ({
			...h,
			at: h.at instanceof Date ? h.at.toISOString() : String(h.at),
			costUsd: h.costUsd === null ? null : Number(h.costUsd),
		}));
	} finally {
		await c.end();
	}
}

async function motLuot(b: BienThe, luot: number, goc: string) {
	const ten = `${b.ten}-${luot}`;
	const tepLog = join(DO.evidence, `luot-${ten}.log`);
	if (b.low) writeFileSync(DO.tepAgent, goc.replace(DO.moDau, DO.chenLow));
	const bamAgent = sha(readFileSync(DO.tepAgent, "utf8"));
	const kho = `tnc-${b.ten.replace(/[^a-z0-9]/g, "")}-${luot}`;
	let url = "";
	const batDau = new Date();
	try {
		url = taoKho(kho);
		datModel(url, b.model);
		await chay(
			[
				join(GOC, "apps/agent/node_modules/.bin/eve"),
				"eval",
				DO.eval,
				"--verbose",
			],
			{
				...process.env,
				DATABASE_URL: url,
				AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
				ZALO_BOT_TOKEN: "",
				CRM_TELEMETRY_DISABLED: "1",
			},
			join(GOC, "apps/agent"),
			tepLog,
		);
		const ketThuc = new Date();
		const log = readFileSync(tepLog, "utf8");
		const phien = log.match(DO.phienGoc)?.[1] ?? "";
		const kq = log.match(DO.ketQua);
		const qua = kq?.[1] === "✓";
		const hang = phien ? await ketXuat(url, phien) : [];
		const tepCp = join(DO.evidence, `aichiphi-${ten}.json`);
		writeFileSync(tepCp, `${JSON.stringify(hang, null, 2)}\n`);
		return {
			bien_the: b.ten,
			luot,
			model: b.model,
			bat_dau: batDau.toISOString(),
			ket_thuc: ketThuc.toISOString(),
			giay: Number(((ketThuc.getTime() - batDau.getTime()) / 1000).toFixed(1)),
			ket_qua: qua ? "qua" : "hong",
			ly_do: qua
				? null
				: log.includes(DO.quaTran)
					? "qua tran 180 giay"
					: (kq?.[0] ?? "khong co dong ket qua"),
			bi_cat: !qua && log.includes(DO.quaTran),
			phien_goc: phien,
			bam_agent: bamAgent,
			nhat_ky: `luot-${ten}.log`,
			aichiphi: `aichiphi-${ten}.json`,
		};
	} finally {
		if (b.low) writeFileSync(DO.tepAgent, goc);
		if (url && !xoaKho(kho)) console.log(`don hong: khong xoa duoc kho ${kho}`);
	}
}

async function main() {
	mkdirSync(DO.evidence, { recursive: true });
	const goc = readFileSync(DO.tepAgent, "utf8");
	if (!goc.includes(DO.moDau))
		throw new Error("agent.ts khong co dong mo defineAgent de chen reasoning");
	const bamGoc = sha(goc);
	const bamLow = sha(goc.replace(DO.moDau, DO.chenLow));
	writeFileSync(
		join(DO.evidence, "ke-hoach.json"),
		`${JSON.stringify({ bien_the: DO.bienThe, so_luot: DO.soLuot, bam_agent_goc: bamGoc, bam_agent_low: bamLow }, null, 2)}\n`,
	);
	const dong: string[] = [];
	for (let luot = 1; luot <= DO.soLuot; luot++) {
		for (const b of DO.bienThe) {
			const r = await motLuot(b, luot, goc);
			console.log(
				`${r.bien_the} luot ${luot}: ${r.ket_qua} ${r.giay}s phien ${r.phien_goc || "?"}`,
			);
			dong.push(JSON.stringify(r));
			writeFileSync(
				join(DO.evidence, "tac-nhan.jsonl"),
				`${dong.join("\n")}\n`,
			);
		}
	}
	if (sha(readFileSync(DO.tepAgent, "utf8")) !== bamGoc)
		throw new Error("agent.ts khong tra ve ban goc");
}

if (import.meta.main) {
	try {
		await main();
	} catch (loi) {
		console.log(
			`KHONG DO DUOC: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		process.exit(2);
	}
}
