# Trang Lộ trình trong CRM — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang `/[slug]/lo-trinh` chỉ đọc, theo khung danh sách của Thoả thuận, cho trưởng phòng ban thấy mỗi việc
của lộ trình kho đang ở đâu, hẹn mốc nào, còn bao lâu hay đã trễ.

**Architecture:** Trang máy chủ đọc `LO-TRINH.html` mang theo trong bản dựng, rút khối bằng bản chép nguyên văn
`docDuLieu` của kit, phân tích một lần bằng khuôn Zod ở `packages/validation`, rồi đưa dữ liệu thường cho thành
phần khách. Thành phần khách dựng danh sách bằng `DataTable` và `Board` dùng chung, tham số trên đường dẫn qua
`nuqs`, và chỉ tự làm một việc: so ngày mốc với hôm nay của người xem.

**Tech Stack:** Next (apps/app, `cacheComponents`), React 19, `@crm/ui` (DataTable, Board, Sheet, Timeline ReUI),
`nuqs`, Zod 4, Bun test (`*.spec.ts`, `*.dom.tsx`), puppeteer-core cho đo màn.

**Spec:** `docs/superpowers/specs/2026-10-09-trang-lo-trinh-trong-crm-design.md` · hợp đồng
`_acceptance/trang-lo-trinh-trong-crm/contract.md` (14 AC) · phép đo `evals.yaml` (17 eval) · bản mẫu đã duyệt
`apps/app/app/proto/_modules/trang-lo-trinh-trong-crm/` (nguồn tham chiếu cho mọi phần giao diện).

Bản mẫu không nằm trên `onehub`: gộp hồ sơ trước khi có mã thì phép kiểm trước-gộp chặn mã bản mẫu, nên nó được
tách ra và giữ ở thẻ `luu/trang-lo-trinh-ban-mau`. Trước Task 1, lấy lại bằng
`git checkout luu/trang-lo-trinh-ban-mau -- apps/app/app/proto/_modules/trang-lo-trinh-trong-crm apps/app/app/proto/catalog.ts apps/app/app/proto/registry.ts`
rồi gộp tay hai tệp `catalog.ts`, `registry.ts` với bản hiện tại (chỉ thêm dòng của LT1).

## Global Constraints

- Không viết chú thích trong mã — kể cả trong bản chép `docDuLieu` (chép thân hàm; khối chú thích trước `export function` không chép).
- Giao diện chỉ từ `@crm/ui` (import theo subpath); biến thể mới đặt trong `packages/ui`, không `className` đổi màu, góc, khoảng cách tại chỗ gọi.
- Client component không import `@crm/db`, `@crm/auth`; trang máy chủ đọc tệp, client nhận dữ liệu thường.
- Phân tích ở biên: `duLieu` qua khuôn Zod đúng một lần; kiểu suy bằng `z.infer`; không `Record<string, unknown>` truyền đi.
- Hằng số chỉnh được gom vào `apps/app/lib/lo-trinh/cau-hinh.ts` (một object `as const`).
- Mọi nhãn qua `apps/app/lib/messages/lo-trinh.ts` (vi + en, cùng khoá); chữ của tệp kế hoạch hiện nguyên văn, `translate="no"`.
- Trang không tự suy trạng thái; việc duy nhất tự làm là so ngày (hai hàm chép nguyên từ khối `LO-TRINH-DU-LIEU-LUAT-NGAY`).
- Không `useEffect` trong mã app (nếp kho); phần phụ thuộc ngày dùng `useSyncExternalStore` với ảnh chụp máy chủ `null`.
- Bộ năm lệnh chứng: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- Việc nặng (bộ test cả kho, `git push`) đi qua khoá máy `~/.claude/projects/-Users-manhphan-dev-crm/khoa-may/chay-nang.sh`.
- Thanh công cụ, lọc vòng đời, vị trí nút cách xem, số đếm trong chip, khung lỗi, khung chờ: theo nếp mà phiên «Thống nhất khuôn trang giữa các màn OneHub» chốt trong `docs/design.md`; đọc lại tệp đó trước Task 6.

## Điều kiện mở (kiểm trước Task 1, dừng nếu thiếu)

| Điều kiện | Kiểm bằng | Vì sao |
|---|---|---|
| crm đã nhận kit ≥ 2.26 (có khối dữ liệu lộ trình) | `grep -n 'export function docDuLieu' scripts/lo-trinh.mjs` có kết quả | Task 2, 3 chép hàm và chạy bộ vẽ của kho |
| PR crm-onehub#313 đã gộp | `git grep -n '"ma": "LT1"' origin/onehub -- docs/plan/lo-trinh-okr.json` | hàng LT1 có trên nhánh chính |
| Phiên thống nhất khuôn trang đã gộp | `git log origin/onehub --oneline --grep 'khuôn trang'` hoặc mục mới trong `docs/design.md` | nếp thanh công cụ của Task 6 |
| E7 `datatable-loc-ro` đã gộp | `git log origin/onehub --oneline --grep 'datatable-loc-ro'` | LT1 dùng `DataTable` mà E7 đang sửa |
| NM3 `mau-trang-thai-chung` đã gộp | `git ls-tree origin/onehub packages/ui/src/components/status-tone.ts` có kết quả | `docs/design.md` mục «Màu trạng thái» cấm khai ánh xạ `tone` thứ sáu; còn / trễ / đã giao lấy `tone` từ đó |
| Đã qua 14/10 | ngày hệ thống | ràng buộc chủ kho 08/10 |

