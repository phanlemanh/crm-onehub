# Logo OneHub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay logo Comp AI bằng logo OneHub trong CRM: `Logo` mới (mark dải màu, căn tâm), `LogoLockup` mới, bộ icon sinh từ một nguồn, manifest mới, và PNG xuất cho Slack/Zalo/Google.

**Architecture:** Một module nguồn `packages/ui/src/lib/logo-onehub.ts` giữ path và màu. `Logo` và `LogoLockup` vẽ từ đó. Script `packages/ui/scripts/logo-icons.ts` lấy SVG bằng `renderToStaticMarkup` của chính hai component, raster bằng `sharp`, tự ghép `.ico`. Test so component với PNG gốc chép trong kho, và so file icon trong kho với bản sinh lại.

**Tech Stack:** React 19.2 (`useId`), bun test + jsdom, `sharp` 0.34.5, Next.js 16 metadata.

**Spec:** `docs/superpowers/specs/2026-09-25-logo-onehub-design.md` · hợp đồng `_acceptance/logo-onehub/contract.md` · phép đo `_acceptance/logo-onehub/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- `Logo` giữ tên, default export, nhận `React.SVGProps<SVGSVGElement>`.
- Màu `#0045FF` → `#02D7FF`; `--primary` giữ `#006b4f`.
- Tham số mark: tâm (274.46, 310.67) trên lưới 625×622, R 201.44, r 115.61, bo góc 39.06, không xoay.
- `viewBox` của `Logo`: `-311 -311 622 622`; của `LogoLockup`: `0 0 2048 622`.
- Không sửa `components/landing/*`, `app/(landing)/*`, `brand-logos/*`, `favicon.service.ts`, `packages/db/src/favicon.ts`.
- Hằng tinh chỉnh được nằm trong một config theo vùng (`as const`), không rải ở đầu file.

## Review Focus

1. Hai logo trên một trang (thanh trên cùng + tab Agent) — dải màu không được trỏ nhầm sang logo kia: test DOM ở Task 1 dùng `CSS.escape(id)` vì `useId` của React 19.2 sinh ký tự đặc biệt.
2. Server Component gọi `Logo` (`auth-shell.tsx` là async server) — `useId` phải chạy được phía server: `bun run build` ở cuối là thước.
3. Chỗ gọi truyền `aria-hidden` (huy hiệu phạm vi) — không được bị `role="img"` mặc định đè: test DOM (d) ở Task 1.
4. Icon ở 16px — lỗ sao phải còn thấy: ảnh xem trước đã soát ở S1; Task 3 in ảnh 16/32 vào `.acceptance-runs/` để soát lại.
5. CI linux x64 raster khác Mac — dung sai ở ca «tuoi» của Task 3.

---

### Task 1: Nguồn logo, `Logo` mới, PNG gốc, phép đo khớp gốc

**independent:** false (Task 2, 3 dùng nguồn này) · **phục vụ:** E1, E2, E3, E12

**Files:**
- Create: `packages/ui/src/lib/logo-onehub.ts`
- Modify: `packages/ui/src/components/logo.tsx`
- Create: `packages/ui/scripts/logo-goc/logo-mark.png`, `logo-horizontal.png` (chép từ `~/Documents/Share/logo/`)
- Create: `packages/ui/test/logo-raster.ts` (hàm dùng chung cho test: render component → SVG → RGBA)
- Test: `packages/ui/test/logo.dom.tsx`, `packages/ui/test/logo-khop-goc.spec.ts`
- Modify: `packages/ui/package.json` (devDependency `sharp: 0.34.5`)

**Interfaces — Produces:**
- `LOGO_ONEHUB` (as const): `{ ten, mark: { viewBox, path, tam: {x,y}, banKinhNgoai }, dai: { tu, den, x1, y1, x2, y2 }, banNgang: { viewBox, rong, cao, chu } }`
- `default Logo(props: React.SVGProps<SVGSVGElement>)`
- `veRgba(svg: string, rong: number, cao: number): Promise<Uint8Array>` và `alpha/iouMem` trong `test/logo-raster.ts`

