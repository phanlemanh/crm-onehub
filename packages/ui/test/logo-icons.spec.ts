import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON_ONEHUB } from "../scripts/logo-icons-config";
import { docIco, GOC_KHO, sinhBoIcon } from "../scripts/logo-icons-lib";
import { type AnhRgba, dat, docAnh, NGUONG_LOGO } from "./logo-raster";

const CLI = fileURLToPath(new URL("../scripts/logo-icons.ts", import.meta.url));
const { trongKho, ngoaiKho, ico } = ICON_ONEHUB;
const CHO_ANH_NGOAI_LAC = ["", "apps/app/public", "packages/ui"];

function docTep(duong: string): Uint8Array {
	return new Uint8Array(readFileSync(join(GOC_KHO, duong)));
}

function giongTungByte(a: Uint8Array, b: Uint8Array): boolean {
	return a.length === b.length && a.every((v, i) => v === b[i]);
}

function kiemDucNenTrang(anh: AnhRgba, ten: string): void {
	let minAlpha = 255;
	for (let i = 3; i < anh.data.length; i += 4)
		minAlpha = Math.min(minAlpha, anh.data[i] ?? 0);
	dat(minAlpha === 255, `${ten} khong duc: alpha nho nhat ${minAlpha}`);
	for (const [x, y] of [
		[0, 0],
		[anh.rong - 1, 0],
		[0, anh.cao - 1],
		[anh.rong - 1, anh.cao - 1],
	] as const) {
		const i = (y * anh.rong + x) * 4;
		const trang = [0, 1, 2].every((k) => anh.data[i + k] === 255);
		dat(trang, `${ten} goc (${x},${y}) khong trang`);
	}
}

function kiemVungAnToan(anh: AnhRgba, ten: string): void {
	const tam = anh.rong / 2;
	const banKinh = anh.rong * NGUONG_LOGO.banKinhAnToan;
	let xaNhat = 0;
	for (let y = 0; y < anh.cao; y++) {
		for (let x = 0; x < anh.rong; x++) {
			const i = (y * anh.rong + x) * 4;
			const lech = Math.max(
				...[0, 1, 2].map((k) => 255 - (anh.data[i + k] ?? 0)),
			);
			if (lech <= NGUONG_LOGO.lechNenTrang) continue;
			xaNhat = Math.max(xaNhat, Math.hypot(x + 0.5 - tam, y + 0.5 - tam));
		}
	}
	console.log(
		`${ten}: diem xa tam nhat ${xaNhat.toFixed(1)} / ban kinh an toan ${banKinh}`,
	);
	dat(
		xaNhat <= banKinh,
		`${ten} ngoai vung an toan: ${xaNhat.toFixed(1)} > ${banKinh}`,
	);
}

async function kiemCo(
	noiDung: Uint8Array,
	canh: number,
	ten: string,
): Promise<AnhRgba> {
	const anh = await docAnh(noiDung);
	dat(
		anh.rong === canh && anh.cao === canh,
		`${ten} la ${anh.rong}x${anh.cao}, can ${canh}x${canh}`,
	);
	return anh;
}

describe("bo icon trong kho", () => {
	test("kich-thuoc: hai favicon.ico giong tung byte", () => {
		dat(
			giongTungByte(docTep(trongKho.icoApp), docTep(trongKho.icoPublic)),
			"hai favicon.ico khac nhau",
		);
	});

	test("kich-thuoc: favicon.ico chua dung 16 32 48", async () => {
		const anh = docIco(docTep(trongKho.icoApp));
		const co = anh.map((a) => a.canh).sort((a, b) => a - b);
		const thieu = ico.filter((c) => !co.includes(c));
		dat(thieu.length === 0, `ico thieu ${thieu.join(", ")}`);
		dat(co.length === ico.length, `ico co ${co.length} anh, can ${ico.length}`);
		for (const a of anh)
			await kiemCo(a.png, a.canh, `anh ${a.canh}px trong favicon.ico`);
	});

	test("kich-thuoc: favicon-96x96.png", async () => {
		await kiemCo(
			docTep(trongKho.png96.duong),
			trongKho.png96.canh,
			"favicon-96x96.png",
		);
	});

	test("kich-thuoc: apple-touch-icon duc nen trang", async () => {
		const anh = await kiemCo(
			docTep(trongKho.apple.duong),
			trongKho.apple.canh,
			"apple-touch-icon.png",
		);
		kiemDucNenTrang(anh, "apple-touch-icon.png");
	});

	for (const m of [trongKho.manifest192, trongKho.manifest512]) {
		test(`kich-thuoc: ${m.duong} maskable`, async () => {
			const anh = await kiemCo(docTep(m.duong), m.canh, m.duong);
			kiemDucNenTrang(anh, m.duong);
			kiemVungAnToan(anh, m.duong);
		});
	}

	test("kich-thuoc: favicon.svg vuong va co dai mau", () => {
		const svg = new TextDecoder().decode(docTep(trongKho.svg));
		const vb =
			svg
				.match(/viewBox="([^"]+)"/)?.[1]
				?.split(/\s+/)
				.map(Number) ?? [];
		dat(
			vb.length === 4 && vb[2] === vb[3],
			`viewBox khong vuong: ${vb.join(" ")}`,
		);
		dat(
			svg.includes('stop-color="#0045FF"') &&
				svg.includes('stop-color="#02D7FF"'),
			"favicon.svg thieu dai mau",
		);
	});
});

