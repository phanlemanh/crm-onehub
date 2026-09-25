import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
	banSaoCuaSha,
	CHO_CHAY,
	chayBunTest,
	dbCuaLuot,
	dungBanSao,
	giuKhoa,
	hong,
	loiGoiTest,
	SPEC,
} from "./chung.mjs";

const TRAN_MS = 1250;
const SO_LUOT_MAC_DINH = 10;
const CA = "khoa-con-bat";

function thamSo(ten) {
	const i = process.argv.indexOf(ten);
	return i === -1 ? undefined : process.argv[i + 1];
}

function tienTrinhBunTestKhac() {
	const ra = spawnSync("ps", ["-Ao", "pid=,command="], {
		encoding: "utf8",
	}).stdout;
	return ra
		.split("\n")
		.filter(
			(d) => /\bbun\b.*\btest\b/.test(d) && !d.includes("do-thoi-gian.mjs"),
		)
		.filter((d) => !d.trim().startsWith(`${process.pid} `)).length;
}

function docJunit(xml) {
	const cacCa = [
		...xml.matchAll(
			/<testcase\b[^>]*\bname="([^"]*)"[^>]*\btime="([0-9.]+)"[^>]*?(\/>|>)/g,
		),
	].map((m) => ({
		ten: m[1].split(":")[0],
		ms: Number(m[2]) * 1000,
	}));
	return { cacCa, soHong: (xml.match(/<failure\b/g) ?? []).length };
}

const sha = thamSo("--ban-sha");
const soLuot = Number(thamSo("--luot") ?? SO_LUOT_MAC_DINH);
if (!Number.isInteger(soLuot) || soLuot < 1)
	hong(2, "--luot phai la so nguyen duong");
dbCuaLuot();
await giuKhoa();

const noiDung = sha ? banSaoCuaSha(sha) : readFileSync(SPEC, "utf8");
const tep = sha ? dungBanSao(noiDung, `sha-${sha}`) : SPEC;
const soCaKyVong = loiGoiTest(noiDung).length;
console.log(
	`tep do: ${sha ? `ban ${sha} (ban sao)` : "apps/api/test/go-la-cat-quyen.spec.ts"} · ${soCaKyVong} ca · tran ${TRAN_MS}ms · ${soLuot} luot`,
);

const thuMucJunit = join(CHO_CHAY, `junit-${process.pid}`);
mkdirSync(thuMucJunit, { recursive: true });
process.on("exit", () => rmSync(thuMucJunit, { recursive: true, force: true }));

const loi = [];
const cacSeed = [];
for (let n = 1; n <= soLuot; n += 1) {
	const khac = tienTrinhBunTestKhac();
	const junit = join(thuMucJunit, `r${n}.xml`);
	const { ma, ra } = await chayBunTest(tep, [
		"--randomize",
		"--reporter=junit",
		`--reporter-outfile=${junit}`,
	]);
	const seed = ra.match(/--seed=(\d+)/)?.[1] ?? null;
	cacSeed.push(seed);
	let xml = "";
	try {
		xml = readFileSync(junit, "utf8");
	} catch {
		loi.push(`luot ${n}: khong co junit`);
	}
	const { cacCa, soHong } = docJunit(xml);
	const caDo = cacCa.filter((c) => c.ten === CA);
	const ms = caDo.length === 1 ? Math.round(caDo[0].ms) : null;
	console.log(
		`luot ${n}: seed ${seed ?? "?"} · ma ${ma} · ${cacCa.length} ca · ${soHong} do · ${CA} ${ms ?? "?"}ms · ${khac} tien trinh bun test khac`,
	);
	if (ma !== 0) loi.push(`luot ${n}: ma thoat ${ma}`);
	if (cacCa.length !== soCaKyVong)
		loi.push(`luot ${n}: junit co ${cacCa.length} ca, ky vong ${soCaKyVong}`);
	if (soHong !== 0) loi.push(`luot ${n}: ${soHong} ca do`);
	if (caDo.length !== 1) loi.push(`luot ${n}: ${CA} co mat ${caDo.length} lan`);
	else if (ms > TRAN_MS)
		loi.push(`${CA} vuot ${TRAN_MS}ms o luot ${n}: ${ms}ms`);
	if (ma !== 0 && soHong === 0) console.log(ra.slice(-2000));
}

const seedKhac = new Set(cacSeed.filter(Boolean));
if (seedKhac.size !== soLuot)
	loi.push(
		`${seedKhac.size}/${soLuot} seed doi mot khac nhau (${cacSeed.join(", ")})`,
	);
else console.log(`OK ${soLuot} seed doi mot khac nhau`);

for (const l of loi) console.log(`HONG ${l}`);
console.log(
	`do-thoi-gian: ${loi.length ? `${loi.length} hong` : `${soLuot}/${soLuot} luot dat`}`,
);
process.exit(loi.length ? 1 : 0);
