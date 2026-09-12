import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { duongRa } from "./moi-mac-dinh.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");
const HERE = import.meta.dirname;

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

function docPhanNhom() {
	try {
		execFileSync("node", [join(HERE, "lai-ra-man.mjs"), "phan-nhom"], {
			cwd: GOC,
			stdio: "pipe",
		});
	} catch (e) {
		const ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
		if (ra.includes("BO-VE-CHET"))
			throw new Error(
				`BO-VE-CHET: buoc ve thoat truoc khi phan nhom, khong cham tiep\n${ra.slice(-900)}`,
			);
		const neo = (ra.match(/DO: tong ba nhom [^\n]*/) || [])[0];
		if (!neo)
			throw new Error(
				`KHONG DO DUOC: phan nhom thoat ${e.status ?? "khac 0"} vi ly do la\n${ra.slice(-900)}`,
			);
		console.log(`neo dan so lech vi ca nay co cay them gia tri — ${neo}`);
	}
	const duong = duongRa(GOC, "phan-nhom.json");
	if (!existsSync(duong))
		throw new Error(
			"KHONG DO DUOC: khong co tao pham phan-nhom.json sau luot chay — khong ket luan gi.",
		);
	return JSON.parse(readFileSync(duong, "utf8"));
}

function co(nhom, file, thamSo) {
	return nhom.some((m) => m.file === file && m.tham_so === thamSo);
}

const goc = new Map();
let ma = 0;
try {
	const sach = docPhanNhom();
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
	if (!co(sach.ky_thuat, DOI_CHUNG_AM[0], DOI_CHUNG_AM[1])) {
		throw new Error(
			`KHONG DO DUOC: doi chung am ${DOI_CHUNG_AM[0]} tham so ${DOI_CHUNG_AM[1]} khong co trong nhom ky thuat — khong con vat de so.`,
		);
	}
	console.log(
		`doi chung am: ${DOI_CHUNG_AM[0]} ${DOI_CHUNG_AM[1]} nam o nhom ky thuat, dung cho.`,
	);

	for (const c of CAY) {
		const duong = join(GOC, c.file);
		const nguon = readFileSync(duong, "utf8");
		if (!nguon.includes(c.cu)) {
			throw new Error(`KHONG DO DUOC: khong cay duoc vao ${c.file} — moc da doi.`);
		}
		goc.set(duong, nguon);
		writeFileSync(duong, nguon.replace(c.cu, c.moi));
	}
	console.log(`da cay ${choDoi.length} gia tri mac dinh tieng Anh tro lai.`);

	const cay = docPhanNhom();
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
} catch (e) {
	console.error(String(e.message ?? e));
	ma = String(e.message ?? "").startsWith("KHONG DO DUOC") ? 2 : 1;
} finally {
	for (const [duong, nguon] of goc) writeFileSync(duong, nguon);
	if (goc.size > 0) {
		console.log(`da tra lai ${goc.size} file ve nguyen trang.`);
		try {
			docPhanNhom();
			console.log("da dung lai tao pham tu cay nguyen trang.");
		} catch (e) {
			console.error(`khong dung lai duoc tao pham: ${String(e.message ?? e)}`);
			ma = ma === 0 ? 1 : ma;
		}
	}
}

if (ma === 0)
	console.log(
		"XANH: cap hai chieu tren cung mot vat — vat lanh sach, vat cay bi bat dung cho.",
	);
process.exit(ma);
