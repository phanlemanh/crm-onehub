# Cửa vào đăng nhập cho người mới — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang `/sign-in` nói cho người mới ba bước để được vào CRM, báo lỗi rõ khi better-auth trả người bị từ chối về, và theo giao diện máy thay vì ép tối — bốn trang `AuthShell` khác giữ bố cục.

**Architecture:** Hai hàm thuần (`chonCua`, `phanLoaiLoiDangNhap`) và một bộ chữ mới sống ở tệp riêng của OneHub. Trang server dùng `chonCua` cho CẢ nút lẫn bước, nên hướng dẫn không bao giờ nói khác các nút. `AuthShell` nhận một prop tuỳ chọn `gioiThieu`; khối hướng dẫn là component server có `Suspense` riêng vì `AuthShell` bọc ngoài `Suspense` của `SignIn`. `StepList` ở `packages/ui` thêm chế độ tĩnh.

**Tech Stack:** Next 16 App Router (server components, `cacheComponents`), React 19, better-auth 1.6.25, tRPC (`RouterOutputs`), `@crm/ui` (shadcn + ReUI stepper), bun test + happy-dom preload, puppeteer-core cho bàn đo.

**Spec:** `docs/superpowers/specs/2026-09-25-cua-vao-dang-nhap-design.md` · Hợp đồng: `_acceptance/cua-vao-dang-nhap/contract.md` (approved 2026-09-25) · Evals: `_acceptance/cua-vao-dang-nhap/evals.yaml`

## Điều kiện bắt đầu S3

PR #104 (`feat/quen-mat-khau`) phải merge vào `onehub` trước. Nó sửa đúng
`apps/app/app/(landing)/sign-in/page.tsx` và `password-sign-in.tsx`, thêm
`quenMatKhau: boolean` vào `sso.signInOptions`. Khi đã merge:

```bash
git fetch origin && git merge origin/onehub
```

Mọi đoạn mã dưới đây giả định bản `page.tsx` SAU #104 (có `quenMatKhau`).

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Tệp `"use client"` không nhập `@crm/auth` hay `@crm/db`. Máy chủ tính, client vẽ.
- `@crm/ui` chỉ nhập theo subpath (`@crm/ui/components/<tên>`).
- Không `className` đổi màu, góc, viền, bóng trên component `@crm/ui` ở chỗ gọi; biến thể mới làm ở `packages/ui`.
- Không chạm `apps/app/components/landing/**`, `apps/app/proxy.ts`, `packages/auth/**`.
- Mã mới ở tệp riêng của OneHub: `apps/app/lib/cua-vao/*`, `apps/app/components/cua-vao/*`, `apps/app/lib/messages/cua-vao.ts`. Tệp của hãng chỉ sửa `auth-shell.tsx`, `sign-in/page.tsx`, `lib/messages/auth.ts`.
- Chữ đã chốt (vi): tiêu đề «Đăng nhập vào CRM»; mô tả «Dùng đúng địa chỉ email đã được cho phép.»; dòng «là gì» «CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.»; khối «Lần đầu vào?».
- Ba loại lỗi: tiền tố `This_CRM_is_private.` → «chưa được cho phép»; `access_denied` (so trọn chuỗi) → «dừng giữa chừng»; còn lại → «chung»; vắng/rỗng → không ô. Không bao giờ in giá trị lấy từ URL.
- Test DOM: mỗi nhóm `mock.module` một tệp, một lệnh (`mock.module` của bun sống cả tiến trình). Chạy gói `apps/app` hai thứ tự `--randomize --seed` trước khi tin màu xanh.
- `bun test` mặc định `TZ=UTC`; lệnh DOM trong config đã đặt `TZ=Asia/Ho_Chi_Minh`.
- Khoá chữ mới phải có trong `GHIM` (hàm ghép) và được gọi ở đâu đó (luật «khoá chết») của `apps/app/test/messages-guard.spec.ts`.

## Review Focus

1. `?error=` mang giá trị lặp (`?error=a&error=b`) — Next đưa `string[]`; trang phải lấy giá trị đầu, không in mảng. Test ở Task 1 (hàm) và Task 4 (trang).
2. `?error=access_denied` kèm `?method=google` — hai tham số cùng lúc: ô lỗi «dừng giữa chừng» VÀ chỉ nút Google; bước 2 chỉ gọi Google. Test ở Task 4 ca `method-google`.
3. `signInOptions` lỗi (API chết) trong lúc có `?error=` — ô lỗi vẫn hiện theo `error`, bước theo mặc định Google. Test ở Task 4 ca `options-loi`.
4. Giao diện sáng ở bốn trang kia — `AuthShader` viết cứng màu tối dưới lớp `bg-background/70`: không đổi mã, nhưng ảnh của E14 phải chụp một trang kia (`dat-mat-khau` liên kết hỏng) ở sáng để người nhìn. Thêm ảnh ở Task 5b.
5. Người đã đăng nhập mở `/sign-in?error=…` — vẫn `redirect("/")` như hôm nay, không hiện ô lỗi trước khi chuyển. Test ở Task 4 (session có → redirect được gọi).

---

### Task 1: Chữ, phân loại lỗi và chọn cửa (hàm thuần)

`independent: true` (với Task 2) · phục vụ E3, E4, E5, E6, E7, E8, E10

**Files:**
- Create: `apps/app/lib/messages/cua-vao.ts`
- Create: `apps/app/lib/cua-vao/loi-dang-nhap.ts`
- Create: `apps/app/lib/cua-vao/chon-cua.ts`
- Modify: `apps/app/lib/messages/auth.ts` (khoá `shell.headline`, `signIn.title`, `signIn.description` — vi và en)
- Modify: `apps/app/test/messages-guard.spec.ts` (GHIM các hàm ghép mới)
- Test: `apps/app/test/cua-vao-ham.spec.ts`