## Ranh giới tệp (khai cho phiên điều phối)

```json
{
  "ma": "LT1",
  "slug": "trang-lo-trinh-trong-crm",
  "day": "P2",
  "uu_tien": 4,
  "sau": ["E7", "NM3"],
  "ranh_gioi": [
    "apps/app/app/(app)/[slug]/lo-trinh/**",
    "apps/app/components/lo-trinh/**",
    "apps/app/lib/lo-trinh/**",
    "packages/validation/src/lo-trinh-du-lieu.ts",
    "packages/validation/test/lo-trinh-du-lieu.spec.ts",
    "apps/app/test/lo-trinh*",
    "apps/app/test/proxy-lo-trinh.spec.ts",
    "apps/app/test/fixtures/lo-trinh/**",
    "apps/app/app/proto/_modules/trang-lo-trinh-trong-crm/**",
    "_acceptance/trang-lo-trinh-trong-crm/**",
    "docs/superpowers/specs/2026-10-09-trang-lo-trinh-trong-crm-design.md",
    "docs/superpowers/plans/2026-10-09-trang-lo-trinh-trong-crm.md"
  ],
  "chung_chi_them": [
    "apps/app/lib/messages/lo-trinh.ts",
    "apps/app/lib/khung-dieu-huong.ts",
    "apps/app/lib/pham-vi-man.ts",
    "apps/app/components/app-icon-rail.tsx",
    "apps/app/lib/messages/khung-ung-dung.ts",
    "apps/app/lib/search-param-keys.ts",
    "apps/app/proxy.ts",
    "apps/app/next.config.ts",
    "apps/app/test/khung-dieu-huong.spec.ts",
    "apps/app/test/pham-vi-man.spec.ts",
    "apps/app/test/thanh-bieu-tuong-hydrat.dom.tsx",
    "packages/validation/package.json",
    "packages/ui/src/components/reui/timeline.tsx",
    "apps/app/app/proto/catalog.ts",
    "apps/app/app/proto/registry.ts",
    "_acceptance/config.yaml"
  ],
  "s4": "local"
}
```

Chồng với đợt `sau-14-10` (đối chiếu `docs/plan/dot-sau-14-10/hang-viec.json` ngày 09/10): `proto/catalog.ts`,
`proto/registry.ts` (K2 — chỉ thêm dòng), `apps/app/lib/messages/*.ts` (K6a giữ; LT1 thêm tệp mới `lo-trinh.ts` và
một khoá ở `khung-ung-dung.ts`), `_acceptance/config.yaml`, `LO-TRINH.html`, `PRODUCT-MAP.md` (`bao_ve`, đổi khi giữ khoá
gộp). `data-table.tsx` (E7) và `list-search-params.ts` (V2) chỉ dùng, không sửa.

## Review Focus

- Người xem mở trang lúc 00:30 giờ Việt Nam đúng ngày mốc: không việc nào bị báo trễ, «hôm nay» hiện đúng — Task 4 ma trận nửa đêm.
- Đường dẫn cũ mang bộ lọc một mốc đã đổi tên trong kế hoạch: giá trị lạ bị bỏ qua, danh sách không rỗng giả — Task 6 bước «giá trị lạ».
- Lộ trình có việc nhưng không mốc nào (Việc và Dự án hôm nay): cách xem «Mốc» hiện mục «Chưa hẹn mốc», không trắng trang — Task 7.
- Kế hoạch chứa dấu `<` hay `</script>` trong câu giao: khối vẫn đọc được vì bộ vẽ thoát `<` — Task 3 tệp mẫu có một câu giao mang `<`.
- Bản dựng production trên Vercel không có thư mục gốc kho: trang vẫn đọc ra khối — Task 8 dòng 3 của E11.

---

### Task 1: Khuôn Zod của khối dữ liệu

**independent: true** · phục vụ E9 (dòng 2), E8 (ca sai kiểu)

**Files:**
- Create: `packages/validation/src/lo-trinh-du-lieu.ts`
- Modify: `packages/validation/package.json` (thêm `"./lo-trinh-du-lieu": "./src/lo-trinh-du-lieu.ts"` vào `exports`)
- Test: `packages/validation/test/lo-trinh-du-lieu.spec.ts`

**Interfaces:**
- Produces: `loTrinhDuLieu` (Zod), `type LoTrinhDuLieu = z.infer<typeof loTrinhDuLieu>`, `type LoTrinh`, `type HangLoTrinh`,
  `type MocLoTrinh`, `type NhomTrangThai = "da-giao" | "dang-lam" | "chua-bat-dau" | "khac"`,
  `phanTichLoTrinh(gt: unknown): { ok: true; duLieu: LoTrinhDuLieu } | { ok: false; duongKhoa: string; thongDiep: string }`,
  `KHOA_LO_TRINH_DU_LIEU` (bảng khoá theo cấp, dùng cho E9).

- [ ] **Step 1: Viết bài kiểm đỏ**

