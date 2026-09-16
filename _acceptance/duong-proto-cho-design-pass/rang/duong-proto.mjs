import { createHash } from "node:crypto";
import { PROTO_CATALOG } from "../../../apps/app/app/proto/catalog.ts";
import { ma, moMayChu, SLUG_HO_SO, than, thoat } from "./may-chu.mjs";

const chan = process.argv[2];
if (chan === undefined) thoat(2, "thieu ten chan");

const CHAN_HET = [
	"co-bat",
	"co-tat",
	"state-chon-duoc",
	"state-la",
	"slug-la",
	"muc-luc",
];

const MAU = PROTO_CATALOG.find((m) => m.slug === SLUG_HO_SO);
if (PROTO_CATALOG.length < 1) thoat(2, "san cung: catalog rong — khong do gi duoc");
if (MAU === undefined)
	thoat(
		2,
		`san cung: slug ho so "${SLUG_HO_SO}" khong giai duoc thanh mot muc trong catalog (co: ${PROTO_CATALOG.map((m) => m.slug).join(", ")}). design-pass dien {slug} bang slug HO SO, nen hai ten phai trung.`,
	);
if (MAU.states.length !== 5)
	thoat(2, `san cung: duong-proto khai ${MAU.states.length} state, cho 5`);

const loi = [];
function doi(dieu, cau) {
	if (!dieu) loi.push(cau);
}

