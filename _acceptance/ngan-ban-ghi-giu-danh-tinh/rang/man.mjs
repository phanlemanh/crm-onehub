import { spawn, spawnSync } from "node:child_process";
import {
	appendFileSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "ngan-ban-ghi-giu-danh-tinh";
const DEAL = "seed-deal-wise-1";
const NGUONG_MO_MS = 150;
const CHO_KHUNG_MS = 2500;
const TRE_CHIEU_DO_MS = 400;
const GHIM_CHIEU_DO = [
	"man: ngan bien mat khi dong",
	"man: ngan mo tre",
	"man: ngan mo lai la phan tu moi",
];
const BIEN_PHIEN = [
	"DATABASE_URL",
	"APP_URL",
	"API_URL",
	"PHIEN_DO",
	"NEXT_PUBLIC_API_URL",
	"BANG_CHUNG",
];

const TEP_NAP = "apps/app/components/crm/record-sheet/nap-san-khi-mo-ngan.tsx";
const TEP_TAI_XONG = "apps/app/components/crm/record-sheet/sau-khi-tai-xong.ts";
const BAN_CU_NAP = `"use client";

import { type DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRecordStack } from "./record-stack";

export function NapSanKhiMoNgan({
	state,
	children,
}: {
	state: DehydratedState;
	children: ReactNode;
}) {
	const { stack } = useRecordStack();
	return stack.length > 0 ? (
		<HydrationBoundary state={state}>{children}</HydrationBoundary>
	) : (
		children
	);
}
`;

async function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "gdt-man-chieu-do-"));
	const sao = join(tam, "crm");
	let ma = 2;
	let cau = "chua chay";
	try {
		spawnSync("git", ["-C", GOC, "worktree", "add", "--detach", sao, "HEAD"], {
			stdio: "inherit",
		});
		if (existsSync(join(GOC, ".env")))
			symlinkSync(join(GOC, ".env"), join(sao, ".env"));
		const cai = spawnSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao,
			stdio: "inherit",
		});
		if (cai.status !== 0) {
			cau = `bun install trong ban sao ma ${cai.status}`;
			return;
		}
		writeFileSync(join(sao, TEP_NAP), BAN_CU_NAP);
		const taiXong = readFileSync(join(sao, TEP_TAI_XONG), "utf8");
		const moc = "const xongNgay = () => datXong(true);";
		if (taiXong.split(moc).length !== 2) {
			cau = `vet khong cam duoc vao ${TEP_TAI_XONG}`;
			return;
		}
		writeFileSync(
			join(sao, TEP_TAI_XONG),
			taiXong.replace(
				moc,
				`const xongNgay = () => setTimeout(() => datXong(true), ${TRE_CHIEU_DO_MS});`,
			),
		);
		const moiTruong = { ...process.env };
		for (const k of BIEN_PHIEN) delete moiTruong[k];
		let ra = "";
		ma = await new Promise((xong) => {
			const con = spawn(
				"bash",
				[
					"-c",
					`bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, TEP_NAY)}"`,
				],
				{ cwd: sao, env: moiTruong, stdio: ["ignore", "pipe", "pipe"] },
			);
			const ghi = (b) => {
				ra += b.toString();
				process.stdout.write(b);
			};
			con.stdout.on("data", ghi);
			con.stderr.on("data", ghi);
			con.on("error", () => xong(2));
			con.on("exit", (m) => xong(m ?? 2));
		});
		const thuTu = GHIM_CHIEU_DO.every((g) => ra.includes(g));
		if (ma === 1 && thuTu) {
			cau = `DO DUNG GHIM: ma 1, in ${GHIM_CHIEU_DO.join(" · ")}`;
			ma = 0;
		} else if (ma === 2) cau = "ban sao thoat ma 2 (tien de thieu)";
		else {
			cau = `LOT: ma ${ma}, ${thuTu ? "co ghim" : "thieu ghim"}`;
			ma = 1;
		}
	} finally {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", sao]);
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["-C", GOC, "worktree", "prune"]);
		console.log(`chieu do: ${cau}`);
		process.exit(ma);
	}
}

if (process.argv.includes("--chieu-do")) await chieuDo();

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const BANG_CHUNG = process.env.BANG_CHUNG;
const NOI_GIU = join(GOC, "_acceptance", HO_SO, "evidence");
const HOP_DONG = join(GOC, "_acceptance", HO_SO, "contract.md");
const NHAT_KY = join(BANG_CHUNG, "gdt-man.log");
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const ANH = [
	"gdt-mo-1440.png",
	"gdt-dong-1440.png",
	"gdt-mo-390.png",
	"gdt-dong-390.png",
	"gdt-mo-lai-1440.png",
];
const TEP_GIU = [...ANH, "gdt-man.log"];

