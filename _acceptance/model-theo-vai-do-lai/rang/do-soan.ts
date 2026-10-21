import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { conTran, ghiLuot, keHoach, khoaGateway, ungVienChon } from "./chi-phi";
import { bamCommit } from "./do-kho";
import {
	DUONG,
	GOC,
	khoaChi,
	khuonSoanMh4,
	khuonSoanTho,
	laCu,
	MTV,
	modelCua,
	type SoanMh4,
	sha256,
	z,
} from "./khuon";

export const DS = {
	tep: join(GOC, MTV.suaTam.agentOkr),
	dongModel: 'const MO_HINH = "google/gemini-3.8-flash";',
	lenh: join(MTV.rang, "do-soan-chay.mjs"),
} as const;

export function banSuaTam(goc: string, model: string): string {
	if (!goc.includes(DS.dongModel))
		throw new Error("config.ts cua agent-okr khong co dong MO_HINH mong doi");
	return goc.replace(DS.dongModel, `const MO_HINH = ${JSON.stringify(model)};`);
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

function chayLuot(ma: string, luot: number) {
	return new Promise<number>((xong) => {
		const con = spawn(
			"bun",
			[DS.lenh, "--luot", String(luot), "--ung-vien", ma],
			{ cwd: GOC, stdio: "inherit", env: process.env },
		);
		for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"] as const)
			process.on(tin, () => con.kill(tin));
		con.on("error", () => xong(2));
		con.on("exit", (m) => xong(m ?? 2));
	});
}

export function hoanTatSoan(
	ev: string,
	ma: string,
	luot: number,
	gateway: string | null,
	sua: string,
): SoanMh4 {
	const tep = join(ev, DUONG.soan(ma, luot));
	const tom = khuonSoanTho.parse(JSON.parse(readFileSync(tep, "utf8")));
	const ra: SoanMh4 = khuonSoanMh4.parse({
		...tom,
		modelGateway: gateway,
		bamSuaTam: sha256(sua),
		bamCommit: bamCommit(MTV.suaTam.agentOkr),
	});
	writeFileSync(tep, `${JSON.stringify(ra, null, 2)}\n`);
	ghiLuot(
		{
			vai: "soan-okr",
			luot: khoaChi("soan-okr", ma, luot),
			trang_thai: "da-chay",
			usd: Number(ra.usd.toFixed(6)),
			tep: DUONG.soan(ma, luot),
			luc: ra.luc,
		},
		ev,
	);
	return ra;
}

async function motLuot(ma: string, luot: number, model: string, goc: string) {
	const sua = banSuaTam(goc, model);
	writeFileSync(DS.tep, sua);
	let maThoat = 2;
	try {
		const doc = modelCauHinh();
		if (doc !== model)
			throw new Error(`model cau hinh doc lai ${doc}, khong phai ${model}`);
		maThoat = await chayLuot(ma, luot);
	} finally {
		writeFileSync(DS.tep, goc);
	}
	if (maThoat !== 0 || !existsSync(join(MTV.evidence, DUONG.soan(ma, luot))))
		throw new Error(
			`do-soan-chay ${ma} luot ${luot} thoat ${maThoat}, khong co ${DUONG.soan(ma, luot)}`,
		);
	return hoanTatSoan(MTV.evidence, ma, luot, await modelGateway(model), sua);
}

async function main() {
	const ke = keHoach();
	const goc = readFileSync(DS.tep, "utf8");
	const bamGoc = sha256(goc);
	let traLai = false;
	try {
		for (const ma of ungVienChon(ke.soan_okr.ung_vien)) {
			const model = modelCua(ke, ma);
			for (let luot = 1; luot <= ke.soan_okr.so_luot; luot++) {
				if (existsSync(join(MTV.evidence, DUONG.soan(ma, luot)))) continue;
				if (laCu(ma)) {
					console.log(`soan ${ma} luot ${luot}: ung vien cu khong do lai`);
					continue;
				}
				if (!conTran()) {
					ghiLuot({
						vai: "soan-okr",
						luot: khoaChi("soan-okr", ma, luot),
						trang_thai: "dung-vi-tran",
						usd: null,
						tep: null,
					});
					console.log(`soan ${ma} luot ${luot}: dung vi tran`);
					continue;
				}
				const r = await motLuot(ma, luot, model, goc);
				console.log(
					`soan ${ma} luot ${luot}: dat ${r.dat}/${r.tong} hong ${r.hong} model ${r.moHinh} gateway ${r.modelGateway ?? "?"} usd ${r.usd}`,
				);
			}
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
