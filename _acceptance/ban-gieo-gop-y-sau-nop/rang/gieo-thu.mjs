import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";
import { nopDeXuatVao } from "../../../apps/agent/agent/lib/okr/nop-de-xuat.ts";
import { db } from "../../../packages/db/src/index.ts";
import {
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP = resolve(
	GOC,
	process.env.BAN_GIEO ?? "_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs",
);
const DAU_HIEU = /^gieo-gop-y: xong/;
const XONG = TRO_LY_OKR.ketThuc.daNop;

const sai = [];
const viec = (id) =>
	db.agentTask.findUnique({
		where: { id },
		select: { id: true, finishedAt: true, outcome: true },
	});

async function ket(ma, cau) {
	if (cau) console.log(cau);
	await db.$disconnect().catch(() => {});
	process.exit(ma);
}

if (!existsSync(TEP)) await ket(2, `KHONG DO DUOC: khong co ban gieo ${TEP}`);
if (!laKhoDo())
	await ket(
		2,
		"KHONG DO DUOC: DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.k3b_gieo_thu",
	);
const ban = await import(pathToFileURL(TEP).href);
const nap = napBoMau();
if (nap.ma !== 0)
	await ket(
		2,
		`KHONG DO DUOC: okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`,
	);
const quanTri = phienCookie(thuMau(ban.SAN.nguoi.quanTri));
const truong = phienCookie(thuMau(ban.SAN.nguoi.truong));

const inGoc = console.log;
let soDauHieu = 0;
console.log = (...x) => {
	if (DAU_HIEU.test(String(x[0] ?? ""))) soDauHieu += 1;
	inGoc(...x);
};
let g;
try {
	g = await ban.gieoGopY({ api: process.env.API_URL, quanTri, truong });
} catch (e) {
	console.log = inGoc;
	await ket(1, e instanceof Error ? e.message : String(e));
}
console.log = inGoc;

try {
	const dongA = await db.okrDeXuat.findMany({
		where: { taskId: g.taskA },
		select: { trangThai: true },
	});
	const dongB = await db.okrDeXuat.count({ where: { taskId: g.taskB } });
	if (dongA.length !== 3 || dongA.some((d) => d.trangThai !== "cho"))
		sai.push(
			`A ${dongA.length} dong (${dongA.map((d) => d.trangThai).join(",")}), mong 3 cho`,
		);
	if (dongB !== 0) sai.push(`B ${dongB} dong, mong 0`);
	for (const id of [g.taskA, g.taskB]) {
		const h = await viec(id);
		if (!h || h.finishedAt === null || h.outcome !== XONG)
			sai.push(
				`viec ${id} khong dong bang ${XONG} (${h?.outcome ?? "chua dong"})`,
			);
	}
	if (soDauHieu !== 1) sai.push(`dau hieu gieo xong ${soDauHieu} lan, mong 1`);

	const kq = await nopDeXuatVao(
		{ dong: [] },
		ban.nguCanhCon(`${ban.SAN.tienToPhien}${g.taskA}`),
	);
	if (kq.ketQua !== "tu-choi")
		sai.push(`nop lai viec da dong tra ${kq.ketQua}, mong tu-choi`);
	let nem = null;
	try {
		ban.kiemNopXong(kq, await viec(g.taskA));
	} catch (e) {
		nem = e instanceof Error ? e.message : String(e);
	}
	if (nem === null) sai.push("tu-choi that khong bi chan");
	else if (!nem.includes("tu-choi")) sai.push(`tu-choi that nem sai: ${nem}`);
} catch (e) {
	await ket(
		1,
		`loi khi doc ket qua: ${e instanceof Error ? e.message : String(e)}`,
	);
}

if (sai.length) await ket(1, sai.join("\n"));
await ket(
	0,
	"gieo-thu: A 3 dong cho, B rong, 2 viec dong bang da-nop; tu-choi that bi chan",
);
