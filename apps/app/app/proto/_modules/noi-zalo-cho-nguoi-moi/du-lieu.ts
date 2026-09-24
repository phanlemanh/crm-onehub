import { NGUOI, type NguoiNoiMau, TEN_BOT } from "../nhac-qua-zalo/du-lieu";

export { TEN_BOT };

export type LienKetMoi =
	| { loai: "chua-noi" }
	| { loai: "ma-cho"; ma: string; hetHanLuc: string }
	| { loai: "ma-het-han" }
	| { loai: "da-noi"; tenZalo: string };

export type GuiThu = "chua" | "dang" | "xong" | "loi";

export type ThongBaoMoi = {
	lienKet: LienKetMoi;
	guiThu: GuiThu;
};

export type OToken = "trong" | "dang-kiem" | "sai-dang" | "zalo-tu-choi";

export type Webhook = "da-dang-ky" | "can-https" | "chua-dang-ky";

export type KetNoiMoi = {
	quanTri: boolean;
	bat: boolean;
	nguonToken: "man-hinh" | "env" | null;
	goiToken: string | null;
	webhook: Webhook;
	oToken: OToken;
	nguoi: NguoiNoiMau[];
};

const THONG_BAO_GOC: ThongBaoMoi = {
	lienKet: { loai: "chua-noi" },
	guiThu: "chua",
};

const DA_NOI: LienKetMoi = { loai: "da-noi", tenZalo: "Mạnh Phan" };

export const THONG_BAO = {
	"ST-thong-bao-chua-noi": THONG_BAO_GOC,
	"ST-thong-bao-ma-cho": {
		...THONG_BAO_GOC,
		lienKet: { loai: "ma-cho", ma: "482913", hetHanLuc: "09:15" },
	},
	"ST-thong-bao-ma-het-han": {
		...THONG_BAO_GOC,
		lienKet: { loai: "ma-het-han" },
	},
	"ST-thong-bao-da-noi": { lienKet: DA_NOI, guiThu: "chua" },
	"ST-thong-bao-gui-thu-xong": { lienKet: DA_NOI, guiThu: "xong" },
	"ST-thong-bao-gui-thu-loi": { lienKet: DA_NOI, guiThu: "loi" },
} satisfies Record<string, ThongBaoMoi>;

const KET_NOI_GOC: KetNoiMoi = {
	quanTri: true,
	bat: true,
	nguonToken: "man-hinh",
	goiToken: "x7Qa",
	webhook: "da-dang-ky",
	oToken: "trong",
	nguoi: NGUOI,
};

const CHUA_BAT: KetNoiMoi = {
	...KET_NOI_GOC,
	bat: false,
	nguonToken: null,
	goiToken: null,
	webhook: "chua-dang-ky",
};

export const KET_NOI = {
	"ST-ket-noi-chua-bat": CHUA_BAT,
	"ST-ket-noi-dang-luu": { ...CHUA_BAT, oToken: "dang-kiem" },
	"ST-ket-noi-token-sai": { ...CHUA_BAT, oToken: "sai-dang" },
	"ST-ket-noi-zalo-tu-choi": { ...CHUA_BAT, oToken: "zalo-tu-choi" },
	"ST-ket-noi-song": KET_NOI_GOC,
	"ST-ket-noi-can-https": { ...KET_NOI_GOC, webhook: "can-https" },
	"ST-ket-noi-chua-webhook": { ...KET_NOI_GOC, webhook: "chua-dang-ky" },
	"ST-ket-noi-env": { ...KET_NOI_GOC, nguonToken: "env", goiToken: null },
	"ST-ket-noi-thanh-vien": { ...KET_NOI_GOC, quanTri: false },
} satisfies Record<string, KetNoiMoi>;

export function thongBaoCua(state: string): ThongBaoMoi | undefined {
	return Object.hasOwn(THONG_BAO, state)
		? THONG_BAO[state as keyof typeof THONG_BAO]
		: undefined;
}

export function ketNoiCua(state: string): KetNoiMoi | undefined {
	return Object.hasOwn(KET_NOI, state)
		? KET_NOI[state as keyof typeof KET_NOI]
		: undefined;
}
