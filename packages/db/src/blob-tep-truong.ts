const GIAY_MS = 1_000;
const PHUT_GIAY = 60;

export const BLOB_TEP_TRUONG = {
	ten: "truong-tep",
	thuMuc: "truong-tep",
	bienKhoa: "TEP_BAN_GHI_BLOB_TOKEN",
	giayKyPut: 10 * PHUT_GIAY,
	thongDiep: {
		tat: "Kho tệp chưa bật: thiếu TEP_BAN_GHI_BLOB_TOKEN",
	},
} as const;

export type KyUrlTep = { url: string; hetHan: number };

export type KhoTepTruong = {
	bat(): boolean;
	kyPut(
		pathname: string,
		opts: { mime: string; toiDa: number },
	): Promise<KyUrlTep>;
	doc(pathname: string): Promise<Uint8Array | null>;
	xoa(pathname: string): Promise<void>;
	kyGet(pathname: string, giay: number): Promise<KyUrlTep>;
};

export const PATHNAME_TEP = (id: string) => `${BLOB_TEP_TRUONG.thuMuc}/${id}`;

function hetHanSau(giay: number, bayGio = Date.now()): number {
	return bayGio + giay * GIAY_MS;
}

function tokenTep(): string | null {
	return process.env[BLOB_TEP_TRUONG.bienKhoa]?.trim() || null;
}

function canToken(): string {
	const token = tokenTep();
	if (!token) throw new Error(BLOB_TEP_TRUONG.thongDiep.tat);
	return token;
}

export function khoTepTruongVercel(): KhoTepTruong {
	return {
		bat: () => tokenTep() !== null,

		async kyPut(pathname, { mime, toiDa }) {
			const token = canToken();
			const hetHan = hetHanSau(BLOB_TEP_TRUONG.giayKyPut);
			const allowedContentTypes = [mime];
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
			const token = tokenTep();
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
			const token = canToken();
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
