import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { messages } from "../../../packages/ui/src/lib/messages.ts";
import { LY_DO_TU_CHOI_NOP } from "../../../packages/validation/src/okr-cuoc-soan.ts";
import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { LENH } from "../../soan-okr-trang-rieng/rang/kich-ban.mjs";
import {
	APP,
	buoc,
	CHON,
	chuanBi,
	choThay,
	choYen,
	ghi,
	guiTin,
	KY,
	ket,
	khongDo,
	MAN,
	mo,
	moCuoc,
	moPhien,
	moTrang,
	sql,
	the,
	trang,
} from "../../soan-okr-trang-rieng/rang/man-chung.mjs";
import { bam, ROOT, SOAN } from "./chung.mjs";

const TU_DAY = fileURLToPath(import.meta.url);
const TEP_DAY = path.relative(ROOT, TU_DAY);
const EVIDENCE = path.join(ROOT, "_acceptance/ly-do-tu-choi-nop-theo-locale/evidence");
const CAU = JSON.parse(fs.readFileSync(path.join(path.dirname(TU_DAY), "cau-da-duyet.json"), "utf8"));
const TIEN_TO = { vi: "Kara nộp bản nháp chưa được — ", en: "Kara could not submit the draft — " };
const LUOT = {
	"vi-390": { kho: { rong: 390, cao: 844 }, lang: "vi" },
	"vi-1440": { kho: { rong: 1440, cao: 1000 }, lang: "vi" },
	"en-1440": { kho: { rong: 1440, cao: 1000 }, lang: "en" },
};
const PHA_KHAC = "dang-chay";
const MA = "chuKyKhongLapKeHoach";
const VET_THO = {
	tep: `${SOAN}/hoi-thoai-soan.tsx`,
	tu: "hong.lyDo ? m.moc.lyDoTuChoi[hong.lyDo] : null,",
	thanh: "hong.lyDo,",
};

const arg = (ten) => {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
};
const luot = arg("--luot");
const doDo = arg("--kiem-do-do");
if (doDo !== null && doDo !== "tho") {
	console.log("KHONG DO DUOC: --kiem-do-do chi nhan 'tho'");
	process.exit(2);
}
if (luot !== null && !LUOT[luot]) {
	console.log(`KHONG DO DUOC: --luot phai la ${Object.keys(LUOT).join(", ")}`);
	process.exit(2);
}
const duoi = doDo ? ` --kiem-do-do ${doDo}` : "";

function chayCon(l) {
	const r = spawnSync("bun", [TU_DAY, "--luot", l, ...(doDo ? ["--kiem-do-do", doDo] : [])], {
		cwd: ROOT,
		env: process.env,
		stdio: "inherit",
	});
	return r.status ?? 2;
}

