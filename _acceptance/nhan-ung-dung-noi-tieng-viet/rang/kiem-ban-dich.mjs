import { readFileSync } from "node:fs";

const FILE = "_acceptance/nhan-ung-dung-noi-tieng-viet/ban-dich.md";
const src = readFileSync(FILE, "utf8");

const DAU_TIENG_VIET =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;

function mucNgoaiLe() {
	const mo = src.indexOf("## Ngoại lệ khỏi luật dấu tiếng Việt");
	if (mo === -1) return null;
	const sau = src.indexOf("\n## ", mo + 1);
	return src.slice(mo, sau === -1 ? undefined : sau);
}

const ngoaiLe = mucNgoaiLe();
if (ngoaiLe === null) {
	console.log("RANG CUN: khong tim thay muc ngoai le trong ban dich");
	process.exit(2);
}

const ngoaiMucNgoaiLe = src.replace(ngoaiLe, "");
const dong = [...ngoaiMucNgoaiLe.matchAll(/^\| `([^`]+)` \| (.+?) \| (.+?) \|/gm)].map(
	([, khoa, en, vi]) => ({ khoa, en, vi }),
);

if (dong.length === 0) {
	console.log("RANG CUN: khong doc duoc dong dich nao — khuon bang da doi?");
	process.exit(2);
}

const khaiNgoaiLe = (khoa) => {
	if (ngoaiLe.includes(`\`${khoa}\``)) return true;
	const nhom = khoa.split(".")[0];
	return ngoaiLe.includes(`\`${nhom}.*\``);
};

const khongDau = dong.filter((d) => !DAU_TIENG_VIET.test(d.vi));
const thieuKhai = khongDau.filter((d) => !khaiNgoaiLe(d.khoa));

const trung = new Map();
for (const d of dong) {
	if (!trung.has(d.vi)) trung.set(d.vi, []);
	trung.get(d.vi).push(d.khoa);
}
const chungGiaTri = [...trung].filter(([, ks]) => ks.length > 1);

const chuaDich = dong.filter((d) => d.vi === d.en && !khaiNgoaiLe(d.khoa));

console.log(`-- ban dich: ${dong.length} dong`);
console.log(`-- khong mang dau tieng Viet: ${khongDau.length}`);
console.log(`-- trong do CHUA KHAI ngoai le: ${thieuKhai.length}`);
for (const d of thieuKhai) console.log(`   THIEU KHAI  ${d.khoa} -> ${JSON.stringify(d.vi)}`);
console.log(`-- giong het ban tieng Anh ma khong khai: ${chuaDich.length}`);
for (const d of chuaDich) console.log(`   CHUA DICH   ${d.khoa} -> ${JSON.stringify(d.vi)}`);
console.log(`-- gia tri dung chung nhieu khoa: ${chungGiaTri.length} (binh thuong khi cung nghia)`);

const KHO = [
	"apps/app/lib/messages/companies.ts",
	"apps/app/lib/messages/contacts.ts",
	"apps/app/lib/messages/deals.ts",
	"apps/app/lib/messages/crm.ts",
	"apps/app/lib/messages/record-sheet.ts",
];

function khoaTrongKho(goc) {
	const cat =
		goc.indexOf("\n\tvi: {") >= 0
			? goc.indexOf("\n\tvi: {")
			: goc.indexOf("\nconst vi = {");
	const ra = [];
	const ngan = [];
	for (const line of goc.slice(0, cat).split("\n")) {
		const mo = line.match(/^(\t+)(\w+): \{$/);
		if (mo) {
			const sau = mo[1].length;
			ngan.length = Math.max(0, sau - 1);
			ngan[sau - 1] = mo[2];
			continue;
		}
		const la = line.match(/^(\t+)(\w+)[:(]/);
		if (!la) continue;
		const sau = la[1].length;
		const d = [...ngan.slice(0, sau - 1), la[2]].filter(Boolean);
		if (d[0] === "en" || d[0] === "vi") d.shift();
		if (d.length > 0) ra.push(d.join("."));
	}
	return [...new Set(ra)];
}

const daKhai = new Set(dong.map((d) => d.khoa));

function hopLe(k) {
	const phan = k.split(".");
	const ra = [k];
	if (phan.length >= 2) ra.push(phan.slice(-2).join("."));
	if (phan.length === 1) ra.push(phan[0]);
	return ra;
}

const NGOAI_KHO = "apps/app/lib/deal-stage.ts";

const moiKhoaKho = [];
for (const m of readFileSync(NGOAI_KHO, "utf8").matchAll(
	/^\t(\w+): \{ label: "/gm,
)) {
	moiKhoaKho.push({ file: "deal-stage.ts", khoa: `stage.${m[1]}` });
}
for (const f of KHO) {
	for (const k of khoaTrongKho(readFileSync(f, "utf8"))) {
		moiKhoaKho.push({ file: f.split("/").pop(), khoa: k });
	}
}

const chuaCoDong = [];
for (const { file, khoa } of moiKhoaKho) {
	if (!hopLe(khoa).some((x) => daKhai.has(x))) {
		chuaCoDong.push(`${file}:${khoa}`);
	}
}

const phuDuoc = new Set();
for (const { khoa } of moiKhoaKho) for (const x of hopLe(khoa)) phuDuoc.add(x);
const dongThua = dong
	.map((d) => d.khoa)
	.filter((k) => !k.includes("*") && !phuDuoc.has(k));

console.log(
	`-- chieu 1, kho -> bang: ${chuaCoDong.length} khoa khong co dong nao (khop bang duong day du hoac hai doan cuoi, khong khop bang hau to bat ky)`,
);
for (const k of chuaCoDong) console.log(`   CHUA KHAI   ${k}`);
console.log(
	`-- chieu 2, bang -> kho: ${dongThua.length} dong ta mot khoa khong con trong kho chuoi nao`,
);
for (const k of dongThua) console.log(`   DONG THUA   ${k}`);

const hong = thieuKhai.length + chuaDich.length + chuaCoDong.length + dongThua.length;
console.log(`ket qua: dong hong=${hong}`);
process.exit(hong > 0 ? 1 : 0);
