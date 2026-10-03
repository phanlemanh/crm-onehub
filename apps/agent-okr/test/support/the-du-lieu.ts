import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";
import { LOP } from "../../agent/lib/goi-soan";
import { CAU_CHEN, THE_CHEN } from "./gieo-goi";

const THE = TRO_LY_OKR_SOAN.goi.the;
export const MO_LOP_5 = `<${THE} lop="0-5">`;
const DONG = `</${THE}>`;

export function loiBocLop5(chu: string): string[] {
	const mo = chu.indexOf(MO_LOP_5);
	if (mo < 0) return ["thieu the lop 0-5"];
	const dong = chu.indexOf(DONG, mo);
	const loi: string[] = [];
	let chen = chu.indexOf(CAU_CHEN);
	if (chen < 0) loi.push("cau chen khong toi mo hinh");
	while (chen >= 0) {
		if (chen < mo || chen > dong) loi.push(`cau chen ngoai the o ${chen}`);
		chen = chu.indexOf(CAU_CHEN, chen + 1);
	}
	const soDong = chu.slice(mo).split(DONG).length - 1;
	if (soDong !== LOP.length) loi.push(`the dong som: ${soDong}`);
	for (const l of LOP) {
		const soMo = chu.split(`<${THE} lop="${l}">`).length - 1;
		if (soMo !== 1) loi.push(`the mo lop ${l}: ${soMo}`);
	}
	if (chu.includes(THE_CHEN)) loi.push("the chen con nguyen");
	return loi;
}
