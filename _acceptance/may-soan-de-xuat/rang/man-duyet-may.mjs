import { execFileSync, spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
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
process.env.BANG_CHUNG ??= join(
	GOC,
	".acceptance-runs",
	"may-soan-de-xuat",
	"evidence",
);

const CAY_DO = {
	nhan: "ban sao nguon-canh-nhau.tsx xep hai cot thanh mot cot o 1440",
	tenCay: "msd-duyet-may-chieu-do",
	chiBuoc: "2",
	tep: "packages/ui/src/components/nguon-canh-nhau.tsx",
	cam: (s) =>
		s.replace(
			'"grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6"',
			'"grid grid-cols-1 items-start gap-6"',
		),
	dauVet: '"grid grid-cols-1 items-start gap-6"',
	ghim: /buoc 2: khong canh nhau/,
};

const BIEN_PHIEN = [
	"DATABASE_URL",
	"APP_URL",
	"API_URL",
	"PHIEN_DO",
	"NEXT_PUBLIC_API_URL",
	"BANG_CHUNG",
];

function git(doiSo, cwd, tuy = {}) {
	return execFileSync("git", doiSo, { cwd, encoding: "utf8", ...tuy });
}

function chepCayDangSua(sao) {
	const vet = git(["diff", "HEAD", "--binary"], GOC);
	if (vet.trim() !== "") {
		const tepVet = join(dirname(sao), "cay-dang-sua.diff");
		writeFileSync(tepVet, vet);
		git(["apply", "--whitespace=nowarn", tepVet], sao);
	}
	const moi = git(["ls-files", "--others", "--exclude-standard", "-z"], GOC)
		.split("\0")
		.filter(Boolean);
	for (const tep of moi) {
		mkdirSync(dirname(join(sao, tep)), { recursive: true });
		copyFileSync(join(GOC, tep), join(sao, tep));
	}
}

async function chieuDo(cay) {
	console.log(`== chieu do: ${cay.nhan}`);
	const tam = mkdtempSync(join(tmpdir(), "msd-chieu-do-"));
	const sao = join(tam, "crm");
	const lenh = `bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, TEP_NAY)}"`;
	let con = null;
	const ngat = () => con?.kill("SIGINT");
	process.on("SIGINT", ngat);
	process.on("SIGTERM", ngat);
	let ket = { ma: 2, cau: "chua chay" };
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"], GOC, {
			stdio: "inherit",
		});
		chepCayDangSua(sao);
		const env = join(GOC, ".env");
		if (existsSync(env)) symlinkSync(env, join(sao, ".env"));
		execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao,
			stdio: "inherit",
		});
		const tep = join(sao, cay.tep);
		const truoc = readFileSync(tep, "utf8");
		const sau = cay.cam(truoc);
		if (sau === truoc || !sau.includes(cay.dauVet)) {
			ket = { ma: 2, cau: `vet khong cam duoc vao ${cay.tep}` };
			return;
		}
		writeFileSync(tep, sau);
		const moiTruong = { ...process.env };
		for (const k of BIEN_PHIEN) delete moiTruong[k];
		moiTruong.PHIEN_DO_TEN_CAY = cay.tenCay;
		moiTruong.CHI_BUOC = cay.chiBuoc;
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
		const ghim = ra.match(cay.ghim)?.[0] ?? null;
		if (ma === 2) ket = { ma: 2, cau: "ban sao thoat ma 2 (tien de thieu)" };
		else if (ma === 1 && ghim)
			ket = { ma: 0, cau: `DO DUNG GHIM: ma 1, in «${ghim}»` };
		else
			ket = {
				ma: 1,
				cau: `LOT: ma ${ma}, ${ghim ? "co ghim" : `khong thay ${cay.ghim}`}`,
			};
	} finally {
		process.off("SIGINT", ngat);
		process.off("SIGTERM", ngat);
		try {
			git(["worktree", "remove", "--force", sao], GOC, { stdio: "ignore" });
		} catch {}
		rmSync(tam, { recursive: true, force: true });
		try {
			git(["worktree", "prune"], GOC, { stdio: "ignore" });
		} catch {}
		console.log(`chieu do: ${ket.cau}`);
		process.exit(ket.ma);
	}
}

if (process.argv.includes("--chieu-do")) await chieuDo(CAY_DO);

