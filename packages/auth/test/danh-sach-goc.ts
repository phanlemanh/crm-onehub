import { afterAll } from "bun:test";

export function traLaiDanhSachSauTep(): void {
	const goc = process.env.ALLOWED_SIGN_IN;

	afterAll(() => {
		if (goc === undefined) delete process.env.ALLOWED_SIGN_IN;
		else process.env.ALLOWED_SIGN_IN = goc;
	});
}
