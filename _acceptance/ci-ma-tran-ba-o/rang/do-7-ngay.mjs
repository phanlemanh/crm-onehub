import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { readFileSync } from "node:fs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const KHO = "phanlemanh/crm-onehub";
const TEP = ".github/workflows/ci.yml";
const MAU_TOI_THIEU = 10;
const NGUONG_PHUT = 15;
const DU_PHUT = 1;

const thamSo = process.argv.slice(2);
const nhanh = thamSo[thamSo.indexOf("--nhanh") + 1];
if (!thamSo.includes("--nhanh") || !nhanh) {
	console.error("do-7-ngay: can --nhanh <ten branch>");
	process.exit(2);
}

const phut = (j) =>
	(Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60000;

function tranCua(tenJob, tran) {
	if (tenJob.startsWith("test (")) return tran.test;
	if (tenJob === "ci-ok") return tran["ci-ok"];
	return tran.check ?? tran[tenJob];
}

export function phanLoai(luot, tran) {
	const xanh = luot.filter((l) =>
		l.jobs.some((j) => j.name === "ci-ok" && j.conclusion === "success"),
	);
	const dungVaoTran = luot.flatMap((l) =>
		l.jobs
			.filter((j) => j.conclusion === "cancelled")
			.filter((j) => {
				const t = tranCua(j.name, tran);
				return t !== undefined && phut(j) >= t - DU_PHUT;
			})
			.map((j) => `${l.id}/${j.name}`),
	);
	const dai = xanh.map((l) => Math.max(...l.jobs.map(phut)));
	return { xanh: xanh.length, dai, dungVaoTran };
}

const trungVi = (ds) =>
	[...ds].sort((a, b) => a - b)[Math.floor(ds.length / 2)];

function tranTuTep(chu) {
	const jobs = Bun.YAML.parse(chu).jobs ?? {};
	return Object.fromEntries(
		Object.entries(jobs).map(([k, j]) => [
			k,
			Number(j["timeout-minutes"] ?? 360),
		]),
	);
}

const gia = (ten, ket, dai) => ({
	name: ten,
	conclusion: ket,
	started_at: "2026-10-01T00:00:00Z",
	completed_at: new Date(
		Date.parse("2026-10-01T00:00:00Z") + dai * 60000,
	).toISOString(),
});
const TRAN_GIA = { check: 20, test: 20, "ci-ok": 5 };
const tuThu = [
	{
		id: "gia-day-chong",
		jobs: [gia("test (api)", "cancelled", 3), gia("ci-ok", "failure", 0.1)],
	},
	{
		id: "gia-het-tran",
		jobs: [gia("test (app-ui)", "cancelled", 21), gia("ci-ok", "failure", 0.1)],
	},
];
const kq = phanLoai(tuThu, TRAN_GIA);
if (
	kq.dungVaoTran.length !== 1 ||
	kq.dungVaoTran[0] !== "gia-het-tran/test (app-ui)"
) {
	console.error(
		`do-7-ngay: huy vi tran sai tren du lieu gia — dem ${JSON.stringify(kq.dungVaoTran)}`,
	);
	process.exit(1);
}

const runs = JSON.parse(
	execFileSync(
		"gh",
		[
			"run",
			"list",
			"-R",
			KHO,
			"--workflow",
			"ci.yml",
			"--branch",
			nhanh,
			"--limit",
			"200",
			"--json",
			"databaseId,headSha",
		],
		{ encoding: "utf8" },
	),
);
const tranHienTai = tranTuTep(readFileSync(join(GOC, TEP), "utf8"));
const luot = runs.map((r) => ({
	id: String(r.databaseId),
	jobs: JSON.parse(
		execFileSync(
			"gh",
			["api", `repos/${KHO}/actions/runs/${r.databaseId}/jobs`],
			{ encoding: "utf8" },
		),
	).jobs.filter((j) => j.started_at && j.completed_at),
	tran: (() => {
		try {
			return tranTuTep(
				execFileSync("git", ["-C", GOC, "show", `${r.headSha}:${TEP}`], {
					encoding: "utf8",
				}),
			);
		} catch {
			return tranHienTai;
		}
	})(),
}));
const tong = luot.map((l) => phanLoai([l], l.tran));
const xanh = tong.reduce((s, x) => s + x.xanh, 0);
const dai = tong.flatMap((x) => x.dai);
const dung = tong.flatMap((x) => x.dungVaoTran);
console.log(
	`branch ${nhanh}: ${luot.length} luot, ${xanh} luot xanh (ci-ok success)`,
);
console.log(
	`job dai nhat moi luot xanh: ${dai.map((x) => x.toFixed(1)).join(", ") || "-"} phut`,
);
console.log(
	`dung vi tran: ${dung.length}${dung.length ? ` (${dung.join(", ")})` : ""}`,
);
if (xanh < MAU_TOI_THIEU) {
	console.log(
		`ket luan: chua du mau (${xanh} < ${MAU_TOI_THIEU} luot xanh) — khong ket luan SONG`,
	);
} else {
	const tv = trungVi(dai);
	console.log(
		`ket luan: trung vi job dai nhat ${tv.toFixed(1)} phut ${tv <= NGUONG_PHUT ? "<=" : ">"} ${NGUONG_PHUT}; ${dung.length === 0 ? "0 luot dung vi tran" : "CO luot dung vi tran"}`,
	);
}
