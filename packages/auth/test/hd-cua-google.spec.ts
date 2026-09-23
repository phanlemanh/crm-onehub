import { expect, test } from "bun:test";
import { join } from "node:path";

const GOI = join(import.meta.dir, "..");

const DOC_HD = [
	'const { auth } = await import("./src/auth");',
	"const hd = auth.options.socialProviders?.google?.hd ?? null;",
	"console.log(JSON.stringify({ hd }));",
].join("\n");

function hdKhiNap(danhSach: string): string | null {
	const ket = Bun.spawnSync(["bun", "-e", DOC_HD], {
		cwd: GOI,
		env: {
			...process.env,
			ALLOWED_SIGN_IN: danhSach,
			GOOGLE_CLIENT_ID: "hd-cua-google-client-id",
			GOOGLE_CLIENT_SECRET: "hd-cua-google-client-secret",
		},
	});
	const ra = ket.stdout.toString().trim().split("\n").at(-1) ?? "";
	if (ket.exitCode !== 0 || !ra.startsWith("{"))
		throw new Error(
			`khong nap duoc auth voi danh sach ${danhSach}: ${ket.stderr.toString()}`,
		);
	return (JSON.parse(ra) as { hd: string | null }).hd;
}

const BANG = [
	["onemount.com", "onemount.com"],
	["onemount.com,phanlemanh@gmail.com", null],
	["onemount.com,partner.com", null],
] as const;

test.each(BANG)("hd cua google theo danh sach %p", (danhSach, hd) => {
	expect([danhSach, hdKhiNap(danhSach)]).toEqual([danhSach, hd]);
});
