import { execFileSync, spawn } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	openSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "may-soan-de-xuat";
const RONG = 1440;
const HEP = 390;
const GIAY = 1000;
const CHO_API = 120 * GIAY;
const CHO_CONG = 15 * GIAY;
const NHIP = 300;
const TEN_TEP = "quyet-dinh-hoa-hong-doi-tac.docx";
const TEN_TRANG = "Quyết định hoa hồng đối tác 2026";
const LOAI_CHON = "Quy trình";
const NHAN_DANG_SOAN = "Máy đang soạn";
const TOKEN_GIA = "vercel_blob_rw_msdgia_khonglakhoathat";
const MA_THO = /\b(CHO_DOC|CHO_SOAN|DANG_SOAN|DA_SOAN|CAN_GO_TAY|LOI)\b/;
const BIEN_PHIEN = [
	"DATABASE_URL",
	"APP_URL",
	"API_URL",
	"PHIEN_DO",
	"NEXT_PUBLIC_API_URL",
	"BANG_CHUNG",
];

const CAY_DO = {
	nhan: "ban sao an noi dung tab Nguon",
	tenCay: "msd-tai-nguon-chieu-do",
	chiBuoc: "1,2",
	tep: "apps/app/app/(app)/[slug]/tai-lieu/danh-sach.tsx",
	cam: (s) =>
		s.replace(
			'tab === "nguon" ? (\n\t\t\t\t\t<BangNguon />\n\t\t\t\t)',
			'tab === "nguon" ? (\n\t\t\t\t\tnull\n\t\t\t\t)',
		),
	dauVet: 'tab === "nguon" ? (\n\t\t\t\t\tnull\n\t\t\t\t)',
	ghim: /buoc 2: khong thay hang nguon/,
};

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

function chayGit(thamSo, noi) {
	return execFileSync("git", thamSo, { cwd: noi, encoding: "utf8" });
}

