import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { taoKho, xoaKho } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	conTran,
	ghiLuot,
	keHoach,
	ketXuatPhien,
	ungVienChon,
} from "./chi-phi";
import {
	type DongTacNhan,
	DUONG,
	GOC,
	type HangChiPhi,
	khoaChi,
	khuonDongTacNhan,
	khuonKetXuat,
	khuonSuKienChon,
	laLow,
	MTV,
	modelCua,
	type SuKienChon,
	sha256,
	soCon,
} from "./khuon";

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

export const banLow = (goc: string) => goc.replace(DO.moDau, DO.chenLow);

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

export type VaoDong = {
	ma: string;
	bienThe: string;
	luot: number;
	model: string;
	batDau: Date;
	ketThuc: Date;
	log: string;
	hang: HangChiPhi[];
	suKien: SuKienChon;
	bamAgent: string;
};

export const phienCuaLog = (log: string) => log.match(DO.phienGoc)?.[1] ?? "";

export function dongTacNhan(v: VaoDong): DongTacNhan {
	const kq = v.log.match(DO.ketQua);
	const qua = kq?.[1] === "✓";
	const phien = phienCuaLog(v.log);
	const modelCon = [...new Set(v.suKien.map((s) => s.modelId))];
	return khuonDongTacNhan.parse({
		bien_the: v.bienThe,
		luot: v.luot,
		model: v.model,
		model_phien_con: modelCon.length === 1 ? (modelCon[0] ?? null) : null,
		bat_dau: v.batDau.toISOString(),
		ket_thuc: v.ketThuc.toISOString(),
		giay: Number(
			((v.ketThuc.getTime() - v.batDau.getTime()) / 1000).toFixed(1),
		),
		ket_qua: qua ? "qua" : "hong",
		ly_do: qua
			? null
			: v.log.includes(DO.quaTran)
				? "qua tran 180 giay"
				: (kq?.[0] ?? "khong co dong ket qua"),
		bi_cat: !qua && v.log.includes(DO.quaTran),
		phien_goc: phien,
		bam_agent: v.bamAgent,
		nhat_ky: DUONG.nhatKy(v.bienThe, v.luot),
		aichiphi: DUONG.aichiphi(v.bienThe, v.luot),
		su_kien: DUONG.suKien(v.bienThe, v.luot),
		ung_vien: v.ma,
		phien_con: soCon(v.hang, phien),
	});
}

export function ghiBangChungTacNhan(
	ev: string,
	d: DongTacNhan,
	hang: HangChiPhi[],
	suKien: SuKienChon,
) {
	writeFileSync(
		join(ev, d.aichiphi),
		`${JSON.stringify(khuonKetXuat.parse(hang), null, 2)}\n`,
	);
	writeFileSync(
		join(ev, d.su_kien),
		`${JSON.stringify(khuonSuKienChon.parse(suKien), null, 2)}\n`,
	);
	ghiLuot(
		{
			vai: "tac-nhan",
			luot: khoaChi("tac-nhan", d.bien_the, d.luot),
			trang_thai: "da-chay",
			usd: Number(hang.reduce((s, h) => s + (h.costUsd ?? 0), 0).toFixed(6)),
			tep: d.aichiphi,
			luc: d.ket_thuc,
		},
		ev,
	);
}

export function docDong(ev: string): string[] {
	const tep = join(ev, MTV.tep.tacNhan);
	return existsSync(tep)
		? readFileSync(tep, "utf8").split("\n").filter(Boolean)
		: [];
}

export function themDong(ev: string, d: DongTacNhan) {
	const dong = docDong(ev);
	dong.push(JSON.stringify(d));
	writeFileSync(join(ev, MTV.tep.tacNhan), `${dong.join("\n")}\n`);
}

export function daCoLuot(ev: string): Set<string> {
	return new Set(
		docDong(ev).map((d) => {
			const x = khuonDongTacNhan.parse(JSON.parse(d));
			return khoaChi("tac-nhan", x.bien_the, x.luot);
		}),
	);
}

async function motLuot(
	ma: string,
	b: string,
	luot: number,
	model: string,
	goc: string,
) {
	const tepLog = join(MTV.evidence, DUONG.nhatKy(b, luot));
	if (laLow(b)) writeFileSync(DO.tepAgent, banLow(goc));
	const bamAgent = sha256(readFileSync(DO.tepAgent, "utf8"));
	const kho = `mtv-${b.replace(/[^a-z0-9]/g, "")}-${luot}`;
	let url = "";
	const batDau = new Date();
	try {
		url = taoKho(kho);
		datModel(url, model);
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
		const phien = phienCuaLog(log);
		const { hang, suKien } = phien
			? await ketXuatPhien(url, phien)
			: { hang: [], suKien: [] };
		const d = dongTacNhan({
			ma,
			bienThe: b,
			luot,
			model,
			batDau,
			ketThuc,
			log,
			hang,
			suKien,
			bamAgent,
		});
		ghiBangChungTacNhan(MTV.evidence, d, hang, suKien);
		return d;
	} finally {
		if (laLow(b)) writeFileSync(DO.tepAgent, goc);
		if (url && !xoaKho(kho)) console.log(`don hong: khong xoa duoc kho ${kho}`);
	}
}

async function main() {
	mkdirSync(MTV.evidence, { recursive: true });
	const ke = keHoach();
	const chon = ungVienChon(ke.tac_nhan.ung_vien.map((u) => u.ma));
	const goc = readFileSync(DO.tepAgent, "utf8");
	if (!goc.includes(DO.moDau))
		throw new Error("agent.ts khong co dong mo defineAgent de chen reasoning");
	const bamGoc = sha256(goc);
	writeFileSync(
		join(MTV.evidence, MTV.tep.keHoachTacNhan),
		`${JSON.stringify({ bam_agent_goc: bamGoc, bam_agent_low: sha256(banLow(goc)) }, null, 2)}\n`,
	);
	const daCo = daCoLuot(MTV.evidence);
	let traLai = false;
	try {
		for (const u of ke.tac_nhan.ung_vien.filter((x) => chon.includes(x.ma))) {
			const model = modelCua(ke, u.ma);
			for (let luot = 1; luot <= ke.tac_nhan.so_luot; luot++) {
				for (const b of u.bien_the) {
					const khoa = khoaChi("tac-nhan", b, luot);
					if (daCo.has(khoa)) continue;
					if (!conTran()) {
						ghiLuot({
							vai: "tac-nhan",
							luot: khoa,
							trang_thai: "dung-vi-tran",
							usd: null,
							tep: null,
						});
						console.log(`${b} luot ${luot}: dung vi tran`);
						continue;
					}
					const r = await motLuot(u.ma, b, luot, model, goc);
					console.log(
						`${r.bien_the} luot ${luot}: ${r.ket_qua} ${r.giay}s model con ${r.model_phien_con ?? "?"} phien ${r.phien_goc || "?"}`,
					);
					themDong(MTV.evidence, r);
				}
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