**Interfaces:**
- Produces:
  - `type LoaiLoi = "chua-cho-phep" | "da-huy" | "chung"`
  - `phanLoaiLoiDangNhap(raw: string | string[] | undefined): LoaiLoi | null`
  - `type SignInOptions = RouterOutputs["sso"]["signInOptions"]`
  - `type CuaDangNhap = { social: MailboxProviderId[]; sso: { providerId: string; name: string }[] }`
  - `chonCua(options: SignInOptions | null, method: string | string[] | undefined): CuaDangNhap`
  - `type BuocLanDau = { tieuDe: string; moTa: string }`
  - `buocLanDau(cua: CuaDangNhap, chu: { duongChoPhep: string; duongPhatLienKet: string; phut: number }, m: CuaVaoMessages, tenHang: (p: MailboxProviderId) => string): BuocLanDau[]`
  - `cuaVaoMessages(locale: Locale): CuaVaoMessages`

- [x] **Step 1: Viết test đỏ** — `apps/app/test/cua-vao-ham.spec.ts`

```ts
import { describe, expect, it } from "bun:test";
import { buocLanDau, chonCua, type SignInOptions } from "@/lib/cua-vao/chon-cua";
import { phanLoaiLoiDangNhap } from "@/lib/cua-vao/loi-dang-nhap";
import { cuaVaoMessages } from "@/lib/messages/cua-vao";

const m = cuaVaoMessages("vi");
const TEN = { google: "Google", microsoft: "Microsoft" } as const;
const tenHang = (p: keyof typeof TEN) => TEN[p];

const GOOGLE = { google: true, microsoft: false, quenMatKhau: false, providers: [] } satisfies SignInOptions;
const CHU = { duongChoPhep: "Cài đặt › Thành viên › Cho phép một địa chỉ", duongPhatLienKet: "Cài đặt › Thành viên", phut: 60 };

describe("phanLoaiLoiDangNhap", () => {
	const MA_TRAN: [string | string[] | undefined, ReturnType<typeof phanLoaiLoiDangNhap>][] = [
		[undefined, null],
		["", null],
		["This_CRM_is_private._Sign_in_with_your_@onemount.com_account.", "chua-cho-phep"],
		["This_CRM_is_private._That_address_is_not_on_the_allow-list.", "chua-cho-phep"],
		["access_denied", "da-huy"],
		["access_denied ", "chung"],
		["invalid_code", "chung"],
		["<script>alert(1)</script>", "chung"],
		[["access_denied", "invalid_code"], "da-huy"],
		[[], null],
	];
	for (const [vao, ra] of MA_TRAN) {
		it(`${JSON.stringify(vao)} -> ${ra}`, () => {
			expect(phanLoaiLoiDangNhap(vao)).toBe(ra);
		});
	}
});

describe("chonCua va buocLanDau", () => {
	it("google bat: ba buoc, buoc 2 goi Google", () => {
		const cua = chonCua(GOOGLE, undefined);
		expect(cua.social).toEqual(["google"]);
		const buoc = buocLanDau(cua, CHU, m, tenHang);
		expect(buoc).toHaveLength(3);
		expect(buoc[1]?.tieuDe).toContain("Google");
		expect(buoc[2]?.moTa).toContain("60");
	});
	it("chi mat khau: hai buoc, buoc mat khau la duong chinh", () => {
		const cua = chonCua({ ...GOOGLE, google: false }, undefined);
		const buoc = buocLanDau(cua, CHU, m, tenHang);
		expect(buoc.map((b) => b.tieuDe)).toEqual([m.buoc.choPhep.tieuDe, m.buoc.matKhauChinh.tieuDe]);
	});
	it("options null giong google bat", () => {
		expect(chonCua(null, undefined)).toEqual(chonCua(GOOGLE, undefined));
	});
	it("method ep google khi hai cua bat", () => {
		expect(chonCua({ ...GOOGLE, microsoft: true }, "google").social).toEqual(["google"]);
	});
});
```

- [x] **Step 2: Chạy, xác nhận đỏ**

Run: `cd apps/app && bun test ./test/cua-vao-ham.spec.ts`
Expected: FAIL — `Cannot find module '@/lib/cua-vao/chon-cua'`

- [x] **Step 3: Viết bộ chữ** — `apps/app/lib/messages/cua-vao.ts`

