export const STORE_GIA = "ttpgia";
export const KHOA_GIA = `vercel_blob_rw_${STORE_GIA}_bimatgia`;
export const HOST_GIA = `${STORE_GIA}.private.blob.vercel-storage.com`;

const CORS = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET,PUT,POST,DELETE,OPTIONS",
	"access-control-allow-headers": "*",
	"access-control-expose-headers": "*",
};

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");

export function dungKhoGia() {
	const tep = new Map();
	const nhatKy = [];
	const kho = { giuPutMs: 0, giuPutTu: Number.POSITIVE_INFINITY, soPut: 0 };
	const may = Bun.serve({
		port: 0,
		async fetch(req) {
			const u = new URL(req.url);
			nhatKy.push(`${req.method} ${u.pathname}`);
			if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
			if (req.method === "POST" && u.pathname === "/signed-token") {
				const vao = await req.json();
				return Response.json({
					clientSigningToken: "khoa-ky-gia",
					delegationToken: `${b64({ storeId: STORE_GIA, ...vao })}.gia`,
				});
			}
			if (req.method === "POST" && u.pathname === "/delete") {
				const vao = await req.json().catch(() => ({}));
				for (const x of vao.urls ?? []) {
					const ten = String(x).startsWith("http") ? new URL(x).pathname.slice(1) : String(x);
					tep.delete(ten);
				}
				return Response.json({});
			}
			if (req.method === "PUT" && u.searchParams.has("pathname")) {
				const ten = u.searchParams.get("pathname");
				kho.soPut += 1;
				if (kho.soPut >= kho.giuPutTu && kho.giuPutMs > 0) {
					await Bun.sleep(kho.giuPutMs);
				}
				const byte = new Uint8Array(await req.arrayBuffer());
				tep.set(ten, { byte, kieu: req.headers.get("content-type") ?? "application/octet-stream" });
				return Response.json(
					{ url: `https://${HOST_GIA}/${ten}`, pathname: ten, contentType: tep.get(ten).kieu },
					{ headers: CORS },
				);
			}
			if (req.method === "GET" && u.pathname.startsWith("/__blob/")) {
				const ten = decodeURIComponent(u.pathname.slice("/__blob/".length));
				const co = tep.get(ten);
				if (!co) return new Response("", { status: 404, headers: CORS });
				return new Response(co.byte, {
					status: 200,
					headers: {
						...CORS,
						"content-type": co.kieu,
						"content-length": String(co.byte.length),
						"last-modified": new Date().toUTCString(),
					},
				});
			}
			return new Response("", { status: 400, headers: CORS });
		},
	});
	return {
		url: `http://localhost:${may.port}`,
		tep,
		nhatKy,
		giuTuPut(thu, ms) {
			kho.soPut = 0;
			kho.giuPutTu = thu;
			kho.giuPutMs = ms;
		},
		boGiu() {
			kho.giuPutMs = 0;
			kho.giuPutTu = Number.POSITIVE_INFINITY;
		},
		dung() {
			may.stop(true);
		},
	};
}