async function cha() {
	if (!doDo) {
		const ma = [];
		for (const l of Object.keys(LUOT)) ma.push([l, chayCon(l)]);
		ghi(`TONG: ${ma.map(([l, x]) => `luot ${l} thoat ${x}`).join(" · ")}`);
		const cuoi = ma.some(([, x]) => x === 2) ? 2 : ma.some(([, x]) => x !== 0) ? 1 : 0;
		ghi(`KET LUAN: ma thoat ${cuoi}`);
		process.exit(cuoi);
	}
	const duong = path.join(ROOT, VET_THO.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(VET_THO.tep);
	if (truoc.split(VET_THO.tu).length !== 2) {
		ghi(`KHONG DO DUOC: khong thay dung mot dong can pha trong ${VET_THO.tep}`);
		process.exit(2);
	}
	let ma = 2;
	try {
		fs.writeFileSync(duong, truoc.replace(VET_THO.tu, VET_THO.thanh));
		ghi(`(chieu do tho: ${VET_THO.tep} ghep ly do tho — man cua phien do bien dich lai)`);
		ma = chayCon("vi-1440");
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(VET_THO.tep) !== bamTruoc) {
		ghi(`TEP KHONG TRA LAI: ${VET_THO.tep}`);
		process.exit(3);
	}
	ghi(`tep tra lai nguyen: ${VET_THO.tep}`);
	ghi(`KET LUAN: chieu do tho — ma thoat ${ma}`);
	process.exit(ma);
}

const hep = () => LUOT[luot].kho.rong < 768;

async function anh(t, ten) {
	const thu = doDo ? the.ra : EVIDENCE;
	fs.mkdirSync(thu, { recursive: true });
	const tep = path.join(thu, `${ten}.png`);
	await t.p.screenshot({ path: tep });
	ghi(`   ANH ${path.relative(ROOT, tep)}`);
}

async function chonTroChuyen(t) {
	if (!hep()) return true;
	const tab = (await t.p.$$('[data-khung="hep"] [role="tab"]'))[0];
	if (!tab) return false;
	await tab.click();
	return choThay(
		t.p,
		() => document.querySelectorAll('[data-khung="hep"] [role="tab"]')[0]?.getAttribute("aria-selected") === "true",
		"tab tro chuyen",
		10000,
	);
}

async function docDong(p) {
	return p.evaluate(() =>
		[...document.querySelectorAll('[data-nop-khong-thanh="tu-choi"]')].map((d) => d.textContent?.trim() ?? ""),
	);
}

function xetDong(dong, lang) {
	const can = TIEN_TO[lang] + CAU[lang][MA];
	const lo = dong.find((c) => c.includes(LY_DO_TU_CHOI_NOP[MA]) || c.includes(MA));
	if (lo !== undefined) return `lo ma may: ${lo.includes(MA) ? MA : LY_DO_TU_CHOI_NOP[MA]}`;
	if (dong.length !== 1) return `so dong tu-choi ${dong.length}, mong 1`;
	if (dong[0] !== can) return `cau sai: «${dong[0]}», can «${can}»`;
	return null;
}

async function datNgonNgu(t, lang) {
	const host = new URL(APP).hostname;
	await t.ctx.setCookie({ name: "lang", value: lang, domain: host, path: "/" });
}

async function moLai(t, cuocId) {
	if (!(await moTrang(t, cuocId))) await khongDo("khong mo lai duoc trang soan");
	await choThay(t.p, () => document.querySelectorAll('[data-nop-khong-thanh="tu-choi"]').length > 0, "dong tu-choi sau khi mo lai", MAN.cho.manMs);
	await tre(MAN.cho.yenMs * 2);
	if (!(await chonTroChuyen(t))) await khongDo("khong chon duoc tab Tro chuyen");
	await tre(MAN.cho.yenMs);
}

async function con() {
	await moPhien(`bun scripts/lan-do/tien-de.mjs --chay "bun ${TEP_DAY} --luot ${luot}${duoi}"`);
	const { kho, lang } = LUOT[luot];
	try {
		await chuanBi(`k2c-ly-do-${luot}${doDo ? "-do" : ""}`);
		ghi(`LUOT ${luot}${doDo ? ` · chieu do ${doDo}` : ""}`);
		const cuoc = await moCuoc();
		const t = await trang(kho);
		try {
			if (lang !== "vi") {
				await datNgonNgu(t, lang);
				const mUi = messages(lang);
				CHON.gui = `[data-slot="kara-composer"] button[aria-label="${mUi.promptInput.submit}"]`;
				CHON.dung = `[data-slot="kara-composer"] button[aria-label="${mUi.promptInput.stop}"]`;
			}
			if (!(await mo(t, cuoc.id))) await khongDo("trang soan khong mo duoc luot dau");
			if (!(await chonTroChuyen(t))) await khongDo("khong chon duoc tab Tro chuyen");
			if (!(await guiTin(t, LENH.nop1))) await khongDo("lan nop dau khong xong luot");
			await sql(`UPDATE "okrCycle" SET phase = $2 WHERE id = $1`, [KY, PHA_KHAC]);
			let tuChoi;
			try {
				tuChoi = await guiTin(t, LENH.nop2);
			} finally {
				await sql(`UPDATE "okrCycle" SET phase = $2 WHERE id = $1`, [KY, MAN.phaSoan]);
			}
			if (!tuChoi) await khongDo("lan nop bi tu choi khong xong luot");
			if (!(await guiTin(t, LENH.nopLai))) await khongDo("lan nop lai khong xong luot");
			await choThay(t.p, () => document.querySelectorAll('[data-kara-turn="checkpoint"]').length >= 2, "hai moc", MAN.cho.luotMs);
			await choYen(t.p);
			const dau = await docDong(t.p);
			ghi(`   dong tu-choi (${lang}): ${JSON.stringify(dau)}`);
			await anh(t, `E9-tu-choi-${luot}`);
			buoc(1, xetDong(dau, lang));
			await moLai(t, cuoc.id);
			const sau = await docDong(t.p);
			ghi(`   sau tai lai (${lang}): ${JSON.stringify(sau)}`);
			await anh(t, `E9-tu-choi-${luot}-tai-lai`);
			buoc(2, xetDong(sau, lang) ?? (JSON.stringify(sau) !== JSON.stringify(dau) ? "dong doi sau khi tai lai" : null));
		} finally {
			await t.dong();
		}
	} catch (loi) {
		await khongDo(`luot ${luot}: ${loi?.stack ?? loi}`);
	}
	await ket();
}

await (luot ? con() : cha());
