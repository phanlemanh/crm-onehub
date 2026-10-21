#!/usr/bin/env bun
/**
 * Hai chiều cho các thước của hồ sơ loc-don-vi-khong-tu-dong (DH13). Khuôn: khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs.
 *
 *   bun _acceptance/loc-don-vi-khong-tu-dong/rang/hai-chieu.mjs <ldv-dom|ldv-man> [--trinh-duyet]
 *
 * 1. Đối chứng dương: lệnh của nhóm trên vật lành phải thoát 0.
 * 2. Mỗi đột biến (khoá = tên LDV_PHA của evals.yaml): thay đúng đoạn `cu` → `moi` trong một worktree tạm (HEAD +
 *    thay đổi chưa commit), chạy lệnh ở đó → phải thoát ≠ 0 và đầu ra khớp thông điệp ghim.
 *    Cây thật không bị ghi: băm tệp bị đột biến trước và sau phải bằng.
 * Nhóm ldv-man dựng phiên đo trình duyệt cho mỗi đột biến, chỉ chạy khi có --trinh-duyet.
 * Mã thoát: 0 hai chiều đúng · 1 có chiều sai · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	lstatSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	readlinkSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "_acceptance/loc-don-vi-khong-tu-dong";
const TRINH_DUYET = process.argv.includes("--trinh-duyet");

const TRANG = "apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx";
const BANG = "apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx";
const GIU = "apps/app/app/(app)/[slug]/okr/theo-don-vi/giu-bang.ts";
const DT = "packages/ui/src/components/data-table.tsx";

const goBang = {
	ten: "go-bang",
	thay: [
		{
			tep: TRANG,
			cu: "\t} else if (byUnit.isPending) {\n",
			moi: "\t} else if (byUnit.isPending || byUnit.isPlaceholderData) {\n",
		},
	],
};

const DOT_BIEN = {
	"ldv-dom": [
		{
			ten: "luon-boc",
			thay: [{ tep: DT, cu: "refreshing === undefined ? (", moi: "false ? (" }],
			ghim: /ldv-bang: khong truyen van co vung/,
		},
		{
			ten: "boc-ca-goc",
			thay: [
				{ tep: DT, cu: "\t\t\t{bocVungBang(\n", moi: "\t\t\t{(\n" },
				{
					tep: DT,
					cu: "\treturn (\n\t\t<div className={cn(LAYOUT_CLASS[layout].root, className)}>",
					moi: "\treturn bocVungBang(\n\t\t<div className={cn(LAYOUT_CLASS[layout].root, className)}>",
				},
			],
			ghim: /ldv-bang: nut Loc nam trong vung mo/,
		},
		{
			ten: "giu-luon",
			thay: [
				{
					tep: GIU,
					cu: "return cungKhoa ? truoc : undefined;",
					moi: "return truoc;",
				},
			],
			ghim: /ldv-giu: doi don vi giu bang cu/,
		},
	],
	"ldv-man": [
		{
			...goBang,
			ghim: /SAI AC-1: menu Loc dong khi doi loc(?=[\s\S]*SAI AC-3: bang bi go khi doi loc)(?=[\s\S]*SAI AC-2: khung Loc thu lai khi doi loc)(?=[\s\S]*SAI AC-4: (bo loc qua khung cho|khong khop dong menu Loc))/,
			trinhDuyet: true,
		},
		{
			ten: "khong-mo",
			thay: [
				{
					tep: BANG,
					cu: "\t\t\t\trefreshing={dangTaiLai}\n",
					moi: "",
				},
			],
			ghim: /SAI AC-3: vung bang khong ban khi doi loc/,
			trinhDuyet: true,
		},
		{
			ten: "loi-treo",
			thay: [
				{
					tep: TRANG,
					cu: "\t} else if (byUnit.isError) {\n",
					moi: "\t} else if (false) {\n",
				},
			],
			ghim: /SAI AC-5: doi loc loi khong hien khung loi/,
			trinhDuyet: true,
		},
		{
			ten: "giu-moi-khoa",
			thay: [
				{
					tep: GIU,
					cu: "return cungKhoa ? truoc : undefined;",
					moi: "return truoc;",
				},
			],
			ghim: /SAI AC-6: doi chu ky giu bang cu/,
			trinhDuyet: true,
		},
	],
};

const DOM =
	"cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-tai-lai.dom.tsx -t ldv-bang && cd ../../apps/app && bun test ./test/loc-don-vi-giu-bang.spec.ts -t ldv-giu";
const MAN = `bun scripts/lan-do/tien-de.mjs --chay "bun ${HO_SO}/rang/man-loc.mjs"`;

const LENH = {
	"ldv-dom": () => DOM,
	"ldv-man": () => MAN,
};

function khongDoDuoc(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

// Bảng phải phủ MỌI tên LDV_PHA khai trong evals.yaml của hồ sơ.
const khai = new Set(
	[
		...readFileSync(join(GOC, HO_SO, "evals.yaml"), "utf8").matchAll(
			/LDV_PHA=([a-z0-9-]+)/g,
		),
	].map((x) => x[1]),
);
const coBang = new Set(
	Object.values(DOT_BIEN).flatMap((ds) => ds.map((d) => d.ten)),
);
const thieuBang = [...khai].filter((t) => !coBang.has(t));
if (thieuBang.length > 0)
	khongDoDuoc(
		`bang DOT_BIEN thieu ${thieuBang.join(", ")} (khai trong evals.yaml)`,
	);

const nhom = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!nhom || !(nhom in DOT_BIEN))
	khongDoDuoc(
		`nhom «${nhom ?? ""}» khong co trong bang — ${Object.keys(DOT_BIEN).join(", ")}`,
	);

const dsNhom = DOT_BIEN[nhom];
const chay = dsNhom.filter((d) => !d.chuaCo && (!d.trinhDuyet || TRINH_DUYET));
for (const d of dsNhom) {
	if (d.chuaCo)
		console.log(`CHUA CO ${nhom} ${d.ten}: vat do chua co — khong tinh do`);
	else if (d.trinhDuyet && !TRINH_DUYET)
		console.log(
			`BO QUA (trinh duyet) ${nhom} ${d.ten} — chay voi --trinh-duyet`,
		);
}
if (chay.length === 0) {
	console.log(`KET LUAN ${nhom}: khong dot bien nao chay trong luot nay`);
	process.exit(0);
}

function chayLenh(goc, lenh) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: goc,
		encoding: "utf8",
		env: { ...process.env, TZ: "Asia/Ho_Chi_Minh", LDV_PHA: "" },
		maxBuffer: 256 * 1024 * 1024,
		timeout: 30 * 60 * 1000,
	});
	return { ma: r.status ?? 2, chu: `${r.stdout}${r.stderr}` };
}

const bam = (s) => createHash("sha256").update(s).digest("hex");
const git = (cwd, ...a) =>
	execFileSync("git", a, {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});

const tepDot = [
	...new Set(
		chay.flatMap((d) =>
			d.thay.filter((t) => t.tao === undefined).map((t) => t.tep),
		),
	),
];
const bamTruoc = new Map(
	tepDot.map((t) => [t, bam(readFileSync(join(GOC, t), "utf8"))]),
);

// Đối chứng dương: mỗi lệnh khác nhau của nhóm trên vật lành phải thoát 0.
const lenhLanh = [...new Set(chay.map((d) => LENH[nhom](d)))];
for (const lenh of lenhLanh) {
	const lanh = chayLenh(GOC, lenh);
	if (lanh.ma !== 0) {
		console.log(lanh.chu.split("\n").slice(-30).join("\n"));
		console.log(
			`SAI ${nhom}: doi chung duong do tren vat lanh (ma ${lanh.ma}) — ${lenh}`,
		);
		process.exit(1);
	}
	console.log(`DUNG ${nhom} doi chung: vat lanh ma 0 — ${lenh}`);
}

/** node_modules của worktree tạm: trỏ về cây thật, trừ liên kết workspace `@crm`. */
function noiNodeModules(sao) {
	const ds = git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter(
			(d) =>
				/(^|\/)node_modules\/$/.test(d) &&
				!d.slice(0, -1).includes("node_modules/"),
		)
		.map((d) => d.slice(0, -1));
	for (const nm of ds) {
		const that = join(GOC, nm);
		const dich = join(sao, nm);
		if (existsSync(dich)) continue;
		const crm = join(that, "@crm");
		if (!existsSync(crm)) {
			symlinkSync(that, dich);
			continue;
		}
		mkdirSync(dich, { recursive: true });
		for (const e of readdirSync(that)) {
			if (e === "@crm") continue;
			symlinkSync(join(that, e), join(dich, e));
		}
		mkdirSync(join(dich, "@crm"));
		for (const g of readdirSync(crm)) {
			const nguon = join(crm, g);
			// Liên kết tương đối (workspace) dựng lại nguyên văn → trỏ vào gói của worktree tạm.
			const dichLk = lstatSync(nguon).isSymbolicLink()
				? readlinkSync(nguon)
				: nguon;
			symlinkSync(dichLk, join(dich, "@crm", g));
		}
	}
	if (!existsSync(join(sao, "apps/app/node_modules")))
		throw new Error("worktree tam thieu apps/app/node_modules");
	// Bài DOM đọc mã sinh (Prisma client …, bị gitignore) của cây thật — chỉ đọc.
	for (const d of git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter((d) => d === ".env" || /(^|\/)src\/generated\/$/.test(d))
		.map((d) => d.replace(/\/$/, ""))) {
		if (!existsSync(join(sao, d))) symlinkSync(join(GOC, d), join(sao, d));
	}
}

