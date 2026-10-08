import { spawnSync } from "node:child_process";
import { dungBanSao, GOC, goBanSao, KhongDo, thayMotLan } from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 8;
const TRAN_MS = 300_000;
const QD = "_acceptance/tro-ly-doc-kho/rang/quyet-do.ts";
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const SPEC = (t) => `bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t ${t}`;

const CAP = [
	{
		ten: "a nhan-loi",
		lenh: SPEC("nhan-loi"),
		pha: [QD, 'if (ketCuc === "khong-co-ket-qua" || ketCuc === "LOI") return "loi";', 'if (ketCuc === "khong-co-ket-qua") return "loi";'],
		ghim: "loi bi tinh la sai",
	},
	{
		ten: "b nhat-ky",
		lenh: SPEC("nhat-ky"),
		pha: [QD, "\tfor (const t of ds.slice(0, Math.max(0, ds.length - giu)))\n\t\trmSync(join(goc, t), { recursive: true, force: true });\n", ""],
		ghim: "con 12 thu muc luot, can 10",
	},
	{
		ten: "c bam",
		lenh: SPEC("bam"),
		pha: [QD, '\t\t"bun.lock",\n', ""],
		ghim: "pham vi thieu bun.lock",
	},
	{
		ten: "d dung-lai",
		lenh: SPEC("dung-lai"),
		pha: [QD, "now.getTime() - new Date(banGhi.doLuc).getTime() >", "now.getTime() - new Date(banGhi.doLuc).getTime() > Number.POSITIVE_INFINITY &&"],
		ghim: "dung lai ban ghi qua han",
	},
	{
		ten: "e vung-xam",
		lenh: SPEC("vung-xam"),
		pha: [QD, "\tif (loi.length > 0)\n", "\tif (loi.length < 0)\n"],
		ghim: "hoi lai khi luot 1 co loi",
	},
	{
		ten: "f gop",
		lenh: SPEC("gop"),
		pha: [QD, "const g = { k: l1.k + l2.k, n: l1.n + l2.n };", "const g = { k: l2.k, n: l2.n };"],
		ghim: "ket luan khong tren ti le gop",
	},
	{
		ten: "g do-model",
		lenh: SPEC("do-model"),
		pha: [QD, 'for (const vai of ["kho", "goc"] as const) {', 'for (const vai of ["kho"] as const) {'],
		ghim: "thieu model_id cua goc",
	},
	{
		ten: "h cham-lai",
		lenh: "bun _acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs",
		pha: [CHAM, '\t\tdocTungCau(readFileSync(tep, "utf8")),\n', '\t\tdocTungCau(readFileSync(tep, "utf8")).map((d) => (d.ketCuc === "LOI" ? { ...d, ketCuc: "TRA_LOI-sai" as const } : d)),\n'],
		ghim: "cham-bo-do khong dung ham nhan",
	},
];

function chay(goc, lenh, env) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd: goc,
		encoding: "utf8",
		timeout: TRAN_MS,
		env: { ...process.env, ...env },
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, log: `${r.stdout}\n${r.stderr}` };
}

function luotThat() {
	const r = spawnSync("sh", ["-c", "ls -d .acceptance-runs/tro-ly-doc-kho/cham-bo-do/*/luot-1/cham-tung-cau.jsonl 2>/dev/null | sort | tail -1"], { cwd: GOC, encoding: "utf8" });
	const tep = r.stdout.trim();
	return tep ? `${GOC}/${tep.replace(/\/luot-1\/cham-tung-cau\.jsonl$/, "")}` : null;
}

function main() {
	const luot = luotThat();
	if (!luot) throw new KhongDo("chua co luot that cho cap h (chay E8 truoc)");
	const goc = dungBanSao("emtdl-dot-bien");
	const env = { E15_THU_MUC_LUOT: luot };
	let dat = 0;
	let daChay = 0;
	try {
		for (const cap of CAP) {
			daChay++;
			const xanh = chay(goc, cap.lenh, env);
			const hoan = thayMotLan(goc, ...cap.pha);
			const pha = chay(goc, cap.lenh, env);
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
