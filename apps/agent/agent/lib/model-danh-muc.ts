import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { docDanhMucGateway } from "@crm/validation/gateway-danh-muc";
import { z } from "zod";
import { MODEL_DANH_MUC } from "./model-config";

export type KetQuaDanhMuc = { co: ReadonlySet<string> } | "khong-doc-duoc";

type NguonDanhMuc = () => Promise<KetQuaDanhMuc>;

export async function docDanhMucTuMang(
	layVe: typeof fetch = fetch,
): Promise<KetQuaDanhMuc> {
	try {
		const phanHoi = await layVe(MODEL_DANH_MUC.url, {
			headers: { accept: "application/json" },
			signal: AbortSignal.timeout(MODEL_DANH_MUC.timeoutMs),
		});
		if (!phanHoi.ok) return "khong-doc-duoc";
		const ids = docDanhMucGateway(await phanHoi.json()).map((m) => m.id);
		return ids.length === 0 ? "khong-doc-duoc" : { co: new Set(ids) };
	} catch {
		return "khong-doc-duoc";
	}
}

let nguon: NguonDanhMuc = () => docDanhMucTuMang();
let nho: { luc: number; ketQua: { co: ReadonlySet<string> } } | null = null;

export function datNguonDanhMuc(moi: NguonDanhMuc): () => void {
	const cu = nguon;
	nguon = moi;
	nho = null;
	return () => {
		nguon = cu;
		nho = null;
	};
}

export async function docDanhMuc(): Promise<KetQuaDanhMuc> {
	if (nho && Date.now() - nho.luc < MODEL_DANH_MUC.ttlMs) return nho.ketQua;
	const ketQua = await nguon();
	nho = ketQua === "khong-doc-duoc" ? null : { luc: Date.now(), ketQua };
	return ketQua;
}

const daBao = new Set<string>();

export async function ghiBiGoLui(modelId: string, vai: string): Promise<void> {
	if (daBao.has(modelId)) return;
	daBao.add(modelId);
	console.warn(
		`[agent] model ${modelId} is no longer on the AI Gateway, falling back to the default`,
	);
	await db.agentEvent.create({
		data: {
			id: randomUUID(),
			sessionId: MODEL_DANH_MUC.phienSuKien,
			type: MODEL_DANH_MUC.suKienLui,
			data: { modelId, vai },
			emittedAt: new Date(),
		},
	});
}

export const chiTietLoiModel = z
	.object({
		gatewayName: z.string().optional(),
		gatewayType: z.string().optional(),
	})
	.loose()
	.nullable()
	.optional()
	.catch(null);

export type ChiTietLoiModel = z.infer<typeof chiTietLoiModel>;

export function laModelKhongTimThay(chiTiet: ChiTietLoiModel): boolean {
	return (
		chiTiet?.gatewayName === "GatewayModelNotFoundError" ||
		chiTiet?.gatewayType === "model_not_found"
	);
}

export async function ghiModelKhongTimThay(
	sessionId: string,
	modelId: string,
): Promise<void> {
	await db.agentEvent.create({
		data: {
			id: randomUUID(),
			sessionId,
			type: MODEL_DANH_MUC.suKienHong,
			data: { modelId },
			emittedAt: new Date(),
		},
	});
}
