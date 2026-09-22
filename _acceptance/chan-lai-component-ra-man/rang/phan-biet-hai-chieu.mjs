import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	dungCaySao,
	khiBiNgat,
	RangLoi,
} from "../../do-quyen-luot-bang-hanh-vi/rang/chung.mjs";
import { luotCua } from "./luot-chay.mjs";

const LAI_RA_MAN = "_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs";

const CAY = [
	{
		file: "packages/ui/src/components/combobox.tsx",
		cu: "\tplaceholder,\n\tsearchPlaceholder,\n\tempty,\n",
		moi: '\tplaceholder = "Select an option",\n\tsearchPlaceholder = "Search…",\n\tempty = "Nothing matches.",\n',
		cho: [
			["packages/ui/src/components/combobox.tsx", "placeholder"],
			["packages/ui/src/components/combobox.tsx", "searchPlaceholder"],
			["packages/ui/src/components/combobox.tsx", "empty"],
		],
	},
	{
		file: "packages/ui/src/components/date-picker.tsx",
		cu: "\tplaceholder,\n",
		moi: '\tplaceholder = "Select a date",\n',
		cho: [["packages/ui/src/components/date-picker.tsx", "placeholder"]],
	},
	{
		file: "packages/ui/src/components/command.tsx",
		cu: "\ttitle,\n\tdescription,\n",
		moi: '\ttitle = "Command Palette",\n\tdescription = "Search for a command to run...",\n',
		cho: [
			["packages/ui/src/components/command.tsx", "title"],
			["packages/ui/src/components/command.tsx", "description"],
		],
	},
	{
		file: "packages/ui/src/components/async-action.tsx",
		cu: "\tsuccessLabel,\n\terrorLabel,\n",
		moi: '\tsuccessLabel = "Done",\n\terrorLabel = "Try again",\n',
		cho: [
			["packages/ui/src/components/async-action.tsx", "successLabel"],
			["packages/ui/src/components/async-action.tsx", "errorLabel"],
		],
	},
];

const DOI_CHUNG_AM = ["packages/ui/src/components/button.tsx", "variant"];

class KhongDoDuoc extends Error {}

function docPhanNhom(sao) {
	const tep = join(luotCua(sao), "phan-nhom.json");
	rmSync(tep, { force: true });
	const r = chay(sao, ["node", join(sao, LAI_RA_MAN), "phan-nhom"]);
	if (!existsSync(tep))
		throw new KhongDoDuoc(
			r.chu.includes("BO-VE-CHET")
				? `BO-VE-CHET: buoc ve thoat truoc khi phan nhom, khong cham tiep\n${r.chu.slice(-900)}`
				: `khong co tao pham phan-nhom.json moi o ${tep} — chan phan nhom chua chay tron`,
		);
	return JSON.parse(readFileSync(tep, "utf8"));
}

function co(nhom, file, thamSo) {
	return nhom.some((m) => m.file === file && m.tham_so === thamSo);
}

function doHaiChieu(sao) {
	let ma = 0;
	const sach = docPhanNhom(sao);
	const choDoi = CAY.flatMap((c) => c.cho);
	const lot = choDoi.filter(([f, t]) => co(sach.nguoi_doc, f, t));
	if (lot.length > 0) {
		for (const [f, t] of lot)
			console.error(`DO: vat lanh ma ${f} tham so ${t} van o nhom chu-nguoi-doc`);
		ma = 1;
	} else {
		console.log(
			`chieu xanh — vat lanh: ca ${choDoi.length} cho da va deu KHONG con o nhom chu-nguoi-doc.`,
		);
	}
	if (!co(sach.ky_thuat, DOI_CHUNG_AM[0], DOI_CHUNG_AM[1]))
		throw new KhongDoDuoc(
			`doi chung am ${DOI_CHUNG_AM[0]} tham so ${DOI_CHUNG_AM[1]} khong co trong nhom ky thuat — khong con vat de so.`,
		);
	console.log(
		`doi chung am: ${DOI_CHUNG_AM[0]} ${DOI_CHUNG_AM[1]} nam o nhom ky thuat, dung cho.`,
	);

	for (const c of CAY) {
		const duong = join(sao, c.file);
		const nguon = readFileSync(duong, "utf8");
		if (!nguon.includes(c.cu))
			throw new KhongDoDuoc(`khong cay duoc vao ${c.file} — moc da doi.`);
		writeFileSync(duong, nguon.replace(c.cu, c.moi));
	}
	console.log(
		`da cay ${choDoi.length} gia tri mac dinh tieng Anh tro lai, trong cay sao — cay lam viec khong bi cham.`,
	);

	const cay = docPhanNhom(sao);
	const sot = choDoi.filter(([f, t]) => !co(cay.nguoi_doc, f, t));
	if (sot.length > 0) {
		for (const [f, t] of sot)
			console.error(
				`DO: cay lai ${f}:${t} ma chan KHONG xep no vao nhom chu-nguoi-doc — phep phan biet khong bat duoc lop no sinh ra de bat.`,
			);
		ma = 1;
	} else {
		console.log(
			`chieu do — vat cay: ca ${choDoi.length} cho deu bi xep dung vao nhom chu-nguoi-doc.`,
		);
	}
	if (!co(cay.ky_thuat, DOI_CHUNG_AM[0], DOI_CHUNG_AM[1])) {
		console.error(
			`DO: doi chung am ${DOI_CHUNG_AM[0]} ${DOI_CHUNG_AM[1]} bi keo sang nhom chu-nguoi-doc — phep phan biet dang xep bua.`,
		);
		ma = 1;
	}
	return ma;
}

let ma = 2;
const { sao, don } = dungCaySao();
const luot = luotCua(sao);
const donHet = () => {
	rmSync(luot, { recursive: true, force: true });
	don();
};
const boNgat = khiBiNgat(donHet);
try {
	ma = doHaiChieu(sao);
} catch (loi) {
	const biet = loi instanceof KhongDoDuoc || loi instanceof RangLoi;
	console.error(`KHONG DO DUOC: ${biet ? loi.message : (loi?.stack ?? loi)}`);
	ma = 2;
} finally {
	boNgat();
	donHet();
	console.log("da don cay sao.");
}

if (ma === 0)
	console.log(
		"XANH: cap hai chieu tren cung mot vat — vat lanh sach, vat cay bi bat dung cho.",
	);
process.exit(ma);
