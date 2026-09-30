#!/usr/bin/env bun
import { execFileSync, spawn } from "node:child_process";
import {
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
const HO_SO = "hydrat-giai-doan-deals";
const DICH = join(GOC, ".acceptance-runs", HO_SO, "evidence");
const TRUOC_VONG = "6e431a011d1b4cedf21290c0ebbb9df3e420900b";
const TEP_NGAN = "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx";
const LENH_DO = `bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, TEP_NAY)}"`;
const GHIM_DO = /html may chu \/deals: ma tho [A-Z_]+/;

async function chieuDo() {
	console.log(
		`== chieu do: ban sao voi ${TEP_NGAN} cua ${TRUOC_VONG.slice(0, 8)}`,
	);
	const tam = mkdtempSync(join(tmpdir(), "hgd-man-chieu-do-"));
	const sao = join(tam, "crm");
	let con = null;
	const ngat = () => con?.kill("SIGINT");
	process.on("SIGINT", ngat);
	process.on("SIGTERM", ngat);
	let ket = { ma: 2, cau: "chua chay" };
	try {
		const banCu = execFileSync("git", ["show", `${TRUOC_VONG}:${TEP_NGAN}`], {
			cwd: GOC,
			encoding: "utf8",
		});
		execFileSync(
			"git",
			["worktree", "add", "--detach", "--quiet", sao, "HEAD"],
			{
				cwd: GOC,
				stdio: "inherit",
			},
		);
		const env = join(GOC, ".env");
		if (existsSync(env)) symlinkSync(env, join(sao, ".env"));
		execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao,
			stdio: "inherit",
		});
		writeFileSync(join(sao, relative(GOC, TEP_NAY)), readFileSync(TEP_NAY));
		const tep = join(sao, TEP_NGAN);
		if (readFileSync(tep, "utf8") === banCu) {
			ket = { ma: 2, cau: "tep ngan o HEAD trung ban truoc vong" };
			return;
		}
		writeFileSync(tep, banCu);
		const moiTruong = { ...process.env };
		for (const k of [
			"DATABASE_URL",
			"APP_URL",
			"API_URL",
			"PHIEN_DO",
			"NEXT_PUBLIC_API_URL",
		])
			delete moiTruong[k];
		moiTruong.PHIEN_DO_TEN_CAY = "hgd-chieu-do";
		moiTruong.LUOT = "1";
		let ra = "";
		const ma = await new Promise((xong) => {
			con = spawn("bash", ["-c", LENH_DO], {
				cwd: sao,
				env: moiTruong,
				stdio: ["ignore", "pipe", "pipe"],
			});
			const ghi = (b) => {
				ra += b.toString();
				process.stdout.write(b);
			};
			con.stdout.on("data", ghi);
			con.stderr.on("data", ghi);
			con.on("error", () => xong(2));
			con.on("exit", (m) => xong(m ?? 2));
		});
		const ghim = ra.match(GHIM_DO)?.[0] ?? null;
		if (ma === 2) ket = { ma: 2, cau: "ban sao thoat ma 2 (tien de thieu)" };
		else if (ma === 1 && ghim)
			ket = { ma: 0, cau: `DO DUNG GHIM: ma 1, in «${ghim}»` };
		else
			ket = {
				ma: 1,
				cau: `LOT: ma ${ma}, ${ghim ? "co ghim" : `khong thay ${GHIM_DO}`}`,
			};
	} catch (e) {
		ket = { ma: 2, cau: `ban sao khong dung duoc: ${String(e).slice(0, 200)}` };
	} finally {
		process.off("SIGINT", ngat);
		process.off("SIGTERM", ngat);
		try {
			execFileSync("git", ["worktree", "remove", "--force", sao], {
				cwd: GOC,
				stdio: "ignore",
			});
		} catch {}
		rmSync(tam, { recursive: true, force: true });
		try {
			execFileSync("git", ["worktree", "prune"], { cwd: GOC, stdio: "ignore" });
		} catch {}
		console.log(`chieu do: ${ket.cau}`);
		process.exit(ket.ma);
	}
}

if (process.argv.includes("--chieu-do")) await chieuDo();

const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const {
	APP,
	API,
	CHROME,
	chiaCookie,
	datTrinhDuyet,
	goiApiTao,
	ket,
	khongDo,
	suySlug,
} = await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");

const DO = {
	luot: Number(process.env.LUOT ?? 6),
	rong: 1440,
	cao: 900,
	choTaiMs: 120_000,
	choSauTaiMs: 1500,
};
const MA = `hgd${Date.now().toString(36).slice(-6)}`;
const TONE = { OPEN: "info", WON: "success", LOST: "error" };
const LOI_HYDRAT =
	/Hydration failed|didn't match|hydrated but some attributes/i;
