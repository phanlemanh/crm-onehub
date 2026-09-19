import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { bang, chay, GOC, ghim, thoat } from "./chung.mjs";

const TIEN_TO_BS = ".bay-benh-cu-";

function dungBanSao() {
	const sao = join(GOC, "..", `${TIEN_TO_BS}${process.pid}`);
	if (existsSync(sao)) rmSync(sao, { recursive: true, force: true });
	execFileSync(
		"git",
		["-C", GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD"],
		{ encoding: "utf8" },
	);
	return sao;
}

function donBanSao(sao) {
	if (!basename(sao).startsWith(TIEN_TO_BS)) {
		thoat(2, `[xoa-tu-choi] ${sao} khong mang tien to ${TIEN_TO_BS}`);
	}
	try {
		execFileSync("git", ["-C", GOC, "worktree", "remove", "--force", sao], {
			encoding: "utf8",
		});
	} catch {
		rmSync(sao, { recursive: true, force: true });
	}
}

const BAY = 7;
const H = "_acceptance/ho-so-khai-dung-tieng/rang";
const R = "_acceptance/thuoc-khai-dung-tieng/rang";
const HOP_DONG = "_acceptance/thuoc-khai-dung-tieng/contract.md";

const BENH = [
	{
		ma: "A",
		ten: "pha tai cho tren cay dang do, ghi de tep bang chung",
		tep: `${H}/pha-thu.mjs`,
		dau_hieu: "sao = dungCaySao();",
		vi_sao:
			"Con goi dungCaySao() nghia la moi phep pha van nam trong ban sao rieng.",
	},
	{
		ma: "C",
		ten: "gia tri do la hang go san thay vi ve tu may chu",
		tep: `${H}/khai-tieng-ho-so.mjs`,
		dau_hieu: "await goiMayChu(",
		vi_sao: "Con goi may chu nghia la dan so con ve tu nguon that.",
	},
	{
		ma: "D",
		ten: "do nua loi hua — khang dinh am tinh khong doi chung duong",
		tep: `${H}/khai-tieng-ho-so.mjs`,
		dau_hieu: "doi_chung_duong",
		vi_sao: "Con muc doi chung duong nghia la AC-8 con ca hai chieu.",
	},
	{
		ma: "E",
		ten: "khop TEN THE trong khi loi hua la QUAN HE",
		tep: `${H}/mot-duong.mjs`,
		dau_hieu: "NHAP_UI.test(noi_dung)",
		vi_sao:
			"Con phep kiem nhap tu @crm/ui nghia la do QUAN HE, khong do ten the.",
	},
	{
		ma: "F",
		ten: "khoanh ca trang thay vi khoanh dung vung",
		tep: `${H}/khai-tieng-ho-so.mjs`,
		dau_hieu: 'data-slot="sheet-content"',
		vi_sao: "Con bo chon vung ho so nghia la khong do lai be mat von da dung.",
	},
	{
		ma: "G",
		ten: "nhan ban HEAD ma khong bao khi cay ban",
		tep: `${H}/pha-thu.mjs`,
		dau_hieu: "CHO_PHEP_CAY_BAN",
		vi_sao: "Con cua nay nghia la cay ban bi chan chu khong di qua im lang.",
	},
	{
		ma: "chot-ghim-cu",
		ten: "chuoi ghim la ten chan nen luon co mat",
		tep: `${H}/bang-dot-bien.mjs`,
		dau_hieu: 'ghim: "lech-boc:gioi-thieu"',
		vi_sao: "Chuoi ghim da doi sang nhan chi in khi do.",
	},
];

const QUAN_HE = [
	{
		ma: "E",
		vi_sao:
			"Benh E la 'khop TEN THE trong khi loi hua la QUAN HE'. Khoi phuc no = bo\n" +
			"      phep kiem nhap-tu-@crm/ui trong mot-duong.mjs. Cho bat: dinh nghia mot\n" +
			"      ForeignText tu mot duong KHAC trong mot tep dang khai tieng — ban lanh\n" +
			"      phai DO (vi quan he gay), ban da khoi phuc benh phai XANH (vi chi khop\n" +
			"      ten the). Khong dinh nghia ForeignText tai cho: lam vay se them mot\n" +
			"      <span lang=> viet tay va mot-duong do vi LY DO KHAC, nen phep do thanh\n" +
			"      ra khong co lap duoc benh E.",
		pha_thuoc: {
			tep: "_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs",
			cu: "\t\tif (NHAP_UI.test(noi_dung)) {",
			moi: "\t\tif (true) {",
		},
		pha_vat: {
			tep: "apps/app/components/crm/deal-stage.tsx",
			cu: 'import { ForeignText } from "@crm/ui/components/foreign-text";',
			moi: 'import { ForeignText } from "./foreign-text-cuc-bo";',
		},
		do: ["bun", "_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs"],
	},
];

const KHAI_GIOI_HAN = [
	[
		"A",
		"Khoi phuc = cho dungCaySao() tra ve chinh goc cay. Cho bat la phep kiem cay-khong-doi cua pha-thu, ma mot luot pha-thu mat vai phut va can hai may chu dev — vuot tran 600 giay cua cong cu cham neu de trong chan nay.",
	],
	[
		"C",
		"Khoi phuc = so gia tri DOM voi mot hang go san thay vi gia tri ve tu goiMayChu(). Khong phep do nao trong kho phan biet duoc hai ban cai dat do: ca hai deu so DOM voi mot chuoi, khac nhau o CHO chuoi ay den. Day la gioi han that, khong phai gioi han chi phi.",
	],
	[
		"D",
		"Khoi phuc = bo doi chung duong cua ho-so-trong. Cho bat phai la mot vat thu co enrichment RONG ma khoi Gioi thieu VAN ve — dung mot fixture thu hai chua co trong tap du lieu thu.",
	],
	[
		"F",
		"Khoi phuc = noi bo chon tu [data-slot=sheet-content] ra ca trang. Cho bat la phep pha E1 cua pha-thu tren ban da khoi phuc benh; can may chu dev va vai phut.",
	],
	[
		"G",
		"Khoi phuc = bo cua CHO_PHEP_CAY_BAN. Cho bat la chinh pha-thu chay tren mot cay co y lam ban; can mot luot pha-thu day du.",
	],
	[
		"chot-ghim-cu",
		"Khoi phuc = dat chuoi ghim ve ten chan. Cho bat la ghim-phan-biet, ma no mo trinh duyet cho bay chan ui-check — vai phut va can may chu dev.",
	],
];

console.log(
	`-- BAY benh da va o hai vong truoc. Hang ghim ${BAY}, chep tay tu AC-13.\n` +
		"-- Moi benh co MOT dau hieu cau truc; mat dau hieu la benh quay lai.\n" +
		"-- Benh nao khong dung duoc dau hieu phai co TEN trong '## Known limits'\n" +
		"   cua hop dong — khong im lang, va khong tinh la da phu.",
);
ghim("so benh", BENH.length, BAY);

const hopDong = readFileSync(join(GOC, HOP_DONG), "utf8");
const tieuDe = /^## Known limits\s*$/m.exec(hopDong);
if (!tieuDe) {
	thoat(
		2,
		`KHONG DO DUOC: ${HOP_DONG} khong co TIEU DE "## Known limits" dung dau dong.`,
		"   AC-13 lay muc do lam cua thoat duy nhat, nen thieu no thi khong the cham.",
	);
}
const sauTieuDe = tieuDe.index + tieuDe[0].length;
const conLai = hopDong.slice(sauTieuDe);
const ketThuc = conLai.search(/^## /m);
const khoaiLimits = ketThuc < 0 ? conLai : conLai.slice(0, ketThuc);
console.log(
	`-- Muc "## Known limits": doc tu TIEU DE dau dong, ${khoaiLimits.trim().split("\n").length} dong.\n` +
		'   indexOf("## Known limits") tran bat nham chinh cau AC-13 dang nhac ten muc do,\n' +
		"   nen cua thoat khong bao gio mo duoc. Hoi dong S4 vong 1 bat cho nay.",
);

let hong = 0;
const hang = [];

for (const b of BENH) {
	const noi_dung = readFileSync(join(GOC, b.tep), "utf8");
	const con = noi_dung.includes(b.dau_hieu);
	if (con) {
		hang.push(
			`khong quay lai  ${b.ma.padEnd(12)} ${b.ten}\n        dau hieu ${JSON.stringify(b.dau_hieu)} con trong ${b.tep}`,
		);
		continue;
	}
	const coTenOLimits = new RegExp(
		`^\\s*-\\s*\`?${b.ma.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\`?\\s*[—:-]`,
		"m",
	).test(khoaiLimits);
	if (coTenOLimits) {
		hang.push(
			`khai o limits   ${b.ma.padEnd(12)} mat dau hieu, nhung CO ten trong Known limits`,
		);
	} else {
		hang.push(
			`BENH QUAY LAI   [benh-cu-quay-lai:${b.ma}] mat dau hieu ${JSON.stringify(b.dau_hieu)} trong ${b.tep}\n        va KHONG co ten trong Known limits: [benh-thieu-ca-do-lan-known-limits:${b.ma}]`,
		);
		hong += 1;
	}
}

console.log(
	"\n-- CHIEU DUONG: moi dau hieu phai THUC SU bat duoc benh. Bo dau hieu di roi\n" +
		"   chay lai chan nay tren ban sao trong bo — E14 cua ban khai lam viec do.",
);

console.log(
	"-- Ten benh phai la MOT DONG DANH SACH co cau truc (`- <ma> — <ly do>`), khong\n" +
		'   phai mot chuoi con bat ky. Ma benh la MOT CHU CAI, nen includes("G") khop\n' +
		"   ca van xuoi binh thuong: do 19/09, 5/7 benh co cua thoat mo san vinh vien.",
);
bang(`-- ${BENH.length} benh:`, hang);
console.log(
	"\n-- VE QUAN HE: voi benh co cho bat re, khoi phuc benh THAT roi doi mot phep do\n" +
		'   CU THE phai thoi bat duoc. Khang dinh "chuoi dau hieu con day" la dai dien:\n' +
		"   mot ban cai dat van goi goiMayChu() roi so voi mot hang go san se di qua no\n" +
		"   nguyen ven — chuoi con do, benh da quay lai. Hoi dong S4 vong 3 bat cho do.",
);

const hangQH = [];
for (const q of QUAN_HE) {
	const sao = dungBanSao();
	try {
		const apDung = (x) => {
			const duong = join(sao, x.tep);
			const goc = readFileSync(duong, "utf8");
			if (!goc.includes(x.cu)) {
				return `KHONG AP DUNG DUOC: ${x.tep}`;
			}
			writeFileSync(duong, goc.replace(x.cu, x.moi));
			return null;
		};
		const loi = apDung(q.pha_vat);
		if (loi) {
			hangQH.push(`${q.ma} [benh-cu-quay-lai:${q.ma}] ${loi}`);
			hong += 1;
			continue;
		}
		const lanh = chay(q.do[0], q.do.slice(1), { cwd: sao });
		const loi2 = apDung(q.pha_thuoc);
		if (loi2) {
			hangQH.push(`${q.ma} [benh-cu-quay-lai:${q.ma}] ${loi2}`);
			hong += 1;
			continue;
		}
		const benh = chay(q.do[0], q.do.slice(1), { cwd: sao });
		const dat = lanh.ma !== 0 && benh.ma === 0;
		if (!dat) {
			hangQH.push(
				`${q.ma} [benh-cu-quay-lai:${q.ma}] ban LANH thoat ${lanh.ma} (can khac 0), ban DA KHOI PHUC BENH thoat ${benh.ma} (can 0)`,
			);
			hong += 1;
		} else {
			hangQH.push(
				`${q.ma} do bang QUAN HE: ban lanh DO (${lanh.ma}), ban khoi phuc benh XANH (${benh.ma}) — tuc phep kiem quan he that su dang gay`,
			);
		}
	} finally {
		donBanSao(sao);
	}
}
bang(`-- ${QUAN_HE.length} benh do bang QUAN HE:`, hangQH);

const daKhai = new Set(KHAI_GIOI_HAN.map(([m]) => m));
const daQuanHe = new Set(QUAN_HE.map((q) => q.ma));
const soHo = BENH.map((b) => b.ma).filter(
	(m) => !daQuanHe.has(m) && !daKhai.has(m),
);
if (soHo.length > 0) {
	for (const m of soHo) {
		console.log(
			`   [benh-thieu-ca-do-lan-known-limits:${m}] khong do bang quan he VA khong khai gioi han`,
		);
	}
	hong += soHo.length;
}
bang(
	`-- ${KHAI_GIOI_HAN.length} benh CHI do bang dau hieu, gioi han khai dich danh:`,
	KHAI_GIOI_HAN.map(([m, v]) => `${m}: ${v}`),
);

console.log(
	`ket qua: ${hong} cho hong (${BENH.length} benh · ${QUAN_HE.length} do quan he · ${KHAI_GIOI_HAN.length} khai gioi han)`,
);
process.exit(hong > 0 ? 1 : 0);
