import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { conTran, ghiLuot, keHoach, khoaGateway } from "./chi-phi";
import { bamCommit } from "./do-kho";
import { GOC, khuonSoanMh4, MTV, type SoanMh4, sha256, z } from "./khuon";

export const DS = {
	tep: join(GOC, MTV.suaTam.agentOkr),
	dongModel: 'const MO_HINH = "google/gemini-3.8-flash";',
	lenh: join(MTV.rang, "do-soan-chay.mjs"),
} as const;

export function banSuaTam(goc: string): string {
	if (!goc.includes(DS.dongModel))
		throw new Error("config.ts cua agent-okr khong co dong MO_HINH mong doi");
	return goc.replace(
		DS.dongModel,
		`const MO_HINH = ${JSON.stringify(MTV.model)};`,
	);
}

const khuonTraVe = z.object({ model: z.string().optional() }).nullable();

function modelCauHinh(): string | null {
	const r = spawnSync(
		"bun",
		[
			"-e",
			`const { TRO_LY_OKR_SOAN } = await import(${JSON.stringify(DS.tep)}); console.log(TRO_LY_OKR_SOAN.model);`,
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	return r.status === 0 ? r.stdout.trim().split("\n").at(-1) || null : null;
}

async function modelGateway(ma: string): Promise<string | null> {
	const res = await fetch(`${MTV.urlGateway}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${khoaGateway()}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: ma,
			messages: [{ role: "user", content: "ok" }],
			max_tokens: 1,
		}),
	});
	const t = khuonTraVe.safeParse(await res.json().catch(() => null));
	return t.success ? (t.data?.model ?? null) : null;
}

function chayLuot(luot: number) {
	return new Promise<number>((xong) => {
		const con = spawn("bun", [DS.lenh, "--luot", String(luot)], {
			cwd: GOC,
			stdio: "inherit",
			env: process.env,
		});
		for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"] as const)
			process.on(tin, () => con.kill(tin));
		con.on("error", () => xong(2));
		con.on("exit", (m) => xong(m ?? 2));
	});
}

async function motLuot(luot: number, goc: string) {
	const sua = banSuaTam(goc);
	const tep = join(MTV.evidence, MTV.tep.soan(luot));
	writeFileSync(DS.tep, sua);
	let maCauHinh: string | null = null;
	let ma = 2;
	try {
		maCauHinh = modelCauHinh();
		if (maCauHinh !== MTV.model)
			throw new Error(
				`model cau hinh doc lai ${maCauHinh}, khong phai ${MTV.model}`,
			);
		ma = await chayLuot(luot);
	} finally {
		writeFileSync(DS.tep, goc);
	}
	if (ma !== 0 || !existsSync(tep))
		throw new Error(
			`do-soan-chay luot ${luot} thoat ${ma}, khong co ${MTV.tep.soan(luot)}`,
		);
	const tom = khuonSoanMh4
		.omit({ modelGateway: true, bamSuaTam: true, bamCommit: true })
		.parse(JSON.parse(readFileSync(tep, "utf8")));
	const ra: SoanMh4 = khuonSoanMh4.parse({
		...tom,
		modelGateway: await modelGateway(tom.moHinh),
		bamSuaTam: sha256(sua),
		bamCommit: bamCommit(MTV.suaTam.agentOkr),
	});
	writeFileSync(tep, `${JSON.stringify(ra, null, 2)}\n`);
	ghiLuot({
		vai: "soan-okr",
		luot: String(luot),
		trang_thai: "da-chay",
		usd: Number(ra.usd.toFixed(6)),
		tep: MTV.tep.soan(luot),
	});
	return ra;
}

async function main() {
	const ke = keHoach();
	const goc = readFileSync(DS.tep, "utf8");
	const bamGoc = sha256(goc);
	let traLai = false;
	try {
		for (let luot = 1; luot <= ke.soan_okr.so_luot; luot++) {
			if (existsSync(join(MTV.evidence, MTV.tep.soan(luot)))) continue;
			if (!conTran()) {
				ghiLuot({
					vai: "soan-okr",
					luot: String(luot),
					trang_thai: "dung-vi-tran",
					usd: null,
					tep: null,
				});
				console.log(`soan luot ${luot}: dung vi tran`);
				continue;
			}
			const r = await motLuot(luot, goc);
			console.log(
				`soan luot ${luot}: dat ${r.dat}/${r.tong} hong ${r.hong} model ${r.moHinh} gateway ${r.modelGateway ?? "?"} usd ${r.usd}`,
			);
		}
	} finally {
		if (sha256(readFileSync(DS.tep, "utf8")) !== bamGoc) {
			writeFileSync(DS.tep, goc);
			traLai = true;
		}
	}
	if (traLai)
		throw new Error(
			"config.ts cua agent-okr khong tra ve ban goc — da ghi lai",
		);
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
