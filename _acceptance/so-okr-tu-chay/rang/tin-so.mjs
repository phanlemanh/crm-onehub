import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const THU_MUC = dirname(TEP_NAY);
const GOC = join(THU_MUC, "..", "..", "..");
const TEP_SQL = join(THU_MUC, "dem-doc-lap.sql");
const TEP_LECH = join(THU_MUC, "lech-khai-truoc.md");
const TEP_DEM = join(GOC, "packages/db/src/okr-chi-so.ts");
const TEP_DANH_MUC = [
	TEP_DEM,
	join(GOC, "packages/db/src/okr-chi-so-danh-muc.ts"),
	join(GOC, "packages/validation/src/okr-chi-so.ts"),
];
const CHI_SO = [
	{ ma: "thoa-thuan-chot-duoc", cot: "chot" },
	{ ma: "thoa-thuan-moi", cot: "moi" },
	{ ma: "goi-hen-duoc", cot: "hen" },
	{ ma: "buoc-xong-dung-han", cot: "buoc" },
	{ ma: "email-gui-ra", cot: "thu" },
];
const PHAM_VI = { kieu: "toan-cong-ty" };
const NGAY = /^\d{4}-\d{2}-\d{2}$/;

function thoat(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};
const san = process.argv.includes("--san");
const chieuDo = process.argv.includes("--chieu-do");

async function tuKiemSql(sql) {
	const { MA_CHI_SO } = await import(
		join(GOC, "packages/validation/src/okr-chi-so.ts")
	);
	const ten = new Set([...MA_CHI_SO, "okr-chi-so"]);
	for (const tep of TEP_DANH_MUC)
		for (const m of readFileSync(tep, "utf8").matchAll(
			/export\s+(?:async\s+)?(?:function|const|type|class)\s+(\w+)/g,
		))
			ten.add(m[1]);
	const thap = sql.toLowerCase();
	const gap = [...ten].filter((t) => thap.includes(t.toLowerCase()));
	console.log(
		`tu kiem dem-doc-lap.sql: soi ${ten.size} ten cua danh muc (ma chi so, ham, hang so) — ${gap.length === 0 ? "khong ten nao" : `GAP ${gap.join(", ")}`}`,
	);
	if (gap.length > 0)
		thoat(1, `dem-doc-lap.sql không độc lập: nhắc ${gap.join(", ")}`);
}

