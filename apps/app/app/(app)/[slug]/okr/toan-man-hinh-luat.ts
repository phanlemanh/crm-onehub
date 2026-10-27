export type BuocEsc = "nhuong" | "dong-the" | "thoat";

export function buocEsc(vao: {
	tuXuLy: boolean;
	lopMo: boolean;
	theDonViMo: boolean;
}): BuocEsc {
	if (vao.tuXuLy || vao.lopMo) return "nhuong";
	if (vao.theDonViMo) return "dong-the";
	return "thoat";
}

const DUONG_SO_DO = /\/okr\/so-do(?:\/muc-tieu\/[^/]+)?\/?$/;

export function laDuongSoDo(duong: string): boolean {
	return DUONG_SO_DO.test(duong);
}

const BO_CHON_LOP_MO = [
	"[role=dialog][data-state=open]",
	"[role=alertdialog][data-state=open]",
	"[role=menu][data-state=open]",
].join(",");

export function lopDangMo(doc: Document): boolean {
	return doc.querySelector(BO_CHON_LOP_MO) !== null;
}