const { chay, HEP, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { taoDeXuatTaiLieu } = await import(
	"../../../packages/db/src/tai-lieu-de-xuat.ts"
);
const { PATHNAME_NGUON } = await import(
	"../../../packages/db/src/blob-nguon.ts"
);
const { docChu } = await import(
	"../../../apps/agent/agent/lib/tai-lieu-doc-chu.ts"
);
const { kiemBanMay } = await import(
	"../../../packages/validation/src/tai-lieu-so.ts"
);

const TEP_MAU = "quyet-dinh.docx";
const TEN_TRANG = "Chính sách hoa hồng công ty đối tác";
const BAN_DANG_DUNG = [
	"## Phạm vi",
	"",
	"Áp dụng cho các công ty đối tác đã ký hợp đồng khung.",
	"",
	"## Mức hoa hồng",
	"",
	"Mức hoa hồng do phòng Đối tác thông báo từng kỳ.",
].join("\n");
const BAN_MAY = [
	"## Phạm vi",
	"",
	"Áp dụng cho các công ty đối tác đã ký hợp đồng khung.",
	"",
	"## Mức hoa hồng",
	"",
	"Kể từ ngày 01/10/2026, công ty đối tác tầng hai hưởng 1,5% và tầng ba hưởng 1,8% giá trị giao dịch đã xác nhận.",
].join("\n");
const TRICH = [
	{ menhDe: "Áp dụng từ 01/10/2026", trich: "Kể từ ngày 01/10/2026" },
	{ menhDe: "Tầng hai hưởng 1,5%", trich: "tầng hai là 1,5%" },
	{ menhDe: "Tầng ba hưởng 1,8%", trich: "tầng ba là 1,8%" },
];

async function gieoBanMay(d, chu, tai) {
	const slugTrang = await d.taoTrangDangDung(chu, {
		ten: TEN_TRANG,
		loai: "chinh-sach",
		noiDung: BAN_DANG_DUNG,
	});
	const byte = new Uint8Array(
		readFileSync(join(GOC, "_acceptance", "may-soan-de-xuat", "mau", TEP_MAU)),
	);
	const doc = await docChu(byte, "docx");
	if (doc.loai !== "chu")
		throw new Error(`tep mau ${TEP_MAU} khong doc ra chu: ${doc.lyDo}`);
	const kiem = kiemBanMay({
		noiDung: BAN_MAY,
		trichDoan: TRICH,
		chuNguon: doc.chu,
		banGoc: BAN_DANG_DUNG,
	});
	if (!kiem.ok)
		throw new Error(
			`ban may gieo khong qua kiem so: ${JSON.stringify(kiem.loi)}`,
		);
	const trang = await d.db.taiLieuTrang.findUniqueOrThrow({
		where: { slug: slugTrang },
		select: { id: true, banDangDungId: true },
	});
	const nguon = await d.db.taiLieuNguon.create({
		data: {
			sha256: `${createHash("sha256").update(byte).digest("hex").slice(0, 48)}${randomUUID().slice(0, 16)}`,
			tenTep: TEP_MAU,
			kieu: "docx",
			kichThuoc: byte.length,
			blobPathname: PATHNAME_NGUON(randomUUID()),
			taiBoiId: tai.id,
			trangId: trang.id,
			trangThai: "DA_SOAN",
			chu: doc.chu,
			soTrang: doc.soTrang,
			banGocId: trang.banDangDungId,
		},
		select: { id: true },
	});
	const { deXuatId } = await d.db.$transaction((tx) =>
		taoDeXuatTaiLieu(tx, {
			trangId: trang.id,
			banGocId: trang.banDangDungId,
			ten: TEN_TRANG,
			noiDung: BAN_MAY,
			taoBoiId: tai.id,
			suKien: "DE_XUAT",
			nguonId: nguon.id,
			trichDoan: TRICH,
		}),
	);
	return { slugTrang, deXuatId };
}

const docMark = (t) =>
	t.evaluate(() => {
		const trong = (c) =>
			c === "" ||
			c === "transparent" ||
			/^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(c) ||
			/\/\s*0\)$/.test(c);
		return [...document.querySelectorAll("[data-slot='nguon-chu'] mark")].map(
			(e) => {
				const nen = getComputedStyle(e).backgroundColor;
				return { chu: e.textContent.trim(), nen, coNen: !trong(nen) };
			},
		);
	});

const docHaiCot = (t) =>
	t.evaluate(() => {
		const khung = document.querySelector("[data-slot='nguon-canh-nhau']");
		if (!khung) return null;
		const [a, b] = [...khung.children].map((e) => e.getBoundingClientRect());
		if (!a || !b)
			return { boCuc: khung.dataset.boCuc, so: khung.children.length };
		return {
			boCuc: khung.dataset.boCuc,
			so: khung.children.length,
			cungHang: Math.abs(a.top - b.top) < 2,
			benPhai: b.left >= a.right,
			tren: [Math.round(a.top), Math.round(b.top)],
			trai: [Math.round(a.left), Math.round(b.left)],
		};
	});

const docHaiThe = (t) =>
	t.evaluate(() => {
		const khung = document.querySelector("[data-slot='nguon-canh-nhau']");
		return {
			boCuc: khung?.dataset.boCuc ?? null,
			the: [...(khung?.querySelectorAll("[role='tab']") ?? [])].map((e) =>
				e.textContent.trim(),
			),
		};
	});

const nutDuyetKhoa = (t) =>
	t.evaluate(() => {
		const n = document.querySelector("[data-nut-duyet]");
		return n ? n.disabled : null;
	});

