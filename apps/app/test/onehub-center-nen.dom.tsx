import { describe, expect, it, mock } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("@/lib/locale/server", () => ({
	getLocale: async () => "vi" as const,
}));

const { AuthShell } = await import("@/components/auth-shell");
const GOC = join(import.meta.dir, "..", "..", "..");

async function cotTrai(coKhoi: boolean): Promise<Element | undefined> {
	const o = document.createElement("div");
	o.innerHTML = renderToStaticMarkup(
		await AuthShell({
			children: <p />,
			gioiThieu: coKhoi ? <div data-khoi-huong-dan="" /> : undefined,
		}),
	);
	return [...o.querySelectorAll("main > section")].find((s) =>
		s.className.includes("bg-muted"),
	);
}

function nhapAuthShader(): string {
	const ra = spawnSync(
		"git",
		[
			"-C",
			GOC,
			"grep",
			"-l",
			"-e",
			'components/auth-shader"',
			"--",
			"apps/app",
			":(exclude)apps/app/test",
		],
		{ encoding: "utf8" },
	);
	if (ra.status === 1) return "";
	if (ra.status !== 0) {
		throw new Error(`git grep hong (ma ${ra.status}): ${ra.stderr}`);
	}
	return ra.stdout;
}

describe("nen luoi cham", () => {
	for (const coKhoi of [true, false]) {
		it(`cot trai co luoi-cham (${coKhoi ? "sign-in" : "bon trang kia"})`, async () => {
			const luoi =
				(await cotTrai(coKhoi))?.querySelectorAll("[data-slot=luoi-cham]") ??
				[];
			expect(luoi.length, "khong co luoi-cham").toBe(1);
			expect(luoi[0]?.getAttribute("aria-hidden")).toBe("true");
		});
	}

	it("auth-shader.tsx da xoa", () => {
		expect(
			existsSync(join(GOC, "apps/app/components/auth-shader.tsx")),
			"auth-shader.tsx van con",
		).toBe(false);
	});

	it("doi chung: git grep that tim thay mot tep nhap co that", () => {
		const ra = spawnSync(
			"git",
			[
				"-C",
				GOC,
				"grep",
				"-l",
				"-e",
				'components/auth-shell"',
				"--",
				"apps/app",
				":(exclude)apps/app/test",
			],
			{ encoding: "utf8" },
		);
		expect(ra.status, "git grep khong chay").toBe(0);
		expect(
			ra.stdout.trim().length,
			"doi chung khong tim thay auth-shell",
		).toBeGreaterThan(0);
	});

	it("khong tep nao nhap auth-shader", () => {
		expect(nhapAuthShader().trim(), "con nhap auth-shader").toBe("");
	});

	it("luoi-cham khong mau viet cung", () => {
		const nguon = readFileSync(
			join(GOC, "packages/ui/src/components/luoi-cham.tsx"),
			"utf8",
		);
		expect(nguon).not.toMatch(
			/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(\s*[0-9]/i,
		);
	});
});
