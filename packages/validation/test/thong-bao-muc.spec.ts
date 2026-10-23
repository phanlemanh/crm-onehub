import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { THU_TU_NHAC } from "@crm/db/onboarding-nhac";
import { LOAI_SU_KIEN, LOAI_THONG_BAO, MUC_THONG_BAO } from "../src/thong-bao";

const GOI = join(import.meta.dir, "..");
const GOC_KHO = join(GOI, "..", "..");

const BANG_THIET_KE = {
	"okr-cap-nhat": "can-lam",
	"okr-cho-duyet": "can-lam",
	"okr-tra-lai": "can-lam",
	"okr-hoi-y-gop": "can-lam",
	"okr-kr-im": "can-lam",
	"buoc-qua-han": "can-lam",
	"buoc-sap-han": "can-lam",
	"ke-hoach-im": "can-lam",
	"moc-ngay": "can-lam",
	"goi-y-ke-hoach": "can-lam",
	"viec-qua-han": "can-lam",
	"viec-sap-han": "can-lam",
	"viec-cho-danh-gia": "can-lam",
	"tai-lieu-cho-duyet": "can-lam",
	"ai-doi-soat-lech": "can-lam",
	"tac-nhan-can-tra-loi": "can-lam",
	"okr-duoc-giao": "de-biet",
	"okr-nhac-ten": "de-biet",
	"okr-ghi-nhan": "de-biet",
	"okr-hoi-y-cong-bo": "de-biet",
	"okr-theo-doi": "de-biet",
	"okr-tom-tat": "de-biet",
	"ai-tran": "de-biet",
	"tac-nhan-xong": "de-biet",
	"tac-nhan-hong": "de-biet",
	"tin-hieu-doi-cho": "de-biet",
} as const;

describe("tbk-muc", () => {
	test("tbk-muc: 1 — bang muc phu dung moi loai", () => {
		const khoa = Object.keys(MUC_THONG_BAO).sort();
		console.log(`tbk-muc 1: so loai ${LOAI_THONG_BAO.length}`);
		expect(khoa, "bang muc lech tap loai").toEqual([...LOAI_THONG_BAO].sort());
		expect(Object.keys(BANG_THIET_KE).sort()).toEqual(
			[...LOAI_THONG_BAO].sort(),
		);
	});

	test("tbk-muc: 2 — muc cua moi loai dung bang thiet ke", () => {
		for (const loai of LOAI_THONG_BAO) {
			expect(MUC_THONG_BAO[loai].muc, `muc lech bang thiet ke: ${loai}`).toBe(
				BANG_THIET_KE[loai],
			);
		}
	});

	test("tbk-muc: 3 — mac dinh kenh ngoai: nhac sang bat, su kien tat", () => {
		const nhacSang = new Set<string>(THU_TU_NHAC);
		for (const loai of LOAI_THONG_BAO) {
			if (nhacSang.has(loai)) {
				expect(
					MUC_THONG_BAO[loai].macDinhDayRa,
					`loai nhac sang mac dinh khong day: ${loai}`,
				).toBe(true);
			} else {
				expect(
					MUC_THONG_BAO[loai].macDinhDayRa,
					`loai su kien mac dinh day ra: ${loai}`,
				).toBe(false);
			}
		}
	});

	test("tbk-muc: 4 — nhac sang va su kien roi nhau, hop lai du moi loai", () => {
		const nhacSang = new Set<string>(THU_TU_NHAC);
		const suKien = new Set<string>(LOAI_SU_KIEN);
		console.log(
			`tbk-muc 4: nhac sang ${nhacSang.size} · su kien ${suKien.size}`,
		);
		const chung = [...suKien].filter((l) => nhacSang.has(l));
		expect(chung, "loai thuoc ca hai tap").toEqual([]);
		expect(
			[...nhacSang, ...suKien].sort(),
			"hai tap khong phu du loai",
		).toEqual([...LOAI_THONG_BAO].sort());
	});

	test("tbk-muc: 5 — them loai ma khong khai muc thi kiem tra kieu do", () => {
		const tam = mkdtempSync(join(tmpdir(), "tbk-muc-"));
		try {
			const tsc = join(GOC_KHO, "node_modules", ".bin", "tsc");
			const chep = (ten: string) => {
				const dich = join(tam, ten);
				cpSync(join(GOI, "src"), join(dich, "src"), { recursive: true });
				symlinkSync(join(GOI, "node_modules"), join(dich, "node_modules"));
				writeFileSync(
					join(dich, "tsconfig.json"),
					JSON.stringify({
						compilerOptions: {
							strict: true,
							noEmit: true,
							module: "Preserve",
							moduleResolution: "Bundler",
							target: "ES2022",
							skipLibCheck: true,
							types: [],
						},
						files: ["src/thong-bao.ts", "src/thong-bao-cau.ts"],
					}),
				);
				return dich;
			};
			const chay = (dich: string) =>
				spawnSync(tsc, ["-p", dich], { encoding: "utf8" });

			const nguyen = chay(chep("nguyen"));
			expect(
				nguyen.status,
				`ban chep nguyen ven khong qua tsc: ${nguyen.stdout}${nguyen.stderr}`,
			).toBe(0);

			const pha = chep("pha");
			const tep = join(pha, "src", "thong-bao.ts");
			writeFileSync(
				tep,
				readFileSync(tep, "utf8").replace(
					'"tin-hieu-doi-cho",\n] as const;',
					'"tin-hieu-doi-cho",\n\t"loai-thu-moi",\n] as const;',
				),
			);
			const kq = chay(pha);
			const ra = `${kq.stdout}${kq.stderr}`;
			expect(kq.status, "loai moi khong bi kiem kieu chan").not.toBe(0);
			expect(ra, "loai moi khong bi kiem kieu chan: loai-thu-moi").toContain(
				"loai-thu-moi",
			);
		} finally {
			rmSync(tam, { recursive: true, force: true });
		}
	});
});
