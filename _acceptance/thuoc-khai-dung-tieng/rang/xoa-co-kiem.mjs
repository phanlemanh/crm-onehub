import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bang, chay, GOC } from "./chung.mjs";

const PHA_THU = "_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs";
const NGOAI = join(GOC, "..");

console.log(
	"-- Ba duong vao dungCaySao(). Duong (b) va (c) phai bi TU CHOI, va phep do\n" +
		'   khang dinh thu muc VAN CON — mot script keu "tu choi" roi van xoa thi\n' +
		"   thong diep chi la trang tri.\n" +
		"-- CHO_PHEP_CAY_BAN=1: chan nay do PHEP KIEM DUONG DAN, khong do con so nao\n" +
		"   tren man hinh, nen cay sach hay ban khong lien quan.",
);

const hang = [];
let hong = 0;

function goi(cay_sao) {
	return chay("bun", [PHA_THU], {
		env: { CAY_SAO: cay_sao, CHI_KIEM_DUONG: "1", CHO_PHEP_CAY_BAN: "1" },
	});
}

const hopLe = join(NGOAI, `.pha-thu-khai-tieng-do-${process.pid}`);
const r_a = goi(hopLe);
if (r_a.ra.includes("[xoa-tu-choi]")) {
	hang.push(
		`(a) duong hop le BI TU CHOI oan [xoa-nham:tu-choi-duong-dung] ${hopLe}`,
	);
	hong += 1;
} else {
	hang.push(`(a) duong hop le duoc chap nhan  ${hopLe}`);
}

const r_b = goi(GOC);
const bTuChoi = r_b.ra.includes("[xoa-tu-choi]");
const bConSong = existsSync(join(GOC, "package.json"));
if (!bTuChoi) {
	hang.push("(b) goc kho KHONG bi tu choi [xoa-nham:goc-kho]");
	hong += 1;
} else if (!bConSong) {
	hang.push(
		"(b) da tu choi nhung GOC KHO DA BI XOA [xoa-nham:goc-kho-van-bi-xoa]",
	);
	hong += 1;
} else {
	hang.push("(b) goc kho bi tu choi, va goc kho van con");
}

const thuong = join(NGOAI, `thu-muc-thuong-${process.pid}`);
mkdirSync(thuong, { recursive: true });
writeFileSync(join(thuong, "viec-cua-ai-do.txt"), "dung xoa toi\n");
const r_c = goi(thuong);
const cTuChoi = r_c.ra.includes("[xoa-tu-choi]");
const cConSong = existsSync(join(thuong, "viec-cua-ai-do.txt"));
if (!cTuChoi) {
	hang.push(
		`(c) thu muc thuong KHONG bi tu choi [xoa-nham:thu-muc-thuong] ${thuong}`,
	);
	hong += 1;
} else if (!cConSong) {
	hang.push(
		`(c) da tu choi nhung THU MUC DA BI XOA [xoa-nham:van-bi-xoa] ${thuong}`,
	);
	hong += 1;
} else {
	hang.push("(c) thu muc thuong bi tu choi, va tep ben trong van con");
}
rmSync(thuong, { recursive: true, force: true });

bang("-- Ket qua ba duong:", hang);
console.log(`ket qua: ${hong} duong hong tren 3`);
process.exit(hong > 0 ? 1 : 0);
