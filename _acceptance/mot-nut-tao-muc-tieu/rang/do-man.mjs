import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	bao,
	choThay,
	DO,
	GOC,
	mo,
	nghi,
	tongKet,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";
import { taoNguCanh } from "../../vo-khu-muc-tieu/rang/do-man-ngu-canh.mjs";

const HO_SO = "mot-nut-tao-muc-tieu";
const BANG_CHUNG = join(GOC, ".acceptance-runs", HO_SO, "evidence");
const BANG_CHUNG_HO_SO = join(GOC, "_acceptance", HO_SO, "evidence");
const CHEP_ANH = process.env.MNT_CHEP_ANH === "1";
const CHIEU_DO = (process.env.EVAL ?? "").trim() === "chieu-do";

const MAN = {
	"cua-toi": { duong: "/okr", tao: true },
	"bo-okr": { duong: "/okr/bo-okr", tao: true },
	"lay-y-kien": { duong: "/okr/lay-y-kien", tao: false },
	"suc-khoe": { duong: "/okr/suc-khoe", tao: false },
	"so-do": { duong: "/okr/so-do", tao: false },
};
const HANG = "[data-slot=page-shell-actions]";
const HOP = "[data-hop-chon-duong]";
const DUONG_TAO = ["tu-viet", "tu-mau", "bang-tinh", "soan"];

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);
const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

function chepAnh(ten) {
	if (!CHEP_ANH) return;
	mkdirSync(BANG_CHUNG_HO_SO, { recursive: true });
	copyFileSync(join(BANG_CHUNG, ten), join(BANG_CHUNG_HO_SO, ten));
}

async function demNutChinh(trang) {
	return trang.evaluate((hang) => {
		const goc = document.querySelector(hang);
		if (!goc) return 0;
		return [...goc.querySelectorAll("[data-slot=button]")].filter((e) => {
			const v = e.getAttribute("data-variant");
			return (v === null || v === "default") && e.getClientRects().length > 0;
		}).length;
	}, HANG);
}

function duongCua(n, man) {
	return man === "bo-okr"
		? n.w(`${MAN[man].duong}?donOkr=pb:${n.donVi.id}`)
		: n.w(MAN[man].duong);
}

async function moMan(t, n, man) {
	await mo(t, duongCua(n, man), `${HANG} [data-nut=hoi-kara]`);
	if (MAN[man].tao) await choThay(t.trang, `${HANG} [data-nut=them-muc-tieu]`);
	await nghi(DO.cho.langMs);
}

async function e3(n) {
	const truoc = await demNutChinh(n.may.truong.trang).catch(() => -1);
	if (truoc < 0) await khongDo("KHONG DO DUOC: trang chua mo");
	await moMan(n.may.truong, n, "bo-okr");
	if ((await demNutChinh(n.may.truong.trang)) < 1)
		await khongDo(
			"KHONG DO DUOC: bo dem mu — khong thay nut Them muc tieu o bo-okr",
		);
	for (const vai of ["truong", "quanTri"])
		for (const man of Object.keys(MAN)) {
			const t = n.may[vai];
			await moMan(t, n, man);
			if (CHIEU_DO && man === "suc-khoe")
				await t.trang.evaluate((hang) => {
					const nut = document.createElement("button");
					nut.setAttribute("data-slot", "button");
					nut.textContent = "x";
					document.querySelector(hang)?.append(nut);
				}, HANG);
			const so = await demNutChinh(t.trang);
			const mong = MAN[man].tao ? 1 : 0;
			const nhan = vai === "truong" ? "truong" : "quan-tri";
			bao(
				so === mong,
				`NUT CHINH ${man} ${nhan} ${so}`,
				`SAI NUT CHINH ${man} ${nhan} ${so}`,
			);
		}
}

