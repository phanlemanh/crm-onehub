#!/usr/bin/env bun
/**
 * Hai chiều cho một nhóm ca `ctbp-*` của hồ sơ cua-toi-ba-phan (khuôn của DH1,
 * `_acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs`, mở rộng: mỗi nhóm khai
 * lệnh chạy riêng — bài DOM, bài spec của app, bài API có cơ sở dữ liệu thử).
 *
 *   bun _acceptance/cua-toi-ba-phan/rang/hai-chieu.mjs <nhom>
 *
 * 1. Đối chứng dương: chạy nhóm trên vật lành (cây thật) → phải thoát 0, có ca pass.
 * 2. Với từng đột biến của nhóm: thay ĐÚNG từng đoạn đã khai trong MỘT WORKTREE TẠM
 *    (HEAD + thay đổi chưa commit của cây thật, node_modules trỏ về cây thật), chạy
 *    nhóm ở đó → phải thoát ≠ 0 VÀ đầu ra chứa thông điệp ghim. Cây thật không bao
 *    giờ bị ghi (lượt chấm chạy các lệnh song song — DH1 S4 vòng 1, 15/10); băm mọi
 *    tệp bị đột biến trên cây thật trước và sau phải bằng nhau.
 * Đoạn cần thay không xuất hiện đúng một lần → mã 2 «KHONG DO DUOC» (đột biến chết).
 * Mã thoát: 0 hai chiều đúng · 1 có chiều sai · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const OKR = "apps/app/app/(app)/[slug]/okr";
const DOM = "./test/okr-cua-toi-ba-phan.dom.tsx";

/** Lệnh chạy một nhóm, tính từ gốc cây `goc` (cây thật hoặc worktree tạm). */
const LENH = {
	dom: (goc, nhom) => ({
		cwd: join(goc, "apps", "app"),
		argv: [
			"test",
			"--timeout",
			"60000",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			DOM,
			"-t",
			nhom,
		],
	}),
	spec: (tep) => (goc, nhom) => ({
		cwd: join(goc, "apps", "app"),
		argv: ["test", tep, "-t", nhom],
	}),
	api: (tep) => (goc, nhom) => ({
		cwd: goc,
		argv: ["run", "test", "--", `cd apps/api && bun test ${tep} -t ${nhom}`],
	}),
};

