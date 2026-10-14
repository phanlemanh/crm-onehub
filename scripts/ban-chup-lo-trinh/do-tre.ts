import { spawnSync } from "node:child_process";
import path from "node:path";
import { LO_TRINH } from "../../apps/app/lib/lo-trinh/cau-hinh.ts";
import { TIEU_DE_GHI_CHU } from "./day.ts";

const PHUT = 60_000;
const NGUONG = { treMs: 10 * PHUT, dungYenMs: 60 * PHUT } as const;
const DA_DAY = new Set(["nhan", "trung"]);
const KHO = "phanlemanh/crm-onehub";
const WORKFLOW = "ban-chup-lo-trinh.yml";
const TEP = "LO-TRINH.html";

export const CO = {
	quaMuoiPhut: "> 10 phút",
	quaMotGio: "> 1 giờ",
	khongCoLuot: "không có lượt đẩy",
} as const;

export type Luot = {
	headSha: string;
	conclusion: string | null;
	updatedAt: string;
	headCommitLuc: string;
	ketQua: string | null;
	databaseId: number;
};

export type DongDo = {
	sha: string;
	commitLuc: string;
	xongLuc: string | null;
	treMs: number | null;
	co: string[];
};

type LuotTho = {
	databaseId: number;
	headSha: string;
	conclusion: string | null;
	updatedAt: string;
};

function laLuotTho(x: object): x is LuotTho {
	return (
		"databaseId" in x &&
		typeof x.databaseId === "number" &&
		"headSha" in x &&
		typeof x.headSha === "string" &&
		"updatedAt" in x &&
		typeof x.updatedAt === "string" &&
		"conclusion" in x &&
		(x.conclusion === null || typeof x.conclusion === "string")
	);
}

export function docLuotTuGh(json: string): Luot[] {
	const ds: object[] = JSON.parse(json);
	return ds.filter(laLuotTho).map((l) => ({
		databaseId: l.databaseId,
		headSha: l.headSha,
		conclusion: l.conclusion,
		updatedAt: l.updatedAt,
		headCommitLuc: "",
		ketQua: null,
	}));
}

export function docGhiChuTuGh(json: string): string | null {
	const ds: object[] = JSON.parse(json);
	for (const a of ds)
		if (
			"annotation_level" in a &&
			a.annotation_level === "notice" &&
			"title" in a &&
			a.title === TIEU_DE_GHI_CHU &&
			"message" in a &&
			typeof a.message === "string"
		)
			return a.message.trim();
	return null;
}

export function tinhDoTre(o: {
	doi: { sha: string; commitLuc: string }[];
	luot: Luot[];
	nhipMs: number;
}): { dong: DongDo[]; ketLuan: "đạt" | "không đạt" } {
	const daDay = o.luot.filter(
		(l) =>
			l.conclusion === "success" && l.ketQua !== null && DA_DAY.has(l.ketQua),
	);
	const dong = o.doi.map((d): DongDo => {
		const luc = Date.parse(d.commitLuc);
		const phu = daDay
			.filter((l) => Date.parse(l.headCommitLuc) >= luc)
			.sort((x, y) => Date.parse(x.updatedAt) - Date.parse(y.updatedAt))[0];
		if (!phu)
			return {
				sha: d.sha,
				commitLuc: d.commitLuc,
				xongLuc: null,
				treMs: null,
				co: [CO.quaMotGio, CO.khongCoLuot],
			};
		const treMs = Date.parse(phu.updatedAt) - luc + o.nhipMs;
		const co: string[] = [];
		if (treMs > NGUONG.treMs) co.push(CO.quaMuoiPhut);
		if (treMs > NGUONG.dungYenMs) co.push(CO.quaMotGio);
		return {
			sha: d.sha,
			commitLuc: d.commitLuc,
			xongLuc: phu.updatedAt,
			treMs,
			co,
		};
	});
	return {
		dong,
		ketLuan: dong.every((d) => d.co.length === 0) ? "đạt" : "không đạt",
	};
}

function chay(lenh: string, thamSo: string[], goc: string): string {
	const kq = spawnSync(lenh, thamSo, { cwd: goc, encoding: "utf8" });
	if (kq.status !== 0)
		throw new Error(`${lenh} ${thamSo.join(" ")}: ${kq.stderr.trim()}`);
	return kq.stdout;
}

function thamSoTu(argv: string[]): string {
	const i = argv.indexOf("--tu");
	const tu = i >= 0 ? argv[i + 1] : undefined;
	if (!tu || !/^\d{4}-\d{2}-\d{2}$/.test(tu))
		throw new Error("Cần --tu <YYYY-MM-DD>");
	return tu;
}

if (import.meta.main) {
	const goc = path.resolve(import.meta.dir, "..", "..");
	const tu = thamSoTu(process.argv);
	const commitLucCua = (sha: string) =>
		chay("git", ["log", "-1", "--format=%cI", sha], goc).trim();
	const doi = chay(
		"git",
		[
			"log",
			"origin/onehub",
			"--first-parent",
			"--format=%H%x09%cI",
			`--since=${tu}`,
			"--",
			TEP,
		],
		goc,
	)
		.trim()
		.split("\n")
		.filter(Boolean)
		.map((dong) => {
			const [sha = "", commitLuc = ""] = dong.split("\t");
			return { sha, commitLuc };
		})
		.reverse();
	const luot = docLuotTuGh(
		chay(
			"gh",
			[
				"run",
				"list",
				"--repo",
				KHO,
				"--workflow",
				WORKFLOW,
				"--limit",
				"500",
				"--json",
				"databaseId,headSha,status,conclusion,createdAt,updatedAt",
			],
			goc,
		),
	).map((l) => {
		const jobs: { jobs: { databaseId: number }[] } = JSON.parse(
			chay(
				"gh",
				["run", "view", String(l.databaseId), "--repo", KHO, "--json", "jobs"],
				goc,
			),
		);
		const ketQua =
			jobs.jobs
				.map((j) =>
					docGhiChuTuGh(
						chay(
							"gh",
							["api", `repos/${KHO}/check-runs/${j.databaseId}/annotations`],
							goc,
						),
					),
				)
				.find((k) => k !== null) ?? null;
		return { ...l, headCommitLuc: commitLucCua(l.headSha), ketQua };
	});
	const kq = tinhDoTre({ doi, luot, nhipMs: LO_TRINH.nhipLamMoiMs });
	for (const d of kq.dong)
		console.log(
			[
				d.sha.slice(0, 9),
				d.commitLuc,
				d.xongLuc ?? "—",
				d.treMs === null ? "—" : `${Math.round(d.treMs / 1000)} giây`,
				d.co.join(", "),
			].join("\t"),
		);
	console.log(
		`Kết luận: ${kq.ketLuan} (${kq.dong.length} lần đổi lộ trình từ ${tu})`,
	);
	process.exit(kq.ketLuan === "đạt" ? 0 : 1);
}