```ts
import type { Locale } from "@crm/ui/lib/locale";

const en = {
	lanDau: {
		tieuDe: "First time here?",
		moTa: "The CRM only opens for addresses an administrator has allowed.",
	},
	buoc: {
		choPhep: {
			tieuDe: "Ask an administrator to allow the email address you will use",
			moTa: (duong: string) => `In ${duong}.`,
		},
		nutNgoai: {
			tieuDe: (ten: string) => `Sign in with ${ten}, using that same address`,
			moTa: "Any other address will be turned away.",
		},
		matKhauPhu: {
			tieuDe: "Prefer a password? Ask for a set-password link",
			moTa: (duong: string, phut: number) =>
				`An administrator issues it in ${duong}. The link works once and expires after ${phut} minutes.`,
		},
		matKhauChinh: {
			tieuDe: "Ask for a set-password link",
		},
	},
	duongThanhVien: (caiDat: string, thanhVien: string) => `${caiDat} › ${thanhVien}`,
	caiDat: "Settings",
	loi: {
		chuaChoPhep: {
			tieuDe: "This address hasn't been allowed in",
			moTa: "Ask an administrator to allow the exact email address you just used.",
		},
		daHuy: {
			tieuDe: "You stopped signing in partway",
			moTa: "Press the sign-in button again to try once more.",
		},
		chung: {
			tieuDe: "Couldn't sign you in",
			moTa: "Try again; if it still fails, ask an administrator to take a look.",
		},
	},
};

export type CuaVaoMessages = typeof en;

const vi: CuaVaoMessages = {
	lanDau: {
		tieuDe: "Lần đầu vào?",
		moTa: "CRM chỉ mở cho địa chỉ quản trị viên đã cho phép.",
	},
	buoc: {
		choPhep: {
			tieuDe: "Nhờ quản trị viên cho phép địa chỉ email bạn sẽ dùng",
			moTa: (duong) => `Ở ${duong}.`,
		},
		nutNgoai: {
			tieuDe: (ten) => `Đăng nhập bằng ${ten}, đúng địa chỉ đó`,
			moTa: "Địa chỉ khác sẽ bị từ chối.",
		},
		matKhauPhu: {
			tieuDe: "Muốn dùng mật khẩu? Xin liên kết đặt mật khẩu",
			moTa: (duong, phut) =>
				`Quản trị viên phát liên kết ở ${duong}. Liên kết dùng một lần, hết hạn sau ${phut} phút.`,
		},
		matKhauChinh: {
			tieuDe: "Xin liên kết đặt mật khẩu",
		},
	},
	duongThanhVien: (caiDat, thanhVien) => `${caiDat} › ${thanhVien}`,
	caiDat: "Cài đặt",
	loi: {
		chuaChoPhep: {
			tieuDe: "Địa chỉ này chưa được cho phép vào",
			moTa: "Nhờ quản trị viên cho phép đúng địa chỉ email bạn vừa dùng.",
		},
		daHuy: {
			tieuDe: "Bạn đã dừng đăng nhập giữa chừng",
			moTa: "Bấm lại nút đăng nhập để thử lần nữa.",
		},
		chung: {
			tieuDe: "Chưa đăng nhập được",
			moTa: "Thử lại; nếu vẫn không được, nhờ quản trị viên xem giúp.",
		},
	},
};

export function cuaVaoMessages(locale: Locale): CuaVaoMessages {
	return locale === "vi" ? vi : en;
}
```

Kiểm trước khi viết: chữ «Cài đặt» đã có trong một kho chữ khác (vd `lib/messages/settings*.ts`, nhãn điều hướng) thì DÙNG khoá đó thay cho `caiDat` mới — `grep -rn '"Cài đặt"' apps/app/lib/messages`. «Thành viên» lấy từ `thanhVienMessages(locale).trang.tieuDe`; «Cho phép một địa chỉ» lấy từ `thanhVienMessages(locale).duocPhepVao.nutThem` (bước 1 ghép thêm `› <nutThem>`: `m.duongThanhVien(caiDat, trang.tieuDe) + " › " + nutThem`). Hàm `phut` và `duong` ghép ở server.

- [x] **Step 4: Viết phân loại lỗi** — `apps/app/lib/cua-vao/loi-dang-nhap.ts`

```ts
export const TIEN_TO_CHUA_CHO_PHEP = "This_CRM_is_private.";
export const MA_DA_HUY = "access_denied";

export type LoaiLoi = "chua-cho-phep" | "da-huy" | "chung";

export function phanLoaiLoiDangNhap(
	raw: string | string[] | undefined,
): LoaiLoi | null {
	const giaTri = Array.isArray(raw) ? raw[0] : raw;
	if (giaTri === undefined || giaTri === "") return null;
	if (giaTri.startsWith(TIEN_TO_CHUA_CHO_PHEP)) return "chua-cho-phep";
	if (giaTri === MA_DA_HUY) return "da-huy";
	return "chung";
}
```

- [x] **Step 5: Viết chọn cửa + bước** — `apps/app/lib/cua-vao/chon-cua.ts`. Rút nguyên logic chọn nút hiện có của `sign-in/page.tsx` (các dòng `configured`, `insisted`, `showSso`, `social`) vào đây, không đổi hành vi:

```ts
import type { MailboxProviderId } from "@crm/auth/scopes";
import type { RouterOutputs } from "@/lib/trpc/types";
import type { CuaVaoMessages } from "@/lib/messages/cua-vao";

export type SignInOptions = RouterOutputs["sso"]["signInOptions"];
export type NhaCungCapSso = SignInOptions["providers"][number];
export type CuaDangNhap = { social: MailboxProviderId[]; sso: NhaCungCapSso[] };
export type BuocLanDau = { tieuDe: string; moTa: string };

export function chonCua(
	options: SignInOptions | null,
	method: string | string[] | undefined,
): CuaDangNhap {
	const mot = Array.isArray(method) ? method[0] : method;
	const configured: MailboxProviderId[] = [];
	if (options?.google ?? true) configured.push("google");
	if (options?.microsoft ?? false) configured.push("microsoft");
	const providers = options?.providers ?? [];
	const insisted = configured.find((p) => p === mot);
	if (insisted !== undefined) return { social: [insisted], sso: [] };
	if (providers.length > 0) return { social: [], sso: providers };
	return { social: configured, sso: [] };
}

export function buocLanDau(
	cua: CuaDangNhap,
	chu: { duongChoPhep: string; duongPhatLienKet: string; phut: number },
	m: CuaVaoMessages,
	tenHang: (p: MailboxProviderId) => string,
): BuocLanDau[] {
	const ten = [...cua.social.map(tenHang), ...cua.sso.map((p) => p.name)];
	const choPhep = { tieuDe: m.buoc.choPhep.tieuDe, moTa: m.buoc.choPhep.moTa(chu.duongChoPhep) };
	const moTaMatKhau = m.buoc.matKhauPhu.moTa(chu.duongPhatLienKet, chu.phut);
	if (ten.length === 0) {
		return [choPhep, { tieuDe: m.buoc.matKhauChinh.tieuDe, moTa: moTaMatKhau }];
	}
	return [
		choPhep,
		{ tieuDe: m.buoc.nutNgoai.tieuDe(ten.join(", ")), moTa: m.buoc.nutNgoai.moTa },
		{ tieuDe: m.buoc.matKhauPhu.tieuDe, moTa: moTaMatKhau },
	];
}
```

