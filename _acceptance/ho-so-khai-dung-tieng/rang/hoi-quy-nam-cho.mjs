import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import { datDuGiaiDoan } from "./du-lieu-thu.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = process.env.APP_URL ?? "http://localhost:3000";

const CU = "_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs";
const CHAN = ["khai-tieng", "giai-doan"];

const cay = await canhCay();
for (const d of cay.dong) console.log(d);
if (cay.ket !== "dung-cay") {
	console.log(
		`RANG CUN: dau moc khong ve qua ${APP} — dang do MOT CAY KHAC.\n` +
			`   Cay dang xet: ${GOC}\n` +
			"   Khong doc mot con so nao tren may chu do.",
	);
	process.exit(2);
}
console.log(`-- CANH CAY: dau moc ve tu cay dang xet (${APP})`);

console.log(
	"-- HOI QUY nam cho khai dung TU TRUOC vong nay, sau khi chung chuyen sang\n" +
		"   ForeignText. Chay lai THUOC CU nguyen trang, khong sua mot dong nao cua no.\n" +
		"   Chay lai mot cai thuoc KHONG phai mo lai mot hop dong: thuoc la vat,\n" +
		"   hop dong la loi hua, va vong nay chi muon vat.",
);

const giaiDoan = await datDuGiaiDoan();
if (giaiDoan.thieu.length > 0) {
	console.log(
		`-- TIEN DE: du lieu thu thieu ${giaiDoan.thieu.length} giai doan (${giaiDoan.thieu.join(" · ")}),\n` +
			`   da muon ${giaiDoan.daDoi.length} thoa thuan de phu du, se tra ve nguyen trang sau luot chay.`,
	);
}

let hong = 0;
let tienDeThieu = 0;

for (const c of CHAN) {
	console.log(`\n===== CHAN CU: ${c} =====`);
	try {
		const ra = execFileSync("bun", [CU, c], {
			cwd: GOC,
			encoding: "utf8",
			env: process.env,
		});
		process.stdout.write(ra);
		console.log(`   CHAN ${c}: exit 0`);
	} catch (loi) {
		const ma = loi.status ?? 1;
		process.stdout.write(String(loi.stdout ?? ""));
		if (ma === 2) {
			console.log(
				`   CHAN ${c} ma 2 = TIEN DE THIEU (du lieu thu rong hoac may chu khong toi duoc).\n` +
					"   Day KHONG phai la dat, va cung khong phai la hoi quy.",
			);
			tienDeThieu += 1;
		} else {
			console.log(
				`   CHAN ${c} DO (ma ${ma}) tren MAN DANH SACH — nam cho cu da vo sau khi chuyen co che.`,
			);
			hong += 1;
		}
	}
}

console.log(
	`\nket qua: chan do=${hong} · tien de thieu=${tienDeThieu} (tren ${CHAN.length} chan cu)`,
);

await giaiDoan.don();
console.log("-- DA TRA du lieu thu ve nguyen trang");

if (tienDeThieu > 0) process.exit(2);
process.exit(hong > 0 ? 1 : 0);
