import { THAM_SO_KY_OKR } from "@crm/validation/okr-chu-ky";

export const SEARCH_PARAM = {
	list: {
		q: "q",
		sort: "sort",
		dir: "dir",
		page: "page",
		fields: "fields",
		archived: "archived",
	},
	record: {
		stack: "record",
		tab: "tab",
		add: "add",
		thread: "thread",
		timeline: "timeline",
		ngaySo: "ngaySo",
	},
	fieldsSheet: {
		entity: "manageFields",
		field: "manageField",
	},
	fieldsPage: {
		entity: "thucThe",
		field: "truong",
	},
	giaiDoan: {
		them: "themGiaiDoan",
		doiTen: "doiTenGiaiDoan",
		xoa: "xoaGiaiDoan",
	},
	dialog: {
		create: "new",
		switcher: "k",
		closeDeal: "closeDeal",
		closeStage: "closeStage",
	},
	overview: {
		scope: "scope",
	},
	deals: {
		view: "view",
	},
	toChuc: {
		don: "don",
		loc: "loc",
		chuyenOkr: "chuyenOkr",
	},
	onboarding: {
		trangThai: "trangThai",
		cachXem: "cachXem",
		cachChia: "cachChia",
	},
	okr: {
		ky: THAM_SO_KY_OKR,
		don: "donOkr",
		xem: "xemOkr",
		moChuKy: "moChuKy",
		moRa: "moRa",
		suaChuKy: "suaChuKy",
		luotGopY: "luotGopY",
		phuTrach: "phuTrachOkr",
		loai: "loaiOkr",
		trangThai: "trangThaiOkr",
		tuTin: "tuTinOkr",
		kr: "krOkr",
		tu: "tu",
		mau: "mau",
		hop: "hopOkr",
		moHoiY: "moHoiY",
	},
	taiLieu: {
		tab: "tabTaiLieu",
		loai: "loai",
		donVi: "donVi",
		chu: "chuTrang",
		nhom: "nhomDeXuat",
		tuDeXuat: "tuDeXuat",
	},
} as const;

export const RESERVED_SEARCH_PARAM_KEYS: ReadonlySet<string> = new Set(
	Object.values(SEARCH_PARAM).flatMap((group) => Object.values(group)),
);

export function assertUnreservedSearchParamKeys(
	keys: readonly string[],
	owner: string,
): void {
	const clashes = keys.filter((key) => RESERVED_SEARCH_PARAM_KEYS.has(key));
	if (clashes.length === 0) return;
	throw new Error(
		`[${owner}] search param keys already belong to another feature: ${clashes.join(", ")}. Two parsers on one key corrupt each other. Rename the key or add it to SEARCH_PARAM in lib/search-param-keys.ts.`,
	);
}
