import { spawnSync } from "node:child_process";
import {
	markMeasureDatabase,
	markTemplate,
	sweepMeasureDatabases,
} from "../../../packages/db/scripts/measure-db.ts";
import {
	dropDatabase,
	withMaintenance,
} from "../../../packages/db/scripts/test-db-admin.ts";
import { MEASURE_DATABASE } from "../../../packages/db/src/measure-database.ts";
import {
	coKho,
	GOC,
	ketThuc,
	khang,
	khongDo,
	MA,
	mayChu,
	thoatKhongDo,
} from "./kho-gia.mjs";

const PHUT_MS = 60_000;
const LENH =
	'bun run test -- "cd packages/db && bun test test/measure-database.spec.ts -t quet-mo-coi"';
const goc = `crm_ngoai${MA}`;
const khoDo = `${goc}_do`;
const khoMau = `${goc}__mau_do`;

async function dung() {
	const bay = Date.now();
	await withMaintenance(mayChu(), async (k) => {
		for (const ten of [khoDo, khoMau]) {
			await dropDatabase(k, ten);
			await k.query(`CREATE DATABASE "${ten}"`);
		}
		await markMeasureDatabase(k, khoDo, bay);
		await markTemplate(k, khoMau, "ngoai", bay, bay);
	});
}

async function don() {
	await withMaintenance(mayChu(), async (k) => {
		for (const ten of [khoDo, khoMau]) await dropDatabase(k, ten);
	});
}

try {
	await dung();
	if (!(await coKho(khoDo)) || !(await coKho(khoMau)))
		khongDo("khong dung duoc hai kho cua cay khac");

	const ra = spawnSync("bash", ["-c", LENH], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	const duoi = `${ra.stdout ?? ""}${ra.stderr ?? ""}`
		.trim()
		.split("\n")
		.slice(-4)
		.join("\n    ");
	console.log(`  ca quet-mo-coi: ma ${ra.status}\n    ${duoi}`);
	khang(
		ra.status === 0,
		"ca quet-mo-coi cua bo kiem chay xanh",
		`ma ${ra.status}`,
	);
	khang(await coKho(khoDo), "bo kiem xoa mat kho do cua cay khac", khoDo);
	khang(await coKho(khoMau), "bo kiem xoa mat kho mau cua cay khac", khoMau);

	const tuongLai = Date.now() + 2 * MEASURE_DATABASE.maxAgeMs + PHUT_MS;
	const bi = await withMaintenance(mayChu(), (k) =>
		sweepMeasureDatabases(k, tuongLai, goc),
	);
	khang(
		bi.length === 2 && bi.includes(khoDo) && bi.includes(khoMau),
		"doi chung: luot quet voi dong ho tuong lai xoa duoc dung hai kho nay (vat do de ton thuong that)",
		bi.join(", "),
	);
} catch (loi) {
	await don();
	thoatKhongDo(loi);
}
await don();
ketThuc("khong-dung-kho-khac");
