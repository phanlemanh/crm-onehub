export type TuyChonQuen = { quenMatKhau: boolean } | null;

export function duongQuenMatKhau(tuyChon: TuyChonQuen): "hien" | "/sign-in" {
	return tuyChon?.quenMatKhau ? "hien" : "/sign-in";
}