describe("bo icon khop nguon", () => {
	test("tuoi", async () => {
		const sinh = await sinhBoIcon();
		expect(sinh.length).toBe(7);
		for (const t of sinh) {
			const trongKhoNay = docTep(t.duong);
			if (t.duong.endsWith(".svg")) {
				dat(giongTungByte(trongKhoNay, t.noiDung), `${t.ten} lech nguon`);
				continue;
			}
			const cap = t.duong.endsWith(".ico")
				? docIco(trongKhoNay).map(
						(a, i) => [a.png, docIco(t.noiDung)[i]?.png] as const,
					)
				: [[trongKhoNay, t.noiDung] as const];
			for (const [kho, moi] of cap) {
				dat(moi !== undefined, `${t.ten} lech nguon: so anh khac`);
				const a = await docAnh(kho);
				const b = await docAnh(moi ?? new Uint8Array());
				dat(
					a.rong === b.rong && a.cao === b.cao,
					`${t.ten} lech nguon: co khac`,
				);
				let lech = 0;
				let lonNhat = 0;
				for (let i = 0; i < a.data.length; i += 4) {
					const d = Math.max(
						...[0, 1, 2, 3].map((k) =>
							Math.abs((a.data[i + k] ?? 0) - (b.data[i + k] ?? 0)),
						),
					);
					lonNhat = Math.max(lonNhat, d);
					if (d > 0) lech++;
				}
				const tiLe = lech / (a.data.length / 4);
				console.log(
					`${t.ten} ${a.rong}px: ${lech} diem lech, lon nhat ${lonNhat}`,
				);
				dat(
					lonNhat <= NGUONG_LOGO.lechKenhToiDa &&
						tiLe <= NGUONG_LOGO.tiLeDiemLechToiDa,
					`${t.ten} lech nguon`,
				);
			}
		}
	});
});

describe("manifest", () => {
	test("manifest", () => {
		const m = JSON.parse(
			readFileSync(join(GOC_KHO, "apps/app/public/site.webmanifest"), "utf8"),
		);
		dat(m.name === "OneHub CRM", `name la ${m.name}`);
		dat(m.short_name === "OneHub", `short_name la ${m.short_name}`);
		const co = m.icons.map(
			(i: { sizes: string; purpose: string }) => `${i.sizes}:${i.purpose}`,
		);
		expect(co).toEqual(["192x192:maskable", "512x512:maskable"]);
	});
});

describe("xuat-ngoai", () => {
	function bamTepDich(): string[] {
		const dich = [
			trongKho.icoApp,
			trongKho.icoPublic,
			trongKho.svg,
			trongKho.png96.duong,
			trongKho.apple.duong,
			trongKho.manifest192.duong,
			trongKho.manifest512.duong,
		];
		return dich.map(
			(d) => `${d}:${createHash("sha256").update(docTep(d)).digest("hex")}`,
		);
	}

	function anhNgoaiLacVaoKho(): string[] {
		return CHO_ANH_NGOAI_LAC.flatMap((thuMuc) =>
			[ngoaiKho.slack, ngoaiKho.zalo, ngoaiKho.google]
				.map((anh) => join(thuMuc, anh.ten))
				.filter((d) => existsSync(join(GOC_KHO, d))),
		);
	}

	test("xuat-ngoai: ba anh dung co vao thu muc ngoai kho, kho khong doi", async () => {
		const thuMuc = mkdtempSync(join(tmpdir(), "logo-onehub-"));
		try {
			const truoc = bamTepDich();
			const chay = Bun.spawnSync([process.execPath, CLI, "--external", thuMuc]);
			dat(
				chay.exitCode === 0,
				`CLI thoat ${chay.exitCode}: ${chay.stderr.toString()}`,
			);
			for (const anh of [ngoaiKho.slack, ngoaiKho.zalo, ngoaiKho.google]) {
				const noiDung = new Uint8Array(readFileSync(join(thuMuc, anh.ten)));
				const rgba = await kiemCo(noiDung, anh.canh, anh.ten);
				kiemDucNenTrang(rgba, anh.ten);
				if (anh === ngoaiKho.zalo) kiemVungAnToan(rgba, anh.ten);
				if (anh === ngoaiKho.google)
					dat(noiDung.length < 1024 * 1024, `${anh.ten} tu 1MB tro len`);
			}
			const sau = bamTepDich();
			const doi = sau
				.filter((b, i) => b !== truoc[i])
				.map((b) => b.split(":")[0]);
			dat(
				doi.length === 0,
				`luot xuat ngoai ghi de tep icon trong kho: ${doi.join(", ")}`,
			);
			const lac = anhNgoaiLacVaoKho();
			dat(lac.length === 0, `anh ngoai ghi vao kho: ${lac.join(", ")}`);
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
		}
	});

	test("xuat-ngoai: --external khong co thu muc thi tu choi", () => {
		const chay = Bun.spawnSync([process.execPath, CLI, "--external"]);
		dat(chay.exitCode !== 0, "CLI nhan --external trong ma khong tu choi");
		expect(chay.stderr.toString()).toContain("--external can mot thu muc");
	});
});
