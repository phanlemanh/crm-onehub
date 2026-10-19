import type { LOAI_VIEC_TRO_LY_OKR } from "./agent-tasks";
import type { ViecTroLy } from "./okr-tro-ly-danh-muc";

export const TINH_NANG = [
	"crm.nghien-cuu",
	"crm.hoi-dap",
	"zalo.hoi-crm",
	"crm.dung-tac-nhan",
	"crm.tac-nhan",
	"okr.chuyen-tiep",
	"okr.de-xuat",
	"okr.tom-tat",
	"okr.soan",
	"okr.hoi-dap",
	"tai-lieu.may-soan",
	"tai-lieu.tro-ly",
	"khac",
] as const;

export type TinhNang = (typeof TINH_NANG)[number];

export const NHOM_VIEC_AI = [
	"nghien-cuu-danh-ba",
	"tro-ly-ai",
	"hoi-crm-zalo",
	"tac-nhan",
	"tro-ly-okr",
	"chua-gan",
] as const;

export type NhomViecAi = (typeof NHOM_VIEC_AI)[number];

export const NHOM_CUA_TINH_NANG = {
	"crm.nghien-cuu": "nghien-cuu-danh-ba",
	"crm.hoi-dap": "tro-ly-ai",
	"zalo.hoi-crm": "hoi-crm-zalo",
	"crm.dung-tac-nhan": "tac-nhan",
	"crm.tac-nhan": "tac-nhan",
	"okr.chuyen-tiep": "tro-ly-okr",
	"okr.de-xuat": "tro-ly-okr",
	"okr.tom-tat": "tro-ly-okr",
	"okr.soan": "tro-ly-okr",
	"okr.hoi-dap": "tro-ly-okr",
	"tai-lieu.may-soan": "chua-gan",
	"tai-lieu.tro-ly": "chua-gan",
	khac: "chua-gan",
} as const satisfies Record<TinhNang, NhomViecAi>;

export const TINH_NANG_TRO_LY_OKR = [
	"okr.chuyen-tiep",
	"okr.de-xuat",
	"okr.tom-tat",
	"okr.soan",
] as const satisfies readonly TinhNang[];

export function laTinhNang(chu: string): chu is TinhNang {
	return (TINH_NANG as readonly string[]).includes(chu);
}

export const SUBAGENT_CO_SO = [
	"tro_ly_okr",
	"agent_runner",
	"agent_builder",
	"tro_ly_kho",
] as const;

export type SubagentCoSo = (typeof SUBAGENT_CO_SO)[number];

const VIEC_CUA_SUBAGENT = {
	agent_runner: "crm.tac-nhan",
	agent_builder: "crm.dung-tac-nhan",
	tro_ly_kho: "tai-lieu.tro-ly",
} as const satisfies Record<Exclude<SubagentCoSo, "tro_ly_okr">, TinhNang>;

const VIEC_CUA_PURPOSE = {
	okr: "okr.chuyen-tiep",
	builder: "crm.dung-tac-nhan",
	"team-agent": "crm.tac-nhan",
	zalo: "zalo.hoi-crm",
	research: "crm.nghien-cuu",
	"may-soan": "tai-lieu.may-soan",
	kho: "tai-lieu.tro-ly",
	"okr-soan": "okr.soan",
	"okr-hoi": "okr.hoi-dap",
} as const satisfies Record<string, TinhNang>;

export type NguonBuoc = {
	kenh: string | null;
	purpose: string | null;
	subagent: string | null;
	okrViec: string | null;
};

const VIEC_CUA_LOAI_OKR = {
	"okr-de-xuat": "de-xuat",
	"okr-tom-tat-tuan": "tom-tat-tuan",
} as const satisfies Record<(typeof LOAI_VIEC_TRO_LY_OKR)[number], ViecTroLy>;

export function okrViecCuaLoai(kind: string): ViecTroLy | null {
	return kind in VIEC_CUA_LOAI_OKR
		? VIEC_CUA_LOAI_OKR[kind as keyof typeof VIEC_CUA_LOAI_OKR]
		: null;
}

export function tinhNangCua(nguon: NguonBuoc): TinhNang {
	if (nguon.subagent === "tro_ly_okr") {
		if (nguon.okrViec === "tom-tat-tuan") return "okr.tom-tat";
		return nguon.okrViec === "de-xuat" ? "okr.de-xuat" : "okr.chuyen-tiep";
	}
	if (
		nguon.subagent === "agent_runner" ||
		nguon.subagent === "agent_builder" ||
		nguon.subagent === "tro_ly_kho"
	) {
		return VIEC_CUA_SUBAGENT[nguon.subagent];
	}
	if (nguon.subagent) return "khac";
	if (nguon.purpose === "okr-soan") return "okr.soan";
	if (nguon.purpose === "okr-hoi") return "okr.hoi-dap";
	if (nguon.kenh === "eve") return "crm.hoi-dap";
	if (nguon.kenh === "zalo") return "zalo.hoi-crm";
	const purpose = nguon.purpose ?? "research";
	return purpose in VIEC_CUA_PURPOSE
		? VIEC_CUA_PURPOSE[purpose as keyof typeof VIEC_CUA_PURPOSE]
		: "khac";
}

export const MOC_BAO_TRAN = [80, 100] as const;

export type MocBaoTran = 0 | (typeof MOC_BAO_TRAN)[number];

export function mocBaoTran(chiUsd: number, tranUsd: number): MocBaoTran {
	if (tranUsd <= 0 || chiUsd >= tranUsd) return 100;
	return chiUsd / tranUsd >= 0.8 ? 80 : 0;
}

export const KET_QUA_DOI_SOAT = [
	"khop",
	"lech",
	"khong-doi-soat-duoc",
] as const;

export type KetQuaDoiSoat = (typeof KET_QUA_DOI_SOAT)[number];

export type SoSanhDoiSoat = {
	ketQua: Exclude<KetQuaDoiSoat, "khong-doi-soat-duoc">;
	lechPhanTram: number;
};

export const NGUONG_LECH_DOI_SOAT = 0.1;

const XU_MOI_USD = 100;

export function dinhUsd(usd: number): string {
	const xu = Math.round(usd * XU_MOI_USD);
	const tron = xu % XU_MOI_USD === 0;
	return new Intl.NumberFormat("vi", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: tron ? 0 : 2,
		maximumFractionDigits: tron ? 0 : 2,
	}).format(xu / XU_MOI_USD);
}

export function ketQuaDoiSoat(
	soSo: number,
	soGateway: number,
	nguong: number = NGUONG_LECH_DOI_SOAT,
): SoSanhDoiSoat {
	const khac = Math.abs(soSo - soGateway);
	const lech = soSo === 0 ? (khac === 0 ? 0 : 1) : khac / soSo;
	return {
		ketQua: lech <= nguong + 1e-9 ? "khop" : "lech",
		lechPhanTram: Math.round(lech * 1000) / 10,
	};
}