const { HEP, MA, RONG, cho } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const d = await (await import("../../kho-tai-lieu/rang/man-lib.mjs")).moDo();

mkdirSync(BANG_CHUNG, { recursive: true });
writeFileSync(NHAT_KY, "");

const selNgan = (kho) =>
	kho < 768 ? "[data-slot=drawer-content]" : "[data-slot=sheet-content]";

const o = [];

function ghiO(kho, phep, loi) {
	const dong = `o ${kho} ${phep}: ${loi.length === 0 ? "dat" : loi.join(" · ")}`;
	console.log(dong);
	appendFileSync(NHAT_KY, `${dong}\n`);
	o.push({ kho, phep, dat: loi.length === 0 });
}

async function caiDo(t, sel) {
	await t.evaluate((s) => {
		window.__gdtSu?.ob?.disconnect();
		const su = { ds: [], s };
		const ghi = (loai, e) =>
			su.ds.push({
				loai,
				t: performance.now(),
				dau: e.dataset?.gdtDau ?? null,
			});
		const tim = (n) =>
			n instanceof Element ? (n.matches(s) ? n : n.querySelector(s)) : null;
		su.ob = new MutationObserver((muc) => {
			for (const m of muc) {
				for (const n of m.addedNodes) {
					const e = tim(n);
					if (e) ghi("vao", e);
				}
				for (const n of m.removedNodes) {
					const e = tim(n);
					if (e) ghi("ra", e);
				}
			}
		});
		su.ob.observe(document.body, { childList: true, subtree: true });
		window.__gdtSu = su;
	}, sel);
}

const timDong = (ten) => {
	const ung = [...document.querySelectorAll("td, [role=cell], a, span, div")]
		.filter((e) => e.checkVisibility())
		.filter((e) => (e.textContent ?? "").trim() === ten);
	return ung.at(0) ?? null;
};

async function khungSau(t, sel, hanh, tham) {
	return t.evaluate(
		async ({ s, hanh, tham, choToiDa }) => {
			const timDong = (ten) =>
				[...document.querySelectorAll("td, [role=cell], a, span, div")]
					.filter((e) => e.checkVisibility())
					.find((e) => (e.textContent ?? "").trim() === ten) ?? null;
			const khung = [];
			const anh = (e) =>
				e
					? e
							.getAnimations({ subtree: false })
							.filter((a) => a.playState === "running").length
					: 0;
			const chup = (t0) => {
				const e = document.querySelector(s);
				khung.push({
					t: performance.now() - t0,
					co: Boolean(e),
					trangThai: e?.getAttribute("data-state") ?? null,
					chay: anh(e),
					dau: e?.dataset?.gdtDau ?? null,
				});
			};
			const nut = () =>
				document.querySelector(
					`${s} [data-slot=sheet-close], ${s} [data-slot=drawer-close]`,
				);
			const t0 = performance.now();
			if (hanh === "mo") {
				const dong = timDong(tham.ten);
				if (!dong) return { loi: "khong thay dong cua thoa thuan", khung };
				dong.click();
			} else if (hanh === "dong" || hanh === "mo-lai") {
				const n = nut();
				if (!n) return { loi: "khong thay nut dong cua ngan", khung };
				n.click();
			}
			let daMoLai = hanh !== "mo-lai";
			let tMoLai = null;
			await new Promise((xong) => {
				const vong = () => {
					chup(t0);
					const k = khung.at(-1);
					if (!daMoLai && k.t >= tham.moLaiSauMs) {
						const dong = timDong(tham.ten);
						if (dong) {
							dong.click();
							daMoLai = true;
							tMoLai = performance.now() - t0;
						}
					}
					const xongMo =
						daMoLai &&
						hanh !== "dong" &&
						k.co &&
						k.trangThai === "open" &&
						k.chay === 0 &&
						k.t > 50;
					const xongDong = hanh === "dong" && !k.co && k.t > 50;
					if (xongMo || xongDong || k.t > choToiDa) xong();
					else requestAnimationFrame(vong);
				};
				requestAnimationFrame(vong);
			});
			const su = (window.__gdtSu?.ds ?? []).map((x) => ({
				...x,
				t: x.t - t0,
			}));
			return {
				khung,
				su,
				tMoLai,
				record: new URL(location.href).searchParams.get("record"),
			};
		},
		{ s: sel, hanh, tham, choToiDa: CHO_KHUNG_MS },
	);
}

