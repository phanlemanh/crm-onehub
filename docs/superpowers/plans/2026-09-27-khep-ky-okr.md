# Khép kỳ OKR — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kỳ OKR được rà giữa kỳ, chấm, nhìn lại, mang sang, đóng, mở lại và xuất ngay trong CRM; câu mục tiêu và KR được hỏi lại bằng bốn luật khi đặt.

**Architecture:** Hai mô-đun thuần ở `packages/validation` (luật chất lượng `okr-kiem.ts`; điểm, lưới, khuôn đầu vào `okr-khep.ts`) dùng chung cho màn, máy chủ và lượt 9b. Năm bảng mới ở cuối `schema.prisma`. Máy chủ thêm `OkrKhepService` và hàm thuần `khep.ts` (chốt kỳ) cạnh `okr.service.ts`; `setCyclePhase` và `updateKeyResult` sửa tại chỗ. Màn thêm cách xem «Chấm điểm» của «Theo đơn vị», ô lý do và câu hỏi trong hộp thoại KR, điều khiển chu kỳ ở Cài đặt, nút Xuất ở Toàn cảnh; hai biến thể mới ở `packages/ui`.

**Tech Stack:** Bun, Turborepo, NestJS + nestjs-trpc, Prisma 7 (Postgres), Zod, Next.js (bản trong kho — đọc `apps/app/node_modules/next/dist/docs/` trước khi đụng API Next), React Query + tRPC, nuqs, shadcn trong `packages/ui`.

**Spec:** `docs/superpowers/specs/2026-09-27-khep-ky-okr-design.md` · hợp đồng `_acceptance/khep-ky-okr/contract.md` (đã duyệt 2026-09-27) · phép đo `_acceptance/khep-ky-okr/evals.yaml`.

## Điều kiện trước S3 (luật điều phối)

Không bắt đầu Task 1 trước khi chủ kho dán «được viết mã, kéo onehub về trước». Khi đó, theo thứ tự:

1. `git fetch origin && git merge origin/onehub` (9a `tro-ly-okr-nen` thêm bảng vào Chương trình OKR; `4n` sửa nhắc OKR).
2. `bun install`, rồi `cd packages/db && bun run db:generate`.
3. Soát lại kế hoạch với mã mới: dòng số trong `okr.service.ts`, tên hàm cấu hình chương trình (9a có thể đổi `program()`), `HANH_DONG_VET` (9a có thể thêm hành động), mốc `migration` mới nhất, bảng `vai-chi-okr`. Ghi mọi chỗ lệch vào `decisions.jsonl` (`type: "fix"`, `stage: "S3"`).
4. Soát hạng: vẫn T3 (chạm `packages/db/prisma`).

## Global Constraints

- Không viết chú thích trong mã (mới hay sửa).
- Hằng số chỉnh được ở `OKR_KHEP` (`packages/validation/src/okr-khep.ts`) và `OKR_KIEM` (`packages/validation/src/okr-kiem.ts`); không số trần 0.7, 0.1, 10, 500, 2000 ở tệp khác.
- Parse ở biên bằng Zod; không `Record<string, unknown>`; kiểu suy bằng `z.infer`.
- `migration` chỉ `CREATE TABLE`, `CREATE (UNIQUE) INDEX`, `ADD CONSTRAINT … FOREIGN KEY`; mọi khoá ngoại tới bảng OKR cũ `ON DELETE RESTRICT`; năm model mới liền nhau ở cuối `schema.prisma`.
- Màn chỉ dùng thành phần `@crm/ui`; không `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui`; nút Huỷ bọc `DialogClose`.
- Chữ mới ở `apps/app/lib/messages/okr-khep.ts`, vi và en khác nhau; hàm ghép chữ nhận đối số vô hướng (luật `messages-guard`).
- Chữ người nhập mang `translate="no"`.
- Mọi ghi để một dòng `okrTrail`.
- Giờ Việt Nam cho mọi ranh giới ngày: `ngayVN` từ `@crm/db/onboarding-nhac`.
- Điểm lưu chuẩn 0–1; vào và ra theo thang của dòng `OkrDiemKr.thang`.
- Bảy hành động vết mới: `mo-ra`, `dong-ra`, `doi-dich`, `cham-kr`, `nhin-lai`, `mang-sang`, `mo-lai-ky`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (xanh trên vật lành, đỏ với thông điệp ghim trên bản sao bị phá) — thiếu cặp là việc chưa xong.

## Review Focus

- Chấm lại một KR nhiều lần trong pha chấm: dòng `OkrDiemKr` cập nhật, không nhân đôi; vết mỗi lần — Task 8 thêm ca.
- Hai quản trị bấm «Sang chấm điểm» cùng lúc: chỉ một lần sinh dòng điểm (khoá hàng chu kỳ `FOR UPDATE`) — Task 7 thêm ca chạy song song hai lời gọi.
- Mang sang khi KR có trọng số và chương trình tắt trọng số ở kỳ kế: KR chép giữ trọng số cũ, không lỗi — Task 10 thêm ca.
- Xuất kỳ có tên chứa dấu phẩy, ngoặc kép, xuống dòng và ký tự đầu `=` (công thức bảng tính): ô bắt đầu bằng `=`, `+`, `-`, `@` được thêm tiền tố `'` — Task 11 thêm ca.
- Đổi đích đúng lúc 00:00 ngày đầu và ngày sau ngày cuối của cửa sổ rà (giờ VN) — Task 6 thêm hai ca biên.

---

## Bản đồ tệp

| Tệp | Việc |
|---|---|
| `packages/validation/src/okr-kiem.ts` (mới) | Bốn luật chất lượng, `OKR_KIEM`, `MA_LUAT_OKR`, `kiemOkr` |
| `packages/validation/src/okr-khep.ts` (mới) | `OKR_KHEP`, lưới điểm, `goiYDiem`, `diemChuan`, `diemTheoThang`, `diemMucTieu`, `cachDoc`, khuôn đầu vào |
| `packages/validation/src/okr-vet.ts` | Thêm bảy hành động vết |
| `packages/validation/package.json` | Hai subpath `./okr-kiem`, `./okr-khep` |
| `packages/ui/src/components/field.tsx` | Biến thể `FieldDescription variant="hoi"` |
| `packages/ui/src/components/view-switch.tsx` (mới) | `ViewSwitch`: nhóm nút từ `md`, `Select` dưới `md` |
| `packages/db/prisma/schema.prisma` | Năm model mới + quan hệ ngược |
| `packages/db/prisma/migrations/<mốc>_okr_khep_ky/` | `migration` chỉ thêm |
| `apps/api/src/okr/khep.ts` (mới) | Hàm thuần của giao dịch chốt kỳ: `chotKyCham`, `kiemDongKy` |
| `apps/api/src/okr/okr-khep.service.ts` (mới) | `moRa`, `dongRa`, `bangCham`, `chamKr`, `ghiDieuHocDuoc`, `moLaiKy`, `mangSang`, `xuatKy` |
| `apps/api/src/okr/okr-khep.contracts.ts` (mới) | Khuôn đầu ra tRPC |
| `apps/api/src/okr/okr-khep.csv.ts` (mới) | Dựng CSV thuần |
| `apps/api/src/okr/okr.service.ts` | `setCyclePhase` một bước + chốt kỳ; `updateKeyResult` luật đổi đích; `cycles` trả cửa sổ rà |
| `apps/api/src/okr/okr.contracts.ts` | `chuKyOutput.cuaSoRa`; `updateKrInput.lyDoDoiDich` |
| `apps/api/src/okr/okr-config.ts` | Câu ghim mới dưới `thongDiep.khep` |
| `apps/api/src/okr/okr.router.ts`, `okr.module.ts` | Tám thủ tục mới, đăng ký dịch vụ |
| `apps/api/test/okr-khep.spec.ts`, `okr-khep-san.ts`, `okr-khep-xuat.spec.ts` (mới) | Bài máy chủ |
| `apps/api/test/vai-chi-okr.spec.ts` | Đầu vào hợp lệ cho tám thủ tục, ca `pham-vi-khep` |
| `apps/app/lib/messages/okr-khep.ts` (mới) | Chữ vi/en |
| `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` | `CACH_XEM` thêm `"cham"` |
| `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` | Cách xem «Chấm điểm», `ViewSwitch` |
| `apps/app/app/(app)/[slug]/okr/cham-diem.tsx`, `hop-thoai-mang-sang.tsx`, `dai-ky.tsx` (mới) | Màn chấm, mang sang, dải trạng thái kỳ |
| `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx` | Câu hỏi chất lượng, ô lý do đổi đích |
| `apps/app/app/(app)/[slug]/okr/bang-kr.tsx` | Cảnh báo thiếu đối trọng |
| `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx` | Nút Xuất khi kỳ đã đóng |
| `apps/app/app/(app)/[slug]/settings/okr/bang-chu-ky.tsx` (+ `sheet-mo-ra.tsx`, `hop-thoai-dong-ky.tsx`, `hop-thoai-mo-lai.tsx` mới) | Điều khiển chu kỳ |
| `apps/app/test/okr-khep-chu.spec.ts`, `okr-khep-cham.dom.tsx` (mới) | Bài chữ và DOM |
| `_acceptance/khep-ky-okr/rang/*` (mới) | Thước màn, câu đếm, soi mã, `migration` |
| `_acceptance/config.yaml` | Khoá `kko_*` đã khai ở S1 — soát lại tên bài `-t` khớp tên `describe` |
| `docs/api.md` | Mục OKR: tám thủ tục, luật pha mới, bảng mới |

