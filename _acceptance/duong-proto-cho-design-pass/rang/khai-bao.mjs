import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PROTO_CATALOG } from "../../../apps/app/app/proto/catalog.ts";
import { GOC_KHO, SLUG_HO_SO, thoat } from "./may-chu.mjs";

const chan = process.argv[2] ?? "tat-ca";
const loi = [];
const doi = (d, c) => {
	if (!d) loi.push(c);
};

const config = readFileSync(join(GOC_KHO, "_acceptance/config.yaml"), "utf8");
const khoi = config.match(/^design_pass:\n((?:[ \t]+.*\n|\n)*)/m);
if (khoi === null) thoat(2, "san cung: khong doc duoc khoi design_pass trong config.yaml");
const dp = khoi[1];

function gia(khoa, goc = dp) {
	const m = goc.match(new RegExp(`^\\s*${khoa}:\\s*"?([^"\\n]+)"?\\s*$`, "m"));
	return m === null ? null : m[1].trim();
}

if (chan === "config" || chan === "tat-ca") {
	const route = gia("proto_route");
	doi(route !== null, "design_pass.proto_route VANG");
	if (route !== null) {
		doi(route.includes("{slug}"), `proto_route "${route}" khong chua {slug}`);
		const duong = new URL(route.replace("{slug}", "x")).pathname;
		const nhanh = duong.split("/").filter(Boolean)[0];
		doi(
			existsSync(join(GOC_KHO, "apps/app/app", nhanh)),
			`proto_route tro toi nhanh "/${nhanh}" nhung apps/app/app/${nhanh} KHONG ton tai tren dia`,
		);
	}

	const dev = gia("dev_cmd");
	doi(dev !== null, "design_pass.dev_cmd VANG");
	doi(dev !== null && dev.includes("PROTO_ROUTE=1"),
		`dev_cmd khong mang PROTO_ROUTE=1 — in ra cho nguoi thi lenh do van chet: "${dev}"`);

	const he = dp.match(/^\s*host_embed:\n((?:\s{4,}.*\n)+)/m);
    doi(he !== null, "design_pass.host_embed VANG");
	if (he !== null) {
		const guide = gia("guide", he[1]);
		const route2 = gia("route", he[1]);
		const co = gia("dev_flag", he[1]);

		const coGuide = guide !== null && existsSync(join(GOC_KHO, guide));
		doi(coGuide, `host_embed.guide "${guide}" khong ton tai`);
		if (coGuide)
			doi(statSync(join(GOC_KHO, guide)).size > 0, `host_embed.guide "${guide}" rong`);
		doi(route2 !== null && existsSync(join(GOC_KHO, route2)), `host_embed.route "${route2}" khong ton tai`);

		const nguon = readFileSync(join(GOC_KHO, "apps/app/lib/proto-gate.ts"), "utf8");
		const layout = readFileSync(join(GOC_KHO, "apps/app/app/proto/layout.tsx"), "utf8");
		doi(
			!/process\.env\.[A-Z_]+/.test(layout),
			"layout.tsx chep lai ten co thay vi goi protoMoDuoc() — hai cho giu cung mot hang, va phep do chi doc proto-gate.ts nen doi ten se xanh gia",
		);
		const trongMa = nguon.match(/process\.env\.([A-Z_]+)/);
		doi(trongMa !== null, "khong rut duoc ten bien tu proto-gate.ts");
		if (trongMa !== null)
			doi(co === trongMa[1],
				`host_embed.dev_flag khai "${co}" nhung ma doc "${trongMa[1]}" — bang khai va ma nguon troi nhau`);
	}
}

if (chan === "slug" || chan === "tat-ca") {
	doi(PROTO_CATALOG.length >= 1, "san cung: catalog rong");

	const muc = PROTO_CATALOG.find((m) => m.slug === SLUG_HO_SO);
	doi(
		muc !== undefined,
		`slug ho so "${SLUG_HO_SO}" KHONG giai duoc thanh mot muc trong catalog (co: ${PROTO_CATALOG.map((m) => m.slug).join(", ") || "khong muc nao"}). design-pass dien {slug} bang slug HO SO, nen /proto/<slug-ho-so> se 404 va nghi thuc DUNG o preflight — dung cai vong nay dung ra de xoa.`,
	);

	const doc = readFileSync(join(GOC_KHO, "docs/proto.md"), "utf8");
	doi(
		doc.includes("slug hồ sơ") || doc.includes("slug ho so"),
		"docs/proto.md khong noi ra luat slug-so-phai-bang-slug-ho-so — luat khong viet ra thi nguoi sau khong theo duoc",
	);
}

if (chan === "nha-thu-ba" || chan === "tat-ca") {
	const turbo = JSON.parse(readFileSync(join(GOC_KHO, "turbo.json"), "utf8"));
	const cho = turbo.globalPassThroughEnv ?? [];
	doi(
		cho.includes("PROTO_ROUTE"),
		"PROTO_ROUTE KHONG co trong globalPassThroughEnv cua turbo.json — nha thu BA ma docs/environment.md goi la \"cai hay can\". Thieu no thi turbo (che do strict) loc bien khoi moi task, nen dung lenh mot dong khai o design_pass.dev_cmd van cho ra 404, im lang.",
	);

	const dp2 = dp.match(/^\s*dev_cmd:\s*(.+)$/m);
	doi(dp2 !== null, "khong doc duoc dev_cmd de kiem");
	if (dp2 !== null && /turbo/.test(dp2[1]))
		doi(
			cho.includes("PROTO_ROUTE"),
			"dev_cmd chay qua turbo nhung bien chua duoc cho di qua — lenh in ra cho nguoi se chet",
		);
}

if (chan === "bien" || chan === "tat-ca") {
	const env = readFileSync(join(GOC_KHO, ".env.example"), "utf8").split("\n");
	const i = env.findIndex((d) => d.includes("PROTO_ROUTE"));
	doi(i !== -1, ".env.example KHONG co PROTO_ROUTE");
	if (i > 0)
		doi(env[i - 1].trim().startsWith("#") && env[i - 1].trim().length > 3,
			"PROTO_ROUTE trong .env.example khong co dong chu giai ngay truoc no");

	const doc = join(GOC_KHO, "docs/proto.md");
	doi(existsSync(doc) && statSync(doc).size > 0, "docs/proto.md vang hoac rong");
	doi(readFileSync(join(GOC_KHO, "AGENTS.md"), "utf8").includes("docs/proto.md"),
		"bang chi muc cua AGENTS.md khong co dong tro toi docs/proto.md");

	const val = join(GOC_KHO, "apps/api/src/config/env.validation.ts");
	doi(!readFileSync(val, "utf8").includes("PROTO_ROUTE"),
		"PROTO_ROUTE bi khai trong env.validation.ts cua API — API khong doc bien nay");

	for (const goi of ["apps/app", "apps/api", "apps/agent", "packages/ui"])
		doi(!existsSync(join(GOC_KHO, goi, ".env")), `co .env theo goi o ${goi} — kho chi duoc mot .env o goc`);
}

if (loi.length === 0) {
	console.log(`OK khai-bao (${chan})`);
	process.exit(0);
}
for (const c of loi) console.error(`  - ${c}`);
thoat(1, `khai-bao (${chan}): ${loi.length} dieu khong dat`);