function xetDong(kq) {
	const loi = [];
	if (kq.loi) return [kq.loi];
	const dongChay = kq.khung.filter(
		(k) => k.co && k.trangThai === "closed" && k.chay > 0,
	);
	const ra = kq.su.filter((x) => x.loai === "ra");
	if (dongChay.length < 2)
		loi.push(
			`man: ngan bien mat khi dong (${dongChay.length} khung dong co hieu ung, ra ${ra.length} lan)`,
		);
	const cuoiChay = dongChay.at(-1)?.t ?? 0;
	if (ra.length === 0) loi.push("ngan khong roi trang sau khi dong");
	else if (ra[0].t < cuoiChay)
		loi.push(
			`ngan roi trang luc hieu ung con chay (ra ${ra[0].t.toFixed(0)} ms, khung chay cuoi ${cuoiChay.toFixed(0)} ms)`,
		);
	return loi;
}

function xetMo(kq) {
	if (kq.loi) return [kq.loi];
	const loi = [];
	const vao = kq.su.filter((x) => x.loai === "vao");
	const ra = kq.su.filter((x) => x.loai === "ra");
	if (vao.length === 0) return ["ngan khong vao trang sau khi bam"];
	if (vao[0].t > NGUONG_MO_MS)
		loi.push(
			`man: ngan mo tre (${vao[0].t.toFixed(0)} ms > ${NGUONG_MO_MS} ms)`,
		);
	if (vao.length !== 1) loi.push(`ngan vao trang ${vao.length} lan`);
	if (ra.length > 0)
		loi.push(`man: ngan bien roi hien khi mo (ra ${ra.length} lan)`);
	const dau = kq.khung.find((k) => k.co);
	if (!dau || dau.chay === 0)
		loi.push("ngan vao trang ma khong co hieu ung truot dang chay");
	const cuoi = kq.khung.at(-1);
	if (!cuoi?.co || cuoi.trangThai !== "open")
		loi.push(`ngan khong o trang thai mo sau ${CHO_KHUNG_MS} ms`);
	return loi;
}

function xetMoLai(kq) {
	if (kq.loi) return [kq.loi];
	const loi = [];
	if (kq.tMoLai === null) return ["khong bam mo lai duoc sau khi dong"];
	const dongTruoc = kq.khung.filter(
		(k) => k.t < kq.tMoLai && k.co && k.trangThai === "closed" && k.chay > 0,
	);
	const cuoi = kq.khung.at(-1);
	const raCoDau = kq.su.filter((x) => x.loai === "ra" && x.dau === MA);
	if (!cuoi?.co || cuoi.trangThai !== "open")
		loi.push("ngan khong mo lai sau khi bam giua chung");
	if (cuoi?.dau !== MA || raCoDau.length > 0)
		loi.push(
			`man: ngan mo lai la phan tu moi (dau cuoi ${cuoi?.dau ?? "khong co"}, go ${raCoDau.length} lan)`,
		);
	if (dongTruoc.length === 0)
		loi.push(
			`luc bam mo lai (${kq.tMoLai.toFixed(0)} ms) ngan khong dang truot ra`,
		);
	if (kq.record !== `deal:${DEAL}`)
		loi.push(`record= sau khi mo lai la ${kq.record ?? "rong"}`);
	return loi;
}

async function choMoXong(t, sel) {
	await t.waitForFunction(
		(s) => {
			const e = document.querySelector(s);
			return (
				e?.getAttribute("data-state") === "open" &&
				e.getAnimations().every((a) => a.playState !== "running")
			);
		},
		{ timeout: 30_000 },
		sel,
	);
}

async function choDongXong(t, sel) {
	await t.waitForFunction(
		(s) => !document.querySelector(s),
		{ timeout: 30_000 },
		sel,
	);
}

async function danhDau(t, sel) {
	await t.evaluate(
		([s, ma]) => {
			const e = document.querySelector(s);
			if (e) e.dataset.gdtDau = ma;
		},
		[sel, MA],
	);
}

async function choGiuaHieuUng(t, sel, trangThai) {
	await t.waitForFunction(
		([s, tt]) => {
			const e = document.querySelector(s);
			if (!e || e.getAttribute("data-state") !== tt) return false;
			return e.getAnimations().some((a) => {
				const dai = Number(a.effect?.getTiming().duration) || 0;
				return (
					a.playState === "running" &&
					dai > 0 &&
					Number(a.currentTime) >= dai * 0.4
				);
			});
		},
		{ timeout: 30_000, polling: "raf" },
		[sel, trangThai],
	);
}

