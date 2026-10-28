#!/usr/bin/env bun
/**
 * Hai chiều cho một nhóm ca `ctlk-*` của hồ sơ cua-toi-chi-liet-kr (khuôn của DH3,
 * `_acceptance/cua-toi-ba-phan/rang/hai-chieu.mjs`).
 *
 *   bun _acceptance/cua-toi-chi-liet-kr/rang/hai-chieu.mjs <nhom>
 *
 * 1. Đối chứng dương: chạy nhóm trên vật lành (cây thật) → phải thoát 0, có ca pass.
 * 2. Với từng đột biến: thay ĐÚNG từng đoạn đã khai trong MỘT WORKTREE TẠM (HEAD +
 *    thay đổi chưa commit của cây thật), chạy nhóm ở đó → phải thoát ≠ 0 VÀ đầu ra
 *    chứa thông điệp ghim. Cây thật không bao giờ bị ghi.
 * Khác DH3: gói `@crm/*` trong `node_modules` của từng app được nối về `packages/*`
 * của chính worktree tạm, để đột biến đặt trong `packages/db` hay `packages/validation`
 * có hiệu lực; và một nhóm có thể khai nhiều lệnh, chạy lần lượt.
 * Đoạn cần thay không xuất hiện đúng một lần → mã 2 «KHONG DO DUOC».
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
	rmSync,
	symlinkSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const OKR = "apps/app/app/(app)/[slug]/okr";
const DOM = "./test/cua-toi-chi-liet-kr.dom.tsx";
const PHAN1 = `${OKR}/phan-can-cap-nhat.tsx`;
const APPS = ["apps/app", "apps/api", "apps/agent"];

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
	trong: (thuMuc, tep) => (goc, nhom) => ({
		cwd: join(goc, thuMuc),
		argv: ["test", tep, "-t", nhom],
	}),
	kho: (thuMuc, tep, preload) => (goc, nhom) => ({
		cwd: goc,
		argv: [
			"run",
			"test",
			"--",
			`cd ${thuMuc} && CRM_TELEMETRY_DISABLED=1 bun test ${preload ? "--preload ./test/setup.ts " : ""}${tep} -t ${nhom}`,
		],
	}),
};

const MO_TAI_CHO_CAN = [
	PHAN1,
	"	const slug = useWorkspaceSlug();",
	"	const slug = useWorkspaceSlug();\n	const openRecord = useOpenRecord();",
];
const NHAP_OPEN_RECORD = (tep) => [
	tep,
	'import { okrMessages } from "@/lib/messages/okr";',
	'import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";\nimport { okrMessages } from "@/lib/messages/okr";',
];

const NHOM = {
	"ctlk-phan-mot": {
		lenh: [LENH.dom],
		dotBien: [
			{
				ten: "con-bang",
				thay: [
					[
						PHAN1,
						"			<ItemGroup>\n",
						'			<span data-nut="cap-nhat-tai-cho" />\n			<ItemGroup>\n',
					],
				],
				ghim: "ctlk-phan-mot: phan 1 con bang cap nhat hang loat",
			},
			{
				ten: "dem-ca-da-gui",
				thay: [
					[
						PHAN1,
						"const thieu = duLieu.items.filter((kr) => !kr.updatedThisWeek);",
						"const thieu = duLieu.items;",
					],
				],
				ghim: "ctlk-phan-mot: phan 1 co 3 dong, mong 1",
			},
		],
	},
	"ctlk-khong-tu": {
		lenh: [LENH.dom],
		dotBien: [
			{
				ten: "mo-tu-nhac",
				thay: [
					[
						PHAN1,
						'import { useQuery } from "@tanstack/react-query";',
						'import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";\nimport { useMutation, useQuery } from "@tanstack/react-query";\nimport { useQueryState } from "nuqs";',
					],
					[
						PHAN1,
						"	const ds = useQuery(trpc.okr.capNhatTuan.queryOptions());",
						'	const ds = useQuery(trpc.okr.capNhatTuan.queryOptions());\n	const [tuThu] = useQueryState("tu");\n	const moThu = useMutation(trpc.okr.moCapNhat.mutationOptions());\n	useMountEffect(() => {\n		if (tuThu === "nhac") moThu.mutate({ entry: "nhac" });\n	});',
					],
				],
				ghim: "ctlk-khong-tu: tu=nhac mo 1 luot cap nhat, mong 0",
			},
		],
	},
	"ctlk-dong-kr": {
		lenh: [LENH.dom],
		dotBien: [
			{
				ten: "mo-tai-cho",
				thay: [
					NHAP_OPEN_RECORD(PHAN1),
					MO_TAI_CHO_CAN,
					[
						PHAN1,
						"				data-kr={kr.keyResultId}\n",
						'				data-kr={kr.keyResultId}\n				onClick={() => openRecord({ kind: "kr", id: kr.keyResultId })}\n',
					],
				],
				ghim: "ctlk-dong-kr: bam KR mo tai cho, mong sang /ws/okr/kr/<id>",
			},
			{
				ten: "sai-kr",
				thay: [
					[
						PHAN1,
						"dichKrTrongBo(slug, kr.keyResultId, {",
						"dichKrTrongBo(slug, kr.objectiveId, {",
					],
				],
				ghim: "ctlk-dong-kr: href tro id sai",
			},
			{
				ten: "sai-don",
				thay: [[PHAN1, "donOkr: kr.donOkr,", 'donOkr: "pb:pb-1",']],
				ghim: "ctlk-dong-kr: dong 2 tro bo sai don vi",
			},
		],
	},
	"ctlk-dich-kr": {
		lenh: [LENH.trong("apps/app", "test/ctlk-dich-kr.spec.ts")],
		dotBien: [
			{
				ten: "bo-ky",
				thay: [
					[
						"apps/app/lib/okr-duong-kr.ts",
						"		[SEARCH_PARAM.okr.ky]: viTri.cycleId,\n",
						"",
					],
				],
				ghim: "ctlk-dich-kr: thieu kyOkr o phong ban",
			},
			{
				ten: "loi-thanh-trang-loi",
				thay: [
					[
						"apps/app/lib/okr-duong-kr.ts",
						"const viTri = await hoi(krId).catch(() => null);",
						"const viTri = await hoi(krId);",
					],
				],
				ghim: "ctlk-dich-kr: FORBIDDEN khong ve Cua toi",
			},
		],
	},
	"ctlk-vi-tri-kr": {
		lenh: [LENH.kho("apps/api", "test/ctlk-vi-tri-kr.spec.ts", true)],
		dotBien: [
			{
				ten: "bo-quyen-xem",
				thay: [
					[
						"apps/api/src/okr/okr-cap-nhat.service.ts",
						"AND: [{ cycle: KY_CON_HIEN }, dieuKienXemMucTieu(nc)],",
						"AND: [{ cycle: KY_CON_HIEN }],",
					],
				],
				ghim: "ctlk-vi-tri-kr: KR khong duoc xem tra vi tri, mong null",
			},
			{
				ten: "chu-ky-dang-chay",
				thay: [
					[
						"apps/api/src/okr/okr-cap-nhat.service.ts",
						"			cycleId: kr.objective.cycleId,",
						'			cycleId: (\n				await this.db.okrCycle.findFirstOrThrow({\n					where: { phase: "dang-chay", anLuc: null },\n					orderBy: { createdAt: "desc" },\n				})\n			).id,',
					],
				],
				ghim: "ctlk-vi-tri-kr: kyOkr la chu ky dang chay, mong chu ky cua muc tieu",
			},
		],
	},
	"ctlk-duong-nhac": {
		lenh: [
			LENH.trong("packages/validation", "test/ctlk-duong-cap-nhat-kr.spec.ts"),
			LENH.trong("apps/agent", "test/ctlk-duong-nhac.spec.ts"),
		],
		dotBien: [
			{
				ten: "giu-tu-nhac",
				thay: [
					[
						"packages/validation/src/okr-cap-nhat.ts",
						"		: DUONG_CUA_TOI;",
						'		: "/okr?tu=nhac";',
					],
				],
				ghim: "ctlk-duong-nhac: con tu=",
			},
		],
	},
	"ctlk-nhac-dong": {
		lenh: [
			LENH.kho("apps/agent", "test/ctlk-nhac-dong.integration.spec.ts", false),
		],
		dotBien: [
			{
				ten: "duong-tu-nhac",
				thay: [
					[
						"apps/agent/agent/lib/nhac-ke-hoach.ts",
						"		return duongCapNhatKr(v.krIds);",
						'		return "/okr?tu=nhac";',
					],
				],
				ghim: "ctlk-nhac-dong: dong thong bao cua B mang tu=nhac",
			},
		],
	},
	"ctlk-viec": {
		lenh: [LENH.dom],
		dotBien: [
			{
				ten: "viec-tu",
				thay: [
					[
						`${OKR}/viec-cua-toi.tsx`,
						"<Link href={url(duongCapNhatKr(viec.krIds))}>",
						'<Link href={`${url("/okr")}?tu=viec-cua-toi`}>',
					],
				],
				ghim: "ctlk-viec: nut viec cap nhat con tu=",
			},
		],
	},
	"ctlk-theo-doi": {
		lenh: [LENH.dom],
		dotBien: [
			{
				ten: "con-theo-doi",
				thay: [
					[
						`${OKR}/cua-toi.tsx`,
						'import { NhomDaBo } from "./nhom-da-bo";',
						'import { NhomDaBo, NhomDangTheoDoi } from "./nhom-da-bo";',
					],
					[
						`${OKR}/cua-toi.tsx`,
						"		<NhomDaBo danhDauCuaToi ds={mine.data.daBo} hienDonVi />",
						"		<>\n			<NhomDangTheoDoi ds={mine.data.dangTheoDoi} />\n			<NhomDaBo danhDauCuaToi ds={mine.data.daBo} hienDonVi />\n		</>",
					],
				],
				ghim: "ctlk-theo-doi: Cua toi con nhom Dang theo doi",
			},
		],
	},
	"ctlk-phu-trach": {
		lenh: [LENH.dom],
		dotBien: [
			{
				ten: "phu-trach-tai-cho",
				thay: [
					NHAP_OPEN_RECORD(`${OKR}/phan-kr-phu-trach.tsx`),
					[
						`${OKR}/phan-kr-phu-trach.tsx`,
						"	const url = useWorkspaceUrl();",
						"	const url = useWorkspaceUrl();\n	const openRecord = useOpenRecord();",
					],
					[
						`${OKR}/phan-kr-phu-trach.tsx`,
						"href={url(duongCapNhatKr([k.id]))}",
						'href={url(duongCapNhatKr([k.id]))}\n												onClick={() => openRecord({ kind: "kr", id: k.id })}',
					],
				],
				ghim: "ctlk-phu-trach: ten KR mo tai cho",
			},
			{
				ten: "tong-quan-tai-cho",
				thay: [
					[
						`${OKR}/khoi-kr-cua-toi.tsx`,
						'import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";',
						'import { useMoDienBien } from "@/components/crm/record-sheet/dien-bien-kr";\nimport { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";',
					],
					[
						`${OKR}/khoi-kr-cua-toi.tsx`,
						"href={url(duongCapNhatKr([d.keyResultId]))}",
						"href={url(duongCapNhatKr([d.keyResultId]))}\n					onClick={() => moDienBien(d.objectiveId, d.keyResultId)}",
					],
					[
						`${OKR}/khoi-kr-cua-toi.tsx`,
						"function Dong({ d }: { d: DongKr }) {\n	const url = useWorkspaceUrl();",
						"function Dong({ d }: { d: DongKr }) {\n	const url = useWorkspaceUrl();\n	const moDienBien = useMoDienBien();",
					],
				],
				ghim: "ctlk-phu-trach: Tong quan mo KR tai cho",
			},
		],
	},
	"ctlk-trang-thai": {
		lenh: [LENH.dom],
		dotBien: [
			{
				ten: "xoay-toan-trang",
				thay: [
					[
						PHAN1,
						'			<VoPhan tieuDe={m.phan1}>\n				<Skeleton className="h-24 w-full" data-khung-xuong="" />\n			</VoPhan>',
						'			<Skeleton className="h-24 w-full" data-khung-xuong="" />',
					],
				],
				ghim: "ctlk-trang-thai: dang tai mat tieu de phan",
			},
		],
	},
	"ctlk-vong-khep": {
		lenh: [LENH.kho("apps/api", "test/ctlk-vong-khep.spec.ts", true)],
		dotBien: [
			{
				ten: "loc-theo-loi",
				thay: [
					[
						"packages/db/src/okr-nhac.ts",
						"				weekStart: new Date(`${tuan}T00:00:00Z`),\n",
						'				weekStart: new Date(`${tuan}T00:00:00Z`),\n				session: { entry: { in: ["nhac", "cua-toi", "viec-cua-toi"] } },\n',
					],
				],
				ghim: "ctlk-vong-khep: KR 1 da gui qua sheet van con trong tin nhac",
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
	let ma = 0;
	let chu = "";
	let soPass = 0;
	for (const l of lenh) {
		const { cwd, argv } = l(goc, nhom);
		const r = spawnSync("bun", argv, {
			cwd,
			encoding: "utf8",
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
			maxBuffer: 64 * 1024 * 1024,
		});
		const ra = `${r.stdout}${r.stderr}`;
		chu += ra;
		soPass += Number(/(\d+) pass/.exec(ra)?.[1] ?? 0);
		if (r.status !== 0) ma = r.status ?? 1;
	}
	return { ma, chu, soPass };
}

function noiGoiCrm(sao) {
	for (const sinh of git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter(
			(d) => /(^|\/)generated\/$/.test(d) && !d.includes("node_modules/"),
		)) {
		const dich = join(sao, sinh.slice(0, -1));
		if (!existsSync(dich)) symlinkSync(join(GOC, sinh.slice(0, -1)), dich);
	}
	for (const app of APPS) {
		const nm = join(sao, app, "node_modules");
		if (!existsSync(nm) || !lstatSync(nm).isSymbolicLink()) continue;
		const that = join(GOC, app, "node_modules");
		unlinkSync(nm);
		mkdirSync(nm);
		for (const ten of readdirSync(that)) {
			if (ten !== "@crm") {
				symlinkSync(join(that, ten), join(nm, ten));
				continue;
			}
			mkdirSync(join(nm, "@crm"));
			for (const goi of readdirSync(join(that, "@crm")))
				symlinkSync(join(sao, "packages", goi), join(nm, "@crm", goi));
		}
	}
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

const tam = mkdtempSync(join(tmpdir(), "ctlk-hai-chieu-"));
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
	noiGoiCrm(sao);
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
					.filter((l) => l.includes("ctlk-") || /error/i.test(l))
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
