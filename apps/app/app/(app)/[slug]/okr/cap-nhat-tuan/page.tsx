import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Đường cũ của thẻ «Cập nhật tuần». Thẻ đã bỏ — cập nhật tuần làm ngay trong Của tôi —
 * nhưng tin nhắc Zalo đã gửi vẫn mang đường này, nên trang sống lâu dài và chỉ chuyển
 * về `/okr`, giữ nguyên mọi tham số (kể cả `tu`, để Của tôi mở sẵn bảng cập nhật).
 */
function duongCuaToi(
	slug: string,
	thamSo: Record<string, string | string[] | undefined>,
): string {
	const q = new URLSearchParams();
	for (const [khoa, giaTri] of Object.entries(thamSo))
		for (const x of Array.isArray(giaTri)
			? giaTri
			: giaTri === undefined
				? []
				: [giaTri])
			q.append(khoa, x);
	const chuoi = q.toString();
	return chuoi ? `/${slug}/okr?${chuoi}` : `/${slug}/okr`;
}

export default async function CapNhatTuanCu({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: SearchParams;
}) {
	redirect(duongCuaToi((await params).slug, await searchParams));
}