try {
	const [deal] = await d.db.$queryRawUnsafe(
		`SELECT name FROM "deal" WHERE id = $1`,
		DEAL,
	);
	if (!deal) {
		console.log(`KHONG DO DUOC: tien de thieu thoa thuan ${DEAL}`);
		process.exit(2);
	}
	const ten = deal.name;
	const chu = await d.nguoiMoi("gdt", "owner", "Phan Kiểm Ngăn Bản Ghi");
	await d.batTrinhDuyet(chu.cookie);
	const duong = `/deals?q=${encodeURIComponent(ten)}`;

	for (const kho of [RONG, HEP])
		await d.chayBuoc(`do-${kho}`, async () => {
			const sel = selNgan(kho);
			const t = await d.moTrang(chu.cookie, kho, duong);
			await t.waitForFunction(timDong, { timeout: 30_000 }, ten);

			await caiDo(t, sel);
			ghiO(kho, "mo", xetMo(await khungSau(t, sel, "mo", { ten })));
			await choMoXong(t, sel).catch(() => null);

			await caiDo(t, sel);
			ghiO(kho, "dong", xetDong(await khungSau(t, sel, "dong", { ten })));
			await choDongXong(t, sel).catch(() => null);

			await t.evaluate((x) => {
				const dong = [
					...document.querySelectorAll("td, [role=cell], a, span, div"),
				]
					.filter((e) => e.checkVisibility())
					.find((e) => (e.textContent ?? "").trim() === x);
				dong?.click();
			}, ten);
			await choMoXong(t, sel);
			await danhDau(t, sel);
			await caiDo(t, sel);
			ghiO(
				kho,
				"mo lai",
				xetMoLai(await khungSau(t, sel, "mo-lai", { ten, moLaiSauMs: 60 })),
			);
			await t.close();
		});

	for (const kho of [RONG, HEP])
		await d.chayBuoc(`chup-${kho}`, async () => {
			const sel = selNgan(kho);
			const t = await d.moTrang(chu.cookie, kho, duong);
			await t.waitForFunction(timDong, { timeout: 30_000 }, ten);
			const cdp = await t.createCDPSession();
			await cdp.send("Animation.enable");
			await cdp.send("Animation.setPlaybackRate", { playbackRate: 0.1 });
			const bamDong = () =>
				t.evaluate((x) => {
					const dong = [
						...document.querySelectorAll("td, [role=cell], a, span, div"),
					]
						.filter((e) => e.checkVisibility())
						.find((e) => (e.textContent ?? "").trim() === x);
					dong?.click();
				}, ten);
			const bamDongNgan = () =>
				t.evaluate((s) => {
					document
						.querySelector(
							`${s} [data-slot=sheet-close], ${s} [data-slot=drawer-close]`,
						)
						?.click();
				}, sel);
			const chup = async (tenAnh) => {
				await t.screenshot({ path: join(BANG_CHUNG, tenAnh) });
				console.log(`  anh ${tenAnh}`);
			};

			await bamDong();
			await choGiuaHieuUng(t, sel, "open");
			await chup(`gdt-mo-${kho}.png`);
			await choMoXong(t, sel);

			await bamDongNgan();
			await choGiuaHieuUng(t, sel, "closed");
			await chup(`gdt-dong-${kho}.png`);
			await choDongXong(t, sel);

			if (kho === RONG) {
				await bamDong();
				await choMoXong(t, sel);
				await bamDongNgan();
				await choGiuaHieuUng(t, sel, "closed");
				await bamDong();
				await cho(600);
				await chup("gdt-mo-lai-1440.png");
			}
			await t.close();
		});

	const thieu = 6 - o.length;
	if (thieu !== 0) {
		const cau = `man: thieu ${thieu} o trong ma tran 2 kho x 3 phep`;
		console.log(cau);
		appendFileSync(NHAT_KY, `${cau}\n`);
	}
	for (const x of o) d.dat(`${x.kho} ${x.phep}`, x.dat, "xem dong o");
	if (thieu !== 0) d.dat("ma tran", false, `thieu ${thieu} o`);

	const trangThai =
		/^status:\s*(\S+)/m.exec(readFileSync(HOP_DONG, "utf8"))?.[1] ?? "";
	if (DA_THONG_CONG.has(trangThai))
		console.log(
			`  ho so ${trangThai}: khong chep bang chung sang _acceptance/${HO_SO}/evidence/ — o ${BANG_CHUNG}`,
		);
	else {
		mkdirSync(NOI_GIU, { recursive: true });
		for (const tep of TEP_GIU) {
			const nguon = join(BANG_CHUNG, tep);
			if (existsSync(nguon)) copyFileSync(nguon, join(NOI_GIU, tep));
		}
	}

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