Kiểm với `RouterOutputs["sso"]["signInOptions"]` sau #104: nếu `providers[number]` không có `name` thì dừng và báo — đó là khuôn API khác spec.

- [x] **Step 6: Đổi chữ trong `lib/messages/auth.ts`**

`en.shell.headline`: `"The OneHub CRM: partners, 30-day plans and OKRs."` · `vi.shell.headline`: `"CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR."`
`en.signIn.title`: `"Sign in to the CRM"` · `vi.signIn.title`: `"Đăng nhập vào CRM"`
`en.signIn.description`: `"Use the exact email address you were allowed in with."` · `vi.signIn.description`: `"Dùng đúng địa chỉ email đã được cho phép."`

- [x] **Step 7: Ghim hàm mới vào `messages-guard`** — thêm vào `GHIM` trong `apps/app/test/messages-guard.spec.ts` (mỗi khoá hàm hai mẫu `[mot, nhieu]` tiếng Việt):

```ts
"cua-vao:buoc.choPhep.moTa": ["Ở 1.", "Ở 12."],
"cua-vao:buoc.nutNgoai.tieuDe": ["Đăng nhập bằng 1, đúng địa chỉ đó", "Đăng nhập bằng 12, đúng địa chỉ đó"],
"cua-vao:buoc.matKhauPhu.moTa": [
	"Quản trị viên phát liên kết ở 1. Liên kết dùng một lần, hết hạn sau 1 phút.",
	"Quản trị viên phát liên kết ở 12. Liên kết dùng một lần, hết hạn sau 12 phút.",
],
"cua-vao:duongThanhVien": ["1 › 1", "12 › 12"],
```

Đọc cách `GHIM` gọi hàm hai đối số trước khi viết mẫu (`sed -n 640,672p apps/app/test/messages-guard.spec.ts`) — mẫu phải khớp đúng cách test đó dựng đối số.

- [x] **Step 8: Chạy xanh**

Run: `cd apps/app && bun test ./test/cua-vao-ham.spec.ts ./test/messages-guard.spec.ts ./test/auth-messages.spec.ts`
Expected: PASS. `auth-messages.spec.ts` đỏ vì ghim «Mừng bạn quay lại» → sửa ghim đó sang chữ mới (đó là thước cũ nói đúng thứ vừa đổi, không phải hồi quy).

- [x] **Step 9: Commit**

```bash
git add apps/app/lib/cua-vao apps/app/lib/messages/cua-vao.ts apps/app/lib/messages/auth.ts apps/app/test/cua-vao-ham.spec.ts apps/app/test/messages-guard.spec.ts apps/app/test/auth-messages.spec.ts
git commit -m "feat: chữ và hàm chọn cửa, phân loại lỗi cho cửa vào đăng nhập"
```

---

