import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const GOC = join(HERE, "..", "..", "..");
export const RA =
	process.env.BANG_CHUNG ?? join(GOC, "_acceptance", "tac-nhan-va", "evidence");
export const APP = process.env.APP_URL ?? "http://localhost:3000";
export const API = process.env.API_URL ?? "http://localhost:3001";
export const NGUOI = process.env.NGUOI ?? PHIEN_DO.nguoi;
export const CHO_MS = 90_000;
export const KHO = [375, 1440];
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LUONG_THAT = join(
	GOC,
	"_acceptance/bo-dung-khong-ket/rang/luong-het-han-muc-that.ndjson",
);

export class KhongDo extends Error {}
export function khongDo(cau) {
	throw new KhongDo(cau);
}

export function soKet(maTran) {
	const dong = [];
	const daPhat = new Set();
	let sai = 0;
	return {
		kiem(ma, nhan, dat) {
			if (!maTran.includes(ma))
				throw new Error(`ma ${ma} khong co trong MA_TRAN`);
			daPhat.add(ma);
			dong.push(`${dat ? "DUNG" : "SAI"} ${ma} — ${nhan}`);
			if (dat) console.log(`dat ${ma}`);
			else sai += 1;
		},
		async ket(chay, don) {
			let ma = 0;
			try {
				await chay();
				const thieu = maTran.filter((m) => !daPhat.has(m));
				if (thieu.length > 0) {
					dong.push(`SAI ma tran thieu dong: ${thieu.join(", ")}`);
					sai += 1;
				}
				ma = sai > 0 ? 1 : 0;
			} catch (e) {
				dong.push(
					`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`,
				);
				ma = 2;
			} finally {
				await don();
			}
			for (const x of dong) console.log(x);
			console.log(`ANH ${RA}`);
			console.log(
				`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
			);
			process.exit(ma);
		},
	};
}

export async function tienDe() {
	if (
		!/_do$/.test(new URL(process.env.DATABASE_URL ?? "postgres://x/x").pathname)
	)
		khongDo("khong phai kho do rieng — chay qua mot-luot.sh (tien-de.mjs)");
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
}

export function phien() {
	const ra = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${NGUOI}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

export async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.split("/").filter(Boolean)[0];
	if (!dau || dau === "sign-in" || dau.startsWith("onboarding"))
		khongDo(`${APP}/ chuyen toi ${dich}`);
	return dau;
}

export async function goi(cookie, thuTuc, vao, kieu = "POST") {
	const url =
		kieu === "GET"
			? `${API}/api/trpc/${thuTuc}?input=${encodeURIComponent(JSON.stringify(vao))}`
			: `${API}/api/trpc/${thuTuc}`;
	const tra = await fetch(url, {
		method: kieu,
		headers: {
			cookie: `${cookie.ten}=${cookie.gia}`,
			"content-type": "application/json",
		},
		body: kieu === "GET" ? undefined : JSON.stringify(vao),
	});
	const than = await tra.json().catch(() => null);
	if (tra.status !== 200)
		khongDo(`${thuTuc} tra HTTP ${tra.status} ${than?.error?.message ?? ""}`);
	return than?.result?.data;
}

export async function moTrinhDuyet() {
	return puppeteer.launch({ executablePath: CHROME, headless: true });
}

export async function trang(trinhDuyet, kho, cookie) {
	const ctx = await trinhDuyet.createBrowserContext();
	const p = await ctx.newPage();
	await p.setViewport({ width: kho, height: kho < 768 ? 812 : 900 });
	const host = new URL(APP).hostname;
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	return { ctx, p };
}

export async function chup(p, ten) {
	await p.screenshot({ path: join(RA, `${ten}.png`) });
}

export async function tranNgang(p, chon = null) {
	return p.evaluate((sel) => {
		const goc = document.documentElement;
		const vung = sel ? document.querySelector(sel) : null;
		return {
			trang: goc.scrollWidth - goc.clientWidth,
			vung: vung ? vung.scrollWidth - vung.clientWidth : 0,
		};
	}, chon);
}

const VO = readFileSync(LUONG_THAT, "utf8")
	.split("\n")
	.filter((d) => d.trim().length > 0)
	.map((d) => JSON.parse(d));

function voCua(loai) {
	const v = VO.find((e) => e.type === loai);
	if (!v) khongDo(`luong that khong co su kien ${loai}`);
	return v;
}

let dem = 0;
function maSuKien() {
	dem += 1;
	return `evt_TNV${Date.now().toString(36).toUpperCase()}${String(dem).padStart(4, "0")}`;
}

function suKien(loai, data) {
	return {
		...voCua(loai),
		data,
		meta: { at: new Date().toISOString(), id: maSuKien() },
	};
}

export function ghiLuong(thuMuc, sessionId, token, loiNhan, congCu) {
	const toaDo = { sequence: 0, turnId: "turn_0" };
	const buoc = { ...toaDo, stepIndex: 0 };
	const callId = `call_tnv_${dem}`;
	const dong = [
		suKien("session.started", voCua("session.started").data),
		suKien("turn.started", toaDo),
		suKien("message.received", {
			message: loiNhan,
			parts: [{ text: loiNhan, type: "text" }],
			...toaDo,
		}),
		suKien("step.started", buoc),
		...(congCu
			? [
					suKien("actions.requested", {
						actions: [
							{
								callId,
								input: congCu.input,
								kind: "tool-call",
								toolName: congCu.ten,
							},
						],
						...buoc,
					}),
					suKien("action.result", {
						result: {
							callId,
							kind: "tool-result",
							output: congCu.output,
							toolName: congCu.ten,
						},
						...buoc,
						status: "completed",
					}),
				]
			: []),
		suKien("step.completed", { ...voCua("step.completed").data, ...buoc }),
		suKien("turn.completed", toaDo),
		suKien("session.waiting", {
			...voCua("session.waiting").data,
			continuationToken: token,
		}),
	];
	writeFileSync(
		join(thuMuc, `${sessionId}.ndjson`),
		`${dong.map((d) => JSON.stringify(d)).join("\n")}\n`,
	);
	return dong.length;
}