```ts
import { describe, expect, test } from "bun:test";
import {
	KHOA_LO_TRINH_DU_LIEU,
	loTrinhDuLieu,
	phanTichLoTrinh,
} from "../src/lo-trinh-du-lieu";

const hang = {
	ma: "LT1", cau_giao: "«x»", hang: "T2", nhom: "crm-chung", dung_tren: [],
	trang_thai: "Chưa mở", nhom_trang_thai: "chua-bat-dau", ho_so: null,
	theo_loi: false, co: [], bat_khi: "", vi_sao: "",
};
const goc = {
	khuon: "lo-trinh-du-lieu", phien_ban: 1, nguon: ["a.json"], ngoai_lo_trinh: [],
	lo_trinh: [{
		tep: "a.json", ten: "OKR", loi: null, hang_ke: null, can_sua: [],
		tien_do: { tong: 1, da_giao: 0, dang_lam: 0, chua_bat_dau: 1, khac: 0 },
		hang: [hang], moc: [], da_bac: [],
	}],
};

describe("lo-trinh-du-lieu", () => {
	test("doc khoi dung khuon", () => {
		expect(phanTichLoTrinh(goc)).toEqual({ ok: true, duLieu: loTrinhDuLieu.parse(goc) });
	});
	test("sai kieu tra duong khoa", () => {
		const hong = { ...goc, lo_trinh: [{ ...goc.lo_trinh[0], hang: "x" }] };
		const kq = phanTichLoTrinh(hong);
		expect(kq.ok).toBe(false);
		if (!kq.ok) expect(kq.duongKhoa).toBe("lo_trinh.0.hang");
	});
	test("khoa la bi bo, khong vo", () => {
		const kq = phanTichLoTrinh({ ...goc, la: 1 });
		expect(kq.ok).toBe(true);
	});
	test("bang khoa du tam cap", () => {
		expect(Object.keys(KHOA_LO_TRINH_DU_LIEU).sort()).toEqual(
			["can_sua", "da_bac", "goc", "hang", "hang_ke", "lo_trinh", "moc", "tien_do"],
		);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/validation && bun test test/lo-trinh-du-lieu.spec.ts` → FAIL «Cannot find module».

- [ ] **Step 3: Viết khuôn**

```ts
import { z } from "zod";

export const NHOM_TRANG_THAI = ["da-giao", "dang-lam", "chua-bat-dau", "khac"] as const;

const hangLoTrinh = z.object({
	ma: z.string(), cau_giao: z.string(), hang: z.string(), nhom: z.string(),
	dung_tren: z.array(z.string()), trang_thai: z.string(),
	nhom_trang_thai: z.enum(NHOM_TRANG_THAI), ho_so: z.string().nullable(),
	theo_loi: z.boolean(), co: z.array(z.string()), bat_khi: z.string(), vi_sao: z.string(),
});
const mocLoTrinh = z.object({
	ten: z.string(), ngay: z.string(), hang: z.array(z.string()), con_viec: z.boolean(),
});
const loTrinh = z.object({
	tep: z.string(), ten: z.string().nullable(), loi: z.string().nullable(),
	hang_ke: z.object({ ma: z.string(), cau_giao: z.string(), lenh: z.string().nullable() }).nullable(),
	can_sua: z.array(z.object({ ma: z.string().nullable(), chu: z.string() })),
	tien_do: z.object({
		tong: z.number(), da_giao: z.number(), dang_lam: z.number(),
		chua_bat_dau: z.number(), khac: z.number(),
	}),
	hang: z.array(hangLoTrinh), moc: z.array(mocLoTrinh),
	da_bac: z.array(z.object({ ma: z.string(), ly_do: z.string() })),
});
export const loTrinhDuLieu = z.object({
	khuon: z.literal("lo-trinh-du-lieu"), phien_ban: z.number(),
	nguon: z.array(z.string()), lo_trinh: z.array(loTrinh), ngoai_lo_trinh: z.array(z.string()),
});

export type LoTrinhDuLieu = z.infer<typeof loTrinhDuLieu>;
export type LoTrinh = z.infer<typeof loTrinh>;
export type HangLoTrinh = z.infer<typeof hangLoTrinh>;
export type MocLoTrinh = z.infer<typeof mocLoTrinh>;
export type NhomTrangThai = (typeof NHOM_TRANG_THAI)[number];

export const KHOA_LO_TRINH_DU_LIEU = {
	goc: Object.keys(loTrinhDuLieu.shape),
	lo_trinh: Object.keys(loTrinh.shape),
	hang_ke: ["ma", "cau_giao", "lenh"],
	can_sua: ["ma", "chu"],
	tien_do: Object.keys(loTrinh.shape.tien_do.shape),
	hang: Object.keys(hangLoTrinh.shape),
	moc: Object.keys(mocLoTrinh.shape),
	da_bac: ["ma", "ly_do"],
} as const;

export function phanTichLoTrinh(
	gt: unknown,
): { ok: true; duLieu: LoTrinhDuLieu } | { ok: false; duongKhoa: string; thongDiep: string } {
	const kq = loTrinhDuLieu.safeParse(gt);
	if (kq.success) return { ok: true, duLieu: kq.data };
	const loi = kq.error.issues[0];
	return { ok: false, duongKhoa: (loi?.path ?? []).join("."), thongDiep: loi?.message ?? "" };
}
```

- [ ] **Step 4: Chạy, thấy xanh** — cùng lệnh → 4 pass. Phá thử: đổi `"lo_trinh.0.hang"` mong đợi thành `"lo_trinh.0"` → đỏ, trả lại.
- [ ] **Step 5: Commit** — `git add packages/validation/src/lo-trinh-du-lieu.ts packages/validation/package.json packages/validation/test/lo-trinh-du-lieu.spec.ts && git commit -m "feat(validation): khuôn khối dữ liệu lộ trình"`