---

### Task 1: Luật chất lượng khi đặt

**independent: true** · phục vụ E1 (AC-1)

**Files:**
- Create: `packages/validation/src/okr-kiem.ts`
- Create: `packages/validation/test/okr-kiem.spec.ts`
- Modify: `packages/validation/package.json` (thêm `"./okr-kiem": "./src/okr-kiem.ts"` cạnh `./okr-kr`)

**Interfaces:**
- Consumes: `KieuKr` từ `@crm/validation/okr-kr`.
- Produces: `MA_LUAT_OKR`, `type MaLuatOkr`, `type KetQuaKiem = { ma: MaLuatOkr; truong: "title" | "startValue" | "targetValue" | "keyResults"; krIndex: number | null }`, `type MucTieuKiem`, `kiemOkr(mt: MucTieuKiem): KetQuaKiem[]`, `OKR_KIEM`.

- [ ] **Step 1: Viết bài đỏ trước** — bảng ca viết trước, so cả mảng.

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { kiemOkr, MA_LUAT_OKR, type MucTieuKiem } from "../src/okr-kiem";

const kr = (title: string, kind: MucTieuKiem["keyResults"][number]["kind"], startValue = 10, targetValue = 20) => ({ title, kind, startValue, targetValue });
const mt = (...keyResults: MucTieuKiem["keyResults"]): MucTieuKiem => ({ title: "Đối tác mới được đỡ trọn tháng đầu", whyNow: "", keyResults });

const CA: [string, MucTieuKiem, ReturnType<typeof kiemOkr>][] = [
	["viec có dấu", mt(kr("Gọi điện chào mừng mọi đối tác mới", "tang-toi")), [{ ma: "kr-la-viec", truong: "title", krIndex: 0 }]],
	["viec không dấu", mt(kr("goi 50 cuoc cho doi tac", "tang-toi")), [{ ma: "kr-la-viec", truong: "title", krIndex: 0 }]],
	["viec tiếng Anh", mt(kr("Launch the new partner portal", "phan-tram", 5, 80)), [{ ma: "kr-la-viec", truong: "title", krIndex: 0 }]],
	["không viec: tỷ lệ", mt(kr("Tỷ lệ đối tác gọi lại trong 24 giờ", "tang-toi")), []],
	["không viec: mốc", mt(kr("Hoàn thành chuyển kho dữ liệu", "moc", 0, 1)), []],
	["không viec: danh từ", mt(kr("Đối tác chấm hài lòng từ 4/5", "tang-toi")), []],
	["thiếu khởi điểm tăng tới", mt(kr("Đối tác mới ký hợp tác", "tang-toi", 0, 15)), [{ ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 }]],
	["thiếu khởi điểm phần trăm", mt(kr("Tỷ lệ công ty có buổi gặp", "phan-tram", 0, 80)), [{ ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 }]],
	["thiếu khởi điểm giữ trên", mt(kr("Điểm hài lòng trung bình", "giu-tren", 0, 4)), [{ ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 }]],
	["mốc khởi điểm 0 không hỏi", mt(kr("Bộ câu hỏi thường gặp công bố", "moc", 0, 1)), []],
	["khởi điểm 5 không hỏi", mt(kr("Đối tác mới ký hợp tác", "tang-toi", 5, 15)), []],
	["giảm xuống khởi điểm 8 không hỏi", mt(kr("Thời gian phản hồi", "giam-xuong", 8, 2)), []],
	["đích bằng khởi điểm giữ trên", mt(kr("Điểm hài lòng trung bình", "giu-tren", 4, 4)), [{ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: 0 }]],
	["đích bằng khởi điểm giữ dưới", mt(kr("Tỷ lệ huỷ", "giu-duoi", 5, 5)), [{ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: 0 }]],
	["đích bằng khởi điểm phần trăm", mt(kr("Tỷ lệ gặp tuần đầu", "phan-tram", 60, 60)), [{ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: 0 }]],
	["tăng tới đích bằng khởi điểm — lượt 3 đã chặn, luật im", mt(kr("Doanh số quý", "tang-toi", 20, 20)), []],
	["giữ trên đích khác khởi điểm", mt(kr("Điểm hài lòng trung bình", "giu-tren", 3, 4)), []],
	["phần trăm đích khác khởi điểm", mt(kr("Tỷ lệ gặp tuần đầu", "phan-tram", 60, 80)), []],
	["thiếu đối trọng ba tăng tới", mt(kr("Thoả thuận mới", "tang-toi"), kr("Cuộc gọi hẹn được", "tang-toi"), kr("Đối tác mới ký", "tang-toi")), [{ ma: "thieu-doi-trong", truong: "keyResults", krIndex: null }]],
	["có giữ dưới thì không hỏi đối trọng", mt(kr("Thoả thuận mới", "tang-toi"), kr("Tỷ lệ huỷ", "giu-duoi", 5, 4)), []],
	["một KR thì không hỏi đối trọng", mt(kr("Thoả thuận mới", "tang-toi")), []],
	["tăng tới và giảm xuống vẫn không hỏi", mt(kr("Thoả thuận mới", "tang-toi"), kr("Thời gian phản hồi", "giam-xuong", 8, 2)), []],
	["gộp: việc + thiếu khởi điểm, đúng thứ tự", mt(kr("Gọi 50 cuộc mỗi tuần", "tang-toi", 0, 50), kr("Tỷ lệ huỷ", "giu-duoi", 5, 4)), [{ ma: "kr-la-viec", truong: "title", krIndex: 0 }, { ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 }]],
	["mục tiêu rỗng", mt(), []],
];

describe("okr-kiem", () => {
	for (const [ten, dau, mong] of CA)
		test(ten, () => expect(kiemOkr(dau)).toEqual(mong));
	test("danh sách mã theo thứ tự khai", () =>
		expect([...MA_LUAT_OKR]).toEqual(["kr-la-viec", "thieu-khoi-diem", "dich-bang-khoi-diem", "thieu-doi-trong"]));
	test("hàm thuần: không nhập cơ sở dữ liệu hay mạng", () => {
		const nguon = readFileSync(join(import.meta.dir, "../src/okr-kiem.ts"), "utf8");
		for (const cam of ["@crm/db", "prisma", "fetch(", "node:"]) expect(nguon.includes(cam)).toBe(false);
	});
});
```

- [ ] **Step 2: Chạy, xác nhận đỏ** — `cd packages/validation && bun test test/okr-kiem.spec.ts` → FAIL «Cannot find module '../src/okr-kiem'».

- [ ] **Step 3: Viết hàm**

```ts
import type { KieuKr } from "./okr-kr";

export const MA_LUAT_OKR = ["kr-la-viec", "thieu-khoi-diem", "dich-bang-khoi-diem", "thieu-doi-trong"] as const;
export type MaLuatOkr = (typeof MA_LUAT_OKR)[number];
export type TruongKiem = "title" | "startValue" | "targetValue" | "keyResults";
export type KetQuaKiem = { ma: MaLuatOkr; truong: TruongKiem; krIndex: number | null };
export type KrKiem = { title: string; kind: KieuKr; startValue: number; targetValue: number };
export type MucTieuKiem = { title: string; whyNow: string; keyResults: KrKiem[] };

export const OKR_KIEM = {
	dongTuViec: ["goi", "gui", "to chuc", "trien khai", "hoan thanh", "hoan thien", "xay dung", "thuc hien", "lam", "viet", "hop", "tham gia", "dao tao", "chay", "ra mat", "launch", "build", "call", "send", "hold", "run", "write", "complete", "implement", "organize", "create"],
	kieuKhongHoiViec: ["moc"],
	kieuKhongHoiKhoiDiem: ["moc"],
	kieuHoiDichBangKhoi: ["giu-tren", "giu-duoi", "phan-tram"],
	kieuDayMotChieu: "tang-toi",
	kieuDoiTrong: ["giu-tren", "giu-duoi"],
	doiTrongToiThieuKr: 2,
} as const;

function boDau(s: string): string {
	return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().trim();
}

function laViec(title: string): boolean {
	const t = boDau(title);
	return OKR_KIEM.dongTuViec.some((v) => t === v || t.startsWith(`${v} `));
}

const co = <T extends string>(ds: readonly T[], x: string): boolean => (ds as readonly string[]).includes(x);

function kiemKr(kr: KrKiem, i: number): KetQuaKiem[] {
	const ra: KetQuaKiem[] = [];
	if (!co(OKR_KIEM.kieuKhongHoiViec, kr.kind) && laViec(kr.title)) ra.push({ ma: "kr-la-viec", truong: "title", krIndex: i });
	if (!co(OKR_KIEM.kieuKhongHoiKhoiDiem, kr.kind) && kr.startValue === 0) ra.push({ ma: "thieu-khoi-diem", truong: "startValue", krIndex: i });
	if (co(OKR_KIEM.kieuHoiDichBangKhoi, kr.kind) && kr.targetValue === kr.startValue) ra.push({ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: i });
	return ra;
}