const NHOM = {
	"ctbp-phan-mot": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "dem-ca-da-gui",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"const thieu = duLieu.items.filter((kr) => !kr.updatedThisWeek);",
						"const thieu = duLieu.items;",
					],
				],
				ghim: "ctbp-phan-mot: phan 1 co 3 dong, mong 1 (o 1 thieu 2 du)",
			},
			{
				ten: "viec-cap-nhat-con",
				thay: [[`${OKR}/cua-toi.tsx`, "				anCapNhat\n", ""]],
				ghim: "ctbp-phan-mot: khoi viec trong Cua toi con viec okr-cap-nhat",
			},
			{
				ten: "theo-o-chu-ky",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"useQuery(trpc.okr.capNhatTuan.queryOptions());",
						'useQuery(\n		trpc.okr.capNhatTuan.queryOptions({ cycleId: "q3" } as never),\n	);',
					],
				],
				ghim: "ctbp-phan-mot: phan 1 theo chu ky K cu, mong chu ky dang chay",
			},
		],
	},
	"ctbp-cap-nhat-tai-cho": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "mo-phien-khi-tai",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"	const mo = (laSua: boolean) => {",
						'	useEffect(() => {\n		moPhien.mutate({ entry: "cua-toi" });\n	}, []);\n	const mo = (laSua: boolean) => {',
					],
				],
				ghim: "ctbp-cap-nhat-tai-cho: moCapNhat goi 1 lan khi chua bam, mong 0",
			},
			{
				ten: "entry-tab",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						'moPhien.mutate({ entry: "cua-toi" });',
						'moPhien.mutate({ entry: "tab" });',
					],
				],
				ghim: "ctbp-cap-nhat-tai-cho: entry «tab», mong «cua-toi»",
			},
		],
	},
	"ctbp-loi-vao-tu": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "giu-tu",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"				if (tu !== null) void datTu(null);\n",
						"",
					],
				],
				ghim: "ctbp-loi-vao-tu: tu con tren duong dan sau khi mo",
			},
		],
	},
	"ctbp-don-vi-dan": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "thu-tu-api",
				thay: [
					[
						`${OKR}/phan-don-vi-dan.tsx`,
						"	return [\n		...theo(headOf.divisions, bpCay)",
						'	return [\n		...headOf.departments.map((id) => ({ loai: "pb" as const, id })),\n		...theo(headOf.divisions, bpCay)',
					],
				],
				ghim: "ctbp-don-vi-dan: the 1 la phong ban, mong bo phan",
			},
			{
				ten: "dem-tron",
				thay: [
					[
						`${OKR}/phan-don-vi-dan.tsx`,
						"soKr: kr.length,",
						"soKr: ds.length,",
					],
				],
				ghim: "ctbp-don-vi-dan: so KR 3, mong 5",
			},
		],
	},
	"ctbp-kr-phu-trach": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "bo-tham-gia",
				thay: [[`${OKR}/phan-kr-phu-trach.tsx`, "ds={thamGia}", "ds={[]}"]],
				ghim: "ctbp-kr-phu-trach: muc tieu O3, O4 roi khoi Cua toi",
			},
		],
	},
	"ctbp-khong-dan": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "moi-ca-nhan",
				thay: [
					[
						`${OKR}/cua-toi.tsx`,
						"							{m.cuaToiRong.action}\n						</Link>\n					</Button>",
						"							{m.cuaToiRong.action}\n						</Link>\n					</Button>\n					<Button>Tạo OKR cá nhân</Button>",
					],
				],
				ghim: "ctbp-khong-dan: than Cua toi co loi moi tao «Tạo OKR cá nhân»",
			},
		],
	},
	"ctbp-bon-the": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "nam-the",
				thay: [
					[
						`${OKR}/tab-okr.ts`,
						'export const TAB = ["cua-toi", "theo-don-vi", "toan-canh", "hoi-y"] as const;',
						'export const TAB = [\n	"cua-toi",\n	"cap-nhat-tuan",\n	"theo-don-vi",\n	"toan-canh",\n	"hoi-y",\n] as const;',
					],
					[
						`${OKR}/tab-okr.ts`,
						'	"cua-toi": "/okr",\n',
						'	"cua-toi": "/okr",\n	"cap-nhat-tuan": "/okr/cap-nhat-tuan",\n',
					],
				],
				ghim: "ctbp-bon-the: 5 the, mong 4",
			},
		],
	},
	"ctbp-tai-loi": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "loi-chung",
				thay: [
					[
						`${OKR}/phan-don-vi-dan.tsx`,
						"	const cay = useQuery(trpc.org.tree.queryOptions());\n",
						"	const cay = useQuery(trpc.org.tree.queryOptions());\n	const tuan = useQuery(trpc.okr.capNhatTuan.queryOptions());\n	if (tuan.isError)\n		return (\n			<VoPhan tieuDe={m.phan2}>\n				<LoiPhan thuLai={() => {}} />\n			</VoPhan>\n		);\n",
					],
				],
				ghim: "ctbp-tai-loi: okr.capNhatTuan loi lam an phan don-vi-dan",
			},
		],
	},
	"ctbp-loi-mo": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "bo-bao-loi",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"moPhien.isError && bien ? (",
						"false && bien ? (",
					],
				],
				ghim: "ctbp-loi-mo: mo phien loi khong bao",
			},
			{
				ten: "go-tu-som",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"		moPhien.mutate({ entry: tu });\n	}, [coKr, tu, moPhien]);",
						"		moPhien.mutate({ entry: tu });\n		void datTu(null);\n	}, [coKr, tu, moPhien, datTu]);",
					],
				],
				ghim: "ctbp-loi-mo: tu roi duong dan sau loi mo phien",
			},
			{
				ten: "thu-lai-cua-toi",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"moPhien.mutate(bien)",
						'moPhien.mutate({ entry: "cua-toi" })',
					],
				],
				ghim: "ctbp-loi-mo: thu lai entry «cua-toi», mong «nhac»",
			},
		],
	},
	"ctbp-tai-lai-nen": {
		lenh: LENH.dom,
		dotBien: [
			{
				ten: "go-bang",
				thay: [
					[
						`${OKR}/phan-can-cap-nhat.tsx`,
						"	if (!ds.data)\n		return (",
						"	if (ds.isError || !ds.data)\n		return (",
					],
				],
				ghim: "ctbp-tai-lai-nen: bang dang dien bien mat khi tai lai loi",
			},
		],
	},
	"ctbp-chuyen-huong": {
		lenh: LENH.spec("./test/okr-chuyen-huong-cap-nhat.spec.ts"),
		dotBien: [
			{
				ten: "bo-query",
				thay: [
					[
						`${OKR}/cap-nhat-tuan/page.tsx`,
						"return chuoi ? `/${slug}/okr?${chuoi}` : `/${slug}/okr`;",
						"return `/${slug}/okr`;",
					],
				],
				ghim: "ctbp-chuyen-huong: dich «/ws/okr», mong «/ws/okr?tu=nhac»",
			},
		],
	},
	"ctbp-phien-cua-toi": {
		lenh: LENH.api("test/cua-toi-ba-phan.spec.ts"),
		dotBien: [
			{
				ten: "bo-cua-toi",
				// gói @crm/* trong worktree tạm vẫn trỏ node_modules của cây thật, nên đột biến
				// đặt ở bộ định tuyến API (nằm trong worktree): máy chủ từ chối lối «cua-toi».
				thay: [
					[
						"apps/api/src/okr/okr.router.ts",
						"		input: moCapNhatInput,",
						'		input: moCapNhatInput.refine((v) => v.entry !== "cua-toi"),',
					],
				],
				ghim: "ctbp-phien-cua-toi: moCapNhat tu choi entry «cua-toi»",
			},
		],
	},
	"ctbp-do-nguong": {
		lenh: LENH.api("test/do-cap-nhat-cua-toi.spec.ts"),
		dotBien: [
			{
				ten: "dem-thanh-vien",
				thay: [
					[
						"apps/api/scripts/okr/do-cap-nhat-cua-toi.ts",
						"where: { userId: { in: truong }, submittedAt: trongCuaSo },",
						"where: { submittedAt: trongCuaSo },",
					],
				],
				ghim: "ctbp-do-nguong: n 14, mong 9",
			},
			{
				ten: "dem-chua-gui",
				thay: [
					[
						"apps/api/scripts/okr/do-cap-nhat-cua-toi.ts",
						"where: { userId: { in: truong }, submittedAt: trongCuaSo },",
						"where: {\n\t\t\tuserId: { in: truong },\n\t\t\tOR: [\n\t\t\t\t{ submittedAt: trongCuaSo },\n\t\t\t\t{ submittedAt: null, openedAt: trongCuaSo },\n\t\t\t],\n\t\t},",
					],
				],
				ghim: "ctbp-do-nguong: n 12, mong 9",
			},
		],
	},
};

