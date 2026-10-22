import { createRequire } from "node:module";

const GOC = process.env.TTP_BLOB_GIA;
const DUOI_HOST = ".blob.vercel-storage.com";

if (GOC) {
	const require = createRequire(import.meta.url);
	const undici = require("undici");
	const doi = (vao) => {
		const chuoi =
			typeof vao === "string" || vao instanceof URL ? String(vao) : vao?.url;
		if (!chuoi) return null;
		const u = new URL(chuoi);
		if (!u.hostname.endsWith(DUOI_HOST)) return null;
		return `${GOC}/__blob${u.pathname}${u.search}`;
	};
	const boc = (goc) => (vao, init) => {
		const moi = doi(vao);
		if (moi === null) return goc(vao, init);
		if (typeof vao === "string" || vao instanceof URL) return goc(moi, init);
		return goc(new Request(moi, vao), init);
	};
	undici.fetch = boc(undici.fetch);
	globalThis.fetch = boc(globalThis.fetch);
	console.error(`nap-blob-gia: ${DUOI_HOST} -> ${GOC}`);
}
