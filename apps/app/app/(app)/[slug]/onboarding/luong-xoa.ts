export type LuongXoa<T> = {
	dangHoi: T | null;
	soLanGoiXoa: number;
};

export function luongXoaMoi<T>(): LuongXoa<T> {
	return { dangHoi: null, soLanGoiXoa: 0 };
}

export function moHoi<T>(luong: LuongXoa<T>, muc: T): LuongXoa<T> {
	return { ...luong, dangHoi: muc };
}

export function huy<T>(luong: LuongXoa<T>): LuongXoa<T> {
	return { ...luong, dangHoi: null };
}

export function xacNhan<T>(
	luong: LuongXoa<T>,
	xoa: (muc: T) => void,
): LuongXoa<T> {
	if (luong.dangHoi === null) return luong;

	xoa(luong.dangHoi);
	return { dangHoi: null, soLanGoiXoa: luong.soLanGoiXoa + 1 };
}
