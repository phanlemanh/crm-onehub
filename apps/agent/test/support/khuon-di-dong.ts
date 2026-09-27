import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import {
	type PurposeContext,
	SESSION_PURPOSES,
} from "../../agent/lib/session-purpose";

const GOC_AGENT = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"agent",
);

const MAU_TEP = [
	"tools/**/*.ts",
	"subagents/*/tools/**/*.ts",
	"subagents/*/agent.ts",
];

export type KhuonChuan = {
	"~standard": {
		jsonSchema: { input: (tuyChon: { target: string }) => object };
	};
};

type SuKienDong = { type: string };

type BoCongCuDong = Record<string, ModuleKhuon> | null;

type XuLyDong = (
	suKien: SuKienDong,
	nguCanh: PurposeContext,
) => BoCongCuDong | Promise<BoCongCuDong>;

type ModuleKhuon = {
	inputSchema?: KhuonChuan;
	outputSchema?: KhuonChuan;
	events?: Record<string, XuLyDong>;
};

export function chuyenKhuon(schema: KhuonChuan): object {
	return schema["~standard"].jsonSchema.input({
		target: "draft-07",
	});
}

export function viPhamKhuon(ten: string, schema: KhuonChuan): string[] {
	return JSON.stringify(chuyenKhuon(schema)).includes('"$ref"')
		? [`khuon co vong tham chieu: ${ten}`]
		: [];
}

export type PhanLoai =
	| { loai: "khuon"; ten: string; schema: KhuonChuan }
	| { loai: "dong"; events: NonNullable<ModuleKhuon["events"]> }
	| { loai: "da-tat" }
	| { loai: "vi-pham"; loi: string };

export function phanLoaiTep(
	duong: string,
	mod: ModuleKhuon | undefined,
	nguon: string,
): PhanLoai {
	if (duong.endsWith("agent.ts")) {
		return mod?.outputSchema
			? { loai: "khuon", ten: `${duong}#output`, schema: mod.outputSchema }
			: { loai: "da-tat" };
	}
	if (mod?.inputSchema) {
		return { loai: "khuon", ten: duong, schema: mod.inputSchema };
	}
	if (mod?.events && nguon.includes("defineDynamic(")) {
		return { loai: "dong", events: mod.events };
	}
	if (nguon.includes("disableTool(")) return { loai: "da-tat" };
	return { loai: "vi-pham", loi: `khong khuon, khong dau tat: ${duong}` };
}

function nguCanhGia(purpose: string): PurposeContext {
	const thuocTinh = { attributes: { purpose } };
	return {
		session: {
			id: "quet-khuon",
			auth: { current: thuocTinh, initiator: thuocTinh },
		},
	};
}

async function khuonDong(
	duong: string,
	events: NonNullable<ModuleKhuon["events"]>,
): Promise<Array<{ ten: string; schema: KhuonChuan }>> {
	const ra: Array<{ ten: string; schema: KhuonChuan }> = [];
	for (const [suKien, xuLy] of Object.entries(events)) {
		for (const purpose of SESSION_PURPOSES) {
			const bo = await xuLy({ type: suKien }, nguCanhGia(purpose));
			for (const [ten, congCu] of Object.entries(bo ?? {})) {
				if (congCu?.inputSchema) {
					ra.push({
						ten: `${duong}#${purpose}:${ten}`,
						schema: congCu.inputSchema,
					});
				}
			}
		}
	}
	return ra;
}

export async function quetKhuonAgent(): Promise<{
	daQuet: string[];
	viPham: string[];
}> {
	const daQuet: string[] = [];
	const viPham: string[] = [];
	for (const mau of MAU_TEP) {
		for (const tep of new Glob(mau).scanSync(GOC_AGENT)) {
			const duong = join(GOC_AGENT, tep);
			let mod: ModuleKhuon | undefined;
			try {
				mod = (await import(duong)).default as ModuleKhuon | undefined;
			} catch (error) {
				viPham.push(
					`khong nap duoc: ${duong}: ${error instanceof Error ? error.message : String(error)}`,
				);
				continue;
			}
			const phanLoai = phanLoaiTep(duong, mod, readFileSync(duong, "utf8"));
			if (phanLoai.loai === "vi-pham") viPham.push(phanLoai.loi);
			if (phanLoai.loai === "dong") {
				for (const khuon of await khuonDong(duong, phanLoai.events)) {
					daQuet.push(khuon.ten);
					viPham.push(...viPhamKhuon(khuon.ten, khuon.schema));
				}
			}
			if (phanLoai.loai !== "khuon") continue;
			daQuet.push(phanLoai.ten);
			viPham.push(...viPhamKhuon(phanLoai.ten, phanLoai.schema));
		}
	}
	return { daQuet, viPham };
}
