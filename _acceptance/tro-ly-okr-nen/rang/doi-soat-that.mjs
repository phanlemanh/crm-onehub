import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AGENT, GOC, RA, vanTayMa } from "./mau-chung.mjs";

const { gateway } = await import(Bun.resolveSync("ai", AGENT));

const TONG_KET = join(RA, "e9-tong-ket.jsonl");
const SHA_TONG_KET = `${TONG_KET}.sha`;
const NGUONG = 0.1;
const CHO_MS = 15 * 60_000;
const NHIP_MS = 20_000;

if (!process.env.AI_GATEWAY_API_KEY?.trim()) {
	console.log("khong co khoa rieng de doc bao cao Gateway");
	process.exit(2);
}
const SHA = vanTayMa();
const shaTongKet = () =>
	existsSync(SHA_TONG_KET) ? readFileSync(SHA_TONG_KET, "utf8").trim() : "";
if (!existsSync(TONG_KET) || shaTongKet() !== SHA) {
	console.log(
		`tong ket cua E9 ${existsSync(TONG_KET) ? `ghi sha ${shaTongKet() || "(khong)"}` : "chua co"}, cay dang do ${SHA} — chay cach-ly-dau-cuoi.mjs --lan 3`,
	);
	const e9 = spawnSync(
		"bun",
		[join(import.meta.dirname, "cach-ly-dau-cuoi.mjs"), "--lan", "3"],
		{ cwd: GOC, stdio: "inherit" },
	);
	if (e9.status !== 0 || !existsSync(TONG_KET)) {
		console.log(`E9 khong xanh (ma ${e9.status}) — khong doi soat duoc`);
		process.exit(2);
	}
	if (shaTongKet() !== SHA) {
		console.log(
			`tong ket cua E9 ghi sha ${shaTongKet() || "(khong)"}, khac cay dang do ${SHA} — khong doi soat duoc`,
		);
		process.exit(2);
	}
}

const luot = readFileSync(TONG_KET, "utf8")
	.split("\n")
	.filter(Boolean)
	.map((d) => JSON.parse(d));
const ma = luot.flatMap((l) => [
	...(l.luotSinh?.goc ?? []),
	...(l.luotSinh?.con ?? []),
]);
const maCon = new Set(luot.flatMap((l) => l.luotSinh?.con ?? []));
const soSo = luot.reduce((s, l) => s + l.soSoUsd, 0);
const soCon = luot.reduce((s, l) => s + l.soConUsd, 0);
const soBuoc = luot.reduce((s, l) => s + l.soBuoc, 0);

if (ma.length === 0) {
	console.log("tong ket khong co ma luot sinh nao");
	process.exit(2);
}

async function docLuot(id) {
	const het = Date.now() + CHO_MS;
	for (;;) {
		try {
			return await gateway.getGenerationInfo({ id });
		} catch (loi) {
			if (Date.now() > het) throw loi;
			await new Promise((r) => setTimeout(r, NHIP_MS));
		}
	}
}

const tt = await Promise.all(ma.map(docLuot));
const soGateway = tt.reduce((s, g) => s + g.totalCost, 0);
const gatewayCon = tt
	.filter((g) => maCon.has(g.id))
	.reduce((s, g) => s + g.totalCost, 0);
const nhaCungCapCon = [
	...new Set(tt.filter((g) => maCon.has(g.id)).map((g) => g.providerName)),
];
const lech = Math.abs(soSo - soGateway) / soGateway;
const lechBoCon = Math.abs(soSo - soCon - soGateway) / soGateway;

const tu = luot.map((l) => l.batDau).sort()[0];
const den = luot
	.map((l) => l.ketThuc)
	.sort()
	.at(-1);
const url = new URL("https://ai-gateway.vercel.sh/v1/report");
url.searchParams.set("start_date", tu.slice(0, 10));
url.searchParams.set("end_date", den.slice(0, 10));
url.searchParams.set("group_by", "day");
url.searchParams.set("date_part", "hour");
url.searchParams.set("api_key_id", "self");
const r = await fetch(url, {
	headers: { authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}` },
});
const theoGio = r.ok ? await r.json() : { loi: r.status };
const gioDo = (theoGio.results ?? []).filter((d) => {
	const gio = String(d.hour ?? d.day ?? "");
	return gio >= tu.slice(0, 13) && gio <= den.slice(0, 13).replace("T", " ");
});

console.log(
	JSON.stringify({
		khung: { tu, den },
		soLuotSinh: ma.length,
		soBuocSo: soBuoc,
		soSoUsd: soSo,
		soGatewayUsd: soGateway,
		lechPhanTram: Math.round(lech * 1000) / 10,
		phienCon: { soUsd: soCon, gatewayUsd: gatewayCon },
		nhaCungCapGoc: [
			...new Set(tt.filter((g) => !maCon.has(g.id)).map((g) => g.providerName)),
		],
		nhaCungCapCon,
		baoCaoTheoGio: gioDo,
	}),
);
console.log(
	`so ${soSo.toFixed(6)} · gateway ${soGateway.toFixed(6)} · lech ${(lech * 100).toFixed(1)}% · ${ma.length} luot sinh, ${soBuoc} buoc trong so`,
);
console.log(
	`chieu do: bo dong phien con khoi so thi lech ${(lechBoCon * 100).toFixed(1)}%`,
);

if (nhaCungCapCon.some((n) => n !== "vertex")) {
	console.log(`phien con khong qua vertex: ${nhaCungCapCon.join(", ")}`);
	process.exit(1);
}
if (lechBoCon <= NGUONG) {
	console.log("thuoc khong phan biet duoc so thieu phien con");
	process.exit(1);
}
if (lech > NGUONG) {
	console.log(`so lech gateway qua ${NGUONG * 100}%`);
	process.exit(1);
}
process.exit(0);