function docLech() {
	const bang = new Map();
	for (const dong of readFileSync(TEP_LECH, "utf8").split("\n")) {
		const o = dong.split("|").map((x) => x.trim());
		const ma = o[1]?.replace(/`/g, "");
		if (!CHI_SO.some((c) => c.ma === ma)) continue;
		bang.set(ma, { gieo: o[2], production: o[3] });
	}
	for (const c of CHI_SO)
		if (!bang.has(c.ma))
			thoat(2, `KHONG DO DUOC: lech-khai-truoc.md thiếu dòng ${c.ma}`);
	return bang;
}

function tran(o, docLap) {
	const m = /^(\d+)(%?)$/.exec(o ?? "");
	if (!m)
		thoat(2, `KHONG DO DUOC: ô lệch khai trước «${o}» không phải n hay n%`);
	return m[2] === "%" ? Math.ceil((Number(m[1]) * docLap) / 100) : Number(m[1]);
}

async function banSaoDem() {
	const thu = mkdtempSync(join(tmpdir(), "tin-so-do-"));
	const goc = readFileSync(TEP_DEM, "utf8");
	const hong = goc
		.replace(
			/stage: "CLOSED_WON",/,
			'stage: { in: ["CLOSED_WON", "CLOSED_LOST"] },',
		)
		.replace(
			/from "\.\/([^"]+)"/g,
			(_, p) => `from "${join(GOC, "packages/db/src", p)}"`,
		);
	if (!hong.includes('"CLOSED_LOST"'))
		thoat(
			2,
			"KHONG DO DUOC: không tìm thấy điều kiện CLOSED_WON trong okr-chi-so.ts để chép hỏng",
		);
	const tep = join(thu, "okr-chi-so-hong.ts");
	writeFileSync(tep, hong);
	const mod = await import(tep);
	return { mod, don: () => rmSync(thu, { recursive: true, force: true }) };
}

const sql = readFileSync(TEP_SQL, "utf8");
await tuKiemSql(sql);
const lech = docLech();

const { isMeasureDatabase } = await import(
	join(GOC, "packages/db/src/measure-database.ts")
);
const { HAU_TO, tenDb } = await import(
	join(GOC, "scripts/lan-do/kho-nhap.mjs")
);
const kho = tenDb(process.env.DATABASE_URL ?? "");
const khoDo = kho !== null && (isMeasureDatabase(kho) || kho.endsWith(HAU_TO));
console.log(
	`kho: ${kho ?? "?"} (${khoDo ? "kho đo dùng-một-lần" : "không phải kho đo — chỉ đọc"})`,
);
if (san && !khoDo)
	thoat(
		2,
		`KHONG DO DUOC: --san chỉ gieo vào kho đo, "${kho}" không phải — chạy qua scripts/lan-do/tien-de.mjs`,
	);

const { db } = await import(join(GOC, "packages/db/src/client.ts"));
const { khoangKy, demChiSo } = await import(TEP_DEM);

const boGieo = san
	? await import(join(GOC, "apps/api/test/okr-so-san.ts"))
	: null;
const kySan = boGieo
	? `${boGieo.KY.startsOn.toISOString().slice(0, 10)}..${boGieo.KY.endsOn.toISOString().slice(0, 10)}`
	: null;
const [tu, den] = (doiSo("--ky") ?? kySan ?? "").split("..");
if (!NGAY.test(tu ?? "") || !NGAY.test(den ?? "") || tu > den)
	thoat(
		2,
		'KHONG DO DUOC: cần --ky "YYYY-MM-DD..YYYY-MM-DD" (hoặc --san để lấy kỳ của bộ gieo)',
	);

const hong = chieuDo ? await banSaoDem() : null;
let gieo = null;
try {
	if (boGieo) {
		gieo = await boGieo.gieoSanChiSo();
		console.log("da gieo bo E3 (apps/api/test/okr-so-san.ts) vao kho do");
	}
	console.log(
		`ky: ${tu} → ${den} (giờ Việt Nam, cả hai đầu), phạm vi toàn công ty`,
	);

	if (hong)
		console.log(
			"chieu do: dem may bang ban sao okr-chi-so.ts dem ca CLOSED_LOST",
		);
	const dem = hong ? hong.mod.demChiSo : demChiSo;
	const k = khoangKy(
		new Date(`${tu}T00:00:00Z`),
		new Date(`${den}T00:00:00Z`),
		den,
	);
	const may = {};
	for (const c of CHI_SO)
		may[c.ma] = await dem(db, { chiSo: c.ma, phamVi: PHAM_VI }, k);

	const [docLap] = await db.$transaction(async (tx) => {
		await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
		await tx.$executeRawUnsafe(`SELECT set_config('okr.tu', $1, true)`, tu);
		await tx.$executeRawUnsafe(`SELECT set_config('okr.den', $1, true)`, den);
		return tx.$queryRawUnsafe(sql);
	});

	const cot = san ? "gieo" : "production";
	const rong = [22, 7, 14, 5, 16];
	const hang = (o) =>
		o.map((x, i) => String(x).padEnd(rong[i] ?? 0)).join(" | ");
	const tieuDe = [
		"chi so",
		"so may",
		"so dem doc lap",
		"lech",
		`lech khai truoc (${cot})`,
	];
	console.log(hang(san ? tieuDe : [...tieuDe, "so dem tay"]));
	const vuot = [];
	for (const c of CHI_SO) {
		const d = Number(docLap[c.cot]);
		const m = may[c.ma];
		const l = Math.abs(m - d);
		const o = lech.get(c.ma)[cot];
		const t = tran(o, d);
		console.log(
			hang(
				san
					? [c.ma, m, d, l, `${o} (≤ ${t})`]
					: [c.ma, m, d, l, `${o} (≤ ${t})`, ""],
			),
		);
		if (l > t)
			vuot.push(`${c.ma}: số máy ${m}, số đếm độc lập ${d}, lệch ${l} > ${t}`);
	}
	for (const v of vuot) console.log(`LECH ${v}`);
	if (chieuDo) {
		const bat = vuot.some((v) => v.startsWith("thoa-thuan-chot-duoc:"));
		console.log(
			`chieu do: dong thoa-thuan-chot-duoc ${bat ? "bi bat" : "LOT — ban sao hong khong lam lech"}`,
		);
	}
	process.exitCode = vuot.length === 0 ? 0 : 1;
} finally {
	hong?.don();
	if (gieo) {
		await gieo.don();
		console.log("da don bo gieo");
	}
	await db.$disconnect();
}
