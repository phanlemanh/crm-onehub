import { createRequire } from "node:module";

const GOC = process.env.TTP_BLOB_GIA;
const DUOI_HOST = ".blob.vercel-storage.com";

if (GOC) {
	const require = createRequire(import.meta.url);
	const undici = require("undici");
	const doi = (vao) => {
		const u = new URL(vao instanceof Request ? vao.url : String(vao));
		if (!u.hostname.endsWith(DUOI_HOST)) return null;
		return `${GOC}/__blob${u.pathname}${u.search}`;
	};
	const boc = (goc) => (vao, init) => {
		const moi = doi(vao);
		if (moi === null) return goc(vao, init);
		if (vao instanceof Request) return goc(new Request(moi, vao), init);
		return goc(moi, init);
	};
	undici.fetch = boc(undici.fetch);
	globalThis.fetch = boc(globalThis.fetch);
	console.error(`nap-blob-gia: ${DUOI_HOST} -> ${GOC}`);
}
