import { createGateway } from "@ai-sdk/gateway";
import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";

const SOAN = TAI_LIEU_AGENT.soan;

export type NhanKhoa = "rieng" | "chung";

export function nhanKhoaMaySoan(
	env: Readonly<Record<string, string | undefined>> = process.env,
): NhanKhoa {
	return env[SOAN.bienKhoaRieng]?.trim() ? "rieng" : "chung";
}

export type ModelMaySoan = {
	model: ReturnType<ReturnType<typeof createGateway>>;
	modelContextWindowTokens: number;
};

export function modelMaySoan(
	env: Readonly<Record<string, string | undefined>> = process.env,
	tao: typeof createGateway = createGateway,
): ModelMaySoan | null {
	const khoa = env[SOAN.bienKhoaRieng]?.trim();
	if (!khoa) return null;
	return {
		model: tao({ apiKey: khoa })(SOAN.maModel),
		modelContextWindowTokens: DEFAULT_AGENT_MODEL.contextWindowTokens,
	};
}
