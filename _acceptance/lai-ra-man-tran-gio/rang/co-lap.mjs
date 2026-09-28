import { join } from "node:path";
import {
	chayBanSao,
	chup,
	docSpec,
	doiDich,
	epTranCa,
	GOC,
	ketCa,
	ketThuc,
	MocVang,
	soChup,
	thayDungSoLan,
} from "./ban-sao.mjs";
import { CAU_HINH } from "./cau-hinh.mjs";

const RA = join(GOC, CAU_HINH.raGoc, `E3-${process.pid}`);
const { lai, mo, chuoi } = CAU_HINH.tenCa;

function banSao(goc, thuMuc, tatDung) {
	const ep = epTranCa(doiDich(goc, thuMuc), lai, CAU_HINH.tranEpMs);
	return tatDung ? thayDungSoLan(ep, "luot.abort();", "", 2) : ep;
}

function chieuXanh(goc) {
	const thuMuc = join(RA, "xanh");
	const kq = chayBanSao(banSao(goc, thuMuc, false), "co-lap", thuMuc);
	const kLai = ketCa(kq, lai);
	if (kLai.xanh || kLai.loai !== "TimeoutError")
		return {
			ma: 2,
			dong: [
				`KHONG DO DUOC: tran ep ${CAU_HINH.tranEpMs} ms khong co tac dung — ca lai ${kLai.xanh ? "xanh" : `do vi ${kLai.loai}`}`,
			],
		};
	const dong = [
		`chieu xanh: ca lai do vi qua han (TimeoutError) sau tran ep ${CAU_HINH.tranEpMs} ms`,
	];
	let ma = 0;
	for (const t of [mo, chuoi]) {
		const k = ketCa(kq, t);
		if (k.xanh) dong.push(`chieu xanh: ${t} xanh`);
		else {
			ma = 1;
			dong.push(`ca sau do theo du da co tin hieu dung: ${t} (${k.loai})`);
		}
	}
	return { ma, dong };
}

function chieuDo(goc) {
	let soDo = 0;
	for (let i = 1; i <= CAU_HINH.lanDo; i += 1) {
		const thuMuc = join(RA, `do-${i}`);
		const kq = chayBanSao(banSao(goc, thuMuc, true), "co-lap-do", thuMuc);
		if (!ketCa(kq, chuoi).xanh) soDo += 1;
	}
	if (soDo === CAU_HINH.lanDo)
		return {
			ma: 0,
			dong: [
				`vong lai het gio van ve tiep: chuoi da va den man do theo (${soDo}/${CAU_HINH.lanDo})`,
			],
		};
	return {
		ma: 2,
		dong: [
			`KHONG DO DUOC: doi chung khong dua — bo tin hieu dung ma chuoi da va chi do ${soDo}/${CAU_HINH.lanDo}`,
		],
	};
}

const truoc = chup();
const dong = [];
let ma = 0;
try {
	const goc = docSpec();
	for (const buoc of [chieuXanh, chieuDo]) {
		const kq = buoc(goc);
		ma = Math.max(ma, kq.ma);
		dong.push(...kq.dong);
	}
} catch (e) {
	if (!(e instanceof MocVang)) throw e;
	ma = 2;
	dong.push(`KHONG DO DUOC: ${e.message}`);
} finally {
	const loi = soChup(truoc, chup());
	if (loi.length > 0) ma = 2;
	dong.push(...loi);
}
ketThuc(ma, dong);
