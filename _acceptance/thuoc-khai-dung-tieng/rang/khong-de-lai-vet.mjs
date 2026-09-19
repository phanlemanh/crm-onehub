import { db } from "../../../packages/db/src/index.ts";
import { kiemCsdlThu } from "../../ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs";
import { bang, chay, GOC, thoat } from "./chung.mjs";

const HOI_QUY = "_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs";

console.log(
	"-- Chan nay EP mot ngoai le that o GIUA luot chay cua hoi-quy-nam-cho.mjs:\n" +
		"-- KHOANH VUNG: anh chup BO tep mang tien to vat-thu, va phep dem vat con lai\n" +
		"   chi dem vat mang MOC cua chinh luot nay. Chup TOAN BO thoa thuan la khong\n" +
		"   chay song song duoc: mot chan do khac dang tao/xoa vat thu cua no se hien\n" +
		'   ra o day thanh "MOI SINH" — mot bao do gia. Do 19/09 khi chay hai chan cung luc.\n' +
		"   Tu 19/09, phep phu giai doan TAO thoa thuan moi thay vi MUON thoa thuan co\n" +
		"   san. Nen vet de lai khong con la mot ban ghi LECH ma la mot ban ghi THUA —\n" +
		"   nhanh MOI SINH duoi day bat dung cai do. Doi cach nay xoa luon hai lop hong:\n" +
		"   hai luot chay song song khong con gianh nhau mot ban ghi, va khong ban ghi\n" +
		"   THAT nao bi cham du chuyen gi xay ra.\n" +
		"   sau khi no da muon thoa thuan that, truoc khi no tra. Roi doi chieu trang\n" +
		"   thai TRUOC/SAU cua tung ban ghi. Mot kich ban muon ban ghi THAT trong CSDL\n" +
		"   dev ma khong co try/finally se de lai vet moi lan no chet giua chung.",
);

const MOC = `docl${Date.now().toString(36)}`;
const TIEN_TO_VAT = "Vat Thu";

async function chup() {
	const ra = await db.deal.findMany({
		select: { id: true, stage: true, name: true },
	});
	return new Map(
		ra
			.filter((d) => !d.name.startsWith(TIEN_TO_VAT))
			.map((d) => [d.id, d.stage]),
	);
}

const truoc = await chup();
if (truoc.size === 0) {
	await db.$disconnect();
	thoat(2, "KHONG DO DUOC: khong co thoa thuan nao trong CSDL de doi chieu.");
}
console.log(`-- Chup TRUOC: ${truoc.size} thoa thuan.`);

const r = chay("bun", [HOI_QUY], {
	cwd: GOC,
	env: { RANG_EP_LOI: "1", RANG_MOC: MOC },
});
console.log(`-- Luot bi ep loi thoat ma ${r.ma}.`);

const daTao = /da TAO (\d+) thoa thuan/.exec(r.ra);
const soTao = daTao ? Number(daTao[1]) : 0;
const coEpLoi = r.ra.includes("RANG_EP_LOI=1");

console.log(
	"-- BA TIEN DE cua phep do nay, kiem TRUOC khi doc bat ky con so nao:\n" +
		`     (1) luot chay phai THOAT KHAC 0: ${r.ma}\n` +
		`     (2) no phai da TAO that su: ${soTao} thoa thuan\n` +
		`     (3) no phai chet vi DUNG loi ta ep: ${coEpLoi ? "dung" : "khong"}`,
);

if (r.ma === 0 || soTao === 0 || !coEpLoi) {
	await db.$disconnect();
	thoat(
		2,
		"KHONG DO DUOC — mot tien de hong, va ket qua 0-ban-ghi-lech duoi day se la",
		"   mau XANH GIA: mot luot chay chet vi loi cu phap, hoac khong muon ban ghi",
		"   nao, thi tat nhien khong de lai vet. Vang-vi-dung va vang-vi-chua-toi-noi",
		"   la hai chuyen khac nhau ma cung mot bieu thuc boolean.",
		`   Neu so tao = 0: du lieu thu dang phu du enum, khong co gi de tao —`,
		`   dung tap du lieu thieu it nhat mot giai doan roi chay lai.`,
		r.ra
			.split("\n")
			.slice(-14)
			.map((d) => `     ${d}`)
			.join("\n"),
	);
}

const sau = await chup();
await db.$disconnect();

const hang = [];
let hong = 0;

for (const [id, giaiDoan] of truoc) {
	const nay = sau.get(id);
	if (nay === undefined) {
		hang.push(
			`MAT HAN     [ban-ghi-that-con-lech:${id}] truoc=${giaiDoan}, sau=(khong con)`,
		);
		hong += 1;
	} else if (nay !== giaiDoan) {
		hang.push(
			`CON LECH    [ban-ghi-that-con-lech:${id}] truoc=${giaiDoan}, sau=${nay}`,
		);
		hong += 1;
	} else {
		hang.push(`nguyen ven  ${id} ${giaiDoan}`);
	}
}
for (const id of sau.keys()) {
	if (!truoc.has(id)) {
		hang.push(
			`MOI SINH    [ban-ghi-that-con-lech:${id}] khong co truoc luot chay`,
		);
		hong += 1;
	}
}

bang(`-- ${hang.length} ban ghi da doi chieu, goi ten tung cai:`, hang);
console.log(`ket qua: ${hong} ban ghi that con lech tren ${truoc.size}`);
process.exit(hong > 0 ? 1 : 0);
