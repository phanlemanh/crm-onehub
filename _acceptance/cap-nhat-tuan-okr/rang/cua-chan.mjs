import { request as httpRequest, createServer } from "node:http";
import { URL } from "node:url";

const CONG = Number(process.env.CUA_CHAN_PORT ?? 3922);
const NANG = process.env.CUA_CHAN_NANG ?? process.env.API_URL ?? "http://localhost:3921";
const NANG_URL = new URL(NANG);

let chanThuTuc = null;
const NHAT_KY_TOI_DA = 5000;
const nhatKy = [];

function thuTucTrongDuong(duong) {
	const m = duong.match(/^\/api\/trpc\/([^?]+)/);
	if (!m) return [];
	return decodeURIComponent(m[1])
		.split(",")
		.map((d) => d.trim());
}

async function docThan(req) {
	const phan = [];
	for await (const c of req) phan.push(c);
	return Buffer.concat(phan);
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

	if (req.method === "POST" && url.pathname === "/__cua-chan/chan") {
		const than = await docThan(req);
		try {
			const vao = JSON.parse(than.toString("utf8") || "{}");
			chanThuTuc = String(vao.thuTuc) === vao.thuTuc ? vao.thuTuc : null;
		} catch {
			chanThuTuc = null;
		}
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: true, chan: chanThuTuc }));
		return;
	}

	if (req.method === "POST" && url.pathname === "/__cua-chan/bo") {
		await docThan(req);
		chanThuTuc = null;
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
		return;
	}

	if (req.method === "GET" && url.pathname === "/__cua-chan/trang-thai") {
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: true, chan: chanThuTuc, nang: NANG }));
		return;
	}

	if (req.method === "GET" && url.pathname === "/__cua-chan/nhat-ky") {
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: true, goi: nhatKy }));
		return;
	}

	if (req.method === "POST" && url.pathname === "/__cua-chan/xoa-nhat-ky") {
		await docThan(req);
		nhatKy.length = 0;
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
		return;
	}

	const than = await docThan(req);

	const thuTuc = thuTucTrongDuong(url.pathname);
	if (thuTuc.length > 0) {
		nhatKy.push({
			luc: Date.now(),
			thuTuc,
			input: url.searchParams.get("input"),
		});
		if (nhatKy.length > NHAT_KY_TOI_DA) nhatKy.shift();
	}

	if (
		chanThuTuc !== null &&
		thuTucTrongDuong(url.pathname).includes(chanThuTuc)
	) {
		res.writeHead(500, { "content-type": "application/json" });
		res.end(
			JSON.stringify({
				error: { message: `chan boi cua-chan: ${chanThuTuc}`, code: -32000 },
			}),
		);
		return;
	}

	const headers = { ...req.headers, host: NANG_URL.host };
	delete headers["content-length"];
	delete headers["transfer-encoding"];
	delete headers["connection"];
	if (than.length > 0) headers["content-length"] = String(than.length);

	const nguoc = httpRequest(
		{
			hostname: NANG_URL.hostname,
			port: NANG_URL.port,
			path: req.url,
			method: req.method,
			headers,
		},
		(resNang) => {
			res.writeHead(resNang.statusCode ?? 502, resNang.headers);
			resNang.pipe(res);
		},
	);
	nguoc.on("error", (loi) => {
		if (res.headersSent) return;
		res.writeHead(502, { "content-type": "application/json" });
		res.end(
			JSON.stringify({
				error: { message: `cua-chan khong noi duoc nang ${NANG}: ${loi.message}` },
			}),
		);
	});
	nguoc.end(than.length > 0 ? than : undefined);
});

server.listen(CONG, () => {
	console.log(`cua-chan: nghe cong ${CONG}, chuyen toi ${NANG}`);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
