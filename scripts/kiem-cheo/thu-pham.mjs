import { KIEM_CHEO } from "./cau-hinh.mjs";

const { chapChon, doSan, doMoi } = KIEM_CHEO.loaiDo;

async function lanVao(ungVien, coO) {
	for (let i = 0; i < ungVien.length; i++) {
		if (await coO(ungVien[i])) return i;
	}
	return ungVien.length - 1;
}

export async function phanLoai({ D, T, lanGop, chay, coO }) {
	if ((await chay(D)) === 0) return { loai: chapChon };
	const ungVien = lanGop.at(-1) === D ? [...lanGop] : [...lanGop, D];
	let lo = 0;
	if (await coO(T)) {
		if ((await chay(T)) !== 0) return { loai: doSan };
	} else {
		lo = await lanVao(ungVien, coO);
	}
	let hi = ungVien.length - 1;
	while (lo < hi) {
		const giua = (lo + hi) >> 1;
		if ((await chay(ungVien[giua])) !== 0) hi = giua;
		else lo = giua + 1;
	}
	return { loai: doMoi, lan_gop: ungVien[lo] };
}
