import { BLOB_TEP_TRUONG } from "../src/blob-tep-truong";

export async function blobConLai(
	token: string,
	daPut: ReadonlySet<string>,
): Promise<string[]> {
	const { list } = await import("@vercel/blob");
	const con: string[] = [];
	let cursor: string | undefined;
	do {
		const trang = await list({
			token,
			prefix: `${BLOB_TEP_TRUONG.thuMuc}/`,
			cursor,
		});
		for (const b of trang.blobs)
			if (daPut.has(b.pathname)) con.push(b.pathname);
		cursor = trang.hasMore ? trang.cursor : undefined;
	} while (cursor);
	return con;
}

export async function xoaBlob(
	token: string,
	pathnames: string[],
): Promise<void> {
	if (pathnames.length === 0) return;
	const { del } = await import("@vercel/blob");
	await del(pathnames, { token });
}

export async function urlTranBlob(
	token: string,
	pathname: string,
): Promise<URL> {
	const { head } = await import("@vercel/blob");
	const dau = await head(pathname, { token });
	const tran = new URL(dau.url);
	tran.search = "";
	return tran;
}
