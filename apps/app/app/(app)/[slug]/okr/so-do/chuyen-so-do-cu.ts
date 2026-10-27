import * as dieuHuong from "next/navigation";

type ThamSoTho = Record<string, string | string[] | undefined>;

export async function chuyenSoDoCu(
	params: Promise<{ slug: string }>,
	searchParams: Promise<ThamSoTho>,
	tim: (slug: string, thamSo: ThamSoTho) => string | null,
): Promise<null> {
	const [{ slug }, thamSo] = await Promise.all([params, searchParams]);
	const dich = tim(slug, thamSo);
	if (dich) dieuHuong.redirect(dich);
	return null;
}
