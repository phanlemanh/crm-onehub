import { spawnSync } from "node:child_process";

export const VERCEL = "/opt/homebrew/bin/vercel";
export const SCOPE = "phanlemanh-8330s-projects";
export const AGENT_OKR = "prj_5a1UZt07Z4SnyHlnXaKgQEvvRYkB";
export const KHO = "phanlemanh/crm-onehub";

export class LoiApi extends Error {}

function chay(lenh, doiSo) {
	const kq = spawnSync(lenh, doiSo, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	if (kq.status !== 0) {
		throw new LoiApi(`${lenh} ${doiSo.slice(0, 2).join(" ")} -> ma ${kq.status}: ${(kq.stderr ?? "").trim().slice(0, 400)}`);
	}
	try {
		return JSON.parse(kq.stdout);
	} catch {
		throw new LoiApi(`${lenh} ${doiSo.slice(0, 2).join(" ")}: dau ra khong phai JSON`);
	}
}

export function vercelApi(duong) {
	return chay(VERCEL, ["api", duong, "--scope", SCOPE]);
}

export function trienKhaiCho(projectId, sha) {
	const ds = vercelApi(`/v6/deployments?projectId=${projectId}&limit=100`).deployments ?? [];
	return ds
		.filter((d) => d.meta?.githubCommitSha === sha)
		.map((d) => vercelApi(`/v13/deployments/${d.uid}`))
		.map((d) => ({
			id: d.id,
			readyState: d.readyState,
			readyStateReason: d.readyStateReason ?? "",
			source: d.source,
			target: d.target ?? "preview",
		}));
}

export function statusGithub(sha) {
	const trang = chay("gh", ["api", `repos/${KHO}/commits/${sha}/statuses?per_page=100`]);
	return trang.map((s) => ({ context: s.context, state: s.state }));
}

export const ngu = (giay) => Bun.sleep(giay * 1000);