- [ ] **Step 1: Test DOM (đỏ)** — `logo.dom.tsx`: render hai `Logo`, kiểm (a) role/aria-label, (b) hai id khác nhau ghim «id trung», (c) fill trỏ gradient trong chính svg, (d) className + aria-hidden đè được.
- [ ] **Step 2: Test khớp gốc (đỏ)** — `logo-khop-goc.spec.ts`: ca `mark-trung-goc` (IoU ≥ 0.98, ghim «IoU mark»), `mau-trung-goc` (RMS ≤ 8, ghim «RMS kenh <K>»), `can-tam` (lệch ≤ 6.22, ghim «lech tam x/y»). SVG lấy bằng `renderToStaticMarkup(createElement(Logo, { width, height, viewBox }))` — ca `mark-trung-goc` đặt `viewBox` bằng `-274.46 -310.67 625 622` để mark rơi đúng toạ độ ảnh gốc.
- [ ] **Step 3: Chạy — đỏ** `cd packages/ui && bun test test/logo-khop-goc.spec.ts` và `bun test --preload ./test/setup-dom.ts ./test/logo.dom.tsx`.
- [ ] **Step 4: Viết `logo-onehub.ts`** (path mark sinh từ tham số ở Global Constraints, path chữ dò nét từ S1) và `logo.tsx`:

