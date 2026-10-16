import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const VERCEL = process.env.VERCEL_BIN ?? "vercel";
export const TEAM = "team_Y2xHDdP6Pp5IjjK9g1fQk09l";
export const KHO = "phanlemanh/crm-onehub";
export const BA_DU_AN = [
	"crm-onehub-app",
	"crm-onehub-api",
	"crm-onehub-agent",
];
export const BA_TEP = [
	"vercel.json",
	"apps/app/vercel.json",
	"apps/agent/vercel.json",
];

export class LoiApi extends Error {}

function chayJson(lenh, doiSo) {
	const kq = spawnSync(lenh, doiSo, {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (kq.error || kq.status !== 0) {
		const vi = kq.error
			? (kq.error.code ?? kq.error.message)
			: `ma ${kq.status}`;
		throw new LoiApi(
			`${lenh} ${doiSo.slice(0, 2).join(" ")} -> ${vi}: ${(kq.stderr ?? "").trim().slice(0, 400)}`,
		);
	}
	try {
		return JSON.parse(kq.stdout);
	} catch {
		throw new LoiApi(
			`${lenh} ${doiSo.slice(0, 2).join(" ")}: dau ra khong phai JSON`,
		);
	}
}

export function vercelApi(duong) {
	const noi = duong.includes("?") ? "&" : "?";
	return chayJson(VERCEL, [
		"api",
		`${duong}${noi}teamId=${TEAM}`,
		"--method",
		"GET",
	]);
}

export function git(...doiSo) {
	const kq = spawnSync("git", doiSo, { cwd: GOC, encoding: "utf8" });
	return {
		ma: kq.status,
		ra: (kq.stdout ?? "").trim(),
		loi: (kq.stderr ?? "").trim(),
	};
}

export function duAnCuaKho() {
	const ds = vercelApi("/v9/projects?repo=crm-onehub&limit=100").projects ?? [];
	return ds
		.filter(
			(p) => p.link?.org === "phanlemanh" && p.link?.repo === "crm-onehub",
		)
		.map((p) => ({ ten: p.name, id: p.id, root: p.rootDirectory ?? null }));
}

export function timLanDay(nhanh) {
	const ref = encodeURIComponent(`refs/heads/${nhanh}`);
	const trang = chayJson("gh", [
		"api",
		`repos/${KHO}/activity?ref=${ref}&activity_type=push&per_page=100`,
	]);
	return trang.map((s) => ({
		after: s.after,
		before: s.before,
		luc: s.timestamp,
	}));
}

export function trienKhaiCho(duAn, sha) {
	const ds =
		vercelApi(
			`/v6/deployments?projectId=${duAn}&limit=100&meta-githubCommitSha=${sha}`,
		).deployments ?? [];
	return ds
		.filter((d) => d.meta?.githubCommitSha === sha)
		.map((d) => ({
			id: d.uid,
			readyState: d.state ?? d.readyState,
			source: d.source,
			target: d.target ?? "preview",
		}));
}

export function chiTietTrienKhai(id) {
	const d = vercelApi(`/v13/deployments/${id}`);
	return {
		id: d.id,
		readyState: d.readyState,
		readyStateReason: d.readyStateReason ?? "",
		source: d.source,
		target: d.target ?? "preview",
		sha: d.meta?.githubCommitSha ?? "",
	};
}

export function statusGithub(sha) {
	const trang = chayJson("gh", [
		"api",
		`repos/${KHO}/commits/${sha}/statuses?per_page=100`,
	]);
	return trang.map((s) => ({ context: s.context, state: s.state }));
}

export const ngu = (giay) => Bun.sleep(giay * 1000);