async function chieuDo() {
	console.log(`== chieu do: ${CAY_DO.nhan}`);
	const tam = mkdtempSync(join(tmpdir(), "msd-chieu-do-"));
	const sao = join(tam, "crm");
	let con = null;
	const ngat = () => con?.kill("SIGINT");
	process.on("SIGINT", ngat);
	process.on("SIGTERM", ngat);
	let ket = { ma: 2, cau: "chua chay" };
	try {
		chayGit(["worktree", "add", "--detach", "--quiet", sao, "HEAD"], GOC);
		const va = join(tam, "cay-hien-tai.diff");
		writeFileSync(va, chayGit(["diff", "HEAD", "--binary"], GOC));
		if (readFileSync(va, "utf8").trim() !== "")
			execFileSync("git", ["apply", "--whitespace=nowarn", va], {
				cwd: sao,
				stdio: "inherit",
			});
		for (const t of chayGit(["ls-files", "--others", "--exclude-standard"], GOC)
			.split("\n")
			.filter(Boolean)) {
			mkdirSync(dirname(join(sao, t)), { recursive: true });
			writeFileSync(join(sao, t), readFileSync(join(GOC, t)));
		}
		const env = join(GOC, ".env");
		if (existsSync(env)) symlinkSync(env, join(sao, ".env"));
		execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao,
			stdio: "inherit",
		});
		const tep = join(sao, CAY_DO.tep);
		const truoc = readFileSync(tep, "utf8");
		const sau = CAY_DO.cam(truoc);
		if (sau === truoc || !sau.includes(CAY_DO.dauVet)) {
			ket = { ma: 2, cau: `vet khong cam duoc vao ${CAY_DO.tep}` };
			return;
		}
		writeFileSync(tep, sau);
		const moiTruong = { ...process.env };
		for (const k of BIEN_PHIEN) delete moiTruong[k];
		moiTruong.PHIEN_DO_TEN_CAY = CAY_DO.tenCay;
		moiTruong.CHI_BUOC = CAY_DO.chiBuoc;
		const lenh = `bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, TEP_NAY)}"`;
		let ra = "";
		const ma = await new Promise((xong) => {
			con = spawn("bash", ["-c", lenh], {
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
		const ghim = ra.match(CAY_DO.ghim)?.[0] ?? null;
		if (ma === 2) ket = { ma: 2, cau: "ban sao thoat ma 2 (tien de thieu)" };
		else if (ma === 1 && ghim)
			ket = { ma: 0, cau: `DO DUNG GHIM: ma 1, in «${ghim}»` };
		else
			ket = {
				ma: 1,
				cau: `LOT: ma ${ma}, ${ghim ? "co ghim" : `khong thay ${CAY_DO.ghim}`}`,
			};
	} finally {
		process.off("SIGINT", ngat);
		process.off("SIGTERM", ngat);
		try {
			chayGit(["worktree", "remove", "--force", sao], GOC);
		} catch {}
		rmSync(tam, { recursive: true, force: true });
		try {
			chayGit(["worktree", "prune"], GOC);
		} catch {}
		console.log(`chieu do: ${ket.cau}`);
		process.exit(ket.ma);
	}
}

if (process.argv.includes("--chieu-do")) await chieuDo();

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		'KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs"',
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const BANG_CHUNG = process.env.BANG_CHUNG;
const CHI_BUOC = new Set(
	(process.env.CHI_BUOC ?? "").split(",").filter(Boolean),
);
const chay = (n) => CHI_BUOC.size === 0 || CHI_BUOC.has(String(n));

const NAP_TRUOC = `import { createRequire } from "node:module";
const goc = globalThis.fetch;
const GIA = process.env.BLOB_GIA_URL;
const doi = (vao, tuy) => {
	const s = typeof vao === "string" ? vao : vao instanceof URL ? vao.href : vao.url;
	const u = new URL(s);
	if (u.hostname.endsWith(".blob.vercel-storage.com"))
		return goc(GIA + "/blob" + u.pathname + u.search, tuy);
	return goc(vao, tuy);
};
globalThis.fetch = doi;
createRequire(import.meta.url)("undici").fetch = doi;
`;

function b64(o) {
	return Buffer.from(JSON.stringify(o)).toString("base64url");
}

function moBlobGia() {
	const kho = new Map();
	const nhatKy = [];
	const cors = {
		"access-control-allow-origin": "*",
		"access-control-allow-methods": "GET,PUT,POST,OPTIONS",
		"access-control-allow-headers": "*",
	};
	const may = Bun.serve({
		port: 0,
		async fetch(req) {
			const u = new URL(req.url);
			if (req.method === "OPTIONS")
				return new Response(null, { status: 204, headers: cors });
			nhatKy.push(`${req.method} ${u.pathname}`);
			if (u.pathname === "/signed-token" && req.method === "POST") {
				const vao = await req.json();
				return Response.json({
					clientSigningToken: "khoa-ky-gia",
					delegationToken: `${b64({ storeId: "store_msdgia", ...vao })}.gia`,
				});
			}
			if (u.pathname === "/" && req.method === "PUT") {
				const p = u.searchParams.get("pathname") ?? "";
				kho.set(p, new Uint8Array(await req.arrayBuffer()));
				return Response.json({ pathname: p }, { headers: cors });
			}
			if (u.pathname === "/delete" && req.method === "POST") {
				const vao = await req.json();
				for (const x of vao.urls ?? []) kho.delete(x);
				return Response.json({});
			}
			if (u.pathname.startsWith("/blob/")) {
				const b = kho.get(decodeURIComponent(u.pathname.slice(6)));
				return b ? new Response(b) : new Response("", { status: 404 });
			}
			return new Response("", { status: 400 });
		},
	});
	return {
		url: `http://localhost:${may.port}`,
		kho,
		nhatKy,
		dung: () => may.stop(true),
	};
}

function congCon(cong) {
	return new Promise((xong) => {
		const s = connect({ port: cong, host: "localhost" });
		s.setTimeout(NHIP);
		s.once("connect", () => {
			s.destroy();
			xong(true);
		});
		s.once("timeout", () => {
			s.destroy();
			xong(false);
		});
		s.once("error", () => xong(false));
	});
}

function nhomSong(pgid) {
	try {
		process.kill(-pgid, 0);
		return true;
	} catch {
		return false;
	}
}

async function tatNhom(pgid) {
	try {
		process.kill(-pgid, "SIGTERM");
	} catch {}
	const han = Date.now() + CHO_CONG;
	while (Date.now() < han && nhomSong(pgid)) await cho(NHIP);
	if (nhomSong(pgid))
		try {
			process.kill(-pgid, "SIGKILL");
		} catch {}
}

async function thayApi(blob) {
	const { PHIEN_DO: CAU } = await import(
		"../../../scripts/lan-do/cau-hinh.mjs"
	);
	const thuMuc = join(GOC, CAU.ghi, process.env.PHIEN_DO);
	const ghi = JSON.parse(readFileSync(join(thuMuc, "phien.json"), "utf8"));
	const api = (ghi.nhom ?? []).find((n) => n.ten === "api");
	if (!api)
		throw new Error(`phien.json cua ${process.env.PHIEN_DO} khong co may api`);
	const API = process.env.API_URL;
	const cong = Number(new URL(API).port);
	await tatNhom(api.pgid);
	const han = Date.now() + CHO_CONG;
	while (Date.now() < han && (await congCon(cong))) await cho(NHIP);
	if (await congCon(cong))
		throw new Error(`cong ${cong} van ban sau khi tat api phien`);

	const tam = mkdtempSync(join(tmpdir(), "msd-blob-gia-"));
	const nap = join(tam, "nap-truoc.mjs");
	writeFileSync(nap, NAP_TRUOC);
	const nhatKy = join(thuMuc, "api-blob-gia.log");
	const fd = openSync(nhatKy, "w");
	const con = spawn("bun", ["--preload", nap, "src/main.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: {
			...process.env,
			PORT: String(cong),
			KHO_TAI_LIEU_BLOB_TOKEN: TOKEN_GIA,
			BLOB_READ_WRITE_TOKEN: "",
			VERCEL_BLOB_API_URL: blob.url,
			BLOB_GIA_URL: blob.url,
		},
		detached: true,
		stdio: ["ignore", fd, fd],
	});
	const tat = async () => {
		await tatNhom(con.pid);
		rmSync(tam, { recursive: true, force: true });
	};
	const hanApi = Date.now() + CHO_API;
	while (Date.now() < hanApi) {
		if (con.exitCode !== null)
			throw new Error(
				`api blob gia thoat ${con.exitCode}: ${readFileSync(nhatKy, "utf8").slice(-600)}`,
			);
		const ok = await fetch(`${API}/health`)
			.then((r) => r.status === 200)
			.catch(() => false);
		if (ok) return tat;
		await cho(NHIP);
	}
	await tat();
	throw new Error(`api blob gia khong san sang sau ${CHO_API / GIAY}s`);
}

const blob = moBlobGia();
let tatApi = null;
try {
	tatApi = await thayApi(blob);
	console.log(
		`-- blob gia ${blob.url}; api phien chay lai voi KHO_TAI_LIEU_BLOB_TOKEN gia`,
	);
} catch (e) {
	blob.dung();
	console.log(
		`KHONG DO DUOC: khong dung duoc Blob gia — ${String(e?.message ?? e).slice(0, 400)}`,
	);
	process.exit(2);
}

const { moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
const { docxNho } = await import(
	"../../../apps/api/test/tai-lieu-nguon-mau.ts"
);

const thuMucTep = mkdtempSync(join(tmpdir(), "msd-tep-"));
const duongTep = join(thuMucTep, TEN_TEP);
writeFileSync(duongTep, docxNho(`Mức hoa hồng Vàng 0,8% từ ${Date.now()}`));
mkdirSync(BANG_CHUNG, { recursive: true });

const donHet = async () => {
	await tatApi?.().catch(() => null);
	blob.dung();
	rmSync(thuMucTep, { recursive: true, force: true });
};
for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
	process.on(tin, () => {
		void donHet().then(() => process.exit(130));
	});
process.on("exit", () => {
	blob.dung();
});

const d = await moDo();

async function moHopTai(t) {
	await d.bamSel(t, "[data-tai-nguon]:not([disabled])");
	await d.doi(
		t,
		() =>
			window.__tim("[data-hop-tai-nguon] [data-slot='nguon-keo-tha']").length >
			0,
	);
	await cho(400);
}

const docHop = (t) =>
	t.evaluate(() => {
		const hop = document.querySelector("[data-hop-tai-nguon]");
		const moi = [...(hop?.querySelectorAll("[role='radio']") ?? [])].find((r) =>
			r.id.endsWith("-dich-moi"),
		);
		return {
			coHop: !!hop,
			keoTha: !!hop?.querySelector("[data-slot='nguon-keo-tha']"),
			chu: hop?.innerText ?? "",
			moiChon: moi?.getAttribute("aria-checked") === "true",
			tranNgang: hop ? hop.scrollWidth > hop.clientWidth + 1 : false,
			phaiTran: hop
				? hop.getBoundingClientRect().right > window.innerWidth + 1
				: false,
		};
	});

const docHang = (t, khung) =>
	t.evaluate(
		(khung) =>
			window.__tim(`${khung} [data-nguon]`).map((e) => ({
				chu: e.innerText,
				trangThai: e.getAttribute("data-trang-thai"),
			})),
		khung,
	);

async function chonLoai(t, chu) {
	const id = await t.evaluate(() => {
		const nhan = [
			...document.querySelectorAll("[data-hop-tai-nguon] label"),
		].find((l) => l.textContent.trim() === "Loại trang");
		return nhan?.getAttribute("for") ?? null;
	});
	if (!id) throw new Error("khong thay o «Loại trang» trong hop tai");
	await t.click(`[id="${id}"]`);
	await d.doi(t, () => window.__tim("[role='option']").length > 0);
	await d.bamChu(t, "[role='option']", chu);
}

try {
	const nguoi = await d.nguoiMoi("t", "member", "Lê Thu Trang");
	const trangThai = await d.hoi(nguoi.cookie, "taiLieuNguon.trangThai");
	if (trangThai?.bat !== true) {
		console.log("kho nguon tat tren api phien");
		await donHet();
		process.exit(1);
	}
	console.log("kho nguon bat tren api phien");
	await d.batTrinhDuyet(nguoi.cookie);

	let trang = null;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			trang = await d.moTrang(nguoi.cookie, RONG, "/tai-lieu");
			await moHopTai(trang);
			const hop = await docHop(trang);
			await d.chup(trang, "msd-tai-1440.png");
			const loi = [];
			if (!hop.coHop) loi.push("khong mo duoc hop tai");
			if (!hop.keoTha) loi.push("hop tai khong co vung keo tha");
			if (!hop.moiChon) loi.push("dich «Trang mới» chua duoc chon");
			if (!hop.chu.includes("Kéo tệp vào đây"))
				loi.push("vung keo tha khong co «Kéo tệp vào đây»");
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			if (!trang) {
				trang = await d.moTrang(nguoi.cookie, RONG, "/tai-lieu");
				await moHopTai(trang);
			}
			const t = trang;
			const o = await t.$("[data-hop-tai-nguon] input[type='file']");
			if (!o) throw new Error("khong thay o chon tep trong hop tai");
			await o.uploadFile(duongTep);
			await d.doi(t, () => window.__tim("[data-tep-da-chon]").length > 0);
			await t.type("[data-hop-tai-nguon] input[name='ten']", TEN_TRANG);
			await chonLoai(t, LOAI_CHON);
			await d.bamSel(t, "[data-tai-len]:not([disabled])");
			await d
				.doi(t, () => window.location.search.includes("tabTaiLieu=nguon"))
				.catch(() => null);
			await d
				.doi(t, () => window.__tim("[data-bang-nguon] [data-nguon]").length > 0)
				.catch(() => null);
			await cho(800);
			const hang = await docHang(t, "[data-bang-nguon]");
			await d.chup(t, "msd-nguon-1440.png");
			await t.close();
			trang = null;
			const cua = hang.filter((h) => h.chu.includes(TEN_TEP));
			if (cua.length === 0) {
				d.dat(2, false, "khong thay hang nguon");
				return;
			}
			const loi = [];
			if (cua.length !== 1) loi.push(`${cua.length} hang cho ${TEN_TEP}`);
			if (!cua[0].chu.includes(NHAN_DANG_SOAN))
				loi.push(
					`hang khong co «${NHAN_DANG_SOAN}»: ${cua[0].chu.replace(/\s+/g, " ")}`,
				);
			if (!cua[0].chu.includes(TEN_TRANG))
				loi.push("hang khong co ten trang dich");
			if (hang.some((h) => MA_THO.test(h.chu)))
				loi.push("hang in ma trang thai tho");
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const t = await d.moTrang(nguoi.cookie, HEP, "/tai-lieu");
			await moHopTai(t);
			const hop = await docHop(t);
			if (hop.tranNgang || hop.phaiTran) loi.push("hop tai 390 tran ngang");
			const tran = await d.cuonNgang(t);
			if (tran.length > 0)
				loi.push(`hop tai 390 cuon ngang: ${tran.join(", ")}`);
			await d.chup(t, "msd-tai-390.png");
			await t.close();
			const t2 = await d.moTrang(
				nguoi.cookie,
				HEP,
				"/tai-lieu?tabTaiLieu=nguon",
			);
			await d
				.doi(t2, () => window.__tim("[data-the-nguon] [data-nguon]").length > 0)
				.catch(() => null);
			const the = await docHang(t2, "[data-the-nguon]");
			if (!the.some((h) => h.chu.includes(TEN_TEP)))
				loi.push("390: khong thay the nguon vua tai");
			const tran2 = await d.cuonNgang(t2);
			if (tran2.length > 0)
				loi.push(`tab Nguon 390 cuon ngang: ${tran2.join(", ")}`);
			await d.chup(t2, "msd-nguon-390.png");
			await t2.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	await donHet();
	await d.ket("man-tai-nguon");
} catch (e) {
	await donHet();
	await d.khongDoDuoc(e);
}
