import { KHOA_DAY_LO_TRINH } from "./api-keys";
import { auth } from "./auth";

function quyenDay() {
	return { loTrinh: [...KHOA_DAY_LO_TRINH.quyen.loTrinh] };
}

export async function taoKhoaDayLoTrinh(o: {
	userId: string;
	name: string;
	expiresIn: number | null;
}) {
	return auth.api.createApiKey({
		body: {
			userId: o.userId,
			name: o.name,
			expiresIn: o.expiresIn,
			configId: KHOA_DAY_LO_TRINH.configId,
			permissions: quyenDay(),
		},
	});
}

export async function xacMinhKhoaDayLoTrinh(
	key: string,
): Promise<{ apiKeyId: string; userId: string } | null> {
	const kq = await auth.api.verifyApiKey({
		body: {
			key: key.trim(),
			configId: KHOA_DAY_LO_TRINH.configId,
			permissions: quyenDay(),
		},
	});
	if (!kq.valid || !kq.key) return null;
	return { apiKeyId: kq.key.id, userId: kq.key.referenceId };
}
