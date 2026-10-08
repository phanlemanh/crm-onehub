import { spawnSync } from "node:child_process";
import { dungBanSao, goBanSao, KhongDo, thayMotLan } from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 3;
const TRAN_MS = 300_000;
const NGOAI = "apps/agent/agent/tools/tro-ly-okr-ngoai.ts";
const UY_QUYEN = "apps/agent/agent/lib/okr/uy-quyen.ts";
const SPEC = (tep) => `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/${tep}`;

const CAP = [
	{
		ten: "a zalo-khong-de",
		lenh: SPEC("okr-uy-quyen-ngoai.spec.ts"),
		pha: [NGOAI, 'purposeOf(ctx) === "okr"', '(purposeOf(ctx) === "okr" || purposeOf(ctx) === "zalo")'],
		ghim: "zalo: khong de tro_ly_okr",
	},
	{
		ten: "b luon-de",
		lenh: SPEC("okr-uy-quyen-ngoai.spec.ts"),
		pha: [NGOAI, 'purposeOf(ctx) === "okr"', "false"],
		ghim: "phien okr bi de tro_ly_okr",
	},
	{
		ten: "c hook-de-lot",
		lenh: SPEC("okr-uy-quyen.spec.ts"),
		pha: [UY_QUYEN, "? { cho: false, loi: LOI_UY_QUYEN.ngoaiOkr }", "? { cho: true, daGoi: [...daGoi] }"],
		ghim: "tro_ly_okr may be called only from an OKR session.",
	},
];

function chay(goc, lenh) {
	const r = spawnSync("sh", ["-c", lenh], { cwd: goc, encoding: "utf8", timeout: TRAN_MS, maxBuffer: 64 * 1024 * 1024 });
	return { ma: r.status, log: `${r.stdout}\n${r.stderr}` };
}

function main() {
	const goc = dungBanSao("zhok-dot-bien");
	let dat = 0;
	let daChay = 0;
	try {
		for (const cap of CAP) {
			daChay++;
			const xanh = chay(goc, cap.lenh);
			const hoan = thayMotLan(goc, ...cap.pha);
			const pha = chay(goc, cap.lenh);
			hoan();
			const ghim = pha.log.includes(cap.ghim);
			const ok = xanh.ma === 0 && pha.ma !== 0 && ghim;
			console.log(`${cap.ten} xanh=${xanh.ma} do=${pha.ma} ghim=${ghim ? "ok" : "thieu"}`);
			if (ok) dat++;
			else console.error(`${cap.ten}:\n--- xanh\n${xanh.log.slice(-1200)}\n--- do\n${pha.log.slice(-1200)}`);
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