const nhom = process.argv[2];
if (!nhom || !(nhom in NHOM)) {
	console.log(
		`KHONG DO DUOC: nhom «${nhom ?? ""}» khong co trong bang — ${Object.keys(NHOM).join(", ")}`,
	);
	process.exit(2);
}
const { lenh, dotBien } = NHOM[nhom];

function chayNhom(goc) {
	const { cwd, argv } = lenh(goc, nhom);
	const r = spawnSync("bun", argv, {
		cwd,
		encoding: "utf8",
		env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
		maxBuffer: 64 * 1024 * 1024,
	});
	const chu = `${r.stdout}${r.stderr}`;
	const soPass = Number(/(\d+) pass/.exec(chu)?.[1] ?? 0);
	return { ma: r.status, chu, soPass };
}

const bam = (s) => createHash("sha256").update(s).digest("hex");
const git = (cwd, ...a) =>
	execFileSync("git", a, {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});

const tepDot = [...new Set(dotBien.flatMap((d) => d.thay.map(([t]) => t)))];
const bamTruoc = new Map(
	tepDot.map((t) => [t, bam(readFileSync(join(GOC, t), "utf8"))]),
);

const lanh = chayNhom(GOC);
if (lanh.ma !== 0 || lanh.soPass === 0) {
	console.log(lanh.chu.split("\n").slice(-40).join("\n"));
	console.log(
		`SAI ${nhom}: doi chung duong do tren vat lanh (ma ${lanh.ma}, ${lanh.soPass} pass)`,
	);
	process.exit(1);
}
console.log(`DUNG ${nhom} doi chung: vat lanh xanh (${lanh.soPass} pass)`);

