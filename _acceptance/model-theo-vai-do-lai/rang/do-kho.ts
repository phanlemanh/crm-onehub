import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { chenhLech, conTran, ghiLuot, keHoach, soDuGateway } from "./chi-phi";
import { GOC, type KhoTom, MTV, sha256 } from "./khuon";

export const DK = {
	tep: join(GOC, MTV.suaTam.taiLieu),
	moKhoi: "\thoi: {",
	dongModel: 'maModel: "zai/glm-5.2-fast"',
	lenh: join(GOC, "_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts"),
	boMau: join(GOC, "_acceptance/bo-cau-hoi-mau/bo-mau.json"),
	chay: join(MTV.chay, "kho"),
	dongGhi: /^ghi bang: bun \S+ --ghi (\S+)$/m,
	modelKho: /model `([^`]+)` \(Gateway trả\), khoá/,
	modelGoc: /model agent gốc `([^`]+)` \(Gateway trả\)/,
} as const;

export function banSuaTam(goc: string): string {
	const i = goc.indexOf(DK.moKhoi);
	const j = i < 0 ? -1 : goc.indexOf(DK.dongModel, i);
	if (i < 0 || j < 0)
		throw new Error("tai-lieu-config.ts khong co maModel cua khoi hoi");
	return `${goc.slice(0, j)}maModel: ${JSON.stringify(MTV.model)}${goc.slice(j + DK.dongModel.length)}`;
}

export function bamCommit(tep: string): string {
	const r = spawnSync("git", ["-C", GOC, "rev-parse", `HEAD:${tep}`], {
		encoding: "utf8",
	});
	if (r.status !== 0) throw new Error(`git rev-parse HEAD:${tep} loi`);
	return r.stdout.trim();
}

function chayLenh(doiSo: string[], env: NodeJS.ProcessEnv) {
	return new Promise<{ ma: number | null; ra: string }>((xong) => {
		const con = spawn("bun", [DK.lenh, ...doiSo], {
			cwd: GOC,
			env,
			stdio: ["ignore", "pipe", "inherit"],
		});
		let ra = "";
		con.stdout.on("data", (b: Buffer) => {
			ra += b.toString();
			process.stdout.write(b);
		});
		con.on("close", (ma) => xong({ ma, ra }));
	});
}

async function motLuot(luot: number, goc: string): Promise<KhoTom> {
	const ra = join(MTV.evidence, MTV.tep.kho, `luot-${luot}`);
	const sua = banSuaTam(goc);
	const env = {
		...process.env,
		BCM_CHAY: DK.chay,
		BCM_EVIDENCE: ra,
	};
	const truoc = await soDuGateway();
	writeFileSync(DK.tep, sua);
	let thuMuc = "";
	let maDo: number | null = null;
	try {
		const r = await chayLenh(["--do"], env);
		maDo = r.ma;
		thuMuc = r.ra.match(DK.dongGhi)?.[1] ?? "";
	} finally {
		writeFileSync(DK.tep, goc);
	}
	if (maDo !== 0 || !thuMuc)
		throw new Error(`do-bo-mau --do thoat ${maDo}, khong co thu muc luot`);
	const g = await chayLenh(["--ghi", thuMuc], env);
	if (g.ma !== 0) throw new Error(`do-bo-mau --ghi thoat ${g.ma}`);
	const usd = chenhLech(truoc, await soDuGateway()) ?? 0;
	const traLoi = existsSync(join(ra, MTV.tep.khoTraLoi))
		? readFileSync(join(ra, MTV.tep.khoTraLoi), "utf8")
		: "";
	const tom: KhoTom = {
		luot,
		luc: new Date().toISOString(),
		thu_muc: relative(GOC, join(GOC, thuMuc)),
		ma_do_bo_mau: maDo,
		model_kho: traLoi.match(DK.modelKho)?.[1] ?? null,
		model_goc: traLoi.match(DK.modelGoc)?.[1] ?? null,
		bam_bo_mau: sha256(readFileSync(DK.boMau, "utf8")),
		bam_sua_tam: sha256(sua),
		bam_commit: bamCommit(MTV.suaTam.taiLieu),
		usd,
		usd_nguon: "so-du-gateway",
	};
	writeFileSync(join(ra, MTV.tep.khoTom), `${JSON.stringify(tom, null, 2)}\n`);
	ghiLuot({
		vai: "tro-ly-kho",
		luot: String(luot),
		trang_thai: "da-chay",
		usd,
		tep: relative(MTV.evidence, join(ra, MTV.tep.khoTom)),
	});
	return tom;
}

async function main() {
	const ke = keHoach();
	const goc = readFileSync(DK.tep, "utf8");
	const bamGoc = sha256(goc);
	mkdirSync(join(MTV.evidence, MTV.tep.kho), { recursive: true });
	let traLai = false;
	try {
		for (let luot = 1; luot <= ke.tro_ly_kho.so_luot; luot++) {
			const daCo = join(
				MTV.evidence,
				MTV.tep.kho,
				`luot-${luot}`,
				MTV.tep.khoTom,
			);
			if (existsSync(daCo)) continue;
			if (!conTran()) {
				ghiLuot({
					vai: "tro-ly-kho",
					luot: String(luot),
					trang_thai: "dung-vi-tran",
					usd: null,
					tep: null,
				});
				console.log(`kho luot ${luot}: dung vi tran`);
				continue;
			}
			const t = await motLuot(luot, goc);
			console.log(
				`kho luot ${luot}: model kho ${t.model_kho ?? "?"} goc ${t.model_goc ?? "?"} usd ${t.usd}`,
			);
		}
	} finally {
		if (sha256(readFileSync(DK.tep, "utf8")) !== bamGoc) {
			writeFileSync(DK.tep, goc);
			traLai = true;
		}
	}
	if (traLai)
		throw new Error("tai-lieu-config.ts khong tra ve ban goc — da ghi lai");
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
