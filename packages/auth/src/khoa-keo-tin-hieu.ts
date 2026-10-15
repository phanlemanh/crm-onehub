import { KHOA_KEO_TIN_HIEU } from "./api-keys";
import { auth } from "./auth";

function quyenKeo() {
	return { tinHieu: [...KHOA_KEO_TIN_HIEU.quyen.tinHieu] };
}

export async function taoKhoaKeoTinHieu(o: {
	userId: string;
	name: string;
	expiresIn: number | null;
}) {
	return auth.api.createApiKey({
		body: {
			userId: o.userId,
			name: o.name,
			expiresIn: o.expiresIn,
			configId: KHOA_KEO_TIN_HIEU.configId,
			permissions: quyenKeo(),
		},
	});
}

export async function xacMinhKhoaKeoTinHieu(
	key: string,
): Promise<{ apiKeyId: string; userId: string } | null> {
	const kq = await auth.api.verifyApiKey({
		body: {
			key: key.trim(),
			configId: KHOA_KEO_TIN_HIEU.configId,
			permissions: quyenKeo(),
		},
	});
	if (!kq.valid || !kq.key) return null;
	return { apiKeyId: kq.key.id, userId: kq.key.referenceId };
}
