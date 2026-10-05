const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export const MODEL_DANH_MUC = {
	url: "https://ai-gateway.vercel.sh/v1/models",
	ttlMs: 5 * MINUTE_MS,
	timeoutMs: 5 * SECOND_MS,
	suKienLui: "model.bi-go-lui",
	suKienHong: "model.khong-tim-thay",
	suKienChon: "model.phien-chon",
	phienSuKien: "model-danh-muc",
} as const;
