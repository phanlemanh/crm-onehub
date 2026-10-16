// Hồ sơ _acceptance/lam-moi-goi-y-ke-hoach — E5: mỗi cặp chạy bài kiểm trên bản sao lành phải xanh, rồi thay
// ĐÚNG MỘT chuỗi vật thật trong apps/app/lib/trpc/cache.ts và chạy lại phải đỏ với thông điệp ghim. Thông điệp
// ghim là thông điệp ra trước thật, đã thấy tay (16/10): (a)(b)(c) ở lượt đỏ trên code trước khi sửa, (d) trên
// cây có khoá chung. Bản sao dùng chung ban-sao.mjs của ca-chap-chon-cach-ly như goi-y-mo-ke-hoach.
import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 4;
const TRAN_MS = 300_000;
const DOM = (t) =>
	`cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t ${t}`;
const GY = {
	stepper: DOM("gy-lm-stepper"),
	roi: DOM("gy-lm-roi"),
	cache: DOM("gy-lm-cache"),
};
const CACHE = "apps/app/lib/trpc/cache.ts";
const KHOA_THEO_DEAL =
	"\t\t\t\t\tid\n\t\t\t\t\t\t? trpc.onboarding.goiYCuaDeal.queryKey({ dealId: id })\n\t\t\t\t\t\t: trpc.onboarding.goiYCuaDeal.queryKey(),\n";

const CAP = [
	[
		"a go goi y khoi cache.deal → the khong hien",
		CACHE,
		KHOA_THEO_DEAL,
		"",
		[[GY.stepper, "gy-lm: the khong hien sau thang stepper"]],
	],
	[
		"b go goi y khoi cache.deal → the con sau khi roi",
		CACHE,
		KHOA_THEO_DEAL,
		"",
		[[GY.roi, "gy-lm: the con sau khi roi thang stepper"]],
	],
	[
		"c go goi y khoi cache.deal → cache khong lam moi",
		CACHE,
		KHOA_THEO_DEAL,
		"",
		[[GY.cache, "gy-lm: cache.deal khong lam moi goi y d-1"]],
	],
	[
		"d khoa chung khong theo deal",
		CACHE,
		KHOA_THEO_DEAL,
		"\t\t\t\t\ttrpc.onboarding.goiYCuaDeal.queryKey(),\n",
		[[GY.cache, "gy-lm: lam moi goi y deal khac"]],
	],
];

function lenh(cwd, cmd) {
	const r = spawnSync("sh", ["-c", cmd], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra.split("\n").some((d) => d.startsWith("error:") && d.includes(ghim));

let banSao = null;
const xanh = new Map();
let daChay = 0;
const hong = [];
try {
	banSao = dungBanSao("gylm");
	for (const [ten, tep, cu, moi, kiem] of CAP) {
		daChay += 1;
		for (const [cmd] of kiem) {
			if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		}
		const traLai = thayMotLan(banSao, tep, cu, moi);
		const sau = [];
		try {
			for (const [cmd, ghim] of kiem)
				sau.push({ cmd, ghim, ...lenh(banSao, cmd) });
		} finally {
			traLai();
		}
		for (const s of sau) {
			const truoc = xanh.get(s.cmd);
			const dung = truoc.ma === 0 && s.ma !== 0 && coGhim(s.ra, s.ghim);
			console.log(
				`${ten} xanh=${truoc.ma} do=${s.ma} ghim=${coGhim(s.ra, s.ghim) ? "ok" : "thieu"} «${s.ghim}»`,
			);
			if (!dung)
				hong.push({
					ten,
					truoc: truoc.ra.slice(-1200),
					sau: s.ra.slice(-1200),
				});
		}
	}
} catch (loi) {
	if (banSao !== null) goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
if (banSao !== null) goBanSao(banSao);
for (const h of hong)
	console.error(`${h.ten}\n--- truoc\n${h.truoc}\n--- sau\n${h.sau}`);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(
	`dot-bien: ${SO_CAP_KHAI - new Set(hong.map((h) => h.ten)).size}/${SO_CAP_KHAI} cap dat`,
);
process.exit(hong.length === 0 ? 0 : 1);
