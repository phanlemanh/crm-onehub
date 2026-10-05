import { createGateway } from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { DEFAULT_AGENT_MODEL, readAgentModel } from "@crm/db/settings";
import { defineDynamic } from "eve";
import { docDanhMuc, ghiBiGoLui } from "./model-danh-muc";
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
		providerOptions: { gateway: typeof TAI_LIEU_AGENT.hoi.gateway };
	};
};

export function modelChoPhienGoc(
	ctx: PurposeContext,
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
	return modelTheoVai(vaiCuaPhien(ctx));
}

export function modelChoBuocGoc(
	ctx: PurposeContext,
	tao: typeof createGateway = createGateway,
	env: Readonly<Record<string, string | undefined>> = process.env,
): ModelMaySoan | null {
	return purposeOf(ctx) === "kho" ? modelTaiLieu("hoi", env, tao) : null;
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

export const MODEL_GOC = defineDynamic({
	fallback: DEFAULT_AGENT_MODEL.id,
	events: {
		"session.started": (_event, ctx) => modelChoPhienGoc(ctx),
		"step.started": (_event, ctx) => modelChoBuocGoc(ctx),
	},
});
