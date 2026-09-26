import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const RA = process.env.DO_RA;
const NGU_MS = Number(process.env.DO_NGU ?? 0) * 1000;
const MA_RA = Number(process.env.DO_MA ?? 0);
const NGUOI = process.env.NGUOI ?? PHIEN_DO.nguoi;

function tenKho(url) {
	try {
		return new URL(url).pathname.replace(/^\//, "");
	} catch {
		return null;
	}
}

function song(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

const ket = {
	batDau: Date.now(),
	khoDb: tenKho(process.env.DATABASE_URL ?? ""),
	appUrl: process.env.APP_URL ?? null,
	apiUrl: process.env.API_URL ?? null,
	phienDo: process.env.PHIEN_DO ?? null,
	pidCuSong: (process.env.DO_PID_CU ?? "")
		.split(",")
		.filter(Boolean)
		.map((pid) => ({ pid: Number(pid), song: song(Number(pid)) })),
};

try {
	const { canhCay } = await import(
		join(GOC, "_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs")
	);
	ket.canh = (await canhCay()).ket;
} catch (loi) {
	ket.canh = `loi: ${loi.message}`;
}

try {
	ket.health = (
		await fetch(`${ket.apiUrl}/health`, { signal: AbortSignal.timeout(5000) })
	).status;
} catch (loi) {
	ket.health = `loi: ${loi.message}`;
}

try {
	const { db } = await import(join(GOC, "packages/db/src/client.ts"));
	const { readContextDevKey } = await import(
		join(GOC, "packages/db/src/settings.ts")
	);
	const { isOnboarded, WORKSPACE_ID } = await import(
		join(GOC, "packages/db/src/workspace.ts")
	);
	ket.nguoiCo = (await db.user.count({ where: { email: NGUOI } })) === 1;
	const ws = await db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { metadata: true },
	});
	ket.onboarded = ws ? isOnboarded(ws.metadata) : false;
	ket.khoaNghienCuu = await readContextDevKey(db);
	const dau = await db.$queryRaw`SELECT s.description FROM pg_database d
		LEFT JOIN pg_shdescription s ON s.objoid = d.oid
		WHERE d.datname = current_database()`;
	const { parseMeasureComment } = await import(
		join(GOC, "packages/db/src/measure-database.ts")
	);
	ket.khoTaoLuc = parseMeasureComment(dau[0]?.description)?.createdAt ?? null;
	await db.$disconnect();
} catch (loi) {
	ket.loiKho = loi.message;
}

if (RA) writeFileSync(RA, `${JSON.stringify(ket, null, 2)}\n`);
if (NGU_MS > 0) await new Promise((xong) => setTimeout(xong, NGU_MS));
ket.ketThuc = Date.now();
if (RA) writeFileSync(RA, `${JSON.stringify(ket, null, 2)}\n`);
process.exit(MA_RA);
