import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const SHA = "c6a718f3d";
const RA = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"khuon-cu.json",
);

const BO = [
	{
		ten: "lien-he-chon-nguoi-owner",
		entity: "CONTACT",
		url: '?q=__Q__&owner=unassigned&owner=__B__&fields={"__CHON__":["__A__"],"__NGUOI__":["__U__"]}',
	},
	{
		ten: "lien-he-truong-tat",
		entity: "CONTACT",
		url: '?q=__Q__&fields={"__TAT__":["__A_TAT__"]}',
	},
];

const BAI = `import { expect, test } from "bun:test";
import fs from "node:fs";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot } from "react-dom/client";

const { useTableQuery } = await import("@/components/data-table/use-table-query");
const { contactsSearchParams } = await import("@/app/(app)/[slug]/contacts/contacts-search-params");

const BO = ${JSON.stringify(BO)};

test("lmt khuon cu", async () => {
	const ra = [];
	for (const bo of BO) {
		let view = null;
		function Doc() {
			view = useTableQuery(contactsSearchParams).currentView;
			return null;
		}
		const host = document.createElement("div");
		document.body.append(host);
		const root = createRoot(host);
		await act(async () => {
			root.render(<NuqsTestingAdapter searchParams={bo.url}><Doc /></NuqsTestingAdapter>);
		});
		ra.push({ ...bo, filters: view });
		await act(async () => root.unmount());
	}
	fs.writeFileSync(process.env.KHUON_RA, JSON.stringify(ra));
	expect(ra.length).toBe(BO.length);
});
`;

function chay(lenh, doiSo, cwd, env = {}) {
	return execFileSync(lenh, doiSo, {
		cwd,
		env: { ...process.env, ...env },
		stdio: ["ignore", "pipe", "pipe"],
	}).toString();
}

const tam = fs.mkdtempSync(path.join(os.tmpdir(), "lmt-khuon-cu-"));
const cay = path.join(tam, "cay");
const raTam = path.join(tam, "ra.json");

try {
	chay("git", ["worktree", "add", "--detach", cay, SHA], GOC);
	for (const nm of [
		"node_modules",
		"apps/app/node_modules",
		"packages/ui/node_modules",
		"packages/validation/node_modules",
		"packages/db/node_modules",
	]) {
		const nguon = path.join(GOC, nm);
		if (fs.existsSync(nguon) && !fs.existsSync(path.join(cay, nm))) {
			fs.symlinkSync(nguon, path.join(cay, nm));
		}
	}
	fs.writeFileSync(path.join(cay, "apps/app/test/lmt-khuon-cu.dom.tsx"), BAI);
	chay(
		"bun",
		[
			"test",
			"--timeout",
			"30000",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			"./test/lmt-khuon-cu.dom.tsx",
		],
		path.join(cay, "apps/app"),
		{ KHUON_RA: raTam, TZ: "Asia/Ho_Chi_Minh" },
	);
	const shaDu = chay("git", ["rev-parse", SHA], GOC).trim();
	const bo = JSON.parse(fs.readFileSync(raTam, "utf8"));
	fs.writeFileSync(
		RA,
		`${JSON.stringify({ sha: shaDu, nguon: "useTableQuery(contactsSearchParams).currentView", bo }, null, "\t")}\n`,
	);
	console.log(`sinh-khuon-cu: ${bo.length} bo → ${path.relative(GOC, RA)}`);
} finally {
	try {
		chay("git", ["worktree", "remove", "--force", cay], GOC);
	} catch {}
	fs.rmSync(tam, { recursive: true, force: true });
}