const O_BANG =
	/<span[^>]*data-slot="status-indicator"[^>]*data-tone="([a-z]+)"[^>]*>[\s\S]*?<span class="truncate">([^<]*)<\/span>/g;
const TIEU_DE_COT =
	/<h3[^>]*>(?:<span[^>]*>)?<span class="min-w-0 break-words"[^>]*>([^<]*)<\/span>/g;

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const { isMeasureDatabase } = await import(
	"../../../packages/db/src/measure-database.ts"
);
const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho) || process.env.PHIEN_DO !== tenKho)
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do cua chinh phien) — kho "${tenKho}", PHIEN_DO "${process.env.PHIEN_DO ?? ""}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { WORKSPACE_ID } = await import("../../../packages/db/src/workspace.ts");

const email = `${MA}@thu.test`;
const cookie = chiaCookie(
	execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps", "api"),
		encoding: "utf8",
	})
		.trim()
		.split("\n")
		.pop()
		.trim(),
);
const nguoi = await db.user.update({
	where: { email },
	data: { name: "Người đo Deals" },
	select: { id: true },
});
await db.member.upsert({
	where: {
		organizationId_userId: { organizationId: WORKSPACE_ID, userId: nguoi.id },
	},
	create: {
		id: `member-${nguoi.id}`,
		organizationId: WORKSPACE_ID,
		userId: nguoi.id,
		role: "admin",
		createdAt: new Date(),
	},
	update: { role: "admin" },
});
await db.session.updateMany({
	where: { userId: nguoi.id },
	data: { activeOrganizationId: WORKSPACE_ID },
});
const mu = { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi` };

async function doc(duong, vao) {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await fetch(`${API}/api/trpc/${duong}${q}`, { headers: mu });
	const chu = await res.text();
	if (!res.ok)
		await khongDo(
			`KHONG DO DUOC: ${duong} tra ${res.status}: ${chu.slice(0, 160)}`,
		);
	return JSON.parse(chu).result.data;
}

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await khongDo(`KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

function nutChu(html) {
	return html
		.replace(/<script\b[\s\S]*?<\/script>/g, "")
		.replace(/<style\b[\s\S]*?<\/style>/g, "")
		.split(/<[^>]*>/)
		.map((s) => s.trim())
		.filter(Boolean);
}

const hong = [];
let soKiem = 0;
const kiem = (nhan, dat) => {
	soKiem += 1;
	console.log(`  ${dat ? "ok" : "HONG"}: ${nhan}`);
	if (!dat) hong.push(nhan);
	return dat;
};

let trinhDuyet = null;
let ma = 0;
try {
	const giaiDoan = (await doc("giaiDoan.list")).stages;
	const theoLoai = Object.fromEntries(
		Object.keys(TONE).map((loai) => [
			loai,
			giaiDoan.find((g) => g.kind === loai),
		]),
	);
	for (const [loai, g] of Object.entries(theoLoai))
		if (!g)
			await khongDo(
				`KHONG DO DUOC: giaiDoan.list khong co giai doan loai ${loai}`,
			);
	const maTho = new Set(
		giaiDoan.filter((g) => g.id !== g.label).map((g) => g.id),
	);
	const nhan = new Map(giaiDoan.map((g) => [g.label, g.kind]));
	if (maTho.size === 0)
		await khongDo(
			"KHONG DO DUOC: moi giai doan co ma trung nhan — khong phan biet duoc ma tho",
		);

	const toi = await doc("users.me");
	const congTy = await tao("companies.create", { name: `Cong ty ${MA}` });
	for (const [loai, g] of Object.entries(theoLoai))
		await tao("deals.create", {
			name: `${MA} ${loai}`,
			companyId: congTy.id,
			ownerId: toi.id,
			stage: g.id,
		});
	const dong = (await doc("deals.list", { q: MA })).rows;
	const slug = await suySlug(cookie);
	console.log(
		`man-deals: slug ${slug} · ma ${MA} · ${giaiDoan.length} giai doan · ${dong.length} deal cua luot · luot=${DO.luot}`,
	);
	kiem(`deals.list q=${MA} tra 3 dong`, dong.length === 3);

	const man = {
		bang: `/deals?q=${MA}`,
		kanban: `/deals?view=board&q=${MA}`,
	};
	const htmlMayChu = {};
	for (const [ten, duong] of Object.entries(man)) {
		const res = await fetch(`${APP}/${slug}${duong}`, { headers: mu });
		const html = await res.text();
		htmlMayChu[ten] = html;
		const tho = nutChu(html).filter((c) => maTho.has(c));
		kiem(`html may chu ${ten}: tra ${res.status}`, res.status === 200);
		if (tho.length > 0) console.log(`html may chu /deals: ma tho ${tho[0]}`);
		kiem(`html may chu ${ten}: ma tho: ${tho.length}`, tho.length === 0);
	}

	const o = [...htmlMayChu.bang.matchAll(O_BANG)].map((m) => ({
		tone: m[1],
		chu: m[2],
	}));
	kiem(
		`bang: ${o.length} o giai doan, bang so dong deals.list ${dong.length}`,
		o.length === 3 && o.length === dong.length,
	);
	for (const [loai, g] of Object.entries(theoLoai)) {
		const trung = o.filter((x) => x.chu === g.label);
		kiem(
			`bang: loai ${loai} «${g.label}» dung mot o, sac ${TONE[loai]} (thay ${trung.map((x) => x.tone).join(",") || "-"})`,
			trung.length === 1 && trung[0].tone === TONE[loai],
		);
	}
	const cot = [...htmlMayChu.kanban.matchAll(TIEU_DE_COT)].map((m) => m[1]);
	kiem(
		`kanban: ${cot.length} tieu de cot, bang ${giaiDoan.length} giai doan`,
		cot.length === giaiDoan.length,
	);
	const cotLa = cot.filter((c) => !nhan.has(c));
	kiem(
		`kanban: tieu de cot khong phai nhan: ${cotLa.join(",") || "-"}`,
		cotLa.length === 0,
	);

	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	datTrinhDuyet(trinhDuyet);
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);

	async function taiMan(duong, truocHydrat) {
		const trang = await ctx.newPage();
		await trang.setViewport({ width: DO.rong, height: DO.cao });
		const loi = [];
		trang.on("pageerror", (e) => loi.push(String(e)));
		trang.on("console", (x) => {
			if (x.type() === "error") loi.push(x.text());
		});
		if (truocHydrat) await trang.evaluateOnNewDocument(truocHydrat);
		await trang.goto(`${APP}/${slug}${duong}`, {
			waitUntil: "networkidle0",
			timeout: DO.choTaiMs,
		});
		await new Promise((x) => setTimeout(x, DO.choSauTaiMs));
		return { trang, loiHydrat: loi.filter((t) => LOI_HYDRAT.test(t)) };
	}

	const doiChung = await taiMan(man.bang, () => {
		const theoDoi = new MutationObserver(() => {
			const o = document.querySelector(
				"table [data-slot='status-indicator'] .truncate",
			);
			if (o) {
				o.textContent = `${o.textContent} (lech co y)`;
				theoDoi.disconnect();
			}
		});
		theoDoi.observe(document, { childList: true, subtree: true });
	});
	console.log(`doi chung bo nghe: ${doiChung.loiHydrat.length} loi`);
	kiem(
		"doi chung bo nghe: thay loi hydrat co y",
		doiChung.loiHydrat.length >= 1,
	);
	await doiChung.trang.close();

	mkdirSync(DICH, { recursive: true });
	const loiThat = [];
	let soLuot = 0;
	for (let l = 0; l < DO.luot; l++) {
		for (const [ten, duong] of Object.entries(man)) {
			const { trang, loiHydrat } = await taiMan(duong);
			soLuot += 1;
			for (const t of loiHydrat)
				loiThat.push(
					`luot ${l} ${ten}: ${t.replace(/\s+/g, " ").slice(0, 300)}`,
				);
			if (l === 0) {
				if (ten === "bang") {
					const sauTai = await trang.$$eval(
						"table [data-slot='status-indicator'] .truncate",
						(ds) => ds.map((d) => d.textContent),
					);
					kiem(
						`sau tai bang: chu o [${sauTai.join(" | ")}] bang html may chu [${o.map((x) => x.chu).join(" | ")}]`,
						JSON.stringify(sauTai) === JSON.stringify(o.map((x) => x.chu)),
					);
				}
				const anh = join(
					DICH,
					`hgd-${ten === "bang" ? "deals" : "board"}-${DO.rong}.png`,
				);
				await trang.screenshot({ path: anh });
				console.log(`  anh: ${relative(GOC, anh)}`);
			}
			await trang.close();
		}
	}
	console.log(`loi hydrat: ${loiThat.length}/${soLuot} luot`);
	for (const d of loiThat.slice(0, 5)) console.log(`    ${d}`);
	kiem(`loi hydrat: ${loiThat.length}/${soLuot} luot`, loiThat.length === 0);
	await ctx.close();
} catch (e) {
	hong.push(`nem: ${String(e?.stack ?? e).slice(0, 600)}`);
} finally {
	console.log(`man-deals: ${soKiem} kiem, ${hong.length} hong`);
	for (const h of hong) console.log(`  HONG ${h}`);
	ma = hong.length === 0 ? 0 : 1;
	await db.$disconnect().catch(() => {});
}
await ket(ma);
