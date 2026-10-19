import { spawnSync } from "node:child_process";
import {
	appendFileSync,
	cpSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = "apps/app/components/crm/record-sheet/nap-san-khi-mo-ngan.tsx";
const LENH_TEST = [
	"bash",
	"-c",
	"cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu-danh-tinh.dom.tsx",
];
const DUOI_LOG = 25;

const BAN_CU = `"use client";

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

const NHAP =
	'import { type DehydratedState, HydrationBoundary } from "@tanstack/react-query";';
const MOC_STACK = "const { stack } = useRecordStack();";
const MOC_STATE = "state={stack.length > 0 ? state : undefined}";

function git(goc, ...thamSo) {
	const r = spawnSync("git", ["-C", goc, ...thamSo], { encoding: "utf8" });
	if (r.status !== 0)
		throw new Error(`git ${thamSo.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout;
}

function thayMotLan(chu, cu, moi, ca) {
	const lan = chu.split(cu).length - 1;
	if (lan !== 1) {
		console.log(
			`KHONG DO DUOC: dot bien ${ca} khong ap duoc (${lan} cho khop thay vi 1)`,
		);
		process.exit(2);
	}
	return chu.replace(cu, moi);
}

const CA = [
	{
		ten: "ban-cu",
		ap: () => BAN_CU,
		ghim: [
			"gdt: chu ngan dung lai khi doi ngan",
			"gdt: ngan dong mot nhip roi moi mo",
		],
	},
	{
		ten: "luon-do",
		ap: (s) => thayMotLan(s, MOC_STATE, "state={state}", "luon-do"),
		ghim: ["gdt: ngan rong da nap san"],
	},
	{
		ten: "do-cuong-buc",
		ap: (s) =>
			thayMotLan(
				thayMotLan(
					s,
					NHAP,
					`${NHAP.replace("HydrationBoundary }", "HydrationBoundary, useQueryClient }")}\nimport { useMemo } from "react";`,
					"do-cuong-buc nhap",
				),
				MOC_STACK,
				`${MOC_STACK}\n\tconst client = useQueryClient();\n\tconst mo = stack.length > 0;\n\tuseMemo(() => {\n\t\tif (!mo) return;\n\t\tfor (const q of state.queries) client.setQueryData(q.queryKey, q.state.data);\n\t}, [client, state, mo]);`,
				"do-cuong-buc",
			),
		ghim: ["gdt: du lieu moi bi ban may chu de"],
	},
	{
		ten: "chi-khoa-thieu",
		ap: (s) =>
			thayMotLan(
				thayMotLan(
					s,
					NHAP,
					NHAP.replace(
						"HydrationBoundary }",
						"HydrationBoundary, useQueryClient }",
					),
					"chi-khoa-thieu nhap",
				),
				MOC_STATE,
				"state={stack.length > 0 ? { ...state, queries: state.queries.filter((q) => !client.getQueryCache().get(q.queryHash)) } : undefined}",
				"chi-khoa-thieu",
			).replace(MOC_STACK, `${MOC_STACK}\n\tconst client = useQueryClient();`),
		ghim: ["gdt: khoa cu khong nhan ban may chu moi hon"],
	},
	{ ten: "doi-chung", ap: (s) => s, ghim: [], doiChung: true },
];

const BANG_CHUNG_CONG = "_acceptance/ngan-ban-ghi-giu-danh-tinh/evidence/";

function chupCay(goc) {
	const dong = git(goc, "status", "--porcelain", "-uall")
		.split("\n")
		.filter(Boolean)
		.filter(
			(d) => !d.slice(3).replace(/^"|"$/g, "").startsWith(BANG_CHUNG_CONG),
		);
	const trangThai = dong.join("\n");
	const tep = dong
		.map((d) => d.slice(3).replace(/^"|"$/g, ""))
		.filter((d) => existsSync(join(goc, d)));
	const bam = tep.length
		? git(goc, "hash-object", "--", ...tep)
				.trim()
				.split("\n")
		: [];
	return new Map([
		["#trang-thai", trangThai],
		...tep.map((d, i) => [d, bam[i]]),
	]);
}

function khacCay(truoc, sau) {
	const khoa = new Set([...truoc.keys(), ...sau.keys()]);
	return [...khoa].filter((k) => truoc.get(k) !== sau.get(k));
}

function tuThuCay() {
	const o = mkdtempSync(join(tmpdir(), "gdt-tu-thu-"));
	try {
		git(o, "init", "-q");
		writeFileSync(join(o, "a.txt"), "goc\n");
		git(o, "add", "a.txt");
		git(o, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "goc");
		writeFileSync(join(o, "a.txt"), "goc\nsua\n");
		const truoc = chupCay(o);
		appendFileSync(join(o, "a.txt"), "x");
		return khacCay(truoc, chupCay(o)).includes("a.txt");
	} finally {
		rmSync(o, { recursive: true, force: true });
	}
}

function noiNodeModules(sao) {
	const tim = (thuMuc, sau) => {
		if (sau > 3) return [];
		return readdirSync(join(GOC, thuMuc || "."), { withFileTypes: true })
			.filter((m) => m.isDirectory() && !m.name.startsWith("."))
			.flatMap((m) => {
				const con = thuMuc ? `${thuMuc}/${m.name}` : m.name;
				if (m.name === "node_modules") return [con];
				return tim(con, sau + 1);
			});
	};
	for (const d of tim("", 0))
		if (!existsSync(join(sao, d))) symlinkSync(join(GOC, d), join(sao, d));
}

function dungBanSao() {
	const sao = mkdtempSync(join(tmpdir(), "gdt-chieu-do-"));
	rmSync(sao, { recursive: true, force: true });
	git(GOC, "worktree", "add", "--detach", sao, "HEAD");
	if (existsSync(join(GOC, ".env")))
		symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	const sinh = "packages/db/src/generated";
	if (existsSync(join(GOC, sinh)))
		cpSync(join(GOC, sinh), join(sao, sinh), { recursive: true });
	noiNodeModules(sao);
	return sao;
}

function go(sao) {
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", sao]);
	rmSync(sao, { recursive: true, force: true });
	spawnSync("git", ["-C", GOC, "worktree", "prune"]);
}

if (!tuThuCay()) {
	console.log("HONG tu kiem cay: ghi mot byte vao tep dang sua ma khong thay");
	process.exit(1);
}
console.log("OK tu kiem cay");

const truoc = chupCay(GOC);
let dat = 0;

for (const ca of CA) {
	const sao = dungBanSao();
	try {
		const duong = join(sao, TEP);
		const cu = readFileSync(duong, "utf8");
		if (!ca.doiChung && !cu.includes(MOC_STATE)) {
			console.log(
				`KHONG DO DUOC: ${TEP} o HEAD khong mang ban sua (${MOC_STATE})`,
			);
			process.exit(2);
		}
		const moi = ca.ap(cu);
		if (!ca.doiChung && moi === cu) {
			console.log(`KHONG DO DUOC: dot bien ${ca.ten} khong doi tep`);
			process.exit(2);
		}
		writeFileSync(duong, moi);
		const r = spawnSync(LENH_TEST[0], LENH_TEST.slice(1), {
			cwd: sao,
			encoding: "utf8",
			maxBuffer: 256 * 1024 * 1024,
		});
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const thieu = ca.ghim.filter((g) => !ra.includes(g));
		const dung = ca.doiChung
			? r.status === 0
			: r.status !== 0 && thieu.length === 0;
		if (dung) {
			dat += 1;
			console.log(
				ca.doiChung
					? `CHIEU DO DAT: ${ca.ten} (ban sao khong dot bien xanh)`
					: `CHIEU DO DAT: ${ca.ten} (ma ${r.status}, ghim ${ca.ghim.join(" · ")})`,
			);
		} else {
			console.log(
				`CHIEU DO HONG: ${ca.ten} (ma ${r.status}${thieu.length ? `, thieu ghim ${thieu.join(" · ")}` : ""})`,
			);
			console.log(ra.trim().split("\n").slice(-DUOI_LOG).join("\n"));
		}
	} finally {
		go(sao);
	}
}

const lech = khacCay(truoc, chupCay(GOC));
for (const t of lech) console.log(`CHIEU DO GHI CAY ${t}`);

console.log(`gdt chieu do: dat ${dat}/${CA.length}`);
process.exit(dat === CA.length && lech.length === 0 ? 0 : 1);
