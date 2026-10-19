import { createGateway } from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { DEFAULT_AGENT_MODEL, readAgentModel } from "@crm/db/settings";
import { defineDynamic } from "eve";
import { docDanhMuc, ghiBiGoLui } from "./model-danh-muc";
import { ghiModelPhien, modelPhienDaGhi } from "./model-phien";
import { TRO_LY_OKR } from "./okr/config";
import { moHinhTroLyOkr } from "./okr/mo-hinh";
import { MO_HINH_DANG_CHAY, type MucMoHinh } from "./okr/mo-hinh-thu";
import { attribute, type PurposeContext, purposeOf } from "./session-purpose";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";
import { type ModelMaySoan, modelTaiLieu } from "./tai-lieu-model";

export interface ModelSelection {
	model: string;
	modelContextWindowTokens: number;
}

export type VaiModel = "tro-ly" | "tac-nhan";

export async function modelTheoVai(
	vai: VaiModel,
): Promise<ModelSelection | null> {
	try {
		const setting = await readAgentModel(db);

		if (setting.isDefault) return null;

		const danhMuc = await docDanhMuc();
		if (danhMuc !== "khong-doc-duoc" && !danhMuc.co.has(setting.id)) {
			await ghiBiGoLui(setting.id, vai);
			return null;
		}

		return {
			model: setting.id,
			modelContextWindowTokens: setting.contextWindowTokens,
		};
	} catch (error) {
		console.error(
			`[agent] could not read the configured model for ${vai}, falling back: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}

export function vaiCuaPhien(ctx: PurposeContext): VaiModel {
	const purpose = purposeOf(ctx);
	return purpose === "builder" || purpose === "team-agent"
		? "tac-nhan"
		: "tro-ly";
}

export type LuaChonPhienGoc = ModelSelection & {
	modelOptions?: {
		providerOptions: {
			gateway: { zeroDataRetention: boolean; tags?: string[] };
		};
	};
};

export function modelChoPhienGoc(
	ctx: PurposeContext,
	muc: MucMoHinh = MO_HINH_DANG_CHAY,
): Promise<LuaChonPhienGoc | null> {
	if (purposeOf(ctx) === "kho") {
		return Promise.resolve({
			model: TAI_LIEU_AGENT.hoi.maModel,
			modelContextWindowTokens: DEFAULT_AGENT_MODEL.contextWindowTokens,
			modelOptions: {
				providerOptions: { gateway: TAI_LIEU_AGENT.hoi.gateway },
			},
		});
	}
	if (purposeOf(ctx) === "okr") {
		return Promise.resolve({
			model: muc.ma,
			modelContextWindowTokens: muc.cuaSoNguCanh,
			modelOptions: {
				providerOptions: {
					gateway: { zeroDataRetention: true, tags: [...TRO_LY_OKR.tags] },
				},
			},
		});
	}
	return modelTheoVai(vaiCuaPhien(ctx));
}

export function modelChoBuocGoc(
	ctx: PurposeContext,
	tao: typeof createGateway = createGateway,
	env: Readonly<Record<string, string | undefined>> = process.env,
	muc: MucMoHinh = MO_HINH_DANG_CHAY,
): ModelMaySoan | null {
	if (purposeOf(ctx) === "kho") return modelTaiLieu("hoi", env, tao);
	if (purposeOf(ctx) === "okr")
		return {
			model: moHinhTroLyOkr(env, tao, undefined, muc),
			modelContextWindowTokens: muc.cuaSoNguCanh,
		};
	return null;
}

export function modelChoBoDung() {
	return modelTheoVai("tac-nhan");
}

export async function modelChoLuot(): Promise<{
	id: string;
	thuocTinh: Record<string, string>;
}> {
	const chon = await modelTheoVai("tac-nhan");
	if (!chon) return { id: DEFAULT_AGENT_MODEL.id, thuocTinh: {} };
	return {
		id: chon.model,
		thuocTinh: {
			modelId: chon.model,
			modelContextWindowTokens: String(chon.modelContextWindowTokens),
		},
	};
}

export function modelChoBoChay(ctx: PurposeContext): ModelSelection | null {
	if (purposeOf(ctx) !== "team-agent") return null;
	const model = attribute(ctx, "modelId");
	const cuaSo = Number(attribute(ctx, "modelContextWindowTokens"));
	return model && Number.isFinite(cuaSo) && cuaSo > 0
		? { model, modelContextWindowTokens: cuaSo }
		: null;
}

export async function modelPhienDaDung(sessionId: string): Promise<string> {
	return (await modelPhienDaGhi(sessionId)) ?? (await readAgentModel(db)).id;
}

export const MODEL_GOC = defineDynamic({
	fallback: DEFAULT_AGENT_MODEL.id,
	events: {
		"session.started": async (_event, ctx) => {
			const chon = await modelChoPhienGoc(ctx);
			void ghiModelPhien(ctx, chon?.model ?? DEFAULT_AGENT_MODEL.id);
			return chon;
		},
		"step.started": (_event, ctx) => modelChoBuocGoc(ctx),
	},
});