```tsx
import { useId } from "react";
import type * as React from "react";
import { LOGO_ONEHUB } from "../lib/logo-onehub";

const Logo = (props: React.SVGProps<SVGSVGElement>) => {
	const id = useId();
	const { mark, dai } = LOGO_ONEHUB;
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox={mark.viewBox} fill="none" role="img" aria-label={LOGO_ONEHUB.ten} {...props}>
			<defs>
				<linearGradient id={id} gradientUnits="userSpaceOnUse" x1={dai.x1} y1={dai.y1} x2={dai.x2} y2={dai.y2}>
					<stop offset={0} stopColor={dai.tu} />
					<stop offset={1} stopColor={dai.den} />
				</linearGradient>
			</defs>
			<path d={mark.path} fill={`url(#${id})`} />
		</svg>
	);
};
export default Logo;
```

- [ ] **Step 5: Chạy — xanh**, rồi lượt phá-thử trên bản sao (dời `viewBox` 76 → «lech tam x»; `useId` → id cố định → «id trung»), hoàn nguyên.
- [ ] **Step 6: Commit** `feat(ui): logo OneHub dựng lại bằng hình học`

### Task 2: `LogoLockup` và trang đăng nhập

**independent:** false · **phục vụ:** E4, E5, E11

**Files:**
- Create: `packages/ui/src/components/logo-lockup.tsx`
- Modify: `apps/app/components/auth-shell.tsx` (3 chỗ `Logo` → `LogoLockup`, cỡ `h-5 w-auto` / `h-6 w-auto`)
- Test: thêm ca vào `packages/ui/test/logo.dom.tsx` (E5) và `logo-khop-goc.spec.ts` (ca `ban-ngang-trung-goc`, E4)

**Interfaces — Produces:** `export function LogoLockup(props: React.SVGProps<SVGSVGElement>)` — mark trong `<g transform="translate(274.46 310.67)">`, chữ `fill="currentColor"`.

- [ ] **Step 1: Test đỏ** — DOM (a) role/label, (b) chữ currentColor ghim «chu khong theo currentColor», (c) id riêng; khớp gốc: IoU mark ≥ 0.98 (ghim «IoU mark ban ngang»), IoU chữ ≥ 0.98 (ghim «IoU chu»), SVG từ `renderToStaticMarkup(createElement(LogoLockup, { width: 2048, height: 622, style: { color: "#000" } }))`.
- [ ] **Step 2: Viết component, chạy xanh, phá-thử** (dời translate 40 → đỏ «IoU mark ban ngang»; bỏ subpath lỗ chữ O → «IoU chu»).
- [ ] **Step 3: Sửa `auth-shell.tsx`** — import `{ LogoLockup } from "@crm/ui/components/logo-lockup"`, bỏ import `Logo`.
- [ ] **Step 4: Commit** `feat: bản logo kèm chữ OneHub ở trang đăng nhập`

### Task 3: Bộ icon, manifest, ảnh xuất ngoài

**independent:** false · **phục vụ:** E6, E7, E8, E9

**Files:**
- Create: `packages/ui/scripts/logo-icons-config.ts` (hằng: danh sách file, cỡ, tỉ lệ vùng an toàn, đường đích)
- Create: `packages/ui/scripts/logo-icons-lib.ts` (`sinhBoIcon(): Promise<TepIcon[]>`, `sinhAnhNgoai(): Promise<TepIcon[]>`, `ghepIco(pngs)`, `docIco(buf)`)
- Create: `packages/ui/scripts/logo-icons.ts` (CLI: không cờ → ghi vào `apps/app`; `--external <dir>` → chỉ ghi ba ảnh ngoài; `--external` trống → exit 2 «--external can mot thu muc»)
- Regenerate: 7 file icon trong `apps/app/app/` và `apps/app/public/`
- Modify: `apps/app/public/site.webmanifest`
- Test: `packages/ui/test/logo-icons.spec.ts` (ca `kich-thuoc`, `tuoi`, `manifest`, `xuat-ngoai`)

**Interfaces — Produces:** `type TepIcon = { ten: string; duong: string; noiDung: Uint8Array }`; `sinhBoIcon()` trả 7 tệp theo bảng thiết kế (hai `favicon.ico` cùng nội dung).

- [ ] **Step 1: Test đỏ** — `kich-thuoc` đọc file thật trên đĩa (ma trận 8 ca, ghim «ico thieu 48», «ngoai vung an toan»); `tuoi` gọi `sinhBoIcon()` so RGBA dung sai kênh ≤ 2, ≤ 0,5% điểm ảnh, ghim «<ten> lech nguon»; `manifest` ghim «name»; `xuat-ngoai` spawn CLI thật vào tmpdir, so `git status --porcelain` trước/sau.
- [ ] **Step 2: Viết config + lib + CLI.** Icon đục (apple, manifest, ảnh ngoài): nền trắng, khung vuông cạnh `2 * banKinhNgoai / 0.8` đơn vị (mark trong vòng 40%); apple dùng khung `banKinhNgoai / 0.35`. Favicon: nền trong suốt, `viewBox` của `Logo`. ICO: header 6 byte (`0,1,n`), n mục 16 byte (`w,h,0,0,1,32,size,offset`), rồi PNG nối tiếp.
- [ ] **Step 3: `bun packages/ui/scripts/logo-icons.ts`**, sửa manifest, chạy test xanh; phá-thử trên bản sao (ico chỉ 16/32; dời tâm MARK 4 đơn vị) rồi hoàn nguyên.
- [ ] **Step 4: Xuất ảnh ngoài** `bun packages/ui/scripts/logo-icons.ts --external ~/Documents/Share/logo/xuat-dich-vu`.
- [ ] **Step 5: Commit** `feat: bộ icon và manifest OneHub sinh từ một nguồn`

### Task 4: Răng đo của hồ sơ (ranh giới + chụp màn)

**independent:** true (chỉ đọc) · **phục vụ:** E10, E11

**Files:**
- Create: `_acceptance/logo-onehub/rang/ranh-gioi.mjs` (theo `expected` E10: mốc merge-base hoặc cặp merge, diff tới cây làm việc + untracked, grep tại sha mốc, mã 0/1/2)
- Create: `_acceptance/logo-onehub/rang/chup.mjs` (theo `expected` E11: `canhCay`, `dev:session`, puppeteer-core + Chrome, 6 ảnh, đếm svg nhìn thấy, tập href icon, byte favicon)

- [ ] **Step 1: Viết `ranh-gioi.mjs`**, chạy (mã 0), phá-thử trên bản sao worktree tạm (sửa file landing → mã 1 «vung cam»; bỏ import Logo ở app-header → mã 1 «file goi Logo doi»).
- [ ] **Step 2: Viết `chup.mjs`**, dựng bàn đo 3500/3501 (kiểm cổng trước, không đụng cổng 3810), chạy lệnh `lgo_chup`, soát sáu ảnh; phá-thử: thêm `apps/app/app/icon.png` tạm → mã 1 «icon ngoai bang», gỡ.
- [ ] **Step 3: Năm lệnh của kho** `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.
- [ ] **Step 4: Commit** `test(logo-onehub): răng đo ranh giới và chụp màn`
