import { randomUUID } from "node:crypto";
import { existsSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { GOC } from "./lat.mjs";

const APP = process.env.APP_URL ?? "http://localhost:3000";
const CONG = `${GOC}/apps/app/public`;
const DAU = "canh-cay-";
const RAC_MS = 10 * 60_000;
const QUA_PROXY = new Set([
	".svg",
	".png",
	".ico",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".webmanifest",
]);

let daCanh = null;

function donRac() {
	if (!existsSync(CONG)) return;
	const gia = Date.now() - RAC_MS;
	for (const f of readdirSync(CONG)) {
		if (!f.startsWith(DAU)) continue;
		const d = join(CONG, f);
		try {
			if (statSync(d).mtimeMs < gia) rmSync(d, { force: true });
		} catch {}
	}
}

function fileChung() {
	try {
		return (
			readdirSync(CONG).find(
				(f) => !f.startsWith(DAU) && QUA_PROXY.has(extname(f).toLowerCase()),
			) ?? null
		);
	} catch {
		return null;
	}
}

async function lay(duong) {
	try {
		const res = await fetch(`${APP}/${duong}`, { redirect: "manual" });
		return { ma: res.status, chu: await res.text() };
	} catch (loi) {
		return { ma: 0, chu: "", loi: String(loi?.message ?? loi) };
	}
}

async function soi() {
	if (!existsSync(CONG)) {
		return {
			ket: "khong-noi-duoc",
			dong: [
				`KHONG DO DUOC: khong co thu muc ${CONG.replace(`${GOC}/`, "")} de dat dau moc.`,
				"    Khong dat duoc dau moc thi khong chung duoc may chu dang phuc vu cay nao.",
			],
		};
	}

	donRac();
	const ten = `${DAU}${randomUUID()}.svg`;
	const noi = join(CONG, ten);
	const than = `<svg xmlns="http://www.w3.org/2000/svg" data-canh-cay="${ten}"/>`;
	const don = () => rmSync(noi, { force: true });

	try {
		writeFileSync(noi, than);
		process.on("exit", don);
		const moc = await lay(ten);
		if (moc.chu === than) return { ket: "dung-cay", dong: [] };

		const chung = fileChung();
		if (chung === null) {
			return {
				ket: "khong-noi-duoc",
				dong: [
					`KHONG DO DUOC: ${APP} khong tra ve dau moc, va thu muc public khong co file nao di qua duoc proxy de doi chung.`,
					"    Khong co doi chung thi khong tach duoc 'may chu phuc vu cay khac' voi 'public khong duoc phuc vu'.",
				],
			};
		}

		const doi = await lay(chung);
		if (doi.ma !== 200) {
			return {
				ket: "khong-noi-duoc",
				dong: [
					`KHONG DO DUOC: khong noi duoc ${APP} dang phuc vu cay nao.`,
					`    Dau moc ${ten} khong tra ve, va file doi chung ${chung} cung tra ${doi.ma === 0 ? `loi mang: ${doi.loi ?? ""}` : doi.ma}.`,
					"    Khong co may chu tra loi, hoac may chu do khong phuc vu thu muc public — hai duong deu khong ket luan duoc gi.",
				],
			};
		}

		return {
			ket: "khac-cay",
			dong: [
				`KHONG DO DUOC: may chu o ${APP} khong phuc vu cay dang xet.`,
				`    Cay dang xet: ${GOC}`,
				`    Dat dau moc ${ten} vao apps/app/public roi xin ${APP}/${ten} — khong nhan lai dau moc.`,
				`    File doi chung ${chung} van tra 200, nen public CO duoc phuc vu: may chu dang doc mot cay khac.`,
				"    Moi con so do tren may chu nay noi ve cay khac, khong noi ve cay dang xet.",
				"    Dung may chu cho chinh cay nay roi dat APP_URL (va API_URL) tro vao no.",
			],
		};
	} finally {
		don();
		process.off("exit", don);
	}
}

export async function canhCay() {
	if (daCanh === null) daCanh = await soi();
	return daCanh;
}

if (process.argv[1]?.endsWith("canh-cay.mjs")) {
	const v = await canhCay();
	for (const d of v.dong) console.log(d);
	if (v.ket === "dung-cay") {
		console.log(`may chu o ${APP} dang phuc vu dung cay dang xet.`);
		process.exit(0);
	}
	process.exit(2);
}
