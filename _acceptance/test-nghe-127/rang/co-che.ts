import { createServer as taoMayHttp } from "node:http";
import { createServer, type Server } from "node:net";

const LOI_GIA = "SSH-2.0-limactl\r\n";

type Ket = { ten: string; nghe: boolean; fetch: string };

async function giuCong(): Promise<{ chiem: Server; cong: number }> {
	const chiem = createServer((s) => s.end(LOI_GIA));
	await new Promise<void>((ok) => chiem.listen(0, "127.0.0.1", ok));
	const dc = chiem.address();
	if (dc === null || typeof dc === "string") {
		throw new Error("co che: khong doc duoc cong bi giu");
	}
	return { chiem, cong: dc.port };
}

async function goi(cong: number): Promise<string> {
	try {
		const r = await fetch(`http://127.0.0.1:${cong}/`);
		return `${r.status} ${await r.text()}`;
	} catch (e) {
		return e instanceof Error ? e.message : String(e);
	}
}

async function thuBun(ten: string, cong: number, host?: string): Promise<Ket> {
	let sv: ReturnType<typeof Bun.serve>;
	try {
		sv = Bun.serve({
			port: cong,
			...(host ? { hostname: host } : {}),
			fetch: () => new Response("ok"),
		});
	} catch {
		return { ten, nghe: false, fetch: "" };
	}
	const f = await goi(cong);
	sv.stop(true);
	return { ten, nghe: true, fetch: f };
}

async function thuNode(ten: string, cong: number, host?: string): Promise<Ket> {
	const sv = taoMayHttp((_q, r) => r.end("ok"));
	const nghe = await new Promise<boolean>((ok) => {
		sv.once("error", () => ok(false));
		if (host) sv.listen(cong, host, () => ok(true));
		else sv.listen(cong, () => ok(true));
	});
	if (!nghe) return { ten, nghe, fetch: "" };
	const f = await goi(cong);
	await new Promise<void>((ok) => sv.close(() => ok()));
	return { ten, nghe, fetch: f };
}

const { chiem, cong } = await giuCong();
const ket = [
	await thuBun("bun-khong-host", cong),
	await thuNode("node-khong-host", cong),
	await thuBun("bun-127", cong, "127.0.0.1"),
	await thuNode("node-127", cong, "127.0.0.1"),
];
chiem.close();

const doiChung = await new Promise<string>((ok) => {
	const sv = taoMayHttp((_q, r) => r.end("ok"));
	sv.listen(0, "127.0.0.1", async () => {
		const dc = sv.address();
		const f = dc && typeof dc !== "string" ? await goi(dc.port) : "khong cong";
		sv.close(() => ok(f));
	});
});

console.log(`co che: cong bi giu ${cong}`);
for (const k of ket) console.log(`  ${k.ten}: nghe=${k.nghe} fetch=${k.fetch}`);
console.log(`  doi-chung-127-cong-0: ${doiChung}`);

const loi: string[] = [];
for (const k of ket.slice(0, 2)) {
	if (!k.nghe || !k.fetch.includes("Malformed_HTTP_Response")) {
		loi.push(`co che: ${k.ten} khong tai tao duoc loi ${JSON.stringify(k)}`);
	}
}
for (const k of ket.slice(2)) {
	if (k.nghe) loi.push(`co che: ${k.ten} van nghe duoc cong bi giu ${JSON.stringify(k)}`);
}
if (doiChung !== "200 ok") loi.push(`co che: doi chung 127 cong 0 hong ${doiChung}`);
for (const l of loi) console.error(`error: ${l}`);
process.exit(loi.length === 0 ? 0 : 1);
