# Vỏ khu Mục tiêu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Khu Mục tiêu đi bằng `AreaSidebar` (Của tôi · OKR: Bộ OKR, Lấy ý kiến · Báo cáo: Sức khoẻ, Sơ đồ), ô chu kỳ ở đầu thanh, đường mới bằng rewrites, đường cũ bằng redirects, DH11.

**Spec:** `docs/superpowers/specs/2026-10-19-vo-khu-muc-tieu-design.md`; hợp đồng `_acceptance/vo-khu-muc-tieu/contract.md`; evals `_acceptance/vo-khu-muc-tieu/evals.yaml`.

## Global Constraints

- Không chú thích trong code; không dời thư mục route dưới `apps/app/app/(app)/[slug]/okr/`.
- `apps/app/lib/messages/okr*.ts` chỉ thêm dòng (luật 7).
- Không chạm `components/crm/record-sheet/**` (vùng M5) và `apps/agent/**`.
- Bài đã ký chỉ được sửa ở đúng các ca đo thanh thẻ ngang (Hỏi-1, sổ d-20261019T214912Z-13): `okr-thanh-tab.dom.tsx`, `okr-dau-trang-khu.dom.tsx`, `khung-okr-truoc-r1.dom.tsx`, `soan-okr-song-lai.spec.ts`, thước `data-khung-tab` của `dot-hoi-y-tuong-okr`, `khung-man-chung`.
- Giữ `data-chon-chu-ky` trên ô chu kỳ.

## Review Focus

- Liên kết `soan/[cuocSoanId]` đi thẳng `/okr/bo-okr?…&record=soan:<id>` (một bước).
- `#chuong-trinh` đứng sau truy vấn khi chuyển `toan-canh/suc-khoe?kyOkr=`.
- Ô chu kỳ ở layout đổi theo trang đích khi chuyển trang phía trình duyệt.
- Vai chỉ OKR: không footer, vào được mọi mục.

### Task 1: Đường mới và cũ trong `next.config.ts` — phục vụ E5 · independent: true
Files: `apps/app/next.config.ts`; test mới `apps/app/test/vo-khu-chuyen-huong.spec.ts` (`-t vkm-chuyen-huong`, nếp `okr-chuyen-huong-cap-nhat.spec.ts`).
- rewrites (afterFiles): `/:slug/okr/bo-okr` → `/:slug/okr/theo-don-vi`, `/:slug/okr/lay-y-kien` → `/:slug/okr/hoi-y`, `/:slug/okr/suc-khoe` → `/:slug/okr/toan-canh`, `/:slug/okr/so-do/muc-tieu/:id` → `/:slug/okr/quanh-muc-tieu/:id`.
- redirects permanent: ngược lại năm đường cũ, `toan-canh/suc-khoe` → `suc-khoe#chuong-trinh` (đứng TRƯỚC `toan-canh`); dòng `cap-nhat-tuan` giữ nguyên.
- Rủi ro: rewrite đích là nguồn redirect — kiểm trên bản chạy ở Task 7; vòng lặp thì dùng `has`/`missing` header `x-middleware-rewrite` hoặc báo dời thư mục.

### Task 2: Đường trong app — phục vụ E7 · independent: false (sau Task 1)
`tab-okr.ts` `DUONG` sang đường mới, `tabTuDuong` nhận cả đường mới; mọi chuỗi `/okr/theo-don-vi|toan-canh|hoi-y|quanh-muc-tieu` trong `apps/app` (trừ test/proto/next.config) sang đường mới; `soan/luat-ban-nhap.ts` `duongMoCuoc` → `/okr/bo-okr`. Bài quét `_acceptance/vo-khu-muc-tieu/rang/quet-duong-cu.mjs` (nạp nextConfig, miễn đúng source/destination).

### Task 3: Thanh bên và đầu trang — phục vụ E1, E2, E3 · independent: false
`okr/thanh-ben-muc-tieu.tsx` (client, `AreaSidebar label="Mục tiêu"`, header `ChonChuKy`, footer theo `canManageProgram`, số Lấy ý kiến từ truy vấn `ThanhTabOkr` dùng hôm nay); `okr/layout.tsx` theo nếp `settings/layout.tsx`; `DauTrangOkr` thôi dựng `ThanhTabOkr`; `HanhDongKhu` thôi dựng `ChonChuKy`. Chữ nhãn mới trong messages okr (thêm khoá). Test `apps/app/test/vo-khu-muc-tieu.dom.tsx` (`vkm-thanh-ben`, `vkm-chu-ky`, `vkm-mot-lop`).

### Task 4: Sức khoẻ và Sơ đồ — phục vụ E4 · independent: false
`toan-canh/page.tsx` thêm phần quản trị (`SucKhoe`, `TomTatQuanTri`, `OkrMoCoi`) trong `section id="chuong-trinh"` khi `canManageProgram`; trang mới `okr/so-do/page.tsx` dựng `CayCanChinh` ở đơn vị gốc theo `kyOkr`; `quanh-muc-tieu.tsx` nút quay lại → `/okr/so-do`.

### Task 5: DH11 — phục vụ E8 · independent: true
`phan-don-vi-dan.tsx` xét `org.tree` (khung chờ, `LoiPhan` có Thử lại); test mới `apps/app/test/okr-don-vi-dan-cay.dom.tsx` (`vkm-don-vi-dan`).

### Task 6: Bài đã ký gắn thanh thẻ — sau Task 3
Gỡ đúng ca đo thanh thẻ ngang ở sáu chỗ (Global Constraints); mỗi hồ sơ một dòng sổ `fix` `decided_by: Phan Le Manh`.

### Task 7: Bàn đo màn — phục vụ E4, E6, E9, E10, E12, E13, E14 · sau Task 1–5
`_acceptance/vo-khu-muc-tieu/rang/do-man.mjs` theo nếp `thanh-ben-khu-dung-chung/rang/do-man.mjs` (thư viện `man-that-lib`, chép ảnh chỉ khi `VKM_CHEP_ANH=1`), nạp bộ OKR mẫu.

### Kết
`bun run test`, `check-types`, `lint`, `lint:slop`, `build`.
