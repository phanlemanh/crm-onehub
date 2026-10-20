import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { taoKho, xoaKho } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { conTran, ghiLuot, keHoach } from "./chi-phi";
import { GOC, MTV, sha256 } from "./khuon";

const pg = createRequire(join(GOC, "packages/db/package.json"))("pg");

export const DO = {
	tepAgent: join(GOC, MTV.suaTam.agentBuilder),
	moDau: "export default defineAgent({",
	chenLow: 'export default defineAgent({\n\treasoning: "low",',
	eval: "agent-builder",
	cuaSo: 1_000_000,
	phienGoc: /▸ session (wrun_\S+) on channel:crm/,
	ketQua: /^(✓|✗)\s+agent-builder\b.*$/mu,
	quaTran: "aborted due to timeout",
} as const;

type BienThe = "flash" | "flash-low";
const laLow = (b: BienThe) => b === "flash-low";

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
		const hang = (r.rows as HangPg[]).map((h) => ({
			...h,
			at: h.at instanceof Date ? h.at.toISOString() : String(h.at),
			costUsd: h.costUsd === null ? null : Number(h.costUsd),
		}));
		const con = [
			...new Set(
				hang.filter((h) => h.sessionId !== phien).map((h) => h.sessionId),
			),
		];
		const sk = con.length
			? await c.query(
					`select "sessionId", data->>'modelId' as "modelId" from "agentEvent" where type = $1 and "sessionId" = any($2) order by "emittedAt" asc`,
					[MTV.suKienChon, con],
				)
			: { rows: [] };
		return {
			hang,
			suKien: (sk.rows as { sessionId: string; modelId: string | null }[])
				.filter((x) => x.modelId)
				.map((x) => ({ sessionId: x.sessionId, modelId: x.modelId ?? "" })),
		};
	} finally {
		await c.end();
	}
}

async function motLuot(b: BienThe, luot: number, goc: string) {
	const ten = `${b}-${luot}`;
	const tepLog = join(MTV.evidence, `luot-${ten}.log`);
	if (laLow(b)) writeFileSync(DO.tepAgent, goc.replace(DO.moDau, DO.chenLow));
	const bamAgent = sha256(readFileSync(DO.tepAgent, "utf8"));
	const kho = `mtv-${b.replace(/[^a-z0-9]/g, "")}-${luot}`;
	let url = "";
	const batDau = new Date();
	try {
		url = taoKho(kho);
		datModel(url, MTV.model);
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
		const { hang, suKien } = phien
			? await ketXuat(url, phien)
			: { hang: [], suKien: [] };
		const tepCp = `aichiphi-${ten}.json`;
		const tepSk = `su-kien-${ten}.json`;
		writeFileSync(
			join(MTV.evidence, tepCp),
			`${JSON.stringify(hang, null, 2)}\n`,
		);
		writeFileSync(
			join(MTV.evidence, tepSk),
			`${JSON.stringify(suKien, null, 2)}\n`,
		);
		const modelCon = [...new Set(suKien.map((s) => s.modelId))];
		ghiLuot({
			vai: "tac-nhan",
			luot: ten,
			trang_thai: "da-chay",
			usd: Number(hang.reduce((s, h) => s + (h.costUsd ?? 0), 0).toFixed(6)),
			tep: tepCp,
		});
		return {
			bien_the: b,
			luot,
			model: MTV.model,
			model_phien_con: modelCon.length === 1 ? (modelCon[0] ?? null) : null,
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
			aichiphi: tepCp,
			su_kien: tepSk,
		};
	} finally {
		if (laLow(b)) writeFileSync(DO.tepAgent, goc);
		if (url && !xoaKho(kho)) console.log(`don hong: khong xoa duoc kho ${kho}`);
	}
}

function docDong(): string[] {
	const tep = join(MTV.evidence, MTV.tep.tacNhan);
	return existsSync(tep)
		? readFileSync(tep, "utf8").split("\n").filter(Boolean)
		: [];
}

async function main() {
	mkdirSync(MTV.evidence, { recursive: true });
	const ke = keHoach();
	const goc = readFileSync(DO.tepAgent, "utf8");
	if (!goc.includes(DO.moDau))
		throw new Error("agent.ts khong co dong mo defineAgent de chen reasoning");
	const bamGoc = sha256(goc);
	writeFileSync(
		join(MTV.evidence, MTV.tep.keHoachTacNhan),
		`${JSON.stringify({ bam_agent_goc: bamGoc, bam_agent_low: sha256(goc.replace(DO.moDau, DO.chenLow)) }, null, 2)}\n`,
	);
	const dong = docDong();
	const daCo = new Set(
		dong.map((d) => {
			const x = JSON.parse(d) as { bien_the: string; luot: number };
			return `${x.bien_the}-${x.luot}`;
		}),
	);
	let traLai = false;
	try {
		for (let luot = 1; luot <= ke.tac_nhan.so_luot; luot++) {
			for (const b of ke.tac_nhan.bien_the) {
				if (daCo.has(`${b}-${luot}`)) continue;
				if (!conTran()) {
					ghiLuot({
						vai: "tac-nhan",
						luot: `${b}-${luot}`,
						trang_thai: "dung-vi-tran",
						usd: null,
						tep: null,
					});
					console.log(`${b} luot ${luot}: dung vi tran`);
					continue;
				}
				const r = await motLuot(b, luot, goc);
				console.log(
					`${r.bien_the} luot ${luot}: ${r.ket_qua} ${r.giay}s model con ${r.model_phien_con ?? "?"} phien ${r.phien_goc || "?"}`,
				);
				dong.push(JSON.stringify(r));
				writeFileSync(
					join(MTV.evidence, MTV.tep.tacNhan),
					`${dong.join("\n")}\n`,
				);
			}
		}
	} finally {
		if (sha256(readFileSync(DO.tepAgent, "utf8")) !== bamGoc) {
			writeFileSync(DO.tepAgent, goc);
			traLai = true;
		}
	}
	if (traLai)
		throw new Error("agent.ts khong tra ve ban goc — da ghi lai ban goc");
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