async function e8(n) {
	const t = n.may.truong;
	const nonce = `VK9-${Date.now().toString(36)}`;
	await moMan(t, n, "bo-okr");
	await t.trang.click(`${HANG} [data-nut=them-muc-tieu]`);
	await choThay(t.trang, `${HOP} [data-duong=tu-viet]`);
	await t.trang.click(`${HOP} [data-duong=tu-viet]`);
	await choThay(t.trang, "[data-hop-thoai-muc-tieu=moi] input[id$='-ten']");
	await t.trang.type(
		"[data-hop-thoai-muc-tieu=moi] input[id$='-ten']",
		`${nonce} giữ khách cũ`,
	);
	if (!CHIEU_DO) {
		await t.trang.click("[data-nut=gui-muc-tieu]");
		await t.trang
			.waitForFunction(
				() => !document.querySelector("[data-hop-thoai-muc-tieu=moi]"),
				{ timeout: DO.cho.dauHieuMs },
			)
			.catch(() => {});
	}
	await t.trang.reload({ waitUntil: "domcontentloaded" });
	const thay = await choThay(t.trang, "main", DO.cho.dauHieuMs).then(() =>
		t.trang
			.waitForFunction(
				(chu) => document.querySelector("main")?.innerText.includes(chu),
				{ timeout: DO.cho.dauHieuMs },
				nonce,
			)
			.then(() => true)
			.catch(() => false),
	);
	bao(thay, `DUNG TU VIET ${nonce}`, `SAI TU VIET ${nonce}`);
}

async function doDong(trang) {
	return trang.evaluate(
		(hop, duong) => {
			const tranNgang =
				document.documentElement.scrollWidth > window.innerWidth + 1;
			let biCat = 0;
			let tron = 0;
			for (const d of duong) {
				const nut = document.querySelector(`${hop} [data-duong=${d}]`);
				if (!nut) continue;
				for (const chu of nut.querySelectorAll(
					"[data-slot=item-title], [data-slot=item-description]",
				))
					if (
						chu.scrollWidth > chu.clientWidth + 1 ||
						chu.scrollHeight > chu.clientHeight + 1
					)
						biCat += 1;
				const r = nut.getBoundingClientRect();
				const y = r.top + r.height / 2;
				const trai = document.elementFromPoint(r.left + 4, y);
				const phai = document.elementFromPoint(r.right - 4, y);
				if (nut.contains(trai) && nut.contains(phai)) tron += 1;
			}
			return { tranNgang, biCat, tron, tong: duong.length };
		},
		HOP,
		DUONG_TAO,
	);
}

async function e16(n) {
	const t = n.may.truong;
	mkdirSync(BANG_CHUNG, { recursive: true });
	const anh = async (ten) => {
		await t.trang.screenshot({ path: join(BANG_CHUNG, `${ten}.png`) });
		chepAnh(`${ten}.png`);
	};
	for (const kho of [DO.kho.mayTinh, DO.kho.dienThoai]) {
		await t.trang.setViewport({ width: kho.rong, height: kho.cao });
		if (kho === DO.kho.mayTinh) {
			await moMan(t, n, "cua-toi");
			await anh(`cua-toi-dau-trang-${kho.ten}`);
			await moMan(t, n, "suc-khoe");
			await anh(`suc-khoe-dau-trang-${kho.ten}`);
		}
		for (const man of kho === DO.kho.mayTinh
			? ["bo-okr"]
			: ["cua-toi", "bo-okr"]) {
			await moMan(t, n, man);
			await t.trang.click(`${HANG} [data-nut=them-muc-tieu]`);
			await choThay(t.trang, `${HOP} [data-duong=soan]`);
			await nghi(DO.cho.langMs);
			const ten = `${man}-hop-${kho.ten}`;
			await anh(ten);
			const d = await doDong(t.trang);
			bao(
				!d.tranNgang && d.biCat === 0 && d.tron === d.tong,
				`DUNG AC-9 ${ten}: tran ngang 0, dong bi cat 0, vung bam tron ${d.tron}/${d.tong}`,
				`SAI AC-9 ${ten}: tran ngang ${d.tranNgang ? 1 : 0}, dong bi cat ${d.biCat}, vung bam tron ${d.tron}/${d.tong}`,
			);
		}
	}
	await t.trang.setViewport({
		width: DO.kho.mayTinh.rong,
		height: DO.kho.mayTinh.cao,
	});
}

console.log(`do-man VK9${CHIEU_DO ? " · chieu do" : ""}`);
try {
	const n = await taoNguCanh({ canSoan: false });
	await e3(n);
	await e8(n);
	if (!CHIEU_DO) await e16(n);
	await n.trinhDuyet.close();
} catch (loi) {
	console.log(`KHONG DO DUOC: ban do vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
console.log(
	CHEP_ANH
		? `anh: ${BANG_CHUNG_HO_SO}`
		: `anh: ${BANG_CHUNG} (khong chep sang ho so — dat MNT_CHEP_ANH=1 o buoc cua E16)`,
);
const { dung, sai } = tongKet();
console.log(`KET LUAN VK9: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
