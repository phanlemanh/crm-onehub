import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LUOT = "cap-nhat-tuan-okr";
const BIEN_CAY_GOP = "CNT_CAY_GOP";

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

function diemGop() {
	return git("merge-base", "HEAD", "origin/onehub");
}

function gopLuot(chung) {
	return git(
		"log",
		"--first-parent",
		"--diff-filter=A",
		"--format=%H",
		chung,
		"--",
		`_acceptance/${LUOT}/contract.md`,
	)
		.split("\n")
		.at(-1);
}

function vong() {
	const chung = diemGop();
	const gop = gopLuot(chung);
	if (!gop) return { truoc: chung, sau: "HEAD", gop: null };
	return { truoc: git("rev-parse", `${gop}^1`), sau: gop, gop };
}

export const VONG = Object.freeze(vong());

export function doTaiGop(tepNay) {
	if (!VONG.gop || process.env[BIEN_CAY_GOP]) return;
	console.log(
		`luot ${LUOT} da gop o ${VONG.gop.slice(0, 8)}: do tren cay tai commit gop, so voi cha ${VONG.truoc.slice(0, 8)}`,
	);
	const thu = mkdtempSync(join(tmpdir(), "cnt-gop-"));
	const cay = join(thu, "cay");
	let ma = 2;
	try {
		git("worktree", "add", "--detach", "--quiet", cay, VONG.gop);
		symlinkSync(join(GOC, "node_modules"), join(cay, "node_modules"));
		const rang = join("_acceptance", LUOT, "rang");
		cpSync(join(GOC, rang), join(cay, rang), { recursive: true });
		const r = spawnSync(
			process.execPath,
			[join(cay, relative(GOC, tepNay)), ...process.argv.slice(2)],
			{
				stdio: "inherit",
				env: { ...process.env, [BIEN_CAY_GOP]: VONG.gop },
			},
		);
		ma = r.status ?? 2;
	} finally {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
		rmSync(thu, { recursive: true, force: true });
	}
	process.exit(ma);
}

export const HO_SO_BI_CHAM = [
	"agent-builder-noi-tieng-viet",
	"bang-thanh-vien-giu-hang",
	"bo-dung-chung-nhan-chuoi",
	"cai-dat-con-lai-noi-tieng-viet",
	"cau-truc-to-chuc",
	"chan-lai-component-ra-man",
	"cho-phep-ai-vao-o-man-hinh",
	"chu-cuoi-cung-tien-de",
	"chu-mac-dinh-thu-vien-ngoai",
	"claimdue-chi-thay-dong-cua-minh",
	"cron-theo-ban-khai",
	"cua-so-tro-chuyen-noi-tieng-viet",
	"dat-okr-trong-crm",
	"do-quyen-luot-bang-hanh-vi",
	"do-man-tren-kho-rieng",
	"duong-proto-cho-design-pass",
	"go-la-cat-quyen-that",
	"han-viec-theo-ngay",
	"ke-hoach-la-mot-ban-ghi",
	"khoa-api-ghi-thua",
	"khoa-cu-khong-mo-khoa-moi",
	"khoa-lo-giu-tran",
	"khoa-rieng-dien-node",
	"khung-trang-cai-dat",
	"lam-moi-chuyen-viec-qua-loi-chung",
	"lenh-chung-khong-an-cache-doi",
	"lenh-dung-do-khong-ai-thay",
	"logo-onehub",
	"loi-tac-tu-zalo-noi-dung-nguyen-nhan",
	"ma-tran-phai-co-chieu-song",
	"man-cai-dat-noi-tieng-viet",
	"may-nhac-truoc-nguoi",
	"moi-bai-kiem-dom-deu-chay",
	"moi-phia-deu-thay-ke-hoach",
	"mot-duong-ghi-phong-ban",
	"nen-chat-ai-elements",
	"neo-dan-so-khong-cung",
	"ngay-gieo-theo-gio-vn",
	"nhac-qua-zalo",
	"noi-zalo-cho-nguoi-moi",
	"o-cam-chay-duoc-that",
	"o-so-tien-doc-theo-tieng",
	"okr-soat-anh-luot-3",
	"ten-dong-tien-bao-cao",
	"thanh-vien-hai-khoi-cung-khuon",
	"thuoc-o-soan-don-dep",
	"tiep-thi-tuyen-doi-tac",
	"tieu-de-cot-doc-tron",
	"to-chuc-danh-sach-chi-tiet",
	"tong-quan-va-khung-noi-tieng-viet",
	"tra-loi-tin-nhac",
	"truong-tu-tao-o-cai-dat",
	"vai-chi-okr",
	"vao-bang-email-va-mat-khau",
	"vung-cuon-la-khoi-chua",
	"zalo-gio-theo-mui-gio-xuong",
	"zalo-goi-thu-hong-hien-dung-bot",
	"zalo-webhook-doc-khuon-that",
];