**Đã làm 2026-09-26 (trước #104, phiên điều phối cho phép), commit `c8dbc6a0`.** Lệch kế hoạch: không thêm khoá «Cài đặt» mới — trang lấy `settingsMessages(locale).thanhBen.nhan`; dấu ` › ` ghép ở máy chủ; `SignInOptions` chưa có `quenMatKhau` (thêm khi #104 vào). `cua-vao-ham.spec.ts` 20/20; `messages-guard` xanh sau khi Task 4 gọi đủ khoá mới.

### Task 2: `StepList` chế độ tĩnh (packages/ui)

`independent: true` · phục vụ E14, E16, E17 (khuyến nghị «Đều nhau», sổ d-6)

**Files:**
- Modify: `packages/ui/src/components/step-list.tsx`
- Test: `packages/ui/test/step-list-tinh.dom.tsx`

**Interfaces:**
- Produces: `StepList` nhận `tinh?: boolean`; `StepListItem` nhận `activeStep?: number` (tuỳ chọn). Khi `tinh`, không bước nào mang `aria-current`, mọi chỉ báo `data-state="completed"`, tiêu đề không mờ, không dấu tích.

- [x] **Step 1: Test đỏ** — `packages/ui/test/step-list-tinh.dom.tsx`

```tsx
import { describe, expect, it } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { StepList, StepListItem } from "@crm/ui/components/step-list";

function ve(tinh: boolean) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	act(() => {
		createRoot(o).render(
			h(StepList, { activeStep: 1, label: "Lần đầu vào?", tinh },
				h(StepListItem, { step: 1, title: "Một" }),
				h(StepListItem, { step: 2, title: "Hai" }),
				h(StepListItem, { step: 3, title: "Ba" })),
		);
	});
	return o;
}

describe("StepList tinh", () => {
	it("khong buoc nao la buoc hien tai, moi chi bao cung trang thai", () => {
		const o = ve(true);
		expect(o.querySelectorAll("[aria-current]")).toHaveLength(0);
		const trangThai = [...o.querySelectorAll("[data-slot=stepper-indicator]")].map((e) => e.getAttribute("data-state"));
		expect(new Set(trangThai).size).toBe(1);
		expect(o.querySelectorAll("svg")).toHaveLength(0);
	});
	it("doi chung: che do tien do van danh dau buoc 1", () => {
		const o = ve(false);
		expect(o.querySelectorAll("[aria-current=step]")).toHaveLength(1);
	});
});
```

Kiểm tên `data-slot` thật của chỉ báo trong `packages/ui/src/components/reui/stepper.tsx` trước khi chạy; khác thì sửa bộ chọn cho khớp.

- [x] **Step 2: Chạy đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/step-list-tinh.dom.tsx` → FAIL (prop `tinh` chưa có, `aria-current` vẫn có).

- [x] **Step 3: Cài** — trong `step-list.tsx`: `StepList` thêm `tinh = false`; khi `tinh` truyền `value={Number.MAX_SAFE_INTEGER}` cho `Stepper` và `indicators={}` (không dấu tích); đưa `tinh` xuống con qua một context nhỏ trong cùng tệp (`const TinhContext = React.createContext(false)`), `StepListItem` đọc nó và bỏ `aria-current` khi `tinh`; `activeStep` của `StepListItem` thành tuỳ chọn. Không đổi hành vi khi `tinh` vắng.

- [x] **Step 4: Chạy xanh** + test cũ của stepper: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/step-list-tinh.dom.tsx` và `cd apps/app && bun run test:dom` (hộp nhập tổ chức dùng `StepList` tiến độ).

- [x] **Step 5: Commit** — `git commit -m "feat(ui): StepList chế độ tĩnh cho khối hướng dẫn"`

---

**Đã làm 2026-09-26 (trước #104, theo lời chủ kho), commit `b55b1b48`.** Test đỏ trên mã cũ: 3/5 ca chế độ tĩnh đỏ, 2 ca đối chứng xanh. Sau khi cài: 5/5 xanh; gói test `packages/ui` xanh; 34 tệp DOM của `apps/app` xanh; `check-types` của `@crm/ui` và `app` xanh. Phá-thử trên cây đã commit, trả nguyên bằng `git show HEAD:<tệp>`: bỏ `!tinh &&` ở `aria-current` → đỏ đúng «khong buoc nao la buoc hien tai»; bỏ `Number.MAX_SAFE_INTEGER` → đỏ đúng «moi chi bao cung mot trang thai…» và «khong tieu de nao bi lam mo».

### Task 3: `AuthShell` nhận khối cột trái, bỏ ép tối, tiêu đề `h1`

`independent: false` (cần Task 1 cho chữ headline) · phục vụ E2, E11, E17

**Files:**
- Modify: `apps/app/components/auth-shell.tsx`
- Test: `apps/app/test/cua-vao-shell.dom.tsx`

**Interfaces:**
- Consumes: `authMessages(locale).shell.headline` (Task 1).
- Produces: `AuthShell({ children, gioiThieu }: { children: ReactNode; gioiThieu?: ReactNode })`; `AuthHeading({ title, description, cap }: { …; cap?: "h1" | "h2" })` (mặc định `"h2"`).

Hình dạng khi CÓ `gioiThieu`: `<main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[…]">` với thứ tự DOM: (1) section khung đăng nhập (như hôm nay), (2) `<section aria-label={…} className="flex flex-col gap-6 bg-muted px-6 py-8 sm:px-10 lg:order-first lg:justify-between lg:p-12 xl:p-12">` chứa `<div className="hidden lg:flex"><LogoLockup aria-hidden="true" className="h-5 w-auto shrink-0" /></div>` rồi `{gioiThieu}`. Không `AuthShader`. Khi KHÔNG có `gioiThieu`: y hệt hôm nay (section trái đầu DOM, `hidden lg:flex`, `AuthShader`, eyebrow, `h1` headline) trừ lớp `dark` ở `<main>`.

- [x] **Step 1: Test đỏ** — `apps/app/test/cua-vao-shell.dom.tsx` (chỉ mock `@/lib/locale/server`; KHÔNG mock `auth-shell`, `auth-shader`):

```tsx
import { describe, expect, it, mock } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";

mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" as const }));

const vo = await import("@/components/auth-shell");
const { authMessages } = await import("@/lib/messages/auth");

async function ve(gioiThieu?: React.ReactNode) {
	const cay = await vo.AuthShell({ children: h("p", null, "khung"), gioiThieu });
	const o = document.createElement("div");
	document.body.appendChild(o);
	await act(async () => createRoot(o).render(cay));
	return o;
}

describe("AuthShell khong khoi", () => {
	it("AuthShell la ban that", () => {
		expect(vo.AuthShell.name).toBe("AuthShell");
	});
	it("giu cot trai, hieu ung nen, CRM, dong tieu de moi; khong lop dark", async () => {
		const o = await ve();
		const trai = o.querySelector("main > section");
		expect(trai?.className).toContain("hidden");
		expect(trai?.className).toContain("lg:flex");
		expect(trai?.querySelector("[aria-hidden=true]")).not.toBeNull();
		expect(o.textContent).toContain("CRM");
		expect(o.textContent).toContain(authMessages("vi").shell.headline);
		expect(authMessages("vi").shell.headline).toBe("CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.");
		expect(o.querySelector(".dark")).toBeNull();
	});
	it("doi chung: co khoi thi khung dang nhap dung truoc, khong AuthShader", async () => {
		const o = await ve(h("div", { "data-khoi": "" }, "khoi"));
		const phan = [...o.querySelectorAll("main > section")];
		expect(phan[0]?.textContent).toContain("khung");
		expect(phan[1]?.querySelector("[data-khoi]")).not.toBeNull();
		expect(phan[1]?.className).toContain("lg:order-first");
		expect(o.querySelector("[class*=radial-gradient]")).toBeNull();
	});
});
```

- [x] **Step 2: Chạy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cua-vao-shell.dom.tsx` → FAIL «lop dark» / «khong co data-khoi».

- [x] **Step 3: Cài** theo hình dạng ở trên. `AuthHeading`: `const TieuDe = cap ?? "h2";` rồi `<TieuDe className=…>` giữ nguyên lớp cũ.

- [x] **Step 4: Chạy xanh** (cùng lệnh) và `bun run test:dom` của `apps/app` (bốn trang kia có test DOM riêng).

- [x] **Step 5: Commit** — `git commit -m "feat: AuthShell nhận khối cột trái, theo giao diện máy"`

---

**Đã làm 2026-09-26, commit `c8dbc6a0`.** Test dựng bằng `renderToStaticMarkup` (không cần router của `next/link`). Chiều đỏ trên worktree tạm ở `8c75aae8` (mã cũ + test mới): 6/7 đỏ, 1 ca «bản thật» xanh. Sửa thước giữa chừng: `className` của `svg` là `SVGAnimatedString` → đọc thuộc tính `class`.

### Task 4: Trang đăng nhập — khối hướng dẫn và ô lỗi

`independent: false` (cần Task 1, 2, 3) · phục vụ E1, E3, E4, E6, E7, E8, E9, E10, E15

**Files:**
- Create: `apps/app/components/cua-vao/khoi-huong-dan.tsx` (server, không `"use client"`)
- Create: `apps/app/components/cua-vao/o-loi-dang-nhap.tsx` (server)
- Modify: `apps/app/app/(landing)/sign-in/page.tsx`
- Test: `apps/app/test/cua-vao-sign-in.dom.tsx`, `apps/app/test/cua-vao-trang-khac.dom.tsx`
- Modify nếu đỏ: `apps/app/test/sign-in-mat-khau-luon-hien.spec.ts` (duyệt cây: `trang.props.children` vẫn là `Suspense`)

**Interfaces:**
- Consumes: `chonCua`, `buocLanDau`, `phanLoaiLoiDangNhap`, `cuaVaoMessages` (Task 1); `StepList tinh` (Task 2); `AuthShell gioiThieu`, `AuthHeading cap` (Task 3).
- Produces: `KhoiHuongDan({ buoc, m, laGi }: { buoc: BuocLanDau[]; m: CuaVaoMessages["lanDau"]; laGi: string })` — `Card` › `CardHeader` (`CardTitle` = `m.tieuDe`, `CardDescription` = `m.moTa`) › `CardContent` › `StepList tinh label={m.tieuDe}` với mỗi bước một `StepListItem`; dưới Card một `<p className="text-muted-foreground text-sm">{laGi}</p>`. `OLoiDangNhap({ loai, m }: { loai: LoaiLoi; m: CuaVaoMessages["loi"] })` — `Alert variant="destructive"` › `Icon icon={Warning}` › `AlertTitle` › `AlertDescription`.

Trang (`page.tsx`): `SignInPage` trả
```tsx
<AuthShell gioiThieu={<Suspense fallback={null}><HuongDan searchParams={searchParams} /></Suspense>}>
	<Suspense fallback={<AuthHeading cap="h1" title={m.title} description={m.description} />}>
		<SignIn searchParams={searchParams} />
	</Suspense>
</AuthShell>
```
`HuongDan` (async, cùng tệp): `const [options, { method }, locale] = await Promise.all([signInOptions(), searchParams, getLocale()])`; `const cua = chonCua(options, method)`; dựng `duongChoPhep` = `${caiDat} › ${thanhVien.trang.tieuDe} › ${thanhVien.duocPhepVao.nutThem}`, `duongPhatLienKet` = `${caiDat} › ${thanhVien.trang.tieuDe}`, `phut = Math.round(PASSWORD.tokenTtlSeconds / SECONDS_PER_MINUTE)` (cùng nguồn `SECONDS_PER_MINUTE` với trang `dat-mat-khau`); trả `<KhoiHuongDan …/>`. `SignIn`: đọc thêm `error` từ `searchParams`, thay khối `configured/insisted/showSso/social` bằng `chonCua(options, method)`, dùng `cua.sso.length > 0` cho `showSso` và `cua.social` cho nút; `AuthHeading cap="h1"`; ngay sau `AuthHeading`: `{loai ? <OLoiDangNhap loai={loai} m={cv.loi} /> : null}`. `signInOptions()` gọi hai lần trong cùng request — `getServerQueryClient().fetchQuery` dùng chung cache của request; nếu đo thấy hai lượt gọi API thì bọc bằng `cache` của React trong `page.tsx`.

- [x] **Step 1: Test đỏ `cua-vao-sign-in.dom.tsx`** — khuôn mock theo `sign-in-mat-khau-luon-hien.spec.ts` (mock `password-sign-in`, `social-sign-in`, `sso-sign-in` thành hàm ghi props; mock `@/lib/session`, `@/lib/trpc/server` với `fetchQuery` đọc `let tuyChon: SignInOptions | Error` đổi theo ca; mock `@/lib/locale/server`, `next/navigation` với `redirect` ghi lại đích). KHÔNG mock `@crm/auth`, KHÔNG mock `auth-shell`. Dựng trang bằng `renderToString` của `react-dom/server` trên cây đã giải async (duyệt tay như `dungManDangNhap`, giải cả `HuongDan` trong prop `gioiThieu`). Mỗi `describe` mang đúng tag của config: `ba-buoc-google`, `ma-tran-cua`, `o-loi`, `chu`, `quen-mat-khau`. Nội dung từng ca đúng theo `expected` của E3, E4, E6–E10, E15 trong `evals.yaml` — ma trận viết trước, thông điệp ghim nguyên văn ở đó. Ca E6 lấy giá trị `error` bằng cách nhập hàm rút của `_acceptance/cua-vao-dang-nhap/rang/ma-loi-that.mjs` (Task 5a — viết Task 5a Step 1–3 trước Step này, hoặc tạm để ca đó `it.todo` và bật lại ở Task 5a).

- [x] **Step 2: Test đỏ `cua-vao-trang-khac.dom.tsx`** — mock `@/components/auth-shell` thành `AuthShell` ghi `props.gioiThieu` vào mảng, `AuthHeading` trả `null`; mock dữ liệu phụ của từng trang (`@crm/db`, `@/lib/session`, trpc) đủ để trang render; ma trận 5 dòng của E1.

- [x] **Step 3: Chạy đỏ** — hai lệnh `cvdn_*` tương ứng trong `_acceptance/config.yaml` (xem khoá `cvdn_chi_sign_in`, `cvdn_ba_buoc_google`…). Expected: FAIL với thông điệp ghim «khong thay khoi «Lần đầu vào?»» / «sign-in: AuthShell khong nhan khoi».

- [x] **Step 4: Cài** hai component và trang theo Interfaces ở trên.

- [x] **Step 5: Chạy xanh** — sáu lệnh `cvdn_*` loại `test`, rồi `cd apps/app && bun run test:dom && bun test`.

- [x] **Step 6: Hai thứ tự** — `cd apps/app && bun test --randomize --seed 1` và `--seed 2`; so tập ca đỏ với cùng lệnh trên `merge-base` (bài học `mock.module` sống qua tệp).

- [ ] **Step 7: Commit** — `git commit -m "feat: trang đăng nhập nói cách vào và báo lỗi khi bị từ chối"`

---

**E15 xong sau #151 (`f61827e5`): test thôi giả lập `PasswordSignIn`, đo thứ tự thật ô mật khẩu → liên kết → nút; trang thôi truyền cờ → «khong thay lien ket Quên mật khẩu?». ** **Đã làm 2026-09-26, commit `c8dbc6a0`, TRỪ ca E15 «Quên mật khẩu?» (chờ #104) và dòng `quenMatKhau={…}` (#104 thêm).** Lệch kế hoạch: không giả lập `AuthShell` ở E1 — hàm trang trả phần tử `<AuthShell>` chưa vẽ nên đọc thẳng `props.gioiThieu`; `phutLienKetDatMatKhau()` ở `lib/cua-vao/thoi-han.ts` thay hằng `SECONDS_PER_MINUTE` tại chỗ của trang `dat-mat-khau`. Chiều đỏ trên cây cũ: `cua-vao-sign-in` 20/24 đỏ (4 ca đo điều cũ vốn đúng), `cua-vao-trang-khac` 1/5 đỏ («sign-in: AuthShell khong nhan khoi»). Phá-thử trên cây đã commit: bỏ `method` khi tính bước → đỏ `method-google`; in `error` ra trang → 6 ca «HTML chua gia tri URL»; `onboarding` nhận khối → đỏ ca đó; ô lỗi sau ô mật khẩu → «o loi dung sau nut dang nhap». `bun test --randomize` seed 1 và 2: 399/399.

### Task 5a: Răng không cần màn — mã lỗi thật, soi mã, thước đã ký

`independent: false` (cần Task 1) · phục vụ E5, E16, E17, E20

**Files:**
- Create: `_acceptance/cua-vao-dang-nhap/rang/ma-loi-that.mjs`
- Create: `_acceptance/cua-vao-dang-nhap/rang/soi-ma.mjs`
- Create: `_acceptance/cua-vao-dang-nhap/rang/thuoc-da-ky.mjs`
- Create: `_acceptance/cua-vao-dang-nhap/rang/fixtures/` (tệp mẫu vi phạm cho đối chứng dương của `soi-ma`)

**Interfaces:**
- Produces (ma-loi-that.mjs): `export function rutCauHook(duongAuthTs: string): { ten: "co-mien" | "khong-mien" | "chua-khai"; cau: string }[]` và `export function quaCallback(cau: string): string` (đổi khoảng trắng, qua `URLSearchParams`, đọc lại) — Task 4 nhập để lấy giá trị cho E6.

Mọi đường dẫn suy từ `import.meta.url` (`const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..")`), không hardcode gốc. Mỗi răng in một dòng `DUNG …`/`SAI …` cho mỗi phần tử ma trận viết trước và một dòng `KET LUAN n DUNG, k SAI — ma thoat x`; thiếu phần tử → `SAI thieu <ma>`.

- [x] **Step 1: `ma-loi-that.mjs`** — dùng `typescript` (có trong `node_modules`) để parse `packages/auth/src/auth.ts` (hoặc `process.env.CVDN_AUTH_TS`), tìm `new APIError("FORBIDDEN", { message })` trong thân `user.create.before`; chuỗi thường lấy nguyên, template `${domain}` thay `onemount.com`, nhánh `: "…"` lấy đủ hai. Mỏ neo: đọc `link-account.mjs`, `callback.mjs` của better-auth resolve từ `packages/auth` (`createRequire(join(GOC,"packages/auth/package.json")).resolve("better-auth/package.json")`), và `@better-auth/sso/dist/index.mjs` (hoặc `CVDN_SSO_DIST`) — ghim chuỗi trích nguyên văn ở `expected` của E5. Ma trận `{oauth, sso} × {co-mien, khong-mien, chua-khai}` = 6 dòng.
- [x] **Step 2: Chiều đỏ E5** — bản sao `auth.ts` với «This workspace is private.» qua `CVDN_AUTH_TS` → `SAI oauth-co-mien`, mã 1; bản sao dist SSO đổi `split(" ").join("_")` → `SAI moc sso`, mã 1. Ghi nguyên văn hai lượt đỏ vào Notes của hợp đồng.
- [x] **Step 3: `soi-ma.mjs`** — parse bằng `typescript` mọi tệp vòng này viết/sửa dưới `apps/app` (lấy từ `git diff --name-only $(git merge-base HEAD origin/onehub)`), bốn điều (a)–(d) của E16; đối chứng dương trên `rang/fixtures/*.tsx`. Chiều đỏ trên bản sao có `import { PASSWORD } from "@crm/auth"` trong tệp client.
- [ ] **Step 4: `thuoc-da-ky.mjs`** — đọc `evals.yaml` của ba hồ sơ, lọc eval `test`/`script` có `paths` chạm vùng sửa, giải `config:` ref từ `_acceptance/config.yaml`, chạy trên HEAD và trên `git worktree add` tại `merge-base` (gỡ ở `finally`, kể cả khi lỗi); so theo luật E20. Chạy lâu — chạy nền, theo bài học «thước hồ sơ đã ký bị chạm».
- [ ] **Step 5: Chạy cả ba** (`cvdn_ma_loi_that`, `cvdn_soi_ma`, `cvdn_thuoc_da_ky`), commit — `git commit -m "test: răng đo mã lỗi thật, soi mã và thước đã ký cho cua-vao-dang-nhap"`

---

**Step 1–3 đã làm 2026-09-26.** `ma-loi-that.mjs` 9/9 (3 mỏ neo + 2 writer × 3 câu); chiều đỏ: câu hook đổi → 4 SAI; dist SSO đổi phép biến đổi → «SAI moc sso». `soi-ma.mjs` 19/19 kèm 2 đối chứng dương; chiều đỏ: bản sao client nhập `@crm/auth` → SAI (a), `<Card className="rounded-2xl bg-muted">` → SAI (c). **Step 4 (`thuoc-da-ky`) để lại**: chạy eval của ba hồ sơ đã ký trên hai cây, nặng như một làn đo — xin lượt phiên điều phối.

### Task 5b: Bàn đo màn thật

`independent: false` (cần Task 4) · phục vụ E11, E12, E13, E14, E19

**Files:**
- Create: `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs`

Khuôn: như `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/do-khoi.mjs` — `puppeteer-core` + Chrome cục bộ, `canhCay()` của `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs` trước màn đầu tiên, ảnh ra `BANG_CHUNG ?? .acceptance-runs/cua-vao-dang-nhap/evidence`. Không đăng nhập (trang công khai). `MA_TRAN` 45 mã theo E11: 2 giao diện × 3 mã (E11) + 8 ô khổ×giao diện × 3 mã (E12) + 2 khổ × 2 giao diện × 2 mã (E13) + 1 mã đọc `signInOptions` thật (E11) + 6 mã HTML thật (E19). Thêm một ảnh ngoài ma trận cho Review Focus 4: `/dat-mat-khau/khong-hop-le` ở 1440 sáng (`cvdn-shell-1440-light.png`). Tỉ lệ tương phản WCAG tính trong trang (hàm luminance chuẩn), đối chứng `#777` trên `#fff` = 4,48.

- [x] **Step 1:** Cấp cổng 3840/3841 theo `steps` của E14 (mục `ban-do-cvdn-*` trong `.claude/launch.json`); kiểm cổng trống trước khi dựng.
- [x] **Step 2:** Viết `do-cua-vao.mjs`; chạy chiều đỏ trên cây TRƯỚC Task 3–4 (checkout tạm commit trước Task 3 vào một worktree, KHÔNG `git checkout` tại chỗ — bài học phá-thử mất thay đổi) → ghi nguyên văn dòng SAI.
- [x] **Step 3:** Chạy xanh bằng lệnh `cvdn_do_cua_vao`; `CVDN_BO_KHO=768` → đúng 6 dòng `SAI thieu 768-…`.
- [x] **Step 4:** Commit — `git commit -m "test: bàn đo màn thật cho cửa vào đăng nhập"`

---

**Đã làm 2026-09-26 11:06–11:13, commit `31815ace` + `7d795518`.** Lệch kế hoạch: không dựng máy chủ ở 3840/3841 — `tien-de` sau #150 tự chạy trong phiên đo trên `crm_<cây>_do`, cổng 4100–4899. Lệnh đặt `GOOGLE_CLIENT_ID/SECRET` giả như CI (`.env` máy này để rỗng) để tiền đề «Google bật» của AC-12 đúng; thước gọi tên khi tiền đề sai. Kết quả: 45/45. Chiều đỏ: khoá Google rỗng → 4 dòng «tien de AC-12 khong dung»; `CVDN_BO_KHO=768` → đúng 6 dòng «thieu 768-…»; ép `dark` lên `<main>` → «light: 1 phan tu mang lop dark». Quan sát chưa giải: khi ép `dark` lên `<main>`, nền tính toán của chính `<main>` vẫn sáng nên dòng «nen» không đổi — ca ép tối được bắt ở dòng «theo-may», và ảnh E14 cho người nhìn. Sửa thước giữa chừng: đối chứng tương phản gọi hàm trước khi gán; dòng «nen» đo `<main>` thay `body`.

### Task 6: Phá-thử, năm lệnh, đóng S3

`independent: false` · phục vụ mọi eval máy

- [ ] **Step 1:** Mỗi phá-thử ghi ở `expected` của E1–E20 chạy trên BẢN SAO (thư mục `.acceptance-runs/cua-vao-dang-nhap/sao-*` + symlink `node_modules`, không trong gói — bài học oxlint quét `.sao-*`), ghi nguyên văn dòng đỏ vào Notes của hợp đồng.
- [ ] **Step 2:** Năm lệnh từ gốc kho, PATH Bun 1.3.12: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`. Tất cả mã 0.
- [ ] **Step 3:** `cvdn_san_thiet_ke` (design-gate static) mã 0.
- [ ] **Step 4:** Set contract `status: implemented`, commit, dispatch S4.
