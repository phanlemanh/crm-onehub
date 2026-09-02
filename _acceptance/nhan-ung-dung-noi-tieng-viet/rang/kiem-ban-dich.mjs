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

const hong = thieuKhai.length + chuaDich.length;
console.log(`ket qua: dong hong=${hong}`);
process.exit(hong > 0 ? 1 : 0);
