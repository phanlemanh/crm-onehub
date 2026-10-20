import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { databaseName } from "../../../packages/db/src/test-database.ts";
import {
	chenhLech,
	conTran,
	ghiLuot,
	keHoach,
	ketXuatTinhNang,
	soDuGateway,
	ungVienChon,
} from "./chi-phi";
import {
	DUONG,
	GOC,
	type HangChiPhi,
	type KhoTom,
	khoaChi,
	khuonKetXuat,
	khuonKhoTom,
	LOI_KHONG_ZDR,
	laCu,
	MTV,
	modelCua,
	type SoDu,
	sha256,
} from "./khuon";

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
	zdr: /no[^\n]{0,60}provider[^\n]{0,120}(zero[ _-]?data[ _-]?retention|zdr)/i,
} as const;

export function banSuaTam(goc: string, model: string): string {
	const i = goc.indexOf(DK.moKhoi);
	const j = i < 0 ? -1 : goc.indexOf(DK.dongModel, i);
	if (i < 0 || j < 0)
		throw new Error("tai-lieu-config.ts khong co maModel cua khoi hoi");
	return `${goc.slice(0, j)}maModel: ${JSON.stringify(model)}${goc.slice(j + DK.dongModel.length)}`;
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
			stdio: ["ignore", "pipe", "pipe"],
		});
		let ra = "";
		con.stdout.on("data", (b: Buffer) => {
			ra += b.toString();
			process.stdout.write(b);
		});
		con.stderr.on("data", (b: Buffer) => {
			ra += b.toString();
			process.stderr.write(b);
		});
		con.on("close", (ma) => xong({ ma, ra }));
	});
}

export type VaoTomKho = {
	ma: string;
	luot: number;
	luc: string;
	thuMuc: string;
	maDo: number;
	traLoi: string;
	boTho: string;
	sua: string;
	commit: string;
	truoc: SoDu;
	sau: SoDu;
	hang: HangChiPhi[];
	loi: typeof LOI_KHONG_ZDR | null;
};

export function tomTatKho(v: VaoTomKho): KhoTom {
	const chenh = chenhLech(v.truoc.usd, v.sau.usd);
	const coCost = v.hang.length > 0 && v.hang.every((h) => h.costUsd !== null);
	return khuonKhoTom.parse({
		luot: v.luot,
		luc: v.luc,
		thu_muc: v.thuMuc,
		ma_do_bo_mau: v.maDo,
		model_kho: v.traLoi.match(DK.modelKho)?.[1] ?? null,
		model_goc: v.traLoi.match(DK.modelGoc)?.[1] ?? null,
		bam_bo_mau: sha256(v.boTho),
		bam_sua_tam: sha256(v.sua),
		bam_commit: v.commit,
		usd: coCost
			? Number(v.hang.reduce((s, h) => s + (h.costUsd ?? 0), 0).toFixed(6))
			: (chenh ?? 0),
		usd_nguon: coCost ? "aichiphi" : "so-du-gateway",
		ung_vien: v.ma,
		aichiphi: `${DUONG.kho(v.ma, v.luot)}/${MTV.tep.khoKetXuat}`,
		so_du_truoc: v.truoc,
		so_du_sau: v.sau,
		usd_so_du: chenh,
		loi: v.loi,
	});
}

export function ghiTomTatKho(
	ev: string,
	ma: string,
	tom: KhoTom,
	hang: HangChiPhi[],
) {
	const thu = join(ev, DUONG.kho(ma, tom.luot));
	mkdirSync(thu, { recursive: true });
	writeFileSync(
		join(thu, MTV.tep.khoKetXuat),
		`${JSON.stringify(khuonKetXuat.parse(hang), null, 2)}\n`,
	);
	writeFileSync(join(thu, MTV.tep.khoTom), `${JSON.stringify(tom, null, 2)}\n`);
	ghiLuot(
		{
			vai: "tro-ly-kho",
			luot: khoaChi("tro-ly-kho", ma, tom.luot),
			trang_thai: "da-chay",
			usd: tom.usd,
			tep: `${DUONG.kho(ma, tom.luot)}/${MTV.tep.khoTom}`,
			luc: tom.luc,
		},
		ev,
	);
}

const soDuLuc = async (): Promise<SoDu> => ({
	usd: await soDuGateway(),
	luc: new Date().toISOString(),
});