const tam = mkdtempSync(join(tmpdir(), "ctbp-hai-chieu-"));
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
	// Lượt chấm chạy nhiều bộ đo song song trên cùng kho — `git worktree add` có thể
	// giành khoá của nhau; thử lại có giãn cách thay vì báo «không đo được».
	for (let lan = 1; ; lan += 1) {
		try {
			git(GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD");
			break;
		} catch (e) {
			if (lan >= 6) throw e;
			Atomics.wait(
				new Int32Array(new SharedArrayBuffer(4)),
				0,
				0,
				500 * lan + Math.floor(Math.random() * 500),
			);
		}
	}
	const va = git(GOC, "diff", "HEAD", "--binary");
	if (va.trim()) {
		const tepVa = join(tam, "chua-commit.patch");
		writeFileSync(tepVa, va);
		git(sao, "apply", "--whitespace=nowarn", tepVa);
	}
	for (const nm of git(
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
		)) {
		const dich = join(sao, nm.slice(0, -1));
		if (!existsSync(dich)) symlinkSync(join(GOC, nm.slice(0, -1)), dich);
	}
	if (existsSync(join(GOC, ".env")) && !existsSync(join(sao, ".env")))
		symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	if (!existsSync(join(sao, "apps/app/node_modules")))
		throw new Error("worktree tam thieu apps/app/node_modules");
	for (const db of dotBien) {
		const goc = new Map();
		for (const [t, cu, moi] of db.thay) {
			const tep = join(sao, t);
			const truoc = goc.get(t) ?? readFileSync(tep, "utf8");
			if (!goc.has(t)) goc.set(t, truoc);
			const hienTai = readFileSync(tep, "utf8");
			const soLan = hienTai.split(cu).length - 1;
			if (soLan !== 1) {
				khongDo = `dot bien ${db.ten} — doan can thay xuat hien ${soLan} lan trong ${t}`;
				break;
			}
			writeFileSync(tep, hienTai.replace(cu, moi));
		}
		if (khongDo) break;
		const r = chayNhom(sao);
		for (const [t, noiDung] of goc) writeFileSync(join(sao, t), noiDung);
		const coGhim = r.chu.includes(db.ghim);
		if (r.ma !== 0 && coGhim)
			console.log(`DUNG ${nhom} chieu do ${db.ten}: ma ${r.ma}, «${db.ghim}»`);
		else {
			sai += 1;
			console.log(
				r.chu
					.split("\n")
					.filter((l) => l.includes("ctbp-") || /error/i.test(l))
					.slice(0, 20)
					.join("\n"),
			);
			console.log(r.chu.split("\n").slice(-25).join("\n"));
			console.log(
				`SAI ${nhom} chieu do ${db.ten}: ma ${r.ma}, ${coGhim ? "co" : "THIEU"} thong diep «${db.ghim}»`,
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
if (khongDo) {
	console.log(`KHONG DO DUOC: ${khongDo}`);
	process.exit(2);
}
console.log(
	sai === 0
		? `KET LUAN ${nhom}: hai chieu dung (${dotBien.length} dot bien, worktree tam)`
		: `KET LUAN ${nhom}: ${sai} chieu do sai`,
);
process.exit(sai === 0 ? 0 : 1);