export function kiemOkr(mt: MucTieuKiem): KetQuaKiem[] {
	const ds = mt.keyResults;
	const motChieu = ds.length >= OKR_KIEM.doiTrongToiThieuKr && ds.every((k) => k.kind === OKR_KIEM.kieuDayMotChieu) && !ds.some((k) => co(OKR_KIEM.kieuDoiTrong, k.kind));
	return [...ds.flatMap(kiemKr), ...(motChieu ? [{ ma: "thieu-doi-trong", truong: "keyResults", krIndex: null } satisfies KetQuaKiem] : [])];
}
```

- [ ] **Step 4: Chạy lại** → PASS 26 ca.
- [ ] **Step 5: Phá-thử (cặp hai chiều)** — commit trước (bài học «phá-thử phải commit trước»), rồi trong bản sao tạm đổi `boDau` thành `s.toLowerCase().trim()` → ca «viec không dấu» vẫn xanh nhưng «viec có dấu» đỏ in đầu ra nhận; đổi lại; ghi lệnh phá-thử vào tin commit.
- [ ] **Step 6: Commit** — `git add packages/validation/src/okr-kiem.ts packages/validation/test/okr-kiem.spec.ts packages/validation/package.json && git commit -m "khep-ky-okr: luật chất lượng khi đặt"`

Verify per-task: `cd packages/validation && bun test test/okr-kiem.spec.ts && bunx tsc --noEmit -p .`

---

### Task 2: Điểm, lưới và khuôn đầu vào dùng chung

**independent: true** · phục vụ E8, E9, E12 (AC-5, AC-6, AC-9)

**Files:**
- Create: `packages/validation/src/okr-khep.ts`
- Create: `packages/validation/test/okr-khep.spec.ts`
- Modify: `packages/validation/package.json` (`"./okr-khep": "./src/okr-khep.ts"`)
- Modify: `packages/validation/src/okr-vet.ts` (bảy hành động mới, cuối mảng, đúng thứ tự: `mo-ra`, `dong-ra`, `doi-dich`, `cham-kr`, `nhin-lai`, `mang-sang`, `mo-lai-ky`)

**Interfaces:**
- Consumes: `tienDoKr`, `KieuKr` (`okr-kr`); `THANG_CHAM` (`okr-chuong-trinh`); `LOAI_MUC_TIEU` (`okr-muc-tieu`); `ngayLich` (`okr-chu-ky`).
- Produces: `OKR_KHEP`; `type ThangCham = "0-1" | "0-100"`; `goiYDiem(kieu, khoi, dich, soChot): number`; `diemChuan(v: number, thang): number | null`; `diemTheoThang(d: number, thang): number`; `luoiDiem(thang): number[]`; `diemMucTieu(krs: { diem: number | null; weight: number }[], trongSoBat: boolean): number | null`; `CACH_DOC = ["tot","duoi-muc-tot","dat","chua-tron"] as const`; `cachDoc(loai, diem): CachDoc`; khuôn `moRaInput`, `dongRaInput`, `chamKrInput`, `ghiDieuHocDuocInput`, `moLaiKyInput`, `mangSangInput`, `xuatKyInput`, `lyDoDoiDich`.

- [ ] **Step 1: Bài đỏ** — bảng 20 ô của E8 chép nguyên văn, cộng lưới hai thang, trung bình có trọng số, câu đọc.

```ts
import { describe, expect, test } from "bun:test";
import { cachDoc, diemChuan, diemMucTieu, diemTheoThang, goiYDiem } from "../src/okr-khep";

const O: [string, Parameters<typeof goiYDiem>, number][] = [
	["tăng tới 60→80 chốt 70", ["tang-toi", 60, 80, 70], 0.5],
	["tăng tới 60→80 chốt 80", ["tang-toi", 60, 80, 80], 1],
	["tăng tới 60→80 chốt 90", ["tang-toi", 60, 80, 90], 1],
	["tăng tới 0→100 chốt 84", ["tang-toi", 0, 100, 84], 0.8],
	["tăng tới 0→100 chốt 85", ["tang-toi", 0, 100, 85], 0.9],
	["tăng tới 0→100 chốt 86", ["tang-toi", 0, 100, 86], 0.9],
	["giảm xuống 8→2 chốt 5", ["giam-xuong", 8, 2, 5], 0.5],
	["giảm xuống 8→2 chốt 2", ["giam-xuong", 8, 2, 2], 1],
	["giảm xuống 8→2 chốt 1", ["giam-xuong", 8, 2, 1], 1],
	["giữ trên 90 chốt 85", ["giu-tren", 80, 90, 85], 0],
	["giữ trên 90 chốt 90", ["giu-tren", 80, 90, 90], 1],
	["giữ trên 90 chốt 95", ["giu-tren", 80, 90, 95], 1],
	["giữ dưới 5 chốt 6", ["giu-duoi", 7, 5, 6], 0],
	["giữ dưới 5 chốt 5", ["giu-duoi", 7, 5, 5], 1],
	["giữ dưới 5 chốt 4", ["giu-duoi", 7, 5, 4], 1],
	["mốc chốt 0", ["moc", 0, 1, 0], 0],
	["mốc chốt 1", ["moc", 0, 1, 1], 1],
	["phần trăm 20→80 chốt 50", ["phan-tram", 20, 80, 50], 0.5],
	["phần trăm 20→80 chốt 80", ["phan-tram", 20, 80, 80], 0.8],
	["phần trăm 20→80 chốt 100", ["phan-tram", 20, 80, 100], 1],
];

describe("goi-y-diem", () => {
	for (const [ten, dau, mong] of O) test(ten, () => expect(goiYDiem(...dau)).toBe(mong));
});

describe("thang", () => {
	test("0-1 nhận 0.8, từ chối 0.75 và 1.1", () => {
		expect(diemChuan(0.8, "0-1")).toBe(0.8);
		expect(diemChuan(0.75, "0-1")).toBeNull();
		expect(diemChuan(1.1, "0-1")).toBeNull();
	});
	test("0-100 nhận 80, từ chối 85 và 0.8", () => {
		expect(diemChuan(80, "0-100")).toBe(0.8);
		expect(diemChuan(85, "0-100")).toBeNull();
		expect(diemChuan(0.8, "0-100")).toBeNull();
	});
	test("đọc theo thang", () => {
		expect(diemTheoThang(0.8, "0-100")).toBe(80);
		expect(diemTheoThang(0.8, "0-1")).toBe(0.8);
	});
});

describe("diem-muc-tieu", () => {
	test("chưa chấm hết → null", () => expect(diemMucTieu([{ diem: 1, weight: 1 }, { diem: null, weight: 1 }], false)).toBeNull());
	test("trung bình thường", () => expect(diemMucTieu([{ diem: 1, weight: 3 }, { diem: 0.4, weight: 1 }], false)).toBe(0.7));
	test("trung bình có trọng số 3/1", () => expect(diemMucTieu([{ diem: 1, weight: 3 }, { diem: 0.4, weight: 1 }], true)).toBe(0.85));
});

describe("cach-doc", () => {
	test("tham vọng 0.7 → tốt", () => expect(cachDoc("tham-vong", 0.7)).toBe("tot"));
	test("tham vọng 0.65 → dưới mức tốt", () => expect(cachDoc("tham-vong", 0.65)).toBe("duoi-muc-tot"));
	test("cam kết 1 → đạt", () => expect(cachDoc("cam-ket", 1)).toBe("dat"));
	test("cam kết 0.9 → chưa trọn", () => expect(cachDoc("cam-ket", 0.9)).toBe("chua-tron"));
});
```

- [ ] **Step 2: Chạy, đỏ** — `cd packages/validation && bun test test/okr-khep.spec.ts`.
- [ ] **Step 3: Viết mô-đun**

```ts
import { z } from "zod";
import { ngayLich } from "./okr-chu-ky";
import { THANG_CHAM } from "./okr-chuong-trinh";
import { type KieuKr, tienDoKr } from "./okr-kr";
import type { LoaiMucTieu } from "./okr-muc-tieu";

export const OKR_KHEP = {
	buocPhanTram: 10,
	nguongThamVong: 0.7,
	lyDo: { toiThieu: 10, toiDa: 500 },
	dieuHocDuoc: { toiDa: 2000 },
	chamDon: { phut: 10 },
} as const;

export type ThangCham = (typeof THANG_CHAM)[number];
const ma = z.string().trim().min(1).max(120);
const lyDo = z.string().trim().min(OKR_KHEP.lyDo.toiThieu).max(OKR_KHEP.lyDo.toiDa);

export function goiYDiem(kieu: KieuKr, khoi: number, dich: number, soChot: number): number {
	const p = tienDoKr(kieu, khoi, dich, soChot);
	const b = OKR_KHEP.buocPhanTram;
	return (Math.floor((p + b / 2) / b) * b) / 100;
}

export function luoiDiem(thang: ThangCham): number[] {
	const n = 100 / OKR_KHEP.buocPhanTram;
	return Array.from({ length: n + 1 }, (_, i) => (thang === "0-100" ? i * OKR_KHEP.buocPhanTram : i / n));
}

export function diemChuan(v: number, thang: ThangCham): number | null {
	const phanTram = thang === "0-100" ? v : v * 100;
	const tron = Math.round(phanTram);
	if (Math.abs(phanTram - tron) > 1e-9) return null;
	if (tron < 0 || tron > 100 || tron % OKR_KHEP.buocPhanTram !== 0) return null;
	if (thang === "0-100" && !Number.isInteger(v)) return null;
	return tron / 100;
}

export function diemTheoThang(d: number, thang: ThangCham): number {
	return thang === "0-100" ? Math.round(d * 100) : d;
}

