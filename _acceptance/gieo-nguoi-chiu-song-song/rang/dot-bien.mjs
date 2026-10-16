import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const TRAN_MS = 900_000;
const SO_LUOT_DO = 3;
const LENH =
	'bun run test -- "cd apps/api && bun test test/gieo-nguoi-song-song.spec.ts"';
const TEP = "apps/api/test/dieu-phoi-gieo.ts";
const CU = 'loi.code !== "P2002"';
const MOI = 'loi.code !== "P0000"';
const CA_DO = "(fail) gieo-nguoi-song-song > gnss-dong-thoi";
const MA_DO = 'code: "P2002"';
const DA_BAT = "[organization.upsert]";

const coDong = (ra, mau) => ra.split("\n").some((d) => mau.test(d));
const xanhThat = (r) =>
	r.ma === 0 &&
	coDong(r.ra, /^\s*1 pass$/) &&
	!coDong(r.ra, /^\s*\d+ skip$/) &&
	r.ra.includes(DA_BAT);
const doDungGhim = (r) =>
	r.ma !== 0 && r.ra.includes(CA_DO) && r.ra.includes(MA_DO);

function lenh(cwd) {
	const r = spawnSync("sh", ["-c", LENH], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const banSao = dungBanSao("gnss");
let truoc;
const sau = [];
try {
	truoc = lenh(banSao);
	const traLai = thayMotLan(banSao, TEP, CU, MOI);
	try {
		for (let i = 0; i < SO_LUOT_DO; i += 1) sau.push(lenh(banSao));
	} finally {
		traLai();
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);

const xanh = xanhThat(truoc);
const doDung = sau.filter(doDungGhim);
console.log(
	`a bo nhanh bat P2002 xanh=${truoc.ma} ca-chay=${xanh ? "co" : "thieu"} do-dung-ghim=${doDung.length}/${SO_LUOT_DO}`,
);
if (!xanh || doDung.length !== SO_LUOT_DO) {
	const lech = sau.find((r) => !doDungGhim(r));
	console.error(
		`--- truoc\n${truoc.ra.slice(-1500)}\n--- sau\n${(lech ?? sau[0]).ra.slice(-1500)}`,
	);
	console.log("dot-bien: 0/1 cap dat");
	process.exit(1);
}
console.log("dot-bien: 1/1 cap dat");
