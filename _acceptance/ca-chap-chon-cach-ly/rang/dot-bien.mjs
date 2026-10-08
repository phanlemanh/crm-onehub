import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { dungBanSao, goBanSao, KhongDo, thayMotLan } from "./ban-sao.mjs";

const SO_CAP_KHAI = 10;
const TRAN_LENH_MS = 600_000;
const KHOI_DONG = "apps/agent-okr/test/support/khoi-dong.ts";
const SAN = "apps/api/test/tai-lieu-san.ts";
const KHONG_RO = "apps/api/test/tai-lieu-khong-ro.spec.ts";
const THAY_TRANG = "apps/api/test/tai-lieu-thay-trang.spec.ts";
const NGU = "\tawait Bun.sleep(6000);\n";
const DON_VI = (t) => `cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t ${t}`;
const API = (spec) => `bun run test -- "cd apps/api && bun test test/${spec}"`;

const CAP = [
	{
		ten: "a mo-coi",
		lenh: DON_VI("mo-coi"),
		pha: [[KHOI_DONG, "\t\t\t\tawait dungMoCoi(khoa);\n", ""]],
		ghim: "mo coi con song",
	},
	{
		ten: "b ngoai-khoa",
		lenh: DON_VI("ngoai-khoa"),
		pha: [
			[
				KHOI_DONG,
				'docPs(c.pid, "lstart=") === c.batDau &&\n\t\t(docPs(c.pid, "command=") ?? "").includes(KHOI_DONG.moCoi.dau)',
				'docPs(c.pid, "lstart=") === c.batDau',
			],
		],
		ghim: "dung nham tien trinh khong phai eve",
	},
	{
		ten: "c cho-route 503",
		lenh: DON_VI("cho-route"),
		pha: [[KHOI_DONG, "if (r.status !== 503) return r.status;", "return r.status;"]],
		ghim: "tra may khi route con 503",
	},
	{
		ten: "c' cho-route tu choi",
		lenh: DON_VI("cho-route"),
		pha: [[KHOI_DONG, '\t\t\tcuoi = "khong ket noi";\n', '\t\t\tthrow new Error("tu choi");\n']],
		ghim: "bo cuoc khi bi tu choi",
	},
	{
		ten: "d1 hook dungSan",
		lenh: API("tai-lieu-khong-ro.spec.ts"),
		lanh: [[SAN, '\t\tconst { AppModule } = await import("../src/app.module");', `\t${NGU}\t\tconst { AppModule } = await import("../src/app.module");`]],
		pha: [[SAN, "\t}, TAI_LIEU_SAN.hookMs);", "\t});"]],
		ghim: "timed out",
	},
	{
		ten: "d2 hook khong-ro",
		lenh: API("tai-lieu-khong-ro.spec.ts"),
		lanh: [[KHONG_RO, "beforeAll(async () => {\n\tfor (const ai of AI)", `beforeAll(async () => {\n${NGU}\tfor (const ai of AI)`]],
		pha: [[KHONG_RO, "}, TAI_LIEU_SAN.hookMs);", "});"]],
		ghim: "timed out",
	},
	{
		ten: "d3 hook thay-trang",
		lenh: API("tai-lieu-thay-trang.spec.ts"),
		lanh: [[THAY_TRANG, "beforeAll(async () => {\n\tconst dd = await taoTrang(", `beforeAll(async () => {\n${NGU}\tconst dd = await taoTrang(`]],
		pha: [[THAY_TRANG, "}, TAI_LIEU_SAN.hookMs);", "});"]],
		ghim: "timed out",
	},
	{
		ten: "e cong tac turbo",
		lenh: "bun _acceptance/ca-chap-chon-cach-ly/rang/cong-tac.mjs",
		pha: [["turbo.json", '\t\t"SOKR_KHONG_CHAY_AGENT_CU",\n', ""]],
		ghim: "cong tac khong toi test",
	},
	{
		ten: "g du ca",
		lenh: "bun _acceptance/ca-chap-chon-cach-ly/rang/du-ca.mjs",
		pha: [[KHONG_RO, '\ttest("khong-ro: list va get theo ma tran', '\ttest.skip("khong-ro: list va get theo ma tran']],
		ghim: "it ca hon merge-base",
	},
	{
		ten: "f pham vi",
		lenh: "bun _acceptance/ca-chap-chon-cach-ly/rang/pham-vi.mjs --tu-danh-sach .cccl-ds.txt",
		ds: { lanh: "turbo.json\napps/agent-okr/test/support/khoi-dong.ts\n", pha: "turbo.json\napps/api/src/app.module.ts\n" },
		pha: [],
		ghim: "cham ma san pham: apps/api/src/app.module.ts",
	},
];

function chay(goc, lenh) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd: goc,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, log: `${r.stdout}\n${r.stderr}` };
}

function apDung(goc, ds) {
	const hoan = ds.map(([tep, cu, moi]) => thayMotLan(goc, tep, cu, moi));
	return () => {
		for (const h of hoan.reverse()) h();
	};
}

function main() {
	const goc = dungBanSao("dot-bien");
	let dat = 0;
	let daChay = 0;
	try {
		for (const cap of CAP) {
			daChay++;
			const hoanLanh = apDung(goc, cap.lanh ?? []);
			if (cap.ds) writeFileSync(join(goc, ".cccl-ds.txt"), cap.ds.lanh);
			const xanh = chay(goc, cap.lenh);
			const hoanPha = apDung(goc, cap.pha);
			if (cap.ds) writeFileSync(join(goc, ".cccl-ds.txt"), cap.ds.pha);
			const pha = chay(goc, cap.lenh);
			hoanPha();
			hoanLanh();
			const ghim = pha.log.includes(cap.ghim);
			const ok = xanh.ma === 0 && pha.ma !== 0 && ghim;
			console.log(`${cap.ten} xanh=${xanh.ma} do=${pha.ma} ghim=${ghim ? "ok" : "thieu"}`);
			if (ok) dat++;
			else console.error(`${cap.ten}:\n--- xanh\n${xanh.log.slice(-1500)}\n--- do\n${pha.log.slice(-1500)}`);
		}
	} finally {
		goBanSao(goc);
	}
	if (daChay !== SO_CAP_KHAI) {
		console.error(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
		return 1;
	}
	return dat === SO_CAP_KHAI ? 0 : 1;
}

try {
	process.exit(main());
} catch (loi) {
	console.error(loi.message);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
