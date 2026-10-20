import { spawnSync } from "node:child_process";
import { dungBanSao, goBanSao, KhongDo, thayMotLan } from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";
import { GOC, git } from "./dai.mjs";

const M = "apps/app/lib/messages";
const SO_CAP_KHAI = 5;
const CAP = [
	{ ten: "a", tep: `${M}/okr.ts`, cu: 'tabCanChinh: "Góp vào"', moi: 'tabCanChinh: "Căn chỉnh"', khoa: "sheet.tabCanChinh vi" },
	{ ten: "b", tep: `${M}/okr-toan-canh.ts`, cu: 'chuaNoiLen: "Chưa góp vào đâu"', moi: 'chuaNoiLen: "Chưa nối lên"', khoa: "soDo.chuaNoiLen vi" },
	{ ten: "c", tep: `${M}/okr.ts`, cu: '"hoi-y": "Lấy ý kiến"', moi: '"hoi-y": "Hỏi ý"', khoa: "tab.hoi-y vi" },
	{ ten: "d", tep: `${M}/okr-hoi-y.ts`, cu: 'goc: "Company"', moi: 'goc: "Whole company"', khoa: "doPhu.goc en" },
	{ ten: "e", tep: `${M}/okr-gop-y.ts`, cu: '"can-chinh": "Contributes to"', moi: '"can-chinh": "Alignment"', khoa: "dong.loai.can-chinh en" },
];
const LUAT = ["test", "./test/doi-nhan-khu-muc-tieu.spec.ts", "-t", "dnk-luat"];

const chay = (dich) =>
	spawnSync("bun", LUAT, { cwd: `${dich}/apps/app`, encoding: "utf8", maxBuffer: 1 << 26 });

if (CAP.length !== SO_CAP_KHAI) {
	console.log(`dot-bien: ${CAP.length} cap khac SO_CAP_KHAI ${SO_CAP_KHAI}`);
	process.exit(1);
}
const vat = [...new Set(CAP.map((c) => c.tep))];
let dich;
let dat = 0;
try {
	dich = dungBanSao("dnk");
	const lanh = chay(dich);
	if (lanh.status !== 0) throw new KhongDo(`ban sao lanh do:\n${(lanh.stdout + lanh.stderr).slice(-1500)}`);
	for (const c of CAP) {
		const tra = thayMotLan(dich, c.tep, c.cu, c.moi);
		const r = chay(dich);
		tra();
		const ra = r.stdout + r.stderr;
		const [kh, nn] = c.khoa.split(" ");
		const goiTen = ra.includes(`${c.tep}#${kh} ${nn}`);
		if (r.status !== 0 && goiTen) dat += 1;
		else console.log(`dot-bien: cap ${c.ten} ${r.status === 0 ? "xanh" : "do khong goi ten"} ${c.tep}#${c.khoa}`);
	}
} catch (e) {
	if (dich) goBanSao(dich);
	if (e instanceof KhongDo) {
		console.error(`KHONG DO DUOC: ${e.message}`);
		process.exit(2);
	}
	throw e;
}
goBanSao(dich);
const ban = spawnSync("git", ["-C", GOC, "diff", "--quiet", "--", ...vat]).status !== 0;
if (ban) {
	console.log("dot-bien: cay that bi doi");
	process.exit(1);
}
git("rev-parse", "HEAD");
console.log(`dot-bien: ${dat}/${SO_CAP_KHAI} cap dat`);
process.exit(dat === SO_CAP_KHAI ? 0 : 1);