export function diemMucTieu(krs: { diem: number | null; weight: number }[], trongSoBat: boolean): number | null {
	if (krs.length === 0 || krs.some((k) => k.diem === null)) return null;
	const w = (k: { weight: number }) => (trongSoBat ? k.weight : 1);
	const tong = krs.reduce((s, k) => s + w(k), 0);
	if (tong === 0) return null;
	return Math.round((krs.reduce((s, k) => s + (k.diem ?? 0) * w(k), 0) / tong) * 100) / 100;
}

export const CACH_DOC = ["tot", "duoi-muc-tot", "dat", "chua-tron"] as const;
export type CachDoc = (typeof CACH_DOC)[number];
export function cachDoc(loai: LoaiMucTieu, diem: number): CachDoc {
	if (loai === "tham-vong") return diem >= OKR_KHEP.nguongThamVong ? "tot" : "duoi-muc-tot";
	return diem >= 1 ? "dat" : "chua-tron";
}

export const lyDoDoiDich = lyDo;
export const moRaInput = z.object({ cycleId: ma, tuNgay: ngayLich, denNgay: ngayLich }).refine((v) => v.tuNgay <= v.denNgay, { message: "tuNgay <= denNgay" });
export const dongRaInput = z.object({ id: ma });
export const chamKrInput = z.object({ keyResultId: ma, diem: z.number().finite(), lyDo: z.string().trim().max(OKR_KHEP.lyDo.toiDa).optional() });
export const ghiDieuHocDuocInput = z.object({ objectiveId: ma, noiDung: z.string().trim().max(OKR_KHEP.dieuHocDuoc.toiDa) });
export const moLaiKyInput = z.object({ id: ma, lyDo });
export const mangSangInput = z.object({ objectiveId: ma });
export const xuatKyInput = z.object({ cycleId: ma });
export type ChamKrInput = z.infer<typeof chamKrInput>;
export type MoRaInput = z.infer<typeof moRaInput>;
```

Kiểm tay trước khi chạy: `diemMucTieu` thường (1·1 + 0.4·1)/2 = 0.7; có trọng số (1·3 + 0.4·1)/4 = 0.85.

- [ ] **Step 4: Chạy lại** → PASS.
- [ ] **Step 5: Phá-thử** — commit, rồi bản sao `goiYDiem` dùng `Math.floor(p / b)` → ô «chốt 86» đỏ in 0.8; bản sao `Math.ceil` → ô «chốt 84» đỏ in 0.9; bản sao phần trăm theo `(chốt − khởi) / (đích − khởi)` → ô «phần trăm chốt 80» đỏ in 1. Hoàn nguyên.
- [ ] **Step 6: Commit** — `git commit -m "khep-ky-okr: điểm, lưới, khuôn đầu vào dùng chung"`.

Verify per-task: `cd packages/validation && bun test && bunx tsc --noEmit -p .`

---

### Task 3: Hai biến thể giao diện

**independent: true** · phục vụ E3, E13, E18 (AC-2, AC-10, AC-14)

**Files:**
- Modify: `packages/ui/src/components/field.tsx` (`FieldDescription` nhận `variant?: "default" | "hoi"`)
- Create: `packages/ui/src/components/view-switch.tsx`
- Create: `packages/ui/test/khep-ky-bien-the.dom.tsx`

**Interfaces:**
- Produces: `<FieldDescription variant="hoi">` — hiện biểu tượng dấu hỏi `aria-hidden` trước chữ, `data-variant="hoi"`; `<ViewSwitch label value items onValueChange />` với `items: { value: string; label: string }[]` — từ `md` là `ToggleGroup` (outline, sm), dưới `md` là `Select`; cả hai mang `data-view-switch`.

- [ ] **Step 1: Bài DOM đỏ**

```tsx
import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { FieldDescription } from "../src/components/field";
import { ViewSwitch } from "../src/components/view-switch";

