const GIAY_MS = 1_000;
const PHUT_GIAY = 60;

export const BLOB_NGUON = {
	thuMuc: "kho-tai-lieu/nguon",
	kieuNoiDung: {
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		pdf: "application/pdf",
	},
	giayKyPut: 10 * PHUT_GIAY,
	thongDiep: {
		tat: "Kho nguồn chưa bật: thiếu BLOB_READ_WRITE_TOKEN",
	},
} as const;

export type KieuNguon = keyof typeof BLOB_NGUON.kieuNoiDung;

export type KyUrl = { url: string; hetHan: number };

export type KhoNguon = {
	bat(): boolean;
	kyPut(
		pathname: string,
		opts: { kieu: KieuNguon; toiDa: number },
	): Promise<KyUrl>;
	doc(pathname: string): Promise<Uint8Array | null>;
	xoa(pathname: string): Promise<void>;
	kyGet(pathname: string, giay: number): Promise<KyUrl>;
};

export const PATHNAME_NGUON = (id: string) => `${BLOB_NGUON.thuMuc}/${id}`;

export function hetHanSau(giay: number, bayGio = Date.now()): number {
	return bayGio + giay * GIAY_MS;
}

function tokenNguon(): string | null {
	return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null;
}

function canToken(): string {
	const token = tokenNguon();
	if (!token) throw new Error(BLOB_NGUON.thongDiep.tat);
	return token;
}

export function khoNguonVercel(): KhoNguon {
	return {
		bat: () => tokenNguon() !== null,

		async kyPut(pathname, { kieu, toiDa }) {
			const token = canToken();
			const hetHan = hetHanSau(BLOB_NGUON.giayKyPut);
			const allowedContentTypes = [BLOB_NGUON.kieuNoiDung[kieu]];
			const { issueSignedToken, presignUrl } = await import("@vercel/blob");
			const ky = await issueSignedToken({
				token,
				pathname,
				operations: ["put"],
				validUntil: hetHan,
				allowedContentTypes,
				maximumSizeInBytes: toiDa,
			});
			const { presignedUrl } = await presignUrl(ky, {
				operation: "put",
				access: "private",
				pathname,
				validUntil: hetHan,
				allowedContentTypes,
				maximumSizeInBytes: toiDa,
				allowOverwrite: false,
				addRandomSuffix: false,
			});
			return { url: presignedUrl, hetHan };
		},

		async doc(pathname) {
			const token = tokenNguon();
			if (!token) return null;
			const { get } = await import("@vercel/blob");
			const ket = await get(pathname, {
				token,
				access: "private",
				useCache: false,
			});
			if (ket?.statusCode !== 200) return null;
			return new Uint8Array(await new Response(ket.stream).arrayBuffer());
		},

		async xoa(pathname) {
			const token = tokenNguon();
			if (!token) return;
			const { del } = await import("@vercel/blob");
			await del(pathname, { token });
		},

		async kyGet(pathname, giay) {
			const token = canToken();
			const hetHan = hetHanSau(giay);
			const { issueSignedToken, presignUrl } = await import("@vercel/blob");
			const ky = await issueSignedToken({
				token,
				pathname,
				operations: ["get"],
				validUntil: hetHan,
			});
			const { presignedUrl } = await presignUrl(ky, {
				operation: "get",
				access: "private",
				pathname,
				validUntil: hetHan,
			});
			return { url: presignedUrl, hetHan };
		},
	};
}
