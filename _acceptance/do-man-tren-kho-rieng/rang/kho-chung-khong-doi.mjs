import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { dropMeasureDatabase } from "../../../packages/db/scripts/measure-db.ts";
import {
	measureDatabaseName,
	templateDatabaseName,
} from "../../../packages/db/src/measure-database.ts";
import {
	databaseUrlCua,
	dungKhoGia,
	GOC,
	ketThuc,
	khang,
	khongDo,
	lech,
	MA,
	mayChu,
	truyVan,
	vanTay,
	xoaKhoGia,
} from "./kho-gia.mjs";

const cfg = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
const dong = /^ {4}dok_man_chrome: '((?:[^']|'')*)'\s*$/m.exec(cfg);
if (!dong)
	khongDo(
		"khong tim thay executors.test.dok_man_chrome trong _acceptance/config.yaml",
	);
const LENH = dong[1].replaceAll("''", "'");
const CAY = `dmk-okr-${MA}`;
console.log(`lenh dok_man_chrome: ${LENH}`);

function chayLenh(url) {
	const env = { ...process.env, DATABASE_URL: url, PHIEN_DO_TEN_CAY: CAY };
	for (const k of ["PHIEN_DO", "APP_URL", "API_URL"]) delete env[k];
	const ra = spawnSync("bash", ["-c", LENH], {
		cwd: GOC,
		env,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	const ket = `${ra.stdout ?? ""}${ra.stderr ?? ""}`;
	return {
		ma: ra.status ?? 2,
		duoi: ket.trim().split("\n").slice(-6).join("\n    "),
	};
}

async function mot(ten, url, chiIn) {
	const truoc = await vanTay(url);
	const ra = chayLenh(url);
	const sau = await vanTay(url);
	const doi = lech(truoc, sau);
	console.log(`  [${ten}] ma ${ra.ma}\n    ${ra.duoi}`);
	if (chiIn) {
		console.log(
			`  [${ten}] chi in: dau van tay ${doi.length === 0 ? "khong doi" : `lech ${doi.join(", ")}`}`,
		);
		return;
	}
	khang(
		ra.ma === 0,
		`[${ten}] dok_man_chrome khong xanh tren kho chung co du lieu la`,
		`ma ${ra.ma}`,
	);
	khang(doi.length === 0, `[${ten}] dau van tay kho chung doi`, doi.join(", "));
}

const gia = await dungKhoGia("okr");
try {
	await mot("kho chung gia", gia.url, false);

	const that = databaseUrlCua(new URL(mayChu()).pathname.replace(/^\//, ""));
	const chuKy = await truyVan(
		that,
		`SELECT count(*)::int AS n FROM "okrCycle"`,
	);
	if ((chuKy[0]?.n ?? 0) === 0) {
		console.log("  kho crm that khong co chu ky la, bo ca (ii)");
	} else {
		const khac = await truyVan(
			that,
			"SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()",
		);
		const coNguoi = (khac[0]?.n ?? 0) > 0;
		if (coNguoi)
			console.log(
				`  kho crm that co ${khac[0].n} ket noi khac — ca (ii) chi in`,
			);
		await mot(`kho crm that (${chuKy[0].n} chu ky la)`, that, coNguoi);
	}
} finally {
	await xoaKhoGia(gia.ten);
	for (const ten of [measureDatabaseName(CAY), templateDatabaseName(CAY)]) {
		await dropMeasureDatabase(mayChu(), ten).catch(() => {});
	}
}
ketThuc("kho-chung-khong-doi");