describe("khep-ky-bien-the", () => {
	test("FieldDescription hoi có biểu tượng ẩn với trình đọc và data-variant", () => {
		const { container } = render(<FieldDescription variant="hoi">Khởi điểm 0 là số thật, hay chưa đo?</FieldDescription>);
		const el = container.querySelector('[data-slot="field-description"]');
		expect(el?.getAttribute("data-variant")).toBe("hoi");
		expect(el?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
	});
	test("FieldDescription mặc định không đổi", () => {
		const { container } = render(<FieldDescription>Đã khoá khi công bố.</FieldDescription>);
		expect(container.querySelector("svg")).toBeNull();
	});
	test("ViewSwitch dựng cả hai lối, mỗi lối một khổ", () => {
		const { container } = render(<ViewSwitch label="Cách xem" value="cham" onValueChange={() => {}} items={[{ value: "danh-sach", label: "Danh sách" }, { value: "cham", label: "Chấm điểm" }]} />);
		expect(container.querySelectorAll("[data-view-switch]").length).toBe(2);
		expect(container.querySelector('[data-view-switch="nut"]')?.className).toContain("hidden md:");
		expect(container.querySelector('[data-view-switch="chon"]')?.className).toContain("md:hidden");
	});
});
```

- [ ] **Step 2: Chạy đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khep-ky-bien-the.dom.tsx`.
- [ ] **Step 3: Viết** — đọc `field.tsx` hiện có; thêm `variant` qua `cva` như `alert.tsx` (tông `hoi`: cùng màu chữ phụ, thêm `Help` từ `@carbon/icons-react/es/Help` trong `Icon` `aria-hidden`); `view-switch.tsx`:

```tsx
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@crm/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";

export function ViewSwitch({ label, value, items, onValueChange }: { label: string; value: string; items: { value: string; label: string }[]; onValueChange: (v: string) => void }) {
	return (
		<>
			<ToggleGroup aria-label={label} className="hidden md:flex" data-view-switch="nut" size="sm" type="single" value={value} variant="outline" onValueChange={(v) => { if (v) onValueChange(v); }}>
				{items.map((i) => <ToggleGroupItem key={i.value} value={i.value}>{i.label}</ToggleGroupItem>)}
			</ToggleGroup>
			<div className="md:hidden" data-view-switch="chon">
				<Select value={value} onValueChange={onValueChange}>
					<SelectTrigger aria-label={label} size="sm"><SelectValue /></SelectTrigger>
					<SelectContent>{items.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
				</Select>
			</div>
		</>
	);
}
```

Tra `docs/design.md` «Vẽ tay là bậc cuối» và `docs/reui.md`: tìm `reui` «segmented»/«view switcher» trước (bậc 1–3); không có mới dựng bậc 5 — ghi câu tìm vào mô tả PR.
- [ ] **Step 4: Chạy xanh**; `cd packages/ui && bun test test/messages-guard.spec.ts`.
- [ ] **Step 5: Phá-thử** — bản sao bỏ `md:hidden` → ca ViewSwitch đỏ.
- [ ] **Step 6: Commit** — `git commit -m "khep-ky-okr: biến thể câu hỏi và bộ chọn cách xem"`.

Verify per-task: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khep-ky-bien-the.dom.tsx && bunx tsc --noEmit -p .`

---

### Task 4: Năm bảng mới và `migration` chỉ thêm

**independent: false** (mọi task máy chủ sau đứng trên nó) · phục vụ E20 (AC-15)

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (khối liền cuối tệp; quan hệ ngược trên `OkrCycle`, `OkrObjective`, `OkrKeyResult`)
- Create: `packages/db/prisma/migrations/<mốc sau mốc mới nhất của onehub>_okr_khep_ky/migration.sql` (sinh bằng `bunx prisma migrate dev --create-only --name okr_khep_ky` trong `packages/db`)
- Create: `_acceptance/khep-ky-okr/rang/migration-chi-them.mjs` (chép khuôn `_acceptance/so-okr-tu-chay/rang/migration-chi-them.mjs`, đổi danh sách model và bảng)

**Interfaces:**
- Produces: `db.okrCuaSoRa`, `db.okrDoiDich`, `db.okrDiemKr`, `db.okrNhinLai`, `db.okrMangSang`.

- [ ] **Step 1: Viết thước đỏ** — `migration-chi-them.mjs` suy gốc kho từ `import.meta.dirname`, đọc `git diff --name-only origin/onehub...HEAD -- packages/db/prisma/migrations`, kiểm: mỗi câu thuộc tập cho phép; năm model mới liền nhau là các model cuối; khoá ngoại tới `okrCycle`, `okrObjective`, `okrKeyResult` có `ON DELETE RESTRICT`; `--chieu-do` sinh bốn tệp giả trong `os.tmpdir()` (ADD COLUMN trên okrCycle; DROP INDEX; model giữa tệp; CASCADE) + một tệp lành → bốn đỏ ghim, một xanh. Chạy trước khi có `migration` → exit 1 «không có migration mới».
- [ ] **Step 2: Thêm schema**

```prisma
model OkrCuaSoRa {
  id            String       @id @default(cuid())
  cycleId       String
  cycle         OkrCycle     @relation(fields: [cycleId], references: [id], onDelete: Restrict)
  tuNgay        DateTime     @db.Date
  denNgay       DateTime     @db.Date
  moBoiUserId   String
  dongLuc       DateTime?
  dongBoiUserId String?
  doiDich       OkrDoiDich[]
  createdAt     DateTime     @default(now())

  @@index([cycleId])
  @@map("okrCuaSoRa")
}

model OkrDoiDich {
  id           String       @id @default(cuid())
  keyResultId  String
  keyResult    OkrKeyResult @relation(fields: [keyResultId], references: [id], onDelete: Restrict)
  truoc        Decimal      @db.Decimal(18, 4)
  sau          Decimal      @db.Decimal(18, 4)
  lyDo         String       @default("")
  ngoaiRa      Boolean
  cuaSoRaId    String?
  cuaSoRa      OkrCuaSoRa?  @relation(fields: [cuaSoRaId], references: [id], onDelete: Restrict)
  tacGiaUserId String
  luc          DateTime     @default(now())

  @@index([keyResultId, luc])
  @@map("okrDoiDich")
}

model OkrDiemKr {
  id                  String       @id @default(cuid())
  keyResultId         String       @unique
  keyResult           OkrKeyResult @relation(fields: [keyResultId], references: [id], onDelete: Restrict)
  cycleId             String
  cycle               OkrCycle     @relation(fields: [cycleId], references: [id], onDelete: Restrict)
  soChot              Decimal      @db.Decimal(18, 4)
  diemGoiY            Decimal      @db.Decimal(3, 2)
  diem                Decimal?     @db.Decimal(3, 2)
  lyDo                String?
  thang               String
  trongSoBat          Boolean
  phienBanChuongTrinh Int
  chamBoiUserId       String?
  chamLuc             DateTime?
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  @@index([cycleId])
  @@map("okrDiemKr")
}

model OkrNhinLai {
  id           String       @id @default(cuid())
  objectiveId  String       @unique
  objective    OkrObjective @relation(fields: [objectiveId], references: [id], onDelete: Restrict)
  dieuHocDuoc  String
  suaBoiUserId String
  suaLuc       DateTime     @updatedAt

  @@map("okrNhinLai")
}

model OkrMangSang {
  id              String       @id @default(cuid())
  tuObjectiveId   String
  tuObjective     OkrObjective @relation("OkrMangSangTu", fields: [tuObjectiveId], references: [id], onDelete: Restrict)
  sangObjectiveId String       @unique
  sangObjective   OkrObjective @relation("OkrMangSangSang", fields: [sangObjectiveId], references: [id], onDelete: Restrict)
  sangCycleId     String
  sangCycle       OkrCycle     @relation(fields: [sangCycleId], references: [id], onDelete: Restrict)
  boiUserId       String
  luc             DateTime     @default(now())

  @@unique([tuObjectiveId, sangCycleId])
  @@map("okrMangSang")
}
```

Quan hệ ngược (không sinh cột): `OkrCycle { cuaSoRa OkrCuaSoRa[]  diemKr OkrDiemKr[]  mangSangToi OkrMangSang[] }`; `OkrObjective { nhinLai OkrNhinLai?  mangSangDi OkrMangSang[] @relation("OkrMangSangTu")  mangSangTu OkrMangSang? @relation("OkrMangSangSang") }`; `OkrKeyResult { doiDich OkrDoiDich[]  diemKr OkrDiemKr? }`.

Cảnh báo: mục tiêu nháp mang sang tới rồi bị xoá — `OkrObjective` hôm nay không có thủ tục xoá, chỉ «bỏ»; `RESTRICT` giữ nối.
- [ ] **Step 3: Sinh `migration`**, đọc SQL: chỉ `CREATE TABLE`, `CREATE (UNIQUE) INDEX`, `ALTER TABLE "okr…mới" ADD CONSTRAINT`. `bun run db:generate`.
- [ ] **Step 4: Chạy thước** — `bun _acceptance/khep-ky-okr/rang/migration-chi-them.mjs` → exit 0; `--chieu-do` → bốn đỏ ghim + một xanh.
- [ ] **Step 5: Commit** — `git commit -m "khep-ky-okr: năm bảng khép kỳ, migration chỉ thêm"`.

Verify per-task: `cd packages/db && bunx prisma validate && bun run db:generate && cd ../.. && bun run check-types`

---

### Task 5: Cửa sổ rà giữa kỳ

**independent: false** (cần Task 2, 4) · phục vụ E5 (AC-3)

**Files:**
- Create: `apps/api/src/okr/khep.ts`, `apps/api/src/okr/okr-khep.service.ts`, `apps/api/src/okr/okr-khep.contracts.ts`
- Modify: `apps/api/src/okr/okr.router.ts`, `okr.module.ts`, `okr.contracts.ts` (`chuKyOutput` thêm `cuaSoRa: z.object({ id, tuNgay, denNgay }).nullable()`), `okr.service.ts` (`cycles`, `chuKyRa`), `okr-config.ts` (`thongDiep.khep`)
- Create: `apps/api/test/okr-khep-san.ts`, `apps/api/test/okr-khep.spec.ts` (`describe("cua-so-ra")`)

**Interfaces:**
- Consumes: `moRaInput`, `dongRaInput` (Task 2); `OkrService.vet`, `OkrService.assertKyGhiDuoc`, `OkrAccessService.assertQuanTri`.
- Produces: `OkrKhepService.moRa(userId, input)`, `dongRa(userId, id)`; hàm thuần `cuaSoHieuLuc(tx, cycleId, homNay: string): Promise<{ id: string; tuNgay: string; denNgay: string } | null>` trong `apps/api/src/okr/khep.ts` (Task 6, 7 dùng — hàm thuần để `OkrService` gọi được mà không tiêm vòng); tRPC `okr.moRa`, `okr.dongRa` (REST `POST /okr/cycles/{cycleId}/review-window`, `POST /okr/review-windows/{id}/close`).

- [ ] **Step 1: Sàn thử** `okr-khep-san.ts` — dùng `taoNam`, `taoQuy`, `dangChay`, `tao`, `goi` của `okr-san.ts`; xuất `gieoKyQuy({ tu, den })`, `gieoMucTieuCongBo(cycleId, krs)` (gọi `okr.createObjective`, `okr.createKeyResult`, `okr.publishObjective` thật — không chèn bảng tay).
- [ ] **Step 2: Bài đỏ** `describe("cua-so-ra")` — đúng ma trận E5: `setSystemTime(new Date("2026-11-18T03:00:00Z"))`; `moRa(16/11, 22/11)` → đọc `db.okrCuaSoRa`, `okr.cycles` có `cuaSoRa`; `dongRa` → `dongLuc` có, `cycles.cuaSoRa` null; đúng hai dòng vết `mo-ra`, `dong-ra`. Hai ca biên giờ VN: `2026-11-22T16:59:00Z` (23:59 VN) còn trong; `2026-11-22T17:00:00Z` (00:00 VN 23/11) ngoài. Bảy ca từ chối, mỗi ca `expect(tra.loi).toContain(CAU.x)` + đếm `okrCuaSoRa`, `okrTrail` không đổi. Đối chứng dương. `afterAll(() => setSystemTime())`.
- [ ] **Step 3: Chạy đỏ** — `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts -t cua-so-ra"`.
- [ ] **Step 4: Viết** — `khep.ts`:

```ts
export async function cuaSoHieuLuc(tx: Prisma.TransactionClient | Db, cycleId: string, homNay: string) {
	const r = await tx.okrCuaSoRa.findFirst({
		where: { cycleId, dongLuc: null, tuNgay: { lte: toDate(homNay) }, denNgay: { gte: toDate(homNay) } },
		orderBy: { tuNgay: "desc" },
	});
	return r ? { id: r.id, tuNgay: ngayVN(r.tuNgay), denNgay: ngayVN(r.denNgay) } : null;
}
```

`OkrKhepService`:

```ts
@Injectable()
export class OkrKhepService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
	) {}

	async moRa(userId: string, input: MoRaInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const c = await tx.okrCycle.findUnique({ where: { id: input.cycleId } });
			if (!c) throw new NotFoundException(T.khongCoChuKy(input.cycleId));
			if (c.phase !== "dang-chay") throw new BadRequestException(T.khep.raChiKhiDangChay);
			if (input.tuNgay < ngayVN(c.startsOn) || input.denNgay > ngayVN(c.endsOn)) throw new BadRequestException(T.khep.raNgoaiKy);
			const chong = await tx.okrCuaSoRa.findFirst({ where: { cycleId: c.id, dongLuc: null, tuNgay: { lte: toDate(input.denNgay) }, denNgay: { gte: toDate(input.tuNgay) } } });
			if (chong) throw new BadRequestException(T.khep.raChong);
			const r = await tx.okrCuaSoRa.create({ data: { cycleId: c.id, tuNgay: toDate(input.tuNgay), denNgay: toDate(input.denNgay), moBoiUserId: userId } });
			await this.okr.vet(tx, userId, "mo-ra", { cycleId: c.id }, null, { tuNgay: input.tuNgay, denNgay: input.denNgay });
			return { id: r.id, canhBao: null };
		});
	}
}
```

`dongRa` tương tự (`dongLuc: new Date()`, `dongBoiUserId`, vết `dong-ra`; cửa sổ đã đóng → câu ghim). Câu ghim thêm vào `OKR.thongDiep.khep` (`raChiKhiDangChay`, `raNgoaiKy`, `raChong`, `raDaDong`). `cycles(homNay)` đọc mọi cửa sổ còn hiệu lực hôm nay bằng một câu `okrCuaSoRa.findMany` (cùng điều kiện với `cuaSoHieuLuc`, không lọc `cycleId`) rồi ghép theo `cycleId` — không N câu. Router: hai `@Mutation` theo mẫu `setCyclePhase`, `input: moRaInput` / `dongRaInput`, `output: okOutput`. Module: thêm `OkrKhepService` vào `providers`, router tiêm nó.
- [ ] **Step 5: Chạy xanh**; phá-thử: bỏ điều kiện `chong` → ca chồng đỏ in hai cửa sổ.
- [ ] **Step 6: Commit** — `git commit -m "khep-ky-okr: cửa sổ rà giữa kỳ"`.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts -t cua-so-ra" && bun run check-types`

---

### Task 6: Đổi đích trong và ngoài rà

**independent: false** (cần Task 5) · phục vụ E6 (AC-4)

**Files:**
- Modify: `apps/api/src/okr/okr.service.ts` (`updateKeyResult`), `okr.contracts.ts` (`updateKrInput` thêm `lyDoDoiDich: lyDoDoiDich.optional()`), `okr.module.ts`
- Test: `apps/api/test/okr-khep.spec.ts` (`describe("doi-dich")`)

**Interfaces:**
- Consumes: hàm thuần `cuaSoHieuLuc(tx, cycleId, homNay)` trong `apps/api/src/okr/khep.ts` (Task 5).
- Produces: dòng `okrDoiDich` cho mỗi lần đổi đích của KR thuộc mục tiêu đã công bố ở pha đang chạy.

- [ ] **Step 1: Bài đỏ** — bốn ca (a)–(d) của E6 và hai ca biên (00:00 VN ngày đầu cửa sổ: trong; 00:00 VN ngày sau ngày cuối: ngoài), ca «chỉ đổi tên ngoài rà không đòi lý do». Câu ghim: `"Đổi đích ngoài rà giữa kỳ cần lý do"`.
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết** — trong giao dịch của `updateKeyResult`, sau `assertSoTheoKieu`, trước `update`:

```ts
const doiDich = input.targetValue !== undefined && input.targetValue !== soKr(kr.targetValue);
let dongDoiDich: Prisma.OkrDoiDichUncheckedCreateInput | null = null;
if (doiDich && dangChay) {
	const ra = await cuaSoHieuLuc(tx, quyen.objective.cycleId, ngay(new Date()));
	if (ra === null && !input.lyDoDoiDich) throw new BadRequestException(T.khep.lyDoDoiDich);
	dongDoiDich = {
		keyResultId: kr.id,
		truoc: soKr(kr.targetValue),
		sau: input.targetValue as number,
		lyDo: input.lyDoDoiDich ?? "",
		ngoaiRa: ra === null,
		cuaSoRaId: ra?.id ?? null,
		tacGiaUserId: userId,
	};
}
```

Sau `update`: `if (dongDoiDich) { await tx.okrDoiDich.create({ data: dongDoiDich }); await this.vet(tx, userId, "doi-dich", {…}, { targetValue: truoc }, { targetValue: sau, ngoaiRa }, dongDoiDich.lyDo || null); }`. `lyDoDoiDich` sai độ dài bị Zod chặn ở biên (400).
- [ ] **Step 4: Chạy xanh**; chạy lại `bun run test -- "cd apps/api && bun test test/okr.spec.ts"` (lượt 3) — xanh.
- [ ] **Step 5: Phá-thử** — bản sao lấy ngày bằng `new Date().toISOString().slice(0, 10)` (UTC) → ca 23:59 VN đỏ.
- [ ] **Step 6: Commit.**

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts -t doi-dich && bun test test/okr.spec.ts"`

---

### Task 7: Luật pha, sang chấm và chốt số

**independent: false** (cần Task 2, 4) · phục vụ E8, E10 phần đóng (AC-5, AC-7)

**Files:**
- Modify: `apps/api/src/okr/khep.ts` (thêm `chotKyCham`, `kiemDongKy`), `okr.service.ts` (`setCyclePhase`), `okr-config.ts`
- Test: `apps/api/test/okr-khep.spec.ts` (`describe("sang-cham")`)

**Interfaces:**
- Consumes: `goiYDiem` (Task 2); `OkrService.program(tx)`.
- Produces: `chotKyCham(tx, cycle: { id: string; endsOn: Date }, program: OkrProgram & { version: number }): Promise<number>` (số dòng điểm sinh); `kiemDongKy(tx, cycleId): Promise<{ conLai: number; theoDonVi: { khoa: string; ten: string; conLai: number }[] }>`.

- [ ] **Step 1: Bài đỏ** — đúng E8: sàn 20 KR theo bảng 20 ô (mỗi KR ghi số hiện tại qua `guiCapNhat` thật; KR nguồn CRM qua `datNguonKr` + `chupKrCrm`); ca 23:00 VN ngày cuối; ca 00:02 VN chưa có bản chụp; chạy `chupSoOkr` của `apps/agent` bằng `import("../../agent/agent/lib/okr-chup")` như bài lượt 6; ca 00:10 VN; lặp thang 0–100; ba ca nhảy pha; ca song song: `Promise.all([goi(quan, setCyclePhase), goi(quan, setCyclePhase)])` → một thành công, một «Pha đi từng bước», đúng 20 dòng điểm.
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết**

```ts
export async function chotKyCham(tx: Tx, cycle: { id: string; endsOn: Date }, ct: OkrProgram & { version: number }) {
	const thieu = await tx.okrKeyResult.count({
		where: { source: "crm", objective: { cycleId: cycle.id, status: "cong-bo" }, soChup: { none: { ngay: cycle.endsOn } } },
	});
	if (thieu > 0) throw new BadRequestException(T.khep.thieuSoNgayCuoi(thieu));
	const krs = await tx.okrKeyResult.findMany({
		where: { objective: { cycleId: cycle.id, status: "cong-bo" } },
		select: { id: true, kind: true, startValue: true, targetValue: true, currentValue: true },
	});
	await tx.okrDiemKr.createMany({
		data: krs.map((k) => ({
			keyResultId: k.id,
			cycleId: cycle.id,
			soChot: k.currentValue,
			diemGoiY: goiYDiem(kieuKr.parse(k.kind), Number(k.startValue), Number(k.targetValue), Number(k.currentValue)),
			thang: ct.scoreScale,
			trongSoBat: ct.weightsOn,
			phienBanChuongTrinh: ct.version,
		})),
	});
	await tx.okrCuaSoRa.updateMany({ where: { cycleId: cycle.id, dongLuc: null }, data: { dongLuc: new Date() } });
	return krs.length;
}
```

`setCyclePhase`: khoá hàng `SELECT id FROM "okrCycle" WHERE id = … FOR UPDATE`; thay luật «chỉ đi tới» bằng «đúng một bước»: `if (PHA_CHU_KY.indexOf(phase) !== PHA_CHU_KY.indexOf(phaCu) + 1) throw T.khep.phaTungBuoc`; `phase === "cham-diem"` → `if (ngay(new Date()) <= ngay(c.endsOn)) throw T.khep.chamTuNgaySau` rồi `chotKyCham`; `phase === "da-dong"` → `kiemDongKy` và `conLai > 0` → `T.khep.conKrChuaCham(conLai)`. Câu ghim chép nguyên văn từ E8/E10: «Sang chấm điểm từ ngày sau ngày cuối của chu kỳ», «Còn N KR nguồn CRM chưa có số ngày cuối», «Pha đi từng bước», «Còn N KR chưa chấm».
- [ ] **Step 4: Chạy xanh**; chạy lại bài lượt 3 và 6 (`okr.spec.ts`, `okr-nguon.spec.ts`, `okr-cap-nhat.spec.ts`) — ca nào nhảy pha thì sửa **bài** cho đi từng bước (ghi `fix` vào sổ; hồ sơ `dat-okr-trong-crm`, `so-okr-tu-chay` vào danh sách ghim lại).
- [ ] **Step 5: Phá-thử** — ba bản sao của E8 (không lọc `status`; bỏ gác bản chụp; `FOR UPDATE` bỏ → ca song song có lúc 40 dòng — chạy 5 lần).
- [ ] **Step 6: Commit.**

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts -t sang-cham"`

---

### Task 8: Chấm, điều học được, bảng chấm

**independent: false** (cần Task 7) · phục vụ E9 (AC-6)

**Files:**
- Modify: `apps/api/src/okr/okr-khep.service.ts` (`chamKr`, `ghiDieuHocDuoc`, `bangCham`), `okr-khep.contracts.ts`, `okr.router.ts`
- Test: `apps/api/test/okr-khep.spec.ts` (`describe("cham-va-nhin-lai")`)

**Interfaces:**
- Consumes: `chamKrInput`, `ghiDieuHocDuocInput`, `diemChuan`, `diemTheoThang`, `diemMucTieu`, `cachDoc` (Task 2); `assertSuaKr`, `assertSuaMucTieu`.
- Produces: `bangChamOutput = { thang: ThangCham; conLai: number; chuaCham: { khoa: string; ten: string; conLai: number }[]; mucTieu: { id; title; kind; ownerName; suaDuoc: boolean; diem: number | null; cachDoc: CachDoc | null; dieuHocDuoc: string; mangSangToi: { objectiveId; cycleName } | null; mangSangTu: { objectiveId; cycleName } | null; krs: { id; title; kind; ownerName; unit; startValue; targetValue; soChot; diemGoiY; diem: number | null; lyDo: string | null; suaDuoc: boolean; doiDichNgoaiRa: { luc: string; truoc: number; sau: number; lyDo: string }[] }[] }[] }` — mọi điểm theo thang của dòng.

- [ ] **Step 1: Bài đỏ** — ma trận E9 đầy đủ: ba người chấm, chấm lại, bảy từ chối, `ghiDieuHocDuoc` năm ca, `bangCham` sáu ca câu đọc, trọng số, đổi đích trong/ngoài rà; lặp trên thang 0–100 (80 → 0.8 chuẩn; 85, 0.8 → ngoài lưới).
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết** — `chamKr`: `assertSuaKr`; giao dịch: pha phải `cham-diem` (khác → `T.khep.chiChamKhiChamDiem`); đọc `okrDiemKr` theo `keyResultId`; `const chuan = diemChuan(input.diem, thang)`; null → `T.khep.ngoaiLuoi`; `chuan !== Number(dong.diemGoiY)` và lý do thiếu hoặc < `OKR_KHEP.lyDo.toiThieu` → `T.khep.canLyDoCham`; `update`; vết `cham-kr` với trước/sau `{ diem, lyDo }`. `ghiDieuHocDuoc`: `assertSuaMucTieu`; pha ∈ {`dang-chay`, `cham-diem`}; `upsert okrNhinLai`; vết `nhin-lai`. `bangCham`: một câu lấy mục tiêu đã công bố của chu kỳ (lọc đơn vị như `danhSach`), `include` `keyResults.diemKr`, `keyResults.doiDich where ngoaiRa`, `nhinLai`, `mangSangDi`, `mangSangTu`; quyền sửa tính một lần bằng `quyenOkr.quyen(userId)` + `suaDuocDonVi`. Không đọc cấu hình chương trình hiện tại — `trongSoBat`, `thang` lấy từ dòng `okrDiemKr`.
- [ ] **Step 4: Chạy xanh.**
- [ ] **Step 5: Phá-thử** — hai bản sao của E9.
- [ ] **Step 6: Commit.**

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts -t cham-va-nhin-lai"`

---

### Task 9: Đóng, mở lại và khoá sau đóng

**independent: false** (cần Task 7, 8) · phục vụ E10 (AC-7)

**Files:**
- Modify: `apps/api/src/okr/okr-khep.service.ts` (`moLaiKy`), `okr.router.ts`
- Test: `apps/api/test/okr-khep.spec.ts` (`describe("dong-mo-lai")`)

- [ ] **Step 1: Bài đỏ** — đúng E10: ma trận mười bảy thủ tục ghi ở `da-dong` viết thành mảng `[tên thủ tục, đầu vào hợp lệ, hàm đọc bản ghi đích]` và lặp; `chupSoOkr` sau ngày cuối 0 dòng; `moLaiKy` năm ca.
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết** — `moLaiKy`: `assertQuanTri`; khoá hàng; pha phải `da-dong` (khác → `T.khep.chiMoLaiKhiDong`); `update phase: "cham-diem"`; vết `mo-lai-ky` với `note: input.lyDo`, trước `{ phase: "da-dong" }`, sau `{ phase: "cham-diem" }`. Không đụng `okrDiemKr`. Mọi thủ tục mới đã tự khoá theo pha ở Task 5, 8; `mangSang` cố ý không khoá theo pha nguồn (Task 10).
- [ ] **Step 4: Chạy xanh.** **Step 5: Phá-thử** (bỏ đếm `diem null` trong `kiemDongKy` → lần đóng đầu đỏ). **Step 6: Commit.**

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts -t dong-mo-lai"`

---

### Task 10: Mang sang

**independent: false** (cần Task 7, 8) · phục vụ E11 (AC-8)

**Files:**
- Modify: `apps/api/src/okr/okr-khep.service.ts` (`mangSang`), `okr.service.ts` (xuất `kiemTranMucTieu` thành `async kiemTranMucTieu(tx, cycleId, dv, them)` công khai nếu đang `private`), `okr.router.ts`
- Test: `apps/api/test/okr-khep.spec.ts` (`describe("mang-sang")`)

**Interfaces:**
- Produces: `mangSang(userId, { objectiveId }) → { id: string; cycleId: string; chep: string[]; khongChep: { keyResultId: string; lyDo: "diem-tron" | LoiSoTheoKieu }[] }`.

- [ ] **Step 1: Bài đỏ** — đúng E11 cộng ca Review Focus trọng số (KR trọng số 3 ở kỳ bật trọng số → bản chép trọng số 3).
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết** — `assertSuaMucTieu(userId, objectiveId)`; giao dịch: nguồn phải `cong-bo` và pha nguồn ∈ {`cham-diem`, `da-dong`}; chu kỳ đích: `findFirst({ where: { kind: nguon.kind, startsOn: { gt: nguon.endsOn }, phase: { in: [...PHA_GHI_DUOC] } }, orderBy: { startsOn: "asc" } })`, không có → `T.khep.chuaCoKyKe`; `assertSuaDonVi` ở đơn vị đích; `this.okr.kiemTranMucTieu(tx, dich.id, dv, 1)` (chế độ «chặn» ném); `okrMangSang` trùng → `T.khep.daMangSang`; tạo mục tiêu nháp chép trường; với mỗi KR theo `position`: `diem >= 1` → `khongChep diem-tron`; `kiemSoTheoKieu(kind, soChot, target)` khác null → `khongChep <mã>`; còn lại `create` với `startValue = soChot`, `currentValue = soChot`, `source: "tay"`, `dueOn: null`, `weight` giữ; `okrMangSang.create`; vết `mang-sang` trên mục tiêu nguồn và `tao` trên mục tiêu mới.
- [ ] **Step 4–6:** chạy xanh, phá-thử (chép cả KR điểm 1), commit.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts -t mang-sang"`

---

### Task 11: Xuất kỳ đã đóng

**independent: false** (cần Task 8) · phục vụ E12 (AC-9)

**Files:**
- Create: `apps/api/src/okr/okr-khep.csv.ts` (`dungCsv(cot: readonly string[], dong: (string | number | null)[][]): string`, BOM `﻿`, bọc ngoặc kép mọi ô có `,` `"` `\n` `\r`, nhân đôi `"`, tiền tố `'` cho ô chữ bắt đầu bằng `=` `+` `-` `@`)
- Modify: `okr-khep.service.ts` (`xuatKy`), `okr-khep.contracts.ts` (`COT_XUAT` — hằng dòng tiêu đề, dùng chung với bài), `okr.router.ts`
- Test: `apps/api/test/okr-khep-xuat.spec.ts`

- [ ] **Step 1: Bài đỏ** — đúng E12 + Review Focus (ô `=SUM(A1)` ra `'=SUM(A1)`); đọc CSV bằng một bộ đọc viết trong bài theo RFC 4180 (không `split(",")`).
- [ ] **Step 2–6:** như trên. `xuatKy` đọc `bangCham` của cả chu kỳ (không lọc đơn vị) rồi dựng dòng; số dùng `String(n)` (dấu chấm); điểm theo thang của dòng; tên tệp `okr-<tên chu kỳ bỏ dấu>-<yyyy-mm-dd>.csv`.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-khep-xuat.spec.ts"`

---

### Task 12: Ma trận phạm vi vai «chỉ OKR»

**independent: false** (cần Task 5–11) · phục vụ E16 (AC-12)

**Files:**
- Modify: `apps/api/test/vai-chi-okr.spec.ts` (`DAU_VAO_HOP_LE` cho tám thủ tục; `describe("pham-vi-khep")`)

- [ ] **Step 1:** thêm đầu vào hợp lệ, chạy `ma-tran-trpc`, `ma-tran-khoa-rest` — đỏ nếu thiếu đầu vào (bài tự dò thủ tục).
- [ ] **Step 2:** ca `pham-vi-khep` đúng E16; bài so tập tám tên mới ⊂ `soThuTuc(app)`.
- [ ] **Step 3:** phá-thử: bản sao `bangCham` trả thêm `dealId` → ca đỏ.
- [ ] **Step 4:** commit.

Verify per-task: `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"`

---

### Task 13: Chữ, hộp thoại KR, cảnh báo đối trọng, dải kỳ

**independent: false** (cần Task 1, 3, 5, 6) · phục vụ E2, E3, E4, E7 (AC-1, AC-2, AC-4)

**Files:**
- Create: `apps/app/lib/messages/okr-khep.ts` (`okrKhepMessages(locale)`: `luat[ma]`, `cachDoc[k]`, `khongPhaiDanhGia`, `dai.ra(denNgay)`, `dai.cham`, `dai.dong`, chữ màn chấm, mang sang, Cài đặt, xuất), `apps/app/test/okr-khep-chu.spec.ts`, `apps/app/app/(app)/[slug]/okr/dai-ky.tsx`
- Modify: `apps/app/test/messages-guard.spec.ts` (thêm dòng `GHIM` cho hàm ghép chữ mới), `hop-thoai-kr.tsx`, `bang-kr.tsx`, `okr/layout.tsx` (đặt `DaiKy` dưới thanh tab)

**Interfaces:**
- Consumes: `kiemOkr`, `MA_LUAT_OKR` (Task 1); `FieldDescription variant="hoi"` (Task 3); `okr.cycles().cycles[i].cuaSoRa` (Task 5); `updateKrInput.lyDoDoiDich` (Task 6).

- [ ] **Step 1: Bài chữ đỏ** `okr-khep-chu.spec.ts` — rút mã từ `MA_LUAT_OKR` và `CACH_DOC`; vi ≠ en; vi có dấu.
- [ ] **Step 2: Hộp thoại KR** — trong `hop-thoai-kr.tsx`: `const hoi = kiemOkr({ title: mucTieu.title, whyNow: "", keyResults: [{ title: o.ten, kind: o.kieu, startValue: soKhoi ?? 0, targetValue: soDich ?? 0 }] })` (tính trong render từ state hiện có, không `useEffect`); dưới ô tên: `hoi.filter((h) => h.truong === "title").map((h) => <FieldDescription variant="hoi" data-hoi-chat-luong key={h.ma}>{mk.luat[h.ma]}</FieldDescription>)`; tương tự ô khởi điểm, ô đích. Nút Lưu không phụ thuộc `hoi`. Ô «Lý do đổi đích»: hiện khi `kr` có, mục tiêu `cong-bo`, chu kỳ `dang-chay`, `cuaSoRa === null` và đích đã đổi; Lưu tắt khi lý do < `OKR_KHEP.lyDo.toiThieu`; gửi `lyDoDoiDich`.
- [ ] **Step 3: Đối trọng** — `bang-kr.tsx`: người sửa được mục tiêu → `kiemOkr(mucTieu).some((h) => h.ma === "thieu-doi-trong")` → `<Alert variant="warning">` trên bảng.
- [ ] **Step 4: Dải kỳ** — `dai-ky.tsx` đọc chu kỳ đang chọn: `cuaSoRa` → `Alert variant="warning"` «Đang rà giữa kỳ tới …»; `cham-diem` → «… đang chấm điểm»; `da-dong` → `Alert` «… đã đóng».
- [ ] **Step 5: Thước màn** — viết `_acceptance/khep-ky-okr/rang/man-khep-ky.mjs` phần E3, E4, E7 (khuôn `_acceptance/so-okr-tu-chay/rang/man-so-tu-chay.mjs`: `canh-cay.mjs` trước màn đầu, gieo qua API, `dev:session`, puppeteer-core qua `createRequire`, dọn theo id kể cả khi đỏ, `--chieu-do`).
- [ ] **Step 6:** chạy `kko_chu`, `cd apps/app && bunx tsc --noEmit -p .`, thước màn phần E3/E4/E7 qua `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khep-ky-okr/rang/man-khep-ky.mjs --chi E3,E4,E7"`; commit.

---

### Task 14: Màn Chấm điểm và hộp thoại mang sang

**independent: false** (cần Task 3, 8, 10, 13) · phục vụ E13, E14, E21 (AC-10)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/cham-diem.tsx`, `hop-thoai-mang-sang.tsx`, `apps/app/test/okr-khep-cham.dom.tsx`
- Modify: `okr-search-params.ts` (`CACH_XEM = ["danh-sach", "cay", "hop-tuan", "cham"]`), `theo-don-vi/theo-don-vi.tsx` (thay `ToggleGroup` bằng `ViewSwitch`; mục «Chấm điểm» chỉ khi chu kỳ đang chọn ở `cham-diem`/`da-dong`; `xem === "cham"` → `<ChamDiem cycleId unit />`)

**Interfaces:**
- Consumes: `okr.bangCham`, `okr.chamKr`, `okr.ghiDieuHocDuoc`, `okr.mangSang`; `luoiDiem`, `OKR_KHEP` (Task 2).
- Produces: `ChamDiem({ cycleId, unit })` — thành phần nhận dữ liệu từ `useQuery`, trình bày theo bản mẫu `apps/app/app/proto/_modules/khep-ky-okr/cham.tsx` (hướng A): `Alert` «không phải đánh giá nhân sự», «Đã chấm N/M KR», `Card` mỗi mục tiêu, `SimpleTable` KR (điểm và lý do xuống dưới tên ở khổ nhỏ), `Field` «Điều học được» + nút «Lưu điều học được», nút «Mang sang <chu kỳ kế>»; kỳ `da-dong` chỉ đọc; ba trạng thái tải, rỗng, lỗi có «Thử lại».

- [ ] **Step 1: Bài DOM đỏ** `okr-khep-cham.dom.tsx` — đúng E21, dựng `ChamDiemBang` (phần trình bày tách khỏi phần lấy dữ liệu) với props viết trước và `onCham` giả đếm lần gọi.
- [ ] **Step 2:** viết `cham-diem.tsx` hai lớp (`ChamDiem` lấy dữ liệu, `ChamDiemBang` trình bày); `hop-thoai-mang-sang.tsx` dùng `Dialog`, `DialogClose` cho Huỷ, nội dung theo đầu ra `mangSang` xem trước (gọi `bangCham` đã có đủ dữ liệu để nói KR nào chép — cùng luật `diem < 1` và `kiemSoTheoKieu` từ `@crm/validation/okr-kr`, không gọi máy chủ riêng).
- [ ] **Step 3:** thước màn E13/E14 trong `man-khep-ky.mjs` (chặn `bangCham` bằng cửa chặn trình duyệt cho ca lỗi — bài học «chặn truy vấn ở trình duyệt khi trang không tải trước»).
- [ ] **Step 4:** chạy `kko_bang_cham_dom`, tsc, thước màn E13/E14; commit.

---

### Task 15: Điều khiển chu kỳ ở Cài đặt và nút Xuất

**independent: false** (cần Task 5, 7, 9, 11) · phục vụ E15, E22 (AC-11)

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/okr/sheet-mo-ra.tsx`, `hop-thoai-dong-ky.tsx`, `hop-thoai-mo-lai.tsx`
- Modify: `settings/okr/bang-chu-ky.tsx` (menu: «Mở rà giữa kỳ», «Đóng rà sớm», «Sang chấm điểm», «Đóng kỳ», «Mở lại kỳ» theo pha; dòng phụ «Rà giữa kỳ: …»), `okr/toan-canh/toan-canh.tsx` (nút «Xuất» khi chu kỳ `da-dong`: gọi `okr.xuatKy`, tải bằng `Blob` + `URL.createObjectURL` + thẻ `a` có `download`)

- [ ] **Step 1:** «Đóng kỳ» mở `hop-thoai-dong-ky.tsx`: đọc `okr.bangCham({ cycleId, unit: null })`; `conLai > 0` → `ItemGroup` đơn vị + số, nút đóng `disabled`; bằng 0 → `ConfirmDialog tone="default"`. «Mở lại kỳ»: `Dialog` + `Field` + `Textarea`, nút tắt khi lý do < `OKR_KHEP.lyDo.toiThieu`. «Sang chấm điểm»: `ConfirmDialog` như hôm nay; lỗi máy chủ → `toast.error(error.message)`.
- [ ] **Step 2:** thước màn E15/E22 trong `man-khep-ky.mjs` (phiên đo đẩy «hôm nay» bằng biến môi trường giờ giả của phiên đo nếu kho có; không có → gieo chu kỳ đã qua ngày cuối).
- [ ] **Step 3:** tsc, `bun run lint`, thước màn; commit.

---

### Task 16: Thước còn lại và soi mã

**independent: false** (cần mọi task) · phục vụ E17, E18 (AC-13, AC-14)

**Files:**
- Create: `_acceptance/khep-ky-okr/rang/khep-ky.sql` (chỉ `SELECT`, tham số `:'cycle_id'` qua `psql -v` như `ty-le-kr-co-nguon.sql` của lượt 6; cột `pha, mucTieu, krCoDiem, krTong, coHocDuoc, mangSang, khacGoiY, chamDon`), `ty-le.mjs` (gieo qua thủ tục thật, chạy SQL, `--chieu-do`), `soi-ma.mjs --ca thiet-ke` (khuôn lượt 6; thêm kiểm `DialogClose`, định nghĩa `kiemOkr`/`OKR_KHEP`/`goiYDiem` chỉ ở `packages/validation`, số trần, hai biến thể ở `packages/ui`)

- [ ] **Step 1–3:** viết, chạy xanh, chạy `--chieu-do` đỏ đúng thông điệp; commit.

Verify per-task: `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khep-ky-okr/rang/ty-le.mjs" && bun _acceptance/khep-ky-okr/rang/soi-ma.mjs --ca thiet-ke`

---

### Task 17: Tài liệu và năm lệnh chứng

**independent: false** (cuối) · phục vụ AC-14

**Files:**
- Modify: `docs/api.md` (mục OKR: tám thủ tục, luật pha đi từng bước, sang chấm, khoá sau đóng, năm bảng), `docs/plan/lo-trinh-okr.md` (dòng 7 mục 10 — chỉ nối Ghi chú)

- [ ] **Step 1:** sửa tài liệu.
- [ ] **Step 2:** năm lệnh chứng từ gốc kho, PATH Node 24: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` — dán nguyên kết quả vào tin commit cuối S3.
- [ ] **Step 3:** đặt `status: implemented` trong `contract.md`; commit; vào S4.

---

## Thứ tự và song song

Task 1, 2, 3 độc lập — chạy song song (mỗi task một tác tử, một worktree). Task 4 → 5 → 6; 4 → 7 → 8 → {9, 10, 11} → 12; 13 sau 1, 3, 5, 6; 14 sau 3, 8, 10, 13; 15 sau 5, 7, 9, 11; 16, 17 cuối. Cách chạy khuyên: subagent-driven, mỗi task một tác tử kèm một người soát (như lượt 4), vì việc máy chủ nối nhau qua giao dịch và luật pha — một lỗi ở Task 7 lan sang 8–12.

## Hồ sơ đã ký có thể phải ghim lại

`dat-okr-trong-crm` (pha từng bước, luật đổi đích, hộp thoại KR, «Theo đơn vị» đổi bộ chọn cách xem), `vai-chi-okr`, `so-okr-tu-chay`, `toan-canh-okr` (nút Xuất; «Họp tuần» trong `ViewSwitch`), `cap-nhat-tuan-okr` — ghim lại bằng làn máy sau khi gộp, một lượt cho mọi hồ sơ.