async function motLuot(
	ma: string,
	luot: number,
	model: string,
	goc: string,
	url: string,
): Promise<KhoTom> {
	const ra = join(MTV.evidence, DUONG.kho(ma, luot));
	mkdirSync(ra, { recursive: true });
	const sua = banSuaTam(goc, model);
	const env = { ...process.env, BCM_CHAY: DK.chay, BCM_EVIDENCE: ra };
	const batDau = new Date();
	const truoc = await soDuLuc();
	writeFileSync(DK.tep, sua);
	let thuMuc = "";
	let maDo: number | null = null;
	let raDo = "";
	try {
		const r = await chayLenh(["--do"], env);
		maDo = r.ma;
		raDo = r.ra;
		thuMuc = r.ra.match(DK.dongGhi)?.[1] ?? "";
	} finally {
		writeFileSync(DK.tep, goc);
	}
	const tungCau = join(ra, MTV.tep.khoTungCau);
	const khongZdr =
		DK.zdr.test(raDo) ||
		(existsSync(tungCau) && DK.zdr.test(readFileSync(tungCau, "utf8")));
	if ((maDo !== 0 || !thuMuc) && !khongZdr)
		throw new Error(`do-bo-mau --do thoat ${maDo}, khong co thu muc luot`);
	if (thuMuc) {
		const g = await chayLenh(["--ghi", thuMuc], env);
		if (g.ma !== 0 && !khongZdr)
			throw new Error(`do-bo-mau --ghi thoat ${g.ma}`);
	}
	const sau = await soDuLuc();
	const hang = await ketXuatTinhNang(url, MTV.tinhNang["tro-ly-kho"], batDau);
	const traLoi = existsSync(join(ra, MTV.tep.khoTraLoi))
		? readFileSync(join(ra, MTV.tep.khoTraLoi), "utf8")
		: "";
	const tom = tomTatKho({
		ma,
		luot,
		luc: new Date().toISOString(),
		thuMuc: thuMuc ? relative(GOC, join(GOC, thuMuc)) : "",
		maDo: maDo ?? 2,
		traLoi,
		boTho: readFileSync(DK.boMau, "utf8"),
		sua,
		commit: bamCommit(MTV.suaTam.taiLieu),
		truoc,
		sau,
		hang,
		loi: khongZdr ? LOI_KHONG_ZDR : null,
	});
	ghiTomTatKho(MTV.evidence, ma, tom, hang);
	return tom;
}

async function main() {
	const url = process.env.DATABASE_URL ?? "";
	if (!url || !isMeasureDatabase(databaseName(url)))
		throw new Error(
			"DATABASE_URL khong phai kho do dung-mot-lan — chay trong phien do: bun run do:man --chay 'bun _acceptance/model-theo-vai-do-lai/rang/do-kho.ts'",
		);
	const ke = keHoach();
	const goc = readFileSync(DK.tep, "utf8");
	const bamGoc = sha256(goc);
	mkdirSync(join(MTV.evidence, MTV.tep.kho), { recursive: true });
	let traLai = false;
	try {
		for (const ma of ungVienChon(ke.tro_ly_kho.ung_vien)) {
			const model = modelCua(ke, ma);
			for (let luot = 1; luot <= ke.tro_ly_kho.so_luot; luot++) {
				const daCo = join(MTV.evidence, DUONG.kho(ma, luot), MTV.tep.khoTom);
				if (existsSync(daCo)) continue;
				if (laCu(ma)) {
					console.log(`kho ${ma} luot ${luot}: ung vien cu khong do lai`);
					continue;
				}
				if (!conTran()) {
					ghiLuot({
						vai: "tro-ly-kho",
						luot: khoaChi("tro-ly-kho", ma, luot),
						trang_thai: "dung-vi-tran",
						usd: null,
						tep: null,
					});
					console.log(`kho ${ma} luot ${luot}: dung vi tran`);
					continue;
				}
				const t = await motLuot(ma, luot, model, goc, url);
				console.log(
					`kho ${ma} luot ${luot}: model kho ${t.model_kho ?? "?"} goc ${t.model_goc ?? "?"} usd ${t.usd} (${t.usd_nguon})${t.loi ? ` — ${t.loi}` : ""}`,
				);
			}
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
