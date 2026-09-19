import { DOT_BIEN } from "../../ho-so-khai-dung-tieng/rang/bang-dot-bien.mjs";
import { bang, chay, GOC, thoat } from "./chung.mjs";

function khoa(d) {
	return JSON.stringify([d.do.lenh, d.do.doi_so, d.do.duoi ?? ""]);
}

const lenhRieng = new Map();
for (const d of DOT_BIEN) {
	if (!lenhRieng.has(khoa(d))) lenhRieng.set(khoa(d), d.do);
}

console.log(
	`-- ${DOT_BIEN.length} dot bien, doc TU bang-dot-bien.mjs — khong go lai danh sach thu hai.\n` +
		`   ${lenhRieng.size} lenh rieng biet: dot bien dung chung mot lenh thi dung chung mot luot chay.\n` +
		"-- LUAT: chuoi ghim phai VANG o luot LANH. Co mat o luot lanh nghia la phep kiem\n" +
		'   "thong diep co chua ghim khong" luon tra CO, nen no khong chot gi ca.',
);

const raTheoLenh = new Map();
for (const [k, lenh] of lenhRieng) {
	const r = chay(lenh.lenh, lenh.doi_so, {
		cwd: lenh.duoi ? `${GOC}/${lenh.duoi}` : GOC,
	});
	if (r.ma !== 0) {
		thoat(
			2,
			`KHONG DO DUOC: lenh lanh thoat ${r.ma}, le ra phai 0 tren cay sach.`,
			`   lenh: ${lenh.lenh} ${lenh.doi_so.join(" ")}${lenh.duoi ? ` (duoi ${lenh.duoi})` : ""}`,
			"   Mot lenh do tren cay lanh khong phai ket qua do — no la tien de hong.",
			"   Thuong la may chu dev chua chay cho cay nay (canh cay thoat 2).",
			r.ra.split("\n").slice(-12).map((d) => `     ${d}`).join("\n"),
		);
	}
	raTheoLenh.set(k, r.ra);
}

const hang = [];
let hong = 0;

for (const d of DOT_BIEN) {
	const ra = raTheoLenh.get(khoa(d));
	const coOLuotLanh = ra.includes(d.ghim);
	if (coOLuotLanh) hong += 1;
	hang.push(
		`${coOLuotLanh ? "KHONG PHAN BIET" : "phan biet duoc"} ${d.chan.padEnd(4)} ${JSON.stringify(d.ghim)}`,
	);
}

bang(`-- ${DOT_BIEN.length} chuoi ghim:`, hang);

if (hong > 0) {
	console.log(
		"   Cach sua: cho chan do in mot NHAN chi khi no do (vd \"lech-boc:<ten>\"),\n" +
			"   roi lay dung nhan do lam chuoi ghim. Ten chan thi in o moi luot chay.",
	);
}

console.log(
	`ket qua: ${hong} chuoi ghim KHONG phan biet duoc tren ${DOT_BIEN.length}`,
);
process.exit(hong > 0 ? 1 : 0);
