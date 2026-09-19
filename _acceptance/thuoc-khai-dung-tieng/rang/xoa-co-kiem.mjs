import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bang, chay, GOC } from "./chung.mjs";

const PHA_THU = "_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs";
const NGOAI = join(GOC, "..");
const TIEN_TO = ".pha-thu-khai-tieng-";

console.log(
	"-- BON duong vao dungCaySao(), moi duong roi vao MOT NHANH KHAC NHAU cua\n" +
		"   kiemDuongSao(). Ban cu chi co ba duong va ca ba deu bi chan boi LUAT DAU\n" +
		"   TIEN (tien to ten), nen hai luat kia khong bao gio chay — mot ma tran ba\n" +
		"   dong ma chi do mot o. Hoi dong S4 vong 2 bat cho do.\n" +
		"-- Cua CHI_KIEM_DUONG nay thoat SAU lenh xoa, khong truoc. Thoat truoc thi\n" +
		'   khang dinh "thu muc van con" luon dung bat ke hang rao co chay hay khong.',
);

const hang = [];
let hong = 0;

function goi(cay_sao) {
	return chay("bun", [PHA_THU], {
		env: {
			CAY_SAO: cay_sao,
			CHI_KIEM_DUONG: "1",
			CHO_PHEP_CAY_BAN: "1",
		},
	});
}

function ghiNhan(ten, duong, r, mong_nhan, phai_con) {
	const nhan = mong_nhan === null ? null : r.ra.includes(mong_nhan);
	const conSong = phai_con === null ? null : existsSync(phai_con);
	const daQua = r.ra.includes("[chi-kiem-duong]");

	if (mong_nhan === null) {
		if (!daQua) {
			hang.push(
				`${ten} [xoa-nham:tu-choi-duong-dung] duong hop le BI TU CHOI oan`,
			);
			hong += 1;
		} else {
			hang.push(`${ten} duong hop le di qua ca ba luat VA qua lenh xoa`);
		}
		return;
	}
	if (!nhan) {
		hang.push(
			`${ten} [xoa-nham:${mong_nhan}] khong roi vao nhanh mong doi — ${duong}\n` +
				r.ra
					.split("\n")
					.filter((d) => d.includes("[luat-") || d.includes("[chi-kiem"))
					.slice(0, 2)
					.map((d) => `        | ${d.trim()}`)
					.join("\n"),
		);
		hong += 1;
		return;
	}
	if (conSong === false) {
		hang.push(
			`${ten} [xoa-nham:van-bi-xoa] da tu choi dung nhanh NHUNG thu muc BI XOA`,
		);
		hong += 1;
		return;
	}
	hang.push(`${ten} bi chan boi ${mong_nhan}, va vat con nguyen`);
}

const hopLe = join(NGOAI, `${TIEN_TO}do-${process.pid}`);
execFileSync(
	"git",
	["-C", GOC, "worktree", "add", "--detach", "--quiet", hopLe, "HEAD"],
	{
		encoding: "utf8",
	},
);
ghiNhan("(a) worktree hop le, DA TON TAI ", hopLe, goi(hopLe), null, null);
try {
	execFileSync("git", ["-C", GOC, "worktree", "remove", "--force", hopLe], {
		encoding: "utf8",
	});
} catch {
	rmSync(hopLe, { recursive: true, force: true });
}

ghiNhan(
	"(b) goc kho                    ",
	GOC,
	goi(GOC),
	"[luat-1-goc-kho]",
	join(GOC, "package.json"),
);

const thuong = join(NGOAI, `thu-muc-thuong-${process.pid}`);
mkdirSync(thuong, { recursive: true });
writeFileSync(join(thuong, "viec-cua-ai-do.txt"), "dung xoa toi\n");
ghiNhan(
	"(c) thu muc thuong, khong tien to",
	thuong,
	goi(thuong),
	"[luat-2-tien-to]",
	join(thuong, "viec-cua-ai-do.txt"),
);
rmSync(thuong, { recursive: true, force: true });

const gioTien = join(NGOAI, `${TIEN_TO}gia-mao-${process.pid}`);
mkdirSync(gioTien, { recursive: true });
writeFileSync(
	join(gioTien, "viec-cua-ai-do.txt"),
	"toi mang tien to nhung khong phai worktree\n",
);
ghiNhan(
	"(d) MANG tien to, khong worktree ",
	gioTien,
	goi(gioTien),
	"[luat-3-khong-phai-worktree]",
	join(gioTien, "viec-cua-ai-do.txt"),
);
rmSync(gioTien, { recursive: true, force: true });

bang("-- Ket qua bon duong:", hang);
console.log(`ket qua: ${hong} duong hong tren 4`);
process.exit(hong > 0 ? 1 : 0);
