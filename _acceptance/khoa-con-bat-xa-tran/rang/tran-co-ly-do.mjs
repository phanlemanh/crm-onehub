import { loiGoiTest } from "./chung.mjs";

export const TRAN_CO_LY_DO = {
	TRAN_MA_TRAN_MS:
		"d-20260927T112853Z-28 (tro-ly-okr-nen S4-r1): go-la-cat-quyen het tran 5 giay duoi tai S4; chu kho chon giu tran co ly do 13/10 (F24, P7-6)",
};

export function xetTran(spec, ca) {
	if (ca.doiSo.length === 2) return { dat: true, ten: null };
	if (ca.doiSo.length !== 3)
		return { dat: false, chu: `${ca.doiSo.length} doi so` };
	const ten = ca.doiSo[2];
	const lyDo = Object.hasOwn(TRAN_CO_LY_DO, ten) ? TRAN_CO_LY_DO[ten] : null;
	if (!lyDo)
		return { dat: false, ten, chu: `tran ${ten} khong nam trong bang tran co ly do` };
	if (!new RegExp(`^const ${ten} = [0-9_]+;$`, "m").test(spec))
		return { dat: false, ten, chu: `hang ${ten} khong khai trong tep spec` };
	return { dat: true, ten, lyDo };
}

export function soTranRieng(spec) {
	const hong = loiGoiTest(spec)
		.map((ca) => ({ ca, x: xetTran(spec, ca) }))
		.filter(({ x }) => !x.dat)
		.map(({ ca, x }) => `test ${ca.ten} co tran rieng: ${x.chu}`);
	return { dat: hong.length === 0, chu: hong.join("; ") || "moi tran rieng deu co ly do" };
}