/**
 * node_modules thật cho phiên đo trình duyệt: Turbopack từ chối node_modules là
 * liên kết ra ngoài gốc dự án («points out of the filesystem root»), nên worktree
 * tạm cài riêng từ bộ đệm của bun (khoá cứng, vài giây); .env trỏ về cây thật,
 * Prisma client do postinstall sinh trong chính worktree tạm.
 */
function caiNodeModules(sao) {
	if (existsSync(join(GOC, ".env")) && !existsSync(join(sao, ".env")))
		symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	const r = spawnSync("bun", ["install", "--frozen-lockfile"], {
		cwd: sao,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (r.status !== 0)
		throw new Error(
			`bun install trong worktree tam thoat ${r.status}: ${`${r.stdout}${r.stderr}`.trim().split("\n").slice(-3).join(" | ")}`,
		);
}

const tam = mkdtempSync(join(tmpdir(), "ldv-hai-chieu-"));
const sao = join(tam, "crm");
let sai = 0;
let khongDo = null;
function don() {
	try {
		git(GOC, "worktree", "remove", "--force", sao);
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		git(GOC, "worktree", "prune");
	} catch {}
}
for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
	process.on(tin, () => {
		don();
		process.exit(128 + { SIGINT: 2, SIGTERM: 15, SIGHUP: 1 }[tin]);
	});
try {
	git(GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD");
	const va = git(GOC, "diff", "HEAD", "--binary");
	if (va.trim()) {
		const tepVa = join(tam, "chua-commit.patch");
		writeFileSync(tepVa, va);
		git(sao, "apply", "--whitespace=nowarn", tepVa);
	}
	if (chay.some((d) => d.trinhDuyet)) caiNodeModules(sao);
	else noiNodeModules(sao);
	for (const db of chay) {
		const goc = new Map();
		const taoMoi = [];
		for (const t of db.thay) {
			const tep = join(sao, t.tep);
			if (t.tao !== undefined) {
				if (existsSync(tep)) {
					khongDo = `dot bien ${db.ten} — ${t.tep} da co, khong tao duoc`;
					break;
				}
				writeFileSync(tep, t.tao);
				taoMoi.push(tep);
				continue;
			}
			const chu = goc.get(tep) ?? readFileSync(tep, "utf8");
			goc.set(tep, goc.get(tep) ?? chu);
			const hienTai = readFileSync(tep, "utf8");
			if (t.doi) {
				const moi = t.doi(hienTai);
				if (moi === hienTai) {
					khongDo = `dot bien ${db.ten} — doi khong doi gi trong ${t.tep}`;
					break;
				}
				writeFileSync(tep, moi);
				continue;
			}
			const soLan = hienTai.split(t.cu).length - 1;
			if (soLan !== 1) {
				khongDo = `dot bien ${db.ten} — doan can thay xuat hien ${soLan} lan trong ${t.tep}`;
				break;
			}
			writeFileSync(tep, hienTai.replace(t.cu, t.moi));
		}
		if (khongDo) break;
		const batDau = Date.now();
		const r = chayLenh(sao, LENH[nhom](db));
		for (const [tep, chu] of goc) writeFileSync(tep, chu);
		for (const tep of taoMoi) rmSync(tep, { force: true });
		const giay = Math.round((Date.now() - batDau) / 1000);
		const khop = db.ghim.exec(r.chu)?.[0];
		if (r.ma !== 0 && khop)
			console.log(
				`DUNG ${nhom} chieu do ${db.ten}: ma ${r.ma}, «${khop}» (${giay}s)`,
			);
		else {
			sai += 1;
			console.log(
				r.chu
					.split("\n")
					.filter((l) => /ldv-|SAI|KHONG|error/.test(l))
					.slice(0, 20)
					.join("\n"),
			);
			console.log(
				`SAI ${nhom} chieu do ${db.ten}: ma ${r.ma}, THIEU thong diep khop ${db.ghim} (${giay}s)`,
			);
		}
	}
} catch (e) {
	khongDo = `worktree tam: ${String(e).slice(0, 300)}`;
} finally {
	don();
}
for (const t of tepDot)
	if (bam(readFileSync(join(GOC, t), "utf8")) !== bamTruoc.get(t))
		khongDo = `cay that bi ghi: ${t} doi bam trong luot — phep do khong duoc ghi vao cay`;
if (khongDo) khongDoDuoc(khongDo);
console.log(
	sai === 0
		? `KET LUAN ${nhom}: hai chieu dung (${chay.length} dot bien, worktree tam)`
		: `KET LUAN ${nhom}: ${sai} chieu do sai`,
);
process.exit(sai === 0 ? 0 : 1);
