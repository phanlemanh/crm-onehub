import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 6;
const TRAN_MS = 600_000;
const TASKS = "apps/agent/test/tasks.integration.spec.ts";
const GIEO = "apps/agent-okr/test/support/gieo.ts";
const GOI = "apps/agent-okr/agent/lib/goi-soan.ts";
const KHOI_TASKS = `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tasks.integration.spec.ts -t 'a limited lock subquery'"`;
const GOI_DONG_HO = `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test --preload ../../_acceptance/ca-chap-chon-con-lai/rang/dong-ho-26.ts test/goi-soan.integration.spec.ts -t goiKiemTu"`;
const ID_TRONG_GOI = `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/goi-soan.integration.spec.ts -t id-trong-goi"`;
const ANALYZE = '\t\tawait db.$executeRaw`ANALYZE "agentTask"`;\n';
const TRUONG_THONG_KE = [
	"reltuples=",
	"relpages=",
	"so_trang=",
	"n_dead_tup=",
	"last_analyze=",
	"last_autoanalyze=",
];
const CA_FROM =
	'\tit("the fixture bites: a subquery joined in FROM hands out every row", async () => {\n\t\tawait staleStatistics(MAX_ATTEMPTS);\n';
const CA_DUE =
	'\tit("the fixture bites for due work too", async () => {\n\t\tawait staleStatistics(0);\n';

const BANG = [
	{
		ten: "a analyze-truoc-probe-from",
		lenh: KHOI_TASKS,
		tep: TASKS,
		cu: CA_FROM,
		moi: `${CA_FROM}${ANALYZE}`,
		ghim: "ke hoach doi",
		duTruong: true,
	},
	{
		ten: "b analyze-sau-stale-due",
		lenh: KHOI_TASKS,
		tep: TASKS,
		cu: CA_DUE,
		moi: `${CA_DUE}${ANALYZE}`,
		ghim: "ke hoach doi",
	},
	{
		ten: "c bo-tat-autovacuum",
		lenh: KHOI_TASKS,
		tep: TASKS,
		cu: '\tawait db.$executeRawUnsafe(`ALTER TABLE "agentTask" SET (${AUTOVACUUM_OFF})`);\n',
		moi: "",
		ghim: "autovacuum van bat trong khoi",
	},
	{
		ten: "d bo-tra-autovacuum",
		lenh: KHOI_TASKS,
		tep: TASKS,
		cu: "\t\tawait autovacuumRestore(reloptionsBefore);\n",
		moi: "",
		ghim: "autovacuum khong duoc tra lai",
	},
	{
		ten: "e ma-cong-thuc-cu",
		lenh: GOI_DONG_HO,
		tep: GIEO,
		cu: "export const ma = () => `${TIEN_TO}${chuCai(Date.now())}x${chuCai(++dem)}`;",
		moi: "export const ma = () => `${TIEN_TO}${Date.now().toString(36)}x${++dem}`;",
		ghim: "so cap nhat tuan khong in lot",
	},
	{
		ten: "f id-cua-goi-rong",
		lenh: ID_TRONG_GOI,
		tep: GOI,
		cu: "function idCuaGoi(goi: GoiSoan): string[] {\n\treturn [\n\t\t...goi.lop2a.capTren.flatMap((m) => [m.id, ...m.kr.map((k) => k.id)]),\n\t\t...goi.lop2a.ungVienCanChinh.map((u) => u.id),\n\t];\n}",
		moi: "function idCuaGoi(_goi: GoiSoan): string[] {\n\treturn [];\n}",
		ghim: "id trong goi bi trich so: 26",
	},
];

function chay(cwd, lenh) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const dongLoi = (ra, ghim) =>
	ra
		.split("\n")
		.find((d) => /^(error|[A-Za-z]*Error):/.test(d) && d.includes(ghim));

const banSao = dungBanSao("ccl-dot-bien");
let daChay = 0;
const hong = [];
try {
	for (const cap of BANG) {
		daChay += 1;
		const truoc = chay(banSao, cap.lenh);
		const traLai = thayMotLan(banSao, cap.tep, cap.cu, cap.moi);
		let sau;
		try {
			sau = chay(banSao, cap.lenh);
		} finally {
			traLai();
		}
		const dong = dongLoi(sau.ra, cap.ghim);
		const thieu = cap.duTruong
			? TRUONG_THONG_KE.filter((t) => !dong?.includes(t))
			: [];
		const dat = truoc.ma === 0 && sau.ma !== 0 && dong && thieu.length === 0;
		console.log(
			`${cap.ten} xanh=${truoc.ma} do=${sau.ma} ghim=${dong ? "ok" : "thieu"}${thieu.length ? ` thieu-truong=${thieu.join(",")}` : ""}`,
		);
		if (!dat)
			hong.push(
				`${cap.ten}\n--- truoc\n${truoc.ra.slice(-1500)}\n--- sau\n${sau.ra.slice(-1500)}`,
			);
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);
for (const h of hong) console.error(h);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(`DOT BIEN: ${SO_CAP_KHAI - hong.length}/${SO_CAP_KHAI} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
