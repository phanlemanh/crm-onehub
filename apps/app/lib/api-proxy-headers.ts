import { headerProxyKyDiaChi } from "@crm/auth/dia-chi";
import { khoaXacThuc } from "@/lib/env";

const HEADER_BO = [
	"host",
	"x-forwarded-host",
	"x-forwarded-proto",
	"x-forwarded-for",
	"forwarded",
	"transfer-encoding",
	"connection",
	"keep-alive",
	"content-length",
	"expect",
] as const;

export function headerGuiApi(
	vao: Headers,
	khoa: string | undefined = khoaXacThuc(),
): Headers {
	const ra = headerProxyKyDiaChi(vao, khoa);
	for (const header of HEADER_BO) ra.delete(header);
	return ra;
}
