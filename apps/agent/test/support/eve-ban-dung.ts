import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export type BanDungCon = {
	name: string;
	agent: {
		agentRoot: string;
		disabledFrameworkTools: string[];
		tools: { name: string }[];
		skills: unknown[];
		sandbox: { logicalPath: string; sourceHash: string } | null;
	};
};

type KetQuaBienDich = {
	manifest: { subagents: BanDungCon[] };
};

const GOC_AGENT = join(import.meta.dir, "..", "..");
const yeuCau = createRequire(join(GOC_AGENT, "package.json"));
const goiEve = dirname(yeuCau.resolve("eve/package.json"));

let banDung: Promise<KetQuaBienDich> | null = null;

export const TRAN_BIEN_DICH_MS = 60_000;

export async function banDungCon(ten: string): Promise<BanDungCon> {
	banDung ??= bienDich();
	const con = (await banDung).manifest.subagents.find((s) => s.name === ten);
	if (!con) throw new Error(`ban dung eve khong co subagent ${ten}`);
	return con;
}

async function bienDich(): Promise<KetQuaBienDich> {
	const { compileAgentInWorkspace } = (await import(
		join(goiEve, "dist/src/compiler/compile-agent.js")
	)) as {
		compileAgentInWorkspace: (vao: {
			startPath: string;
			artifactLocations: { publishedRoot: string; writeRoot: string };
		}) => Promise<KetQuaBienDich>;
	};
	const tam = mkdtempSync(join(tmpdir(), "tlk-eve-"));
	try {
		return await compileAgentInWorkspace({
			startPath: GOC_AGENT,
			artifactLocations: { publishedRoot: tam, writeRoot: tam },
		});
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

function tenRanRan(ten: string): string {
	return ten.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export async function danhMucDungSan(): Promise<string[]> {
	const macDinh = await import("eve/tools/defaults");
	return [...Object.keys(macDinh).map(tenRanRan), "ask_question"].sort();
}