---

### Task 2: Bộ đọc khối, đọc tệp, luật ngày

**independent: false** (cần Task 1, cần kit ≥ 2.26) · phục vụ E4, E9, E11

**Files:**
- Create: `apps/app/lib/lo-trinh/doc-du-lieu.js` (thân hàm `docDuLieu` chép nguyên từ `scripts/lo-trinh.mjs`)
- Create: `apps/app/lib/lo-trinh/cau-hinh.ts`, `apps/app/lib/lo-trinh/doc-tep.ts`, `apps/app/lib/lo-trinh/ngay.ts`, `apps/app/lib/lo-trinh/doc-trang.ts`
- Create: `_acceptance/trang-lo-trinh-trong-crm/rang/ban-chep.mjs`
- Test: `apps/app/test/lo-trinh-ngay.spec.ts`

**Interfaces:**
- Consumes: `phanTichLoTrinh`, `LoTrinhDuLieu`, `LoTrinh` (Task 1).
- Produces:
  - `docDuLieu(html: string): { duLieu: unknown | null; canhBao: string[] }` (doc-du-lieu.js)
  - `duongTepLoTrinh(): string` và `docTepLoTrinh(): string | null` (doc-tep.ts; đọc theo `LO_TRINH.tep` cạnh thư mục chạy, `null` khi vắng)
  - `type DauVaoLoTrinh = { kieu: "tep-vang" } | { kieu: "chua-co-khoi"; cauMay: string } | { kieu: "khoi-hong"; cauMay: string } | { kieu: "co-du-lieu"; duLieu: LoTrinhDuLieu; canhBao: string[] }` và `docTrangLoTrinh(html: string | null): DauVaoLoTrinh` (doc-trang.ts)
  - `homNayNguoiXem(d: Date): string`, `soNgay(tu: string, toi: string): number`, `mocQuaConViec(moc, homNay): boolean`, `viecTre(loTrinh, homNay): string[]` (ngay.ts; hai hàm sau chép nguyên văn khối luật ngày, thêm kiểu)

