import { OKR_MAU } from "./cau-hinh";

export type MoiTruongNap = {
	DATABASE_URL?: string;
	TEST_DATABASE_URL?: string;
	NODE_ENV?: string;
	VERCEL_ENV?: string;
};

export type KetQuaChan =
	| { cho: true; mayChu: string }
	| { cho: false; lyDo: "may-chu" | "moi-truong" | "thieu-url"; cau: string };

export function mayChuCua(url: string): string | null {
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
}

export function kiemDuocNap(env: MoiTruongNap): KetQuaChan {
	for (const [bien, cam] of Object.entries(OKR_MAU.moiTruongCam)) {
		const giaTri = env[bien as keyof typeof OKR_MAU.moiTruongCam];
		if (giaTri && (cam as readonly string[]).includes(giaTri)) {
			return {
				cho: false,
				lyDo: "moi-truong",
				cau: `Từ chối nạp bộ OKR mẫu: ${bien}=${giaTri}. Bộ mẫu chỉ sống trên máy dev và phiên đo, không bao giờ ở production hay bản xem trước.`,
			};
		}
	}
	const url = env.NODE_ENV === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL;
	if (!url) {
		return {
			cho: false,
			lyDo: "thieu-url",
			cau: "Từ chối nạp bộ OKR mẫu: chưa có DATABASE_URL. Chép .env.example thành .env ở gốc kho.",
		};
	}
	const mayChu = mayChuCua(url);
	if (mayChu === null || !(OKR_MAU.mayCucBo as readonly string[]).includes(mayChu)) {
		return {
			cho: false,
			lyDo: "may-chu",
			cau: `Từ chối nạp bộ OKR mẫu vào «${mayChu ?? url}»: không phải máy cục bộ. Không có cờ nào vượt được bước này — bộ mẫu chỉ nạp vào cơ sở dữ liệu trên chính máy.`,
		};
	}
	return { cho: true, mayChu };
}