function bam(s) {
	return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

const NEO_PROTO = '<div data-proto-body="true">';

function vungProto(html) {
	const dau = html.indexOf(NEO_PROTO);
	if (dau === -1) return null;

	const cuoi = html.indexOf("</main>", dau);
	return html.slice(dau, cuoi === -1 ? undefined : cuoi);
}

function ket() {
	if (loi.length === 0) {
		console.log(`OK ${chan}`);
		process.exit(0);
	}
	for (const c of loi) console.error(`  - ${c}`);
	thoat(1, `chan ${chan}: ${loi.length} dieu khong dat`);
}

if (chan === "tat-ca") {
	const { spawnSync } = await import("node:child_process");
	const toi = new URL(import.meta.url).pathname;
	const hong = [];

	for (const c of CHAN_HET) {
		console.log(`\n--- chan ${c} ---`);
		const ra = spawnSync("bun", [toi, c], { stdio: "inherit" });
		if (ra.status !== 0) hong.push(`${c} (ma ${ra.status})`);
	}

	if (hong.length === 0) {
		console.log(`\nOK tat-ca: ${CHAN_HET.length}/${CHAN_HET.length} chan dat`);
		process.exit(0);
	}

	console.error(`\nchan hong: ${hong.join(", ")}`);
	thoat(1, `tat-ca: ${hong.length}/${CHAN_HET.length} chan khong dat`);
}

if (chan === "co-bat") {
	const s = await moMayChu({ co: "1" });
	const t = await than(s.goc, `/proto/${SLUG_HO_SO}`);
	doi((await ma(s.goc, `/proto/${SLUG_HO_SO}`)) === 200, `/proto/${SLUG_HO_SO} khong tra 200`);
	for (const st of MAU.states)
		doi(t.includes(st.nhan), `than trang thieu ten state "${st.nhan}" tren thanh chuyen`);
	const vung = vungProto(t);
	if (vung === null) {
		doi(false, "khong thay vung data-proto-body — khong do duoc than proto");
	} else {
		const slot = [...vung.matchAll(/data-slot="([a-z-]+)"/g)].map((m) => m[1]);
		doi(slot.length > 0, "than PROTO khong co component nao cua @crm/ui (0 data-slot trong vung)");
		doi(slot.includes("card"), `than proto thieu Card — data-slot thay duoc: ${[...new Set(slot)].join(", ") || "khong co"}`);
	}

	const thanh = t.slice(0, t.indexOf(NEO_PROTO) === -1 ? undefined : t.indexOf(NEO_PROTO));
	doi(/data-slot="button"/.test(thanh), "thanh chuyen state khong dung Button cua @crm/ui");
	s.dong();
	ket();
}

if (chan === "co-tat") {
	const BANG = [
		{ co: undefined, ten: "khong-dat", mo: false },
		{ co: "", ten: '""', mo: false },
		{ co: "0", ten: '"0"', mo: false },
		{ co: "false", ten: '"false"', mo: false },
		{ co: "true", ten: '"true"', mo: false },
		{ co: "1", ten: '"1"', mo: true },
	];
	for (const o of BANG) {
		const s = await moMayChu({ co: o.co });
		for (const d of ["/proto", `/proto/${SLUG_HO_SO}`]) {
			const m = await ma(s.goc, d);
			if (o.mo) doi(m === 200, `co ${o.ten}: ${d} tra ${m}, cho 200`);
			else if (m === 307)
				doi(false, `co ${o.ten}: ${d} tra 307 — proxy da chan, chua chung duoc co chan`);
			else doi(m === 404, `co ${o.ten}: ${d} tra ${m}, cho 404 — gia tri nay lam lot`);
		}
		s.dong();
	}
	ket();
}

if (chan === "state-chon-duoc") {
	const s = await moMayChu({ co: "1" });
	const bams = new Map();
	for (const st of MAU.states) {
		const d = `/proto/${SLUG_HO_SO}?state=${st.id}`;
		doi((await ma(s.goc, d)) === 200, `${d} khong tra 200`);
		const v = vungProto(await than(s.goc, d));
		if (v === null) {
			doi(false, `${d}: khong thay vung data-proto-body de bam`);
			continue;
		}
		const b = bam(v);
		const trung = [...bams.entries()].find(([, v]) => v === b);
		if (trung !== undefined)
			doi(false, `state "${st.id}" va "${trung[0]}" cho CUNG mot ban bam vung proto — tham so state khong toi noi render`);
		bams.set(st.id, b);
	}
	const t = await than(s.goc, `/proto/${SLUG_HO_SO}?state=${MAU.states[1].id}`);
	doi(t.includes('aria-current="page"'), "state dang bat khong mang aria-current");
	s.dong();
	ket();
}

if (chan === "state-la") {
	const s = await moMayChu({ co: "1" });
	const m = await ma(s.goc, `/proto/${SLUG_HO_SO}?state=khong-ton-tai`);
	doi(m === 404, `state la tra ${m}, cho 404 — state la da roi ve mac dinh`);
	s.dong();
	ket();
}

if (chan === "slug-la") {
	const s = await moMayChu({ co: "1" });
	const m = await ma(s.goc, "/proto/khong-ton-tai");
	doi(m === 404, `slug la tra ${m}, cho 404`);
	s.dong();
	ket();
}

if (chan === "muc-luc") {
	const s = await moMayChu({ co: "1" });
	const t = await than(s.goc, "/proto");
	const hien = [...t.matchAll(/data-proto-slug="([^"]+)"/g)].map((x) => x[1]);
	const trongSo = PROTO_CATALOG.map((m) => m.slug);

	for (const x of trongSo) doi(hien.includes(x), `muc luc SOT slug "${x}"`);
	for (const x of hien) doi(trongSo.includes(x), `muc luc THUA slug "${x}"`);

	for (const muc of PROTO_CATALOG) {
		const khop = t.match(
			new RegExp(`data-proto-slug="${muc.slug}"\\s+data-proto-states="(\\d+)"`),
		);
		if (khop === null) {
			doi(false, `dong cua "${muc.slug}" khong khai so state tren DOM`);
			continue;
		}
		doi(Number(khop[1]) === muc.states.length,
			`dong cua "${muc.slug}" khai ${khop[1]} state, so dang ky co ${muc.states.length}`);
	}

	const hrefs = [...t.matchAll(/href="(\/proto\/[^"]+)"/g)].map((x) => x[1]);
	doi(hrefs.length >= trongSo.length, `chi rut duoc ${hrefs.length} href, cho >= ${trongSo.length}`);
	for (const h of hrefs) {
		const m = await ma(s.goc, h);
		doi(m === 200, `href "${h}" tren muc luc tra ${m}, cho 200`);
		const slug = h.split("/").pop();
		const muc = PROTO_CATALOG.find((x) => x.slug === slug);
		doi(muc !== undefined, `href "${h}" tro toi slug khong co trong so`);
		if (muc !== undefined)
			doi((await than(s.goc, h)).includes(muc.ten), `href "${h}" mo ra trang khong mang ten "${muc.ten}"`);
	}
	s.dong();
	ket();
}

thoat(2, `chan la: ${chan}`);