const d = await moDo();

try {
	const chu = await d.nguoiMoi("a", "member", "Lê Văn An");
	const tai = await d.nguoiMoi("b", "member", "Phạm Thu Hà");
	const { slugTrang, deXuatId } = await gieoBanMay(d, chu, tai);
	await d.batTrinhDuyet(chu.cookie);
	const duongDeXuat = `/tai-lieu/de-xuat/${deXuatId}`;
	const docXong = async (t) => {
		await d.bamSel(t, "[data-da-doc-nguon]");
		await d.doi(t, () =>
			document.querySelector("[data-slot='nguon-canh-nhau']"),
		);
	};

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(chu.cookie, RONG, "/tai-lieu");
			await d.bamSel(t, "[data-tab-cho-duyet]");
			await d.bamSel(t, `[data-hang-cho-duyet] [data-de-xuat='${deXuatId}']`);
			await d.choDuong(t, duongDeXuat);
			await d.doi(t, () =>
				document.querySelector(
					"[data-buoc-duyet='1'] [data-slot='nguon-chu'] mark",
				),
			);
			const mark = await docMark(t);
			const coDuyet = await t.evaluate(
				() => document.querySelector("[data-nut-duyet]") !== null,
			);
			await d.chup(t, "msd-duyet-b1-1440.png");
			await t.close();
			const loi = [];
			if (mark.length !== 3) loi.push(`${mark.length} mark, mong 3`);
			const khongNen = mark.find((m) => !m.coNen);
			if (khongNen)
				loi.push(`mark khong co nen (${khongNen.nen} o «${khongNen.chu}»)`);
			if (coDuyet) loi.push("co nut Duyet o buoc 1");
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(chu.cookie, RONG, duongDeXuat);
			await docXong(t);
			const cot = await docHaiCot(t);
			await d.chup(t, "msd-duyet-b2-1440.png");
			await t.close();
			const dung = cot?.cungHang === true && cot.benPhai === true;
			d.dat(2, dung, `khong canh nhau (${JSON.stringify(cot)})`);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(chu.cookie, HEP, duongDeXuat);
			await docXong(t);
			const the = await docHaiThe(t);
			const tran = await d.cuonNgang(t);
			const bang = await t.evaluate(() => {
				const k = document.querySelector(
					"[data-bang-so] [data-slot='table-container']",
				);
				return k ? { cuon: k.scrollWidth, khung: k.clientWidth } : null;
			});
			if (bang && bang.cuon > bang.khung + 1)
				tran.push(`bang so ${bang.cuon}>${bang.khung}`);
			await d.chup(t, "msd-duyet-390.png");
			await t.close();
			const loi = [];
			if (the.boCuc !== "hai-the") loi.push(`bo cuc ${the.boCuc}`);
			if (the.the.join("|") !== "Nguồn|Bản máy soạn")
				loi.push(`the «${the.the.join("|")}»`);
			if (tran.length > 0) loi.push(`cuon ngang o 390: ${tran.join(", ")}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const t = await d.moTrang(chu.cookie, RONG, duongDeXuat);
			await docXong(t);
			const loi = [];
			if ((await nutDuyetKhoa(t)) !== true)
				loi.push("Duyet khong khoa truoc khi tick");
			const soO = await t.evaluate(
				() =>
					document.querySelectorAll("[data-dong-so] [role='checkbox']").length,
			);
			if (soO !== 3) loi.push(`${soO} o Da doi chieu, mong 3`);
			for (let i = 0; i < soO; i += 1) {
				const o = await t.evaluateHandle(
					(i) =>
						document.querySelectorAll("[data-dong-so] [role='checkbox']")[i],
					i,
				);
				await o.click();
			}
			await d.doi(
				t,
				() => document.querySelector("[data-nut-duyet]")?.disabled === false,
			);
			await d.chup(t, "msd-duyet-tick-1440.png");
			await d.bamSel(t, "[data-nut-duyet]:not([disabled])");
			await d.choDuong(t, `/tai-lieu/${encodeURIComponent(slugTrang)}`);
			await d.doi(t, () => document.querySelector("[data-nguon-trang]"));
			const muc = await t.evaluate(() => {
				const m = document.querySelector("[data-nguon-trang]");
				return {
					chu: m?.innerText ?? "",
					nut: m?.querySelector("[data-tai-nguon]")?.innerText.trim() ?? null,
				};
			});
			await d.chup(t, "msd-doc-nguon.png");
			await t.close();
			if (!muc.chu.includes("Nguồn")) loi.push("muc Nguon khong co tieu de");
			if (!muc.chu.includes(TEP_MAU))
				loi.push(`muc Nguon khong co ten tep ${TEP_MAU}`);
			if (muc.nut !== "Tải về") loi.push(`nut tai ve «${muc.nut}»`);
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.ket("man-duyet-may");
} catch (e) {
	await d.khongDoDuoc(e);
}