- [ ] **Step 1: Bài kiểm đỏ cho luật ngày** (`apps/app/test/lo-trinh-ngay.spec.ts`)

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { phanTichLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import { docDuLieu } from "../lib/lo-trinh/doc-du-lieu.js";
import { homNayNguoiXem, mocQuaConViec, soNgay, viecTre } from "../lib/lo-trinh/ngay";

const MAU = path.join(import.meta.dir, "fixtures/lo-trinh/LO-TRINH.mau.html");
const kq = phanTichLoTrinh(docDuLieu(readFileSync(MAU, "utf8")).duLieu);
if (!kq.ok) throw new Error(`tep mau hong: ${kq.duongKhoa}`);
const cong = (ngay: string, n: number) => {
	const [y, m, d] = ngay.split("-").map(Number);
	const t = new Date(Date.UTC(y, m - 1, d + n));
	return t.toISOString().slice(0, 10);
};
const doiChieuTre = (lo: (typeof kq.duLieu.lo_trinh)[number], D: string) => {
	const ra: string[] = [];
	for (const m of lo.moc)
		if (/^\d{4}-\d{2}-\d{2}$/.test(m.ngay) && m.ngay < D)
			for (const ma of m.hang) {
				const h = lo.hang.find((x) => x.ma === ma);
				if (h && h.nhom_trang_thai !== "da-giao" && !ra.includes(ma)) ra.push(ma);
			}
	return ra;
};

describe("ngay", () => {
	test("hom nay theo gio dia phuong quanh nua dem", () => {
		expect(homNayNguoiXem(new Date(2026, 11, 14, 0, 30))).toBe("2026-12-14");
		expect(homNayNguoiXem(new Date(2026, 11, 13, 23, 30))).toBe("2026-12-13");
	});
	test("ma tran moc x ba ngay", () => {
		let so = 0;
		for (const lo of kq.duLieu.lo_trinh)
			for (const m of lo.moc.filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.ngay)))
				for (const D of [cong(m.ngay, -1), m.ngay, cong(m.ngay, 1)]) {
					expect(mocQuaConViec(m, D)).toBe(m.ngay < D && m.con_viec);
					expect(viecTre(lo, D)).toEqual(doiChieuTre(lo, D));
					expect(soNgay(D, m.ngay)).toBe(m.ngay === D ? 0 : m.ngay < D ? -1 : 1);
					so++;
				}
		expect(so).toBeGreaterThan(0);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-ngay.spec.ts` → FAIL (module vắng; tệp mẫu có ở Task 3 — làm Task 3 bước 1–3 trước nếu chạy tuần tự).

- [ ] **Step 3: Chép `docDuLieu`** — mở `scripts/lo-trinh.mjs`, chép từ dòng `export function docDuLieu(html) {` tới dấu `}` đóng hàm sang `apps/app/lib/lo-trinh/doc-du-lieu.js`, không sửa ký tự nào. Không chép khối chú thích phía trên hàm.

- [ ] **Step 4: Viết `cau-hinh.ts`, `ngay.ts`, `doc-tep.ts`, `doc-trang.ts`**

```ts
// cau-hinh.ts
export const LO_TRINH = {
	tep: "LO-TRINH.html",
	coTrang: 25,
	tranTheCot: 8,
	ngayMs: 86_400_000,
} as const;
```

```ts
// ngay.ts
import type { LoTrinh, MocLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import { LO_TRINH } from "./cau-hinh";

const hai = (n: number) => String(n).padStart(2, "0");

export function homNayNguoiXem(d: Date): string {
	return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
}

export function soNgay(tu: string, toi: string): number {
	const ms = (s: string) => {
		const [y, m, d] = s.split("-").map(Number);
		return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1);
	};
	return Math.round((ms(toi) - ms(tu)) / LO_TRINH.ngayMs);
}

export function mocQuaConViec(moc: MocLoTrinh, homNay: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(moc.ngay) && moc.ngay < homNay && moc.con_viec === true;
}

export function viecTre(loTrinh: LoTrinh, homNay: string): string[] {
	const theoMa = new Map(loTrinh.hang.map((h) => [h.ma, h]));
	const ra: string[] = [];
	for (const m of loTrinh.moc) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(m.ngay) || !(m.ngay < homNay)) continue;
		for (const ma of m.hang) {
			const h = theoMa.get(ma);
			if (h && h.nhom_trang_thai !== "da-giao" && !ra.includes(ma)) ra.push(ma);
		}
	}
	return ra;
}
```

`soNgay` trong bài kiểm so dấu, không so trị: thay hai dòng `expect(soNgay(...)).toBe(...)` bằng
`expect(Math.sign(soNgay(m.ngay, D))).toBe(m.ngay === D ? 0 : m.ngay < D ? 1 : -1)`.

```ts
// doc-tep.ts
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { LO_TRINH } from "./cau-hinh";

export function duongTepLoTrinh(goc: string = process.cwd()): string {
	const canh = path.join(goc, LO_TRINH.tep);
	return existsSync(canh) ? canh : path.join(goc, "..", "..", LO_TRINH.tep);
}

export function docTepLoTrinh(goc?: string): string | null {
	const duong = duongTepLoTrinh(goc);
	return existsSync(duong) ? readFileSync(duong, "utf8") : null;
}
```

```ts
// doc-trang.ts
import { type LoTrinhDuLieu, phanTichLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import { docDuLieu } from "./doc-du-lieu.js";

export type DauVaoLoTrinh =
	| { kieu: "tep-vang" }
	| { kieu: "chua-co-khoi"; cauMay: string }
	| { kieu: "khoi-hong"; cauMay: string }
	| { kieu: "co-du-lieu"; duLieu: LoTrinhDuLieu; canhBao: string[] };

export function docTrangLoTrinh(html: string | null): DauVaoLoTrinh {
	if (html === null) return { kieu: "tep-vang" };
	const { duLieu, canhBao } = docDuLieu(html);
	if (duLieu === null) {
		const cau = canhBao.join(" · ");
		return cau.includes("chưa mang") ? { kieu: "chua-co-khoi", cauMay: cau } : { kieu: "khoi-hong", cauMay: cau };
	}
	const kq = phanTichLoTrinh(duLieu);
	if (!kq.ok) return { kieu: "khoi-hong", cauMay: `${kq.duongKhoa}: ${kq.thongDiep}` };
	return { kieu: "co-du-lieu", duLieu: kq.duLieu, canhBao };
}
```

`duongTepLoTrinh` thử cạnh thư mục chạy trước (bản dựng mang tệp theo `outputFileTracingIncludes` — Task 8), rồi mới
tới gốc kho khi chạy dev. Task 8 đo đúng nhánh đầu.

- [ ] **Step 5: `rang/ban-chep.mjs`** — suy gốc kho bằng `path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")`;
  ba dòng DUNG/SAI đúng E9: (1) cắt thân `docDuLieu` ở hai tệp bằng cùng một hàm cắt (từ `export function docDuLieu` tới
  dấu `}` đóng theo đếm ngoặc) rồi so chuỗi; (2) nạp `KHOA_LO_TRINH_DU_LIEU` qua `bun -e` và so với bảng `KHUON` đọc từ thân
  hàm (rút bằng regex khối `const KHUON = {…};`, `JSON.parse` sau khi đổi nháy đơn); (3) `git ls-files` các đường của trang,
  không tệp nào chứa `_acceptance` hay `docs/plan`. Thiếu `docDuLieu` trong `scripts/lo-trinh.mjs` → in câu ghim và thoát 2.
  Phá thử: thêm một dấu cách vào `doc-du-lieu.js` → dòng 1 SAI «ban chep lech ham goc»; trả lại.

- [ ] **Step 6: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-ngay.spec.ts && TZ=UTC bun test ./test/lo-trinh-ngay.spec.ts` và `node _acceptance/trang-lo-trinh-trong-crm/rang/ban-chep.mjs` → xanh. Phá thử luật ngày: đổi `<` thành `<=` trong `viecTre` → ma trận đỏ; trả lại.
- [ ] **Step 7: Commit** các tệp của task.

---

### Task 3: Tệp mẫu từ bộ vẽ thật

**independent: true** (cần kit ≥ 2.26) · phục vụ E16, đầu vào của E1–E8, E12

**Files:**
- Create: `apps/app/test/fixtures/lo-trinh/nguon/` (bản sao tối thiểu: `_acceptance/config.yaml` chỉ mang khoá `lo_trinh`, ba tệp `docs/plan/lo-trinh-*.json` cắt còn ~12 hàng mỗi tệp gồm đủ: hàng có cờ, `theo_loi`, `bat_khi`, `vi_sao`, `dung_tren`, nhóm rỗng, «Xếp lại sau», một câu giao chứa `<`, một mốc chỉ có việc đã giao, một mốc còn việc; hai thư mục hồ sơ `_acceptance/<slug>/contract.md` tối thiểu để có trạng thái từ hồ sơ)
- Create: `apps/app/test/fixtures/lo-trinh/LO-TRINH.mau.html`
- Create: `_acceptance/trang-lo-trinh-trong-crm/rang/sinh-mau.mjs`, `_acceptance/trang-lo-trinh-trong-crm/rang/kiem-mau.mjs`

- [ ] **Step 1:** `sinh-mau.mjs` — suy gốc kho từ vị trí tệp; chép `fixtures/lo-trinh/nguon/` sang thư mục tạm (`mkdtempSync`),
  `git init` ở đó (bộ vẽ đọc git), chạy `node <gốc kho>/scripts/product-map.mjs --root <tạm>`, in đường `LO-TRINH.html` sinh ra;
  cờ `--ghi` thì chép nó thành `fixtures/lo-trinh/LO-TRINH.mau.html`.
- [ ] **Step 2:** `node _acceptance/trang-lo-trinh-trong-crm/rang/sinh-mau.mjs --ghi` → tệp mẫu có khối `id="lo-trinh-du-lieu"`.
- [ ] **Step 3:** `kiem-mau.mjs` — gọi `sinh-mau.mjs` không `--ghi`, so từng byte với tệp đã commit, in một dòng DUNG/SAI; thiếu
  `docDuLieu` trong `scripts/lo-trinh.mjs` → thoát 2 «chưa có bộ vẽ mang khối — cần kit ≥ 2.26». Phá thử: sửa một ký tự trong
  tệp mẫu → SAI «tệp mẫu lệch bộ vẽ»; trả lại bằng `--ghi`.
- [ ] **Step 4:** Commit nguồn, tệp mẫu, hai script.

---

### Task 4: Tệp lời và soát chữ viết thẳng

**independent: true** · phục vụ E14, E17

**Files:**
- Create: `apps/app/lib/messages/lo-trinh.ts` (khuôn `const en = {…}; export type LoTrinhMessages = typeof en; const vi: LoTrinhMessages = {…}; export function loTrinhMessages(locale)`)
- Create: `_acceptance/trang-lo-trinh-trong-crm/rang/chu-cung.mjs`

- [ ] **Step 1:** Rút mọi chữ hiển thị của bản mẫu (`apps/app/app/proto/_modules/trang-lo-trinh-trong-crm/trang.tsx`) vào `vi`;
  viết `en` tương ứng. Nhóm khoá: `trang` (tiêu đề, mô tả), `thanhCongCu` (tìm, cách xem, chia cột, đã bác), `vongDoi`
  (chưa xong, đã giao, xếp lại sau, tất cả), `nhom` (bốn nhãn nhóm trạng thái), `loc` (lộ trình, nhóm, mốc, trễ mốc, chưa hẹn
  mốc, không nhóm), `moc` (`conNgay(n)`, `homNay`, `tre(n)`), `tre` (`tieuDe(n)`, mô tả, nút), `hoSo` (bốn ô, thành công khi,
  vì sao, theo lời, lệch, cần xong trước, đang chờ), `daBac`, `trong` (năm khung trống), `chiTiet`, `meta(n, giao, tong, tre)`.
- [ ] **Step 2:** `cd apps/app && bun test ./test/messages-guard.spec.ts` → xanh (vi/en cùng khoá, vi có dấu, không trùng).
- [ ] **Step 3:** `chu-cung.mjs` — quét `.tsx` dưới `apps/app/components/lo-trinh` và trang: nút JSX text có chữ cái và chuỗi
  trong các prop `label`, `aria-label`, `placeholder`, `title` không đi qua biến tệp lời → in `tệp:dòng` và thoát 1
  «chu viet thang ngoai tep loi». Phá thử: thêm `<span>Sửa</span>` → đỏ; trả lại. (Chạy được sau Task 6.)
- [ ] **Step 4:** Commit.

---

### Task 5: Biến thể «thanh ngày» của Timeline

**independent: true** · phục vụ E5 (cách xem Mốc), E15

**Files:**
- Modify: `packages/ui/src/components/reui/timeline.tsx` (thêm prop `rail?: boolean` cho `Timeline`; khi bật, `TimelineItem`
  thụt `sm:ms-36`, `TimelineDate` đặt tuyệt đối `sm:-left-36 sm:w-24 sm:text-right` — đúng các lớp bản mẫu đang đặt tại chỗ gọi)
- Test: `packages/ui/test/timeline-rail.dom.tsx`

- [ ] **Step 1:** Bài kiểm: render `<Timeline rail>` hai mục → `data-rail` có trên gốc; không `rail` → không có; phá thử bỏ
  nhánh `rail` → đỏ.
- [ ] **Step 2:** Cài biến thể bằng `data-rail` trên gốc và chọn lớp theo `group-data-[rail=true]/timeline:` (không nhận
  `className` từ chỗ gọi).
- [ ] **Step 3:** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/timeline-rail.dom.tsx` xanh; commit.

---

### Task 6: Danh sách, bộ lọc, khung việc trễ

**independent: false** (cần 1, 2, 3, 4; cần E7 đã gộp; đọc `docs/design.md` mới trước) · phục vụ E1, E2, E3, E4, E12, E15

**Files:**
- Create: `apps/app/components/lo-trinh/tham-so.ts` (nuqs: `createListSearchParams({ defaultSort: "moc", tabId: never, facetIds: ["loTrinh","nhom","moc"] })` cộng parser riêng `vongDoi` `withDefault("chua-xong")` và `xem`, `chia`, `daBac`, `viec` — khoá đặt trong `SEARCH_PARAM.loTrinh` của `apps/app/lib/search-param-keys.ts`)
- Create: `apps/app/components/lo-trinh/viec.ts` (thuần: `phangViec(duLieu, homNay) → Viec[]`, `hopLoc`, `khoaMoc`, `demLoc`, `thuocVongDoi` — chép từ bản mẫu, đổi kiểu sang Task 1)
- Create: `apps/app/components/lo-trinh/trang-lo-trinh.tsx` (client: `DataTable` + thanh công cụ + khung việc trễ + «Đã bác»)
- Create: `apps/app/components/lo-trinh/o-trang-thai.tsx`, `o-moc.tsx`
- Modify: `apps/app/lib/search-param-keys.ts` (thêm khối `loTrinh`)
- Test: `apps/app/test/lo-trinh.dom.tsx` (describe `hien`, `vong-doi`, `loc`, `ngay`, `chi-doc`)

Chuyển từ bản mẫu sang mã thật — đúng các thay đổi sau, phần còn lại giữ nguyên:
1. `useTruyVan` tự viết → `useTableQuery` của `apps/app/components/data-table/use-table-query.ts` với `tham-so.ts`.
2. Thẻ vòng đời: không dùng prop `tabs` của `DataTable` (mặc định «all» cứng trong `list-search-params.ts`, tệp của V2);
   dùng parser riêng `vongDoi` mặc định `chua-xong` và điều khiển mà nếp chung chốt (hôm nay: `ToggleGroup` có số đếm ở
   `leadingActions` như `TrangThaiToggle` của Onboarding). Đổi nếp ở phiên thống nhất → theo nếp đó.
3. Ô tìm tự viết → `ListSearch` của `apps/app/components/data-table/list-search.tsx`.
4. Chữ → `loTrinhMessages(useLocale())`.
5. Ngày: `homNay` lấy bằng `useSyncExternalStore(() => () => {}, () => homNayNguoiXem(new Date()), () => null)`; `null` thì
   không hiện «còn/Trễ», không khung việc trễ (E4 dòng 6).
6. Khung việc trễ đếm trên phạm vi ô tìm + Lộ trình + Nhóm; nút đặt `moc=[__tre]`, `vongDoi=tat-ca`, giữ các chiều khác (AC-4).
7. Thuộc tính đo: `data-viec-khoa` (= `tep#ma`), `data-nhom-trang-thai`, `data-lo-trinh-tre`, `data-lo-trinh-trang`,
   `data-lo-trinh-chi-tiet`, `data-lo-trinh-da-bac`, `data-lo-trinh-moc`.

- [ ] **Step 1:** Viết `describe("hien")` của `lo-trinh.dom.tsx` theo E1 (đọc `LO-TRINH.html` gốc kho, suy gốc từ
  `import.meta.dir`; thẻ «Tất cả»; đi mọi trang; ma trận mọi hàng), chạy thấy đỏ.
- [ ] **Step 2:** Viết `viec.ts`, `tham-so.ts`, `o-trang-thai.tsx`, `o-moc.tsx`, `trang-lo-trinh.tsx` theo bảy điểm trên.
- [ ] **Step 3:** `hien` xanh; phá thử hiện `trang_thai` làm nhãn chính → đỏ «viec <khoa> lech nhan trang thai».
- [ ] **Step 4:** Lần lượt `vong-doi`, `loc`, `ngay`, `chi-doc` theo E2, E3, E4 (dòng 4–6), E12 — mỗi describe: viết đỏ, cài,
  xanh, một lượt phá thử đúng câu ghim của eval.
- [ ] **Step 5:** `node ${CLAUDE_PLUGIN_ROOT}/scripts/design-gate.mjs --target apps/app/components/lo-trinh/trang-lo-trinh.tsx --mode static` không P0; commit.

---

### Task 7: Bảng cột, cách xem Mốc, ngăn hồ sơ, đã bác

**independent: false** (cần 5, 6) · phục vụ E5, E6, E7

**Files:**
- Create: `apps/app/components/lo-trinh/bang-cot.tsx` (`Board` chỉ đọc, `linkComponent` mở ngăn qua tham số `viec`, «Chia cột theo» trạng thái/nhóm/lộ trình)
- Create: `apps/app/components/lo-trinh/xem-moc.tsx` (`Timeline rail` của Task 5, mốc có việc khớp lọc, «Chưa hẹn mốc» gập)
- Create: `apps/app/components/lo-trinh/ho-so-viec.tsx` (`Sheet`, dải bốn ô, chi tiết, cần xong trước, đang chờ)
- Create: `apps/app/components/lo-trinh/da-bac.tsx`
- Test: thêm describe `cach-xem`, `ho-so`, `da-bac` vào `apps/app/test/lo-trinh.dom.tsx`

Chuyển từ bản mẫu: `BangCot`, `DongThoiGian`, `ChiTietViec`, `BangDaBac` — đổi chữ sang tệp lời, việc đang chọn đọc/ghi
tham số `viec` (để gửi đường dẫn mở thẳng ngăn), `TimelineItem`/`TimelineDate` bỏ lớp vị trí, dùng `<Timeline rail>`.

- [ ] **Step 1–4:** mỗi describe: viết đỏ theo E5/E6/E7, cài, xanh, phá thử đúng câu ghim («chia cot sai chieu», «viec dang cho sai chieu», «thieu viec da bac cua lo trinh <ten>»).
- [ ] **Step 5:** Commit.

---

### Task 8: Trang máy chủ và bản dựng mang tệp

**independent: false** (cần 2, 6, 7) · phục vụ E8, E11

**Files:**
- Create: `apps/app/app/(app)/[slug]/lo-trinh/page.tsx` (`requireSession()`, `PageShell` + tiêu đề, `Suspense` bọc thành phần khách; đọc `docTrangLoTrinh(docTepLoTrinh())` bên trong `'use cache'`)
- Modify: `apps/app/next.config.ts` (`outputFileTracingIncludes: { "/[slug]/lo-trinh": ["../../LO-TRINH.html"] }`)
- Create: `_acceptance/trang-lo-trinh-trong-crm/rang/ban-dung.mjs`
- Test: describe `khoan-dung` trong `apps/app/test/lo-trinh.dom.tsx` (tám ca dẫn từ tệp mẫu theo E8)

- [ ] **Step 1:** `khoan-dung` đỏ → cài khung trống (`Empty` + `ChiTietDoi`) cho bốn kiểu `DauVaoLoTrinh` không có dữ liệu, khung
  lộ trình lỗi, khung khuôn mới → xanh; phá thử bỏ nhánh `tep-vang` → «trang vo khi tep vang».
- [ ] **Step 2:** `ban-dung.mjs`: `next build` với `distDir` riêng (`PROTO_DIST_DIR`), đọc `.nft.json` của đường, ba dòng E11;
  dòng 3 chép đúng tệp nft liệt sang `mkdtempSync` rồi gọi `docTepLoTrinh(<bản sao>)`.
- [ ] **Step 3:** Phá thử: bỏ `outputFileTracingIncludes` → dòng 1 SAI; trả lại. Commit.

---

### Task 9: Điều hướng và quyền

**independent: true** (với 6–8; cần trang tồn tại để bấm thật ở Task 10) · phục vụ E10

**Files:**
- Modify: `apps/app/lib/khung-dieu-huong.ts` (khoá `loTrinh` vào `MucRailKey`, mục vào `MUC_RAIL` sau `taiLieu`)
- Modify: `apps/app/lib/pham-vi-man.ts` (`RAIL_CHI_OKR` thêm `if (muc.key === "loTrinh") return [muc];`)
- Modify: `apps/app/components/app-icon-rail.tsx` (`ICON.loTrinh`: biểu tượng Carbon chưa dùng, ví dụ `Milestone`)
- Modify: `apps/app/lib/messages/khung-ung-dung.ts` (`rail.loTrinh`: «Roadmap» / «Lộ trình»)
- Modify: `apps/app/proxy.ts` (thêm `/lo-trinh` vào `SECTIONS`)
- Modify tests: `apps/app/test/khung-dieu-huong.spec.ts` (độ dài + thứ tự), `apps/app/test/pham-vi-man.spec.ts` (danh sách khoá chỉ OKR), `apps/app/test/thanh-bieu-tuong-hydrat.dom.tsx` (đếm mục)
- Create: `apps/app/test/proxy-lo-trinh.spec.ts` (chưa đăng nhập → chuyển `/sign-in`)

- [ ] **Step 1:** Ba bài cũ sửa kỳ vọng + `-t lo-trinh` mới đỏ → cài → xanh (`config:executors.test.ltc_vai`); phá thử bỏ
  dòng `RAIL_CHI_OKR` → «vai chi OKR khong thay Lo trinh». Commit.

---

### Task 10: Đo màn thật, bản mẫu, bản đồ

**independent: false** (cuối) · phục vụ E13, E15

**Files:**
- Create: `_acceptance/trang-lo-trinh-trong-crm/rang/do-man.mjs` (theo khuôn `_acceptance/da-luu-tru-tai-loi/rang/do-man.mjs`: `tien-de.mjs`, người đo vai chỉ OKR, chín ô của E13 kể cả ba ô 375, so thứ tự thanh công cụ với `/deals` cùng lượt)
- Modify: `apps/app/app/proto/_modules/trang-lo-trinh-trong-crm/trang.tsx` (gọi thẳng thành phần thật với dữ liệu mẫu, xoá bản sao giao diện trong module proto)

- [ ] **Step 1:** `bun run do:man --chay "<làn>"` theo `docs/setup.md` «Screen measurements» → mã 0, ảnh vào `evidence/`.
- [ ] **Step 2:** `node scripts/product-map.mjs --root .` rồi `--check`; bộ năm lệnh chứng xanh dưới khoá máy.
- [ ] **Step 3:** Commit; đặt hợp đồng `status: implemented` → S4.

## Thứ tự và song song

| Lượt | Việc | Ghi chú |
|---|---|---|
| 1 | Task 1, 3, 4, 5, 9 | độc lập; Task 3 cần kit ≥ 2.26 |
| 2 | Task 2 | cần 1 + 3 |
| 3 | Task 6 | cần 2, 4; cần E7 đã gộp và nếp chung mới |
| 4 | Task 7 | cần 5, 6 |
| 5 | Task 8 | cần 2, 6, 7 |
| 6 | Task 10 | cuối |
