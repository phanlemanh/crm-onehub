---
schema_version: 1
feature: "Cửa vào vá — Quên mật khẩu giữ logo, đăng xuất lỗi báo tiếng Việt, API không đọc được phiên thì không đá người còn phiên về đăng nhập mà hiện trang lỗi có «Thử lại»; trả nợ thước cua-vao-dang-nhap"
slug: cua-vao-va
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-04T21:36:14Z
design_doc: docs/superpowers/specs/2026-10-05-cua-vao-va-design.md
---

# Acceptance Contract: cua-vao-va

## Context

Sau đợt nhập cả công ty 04/10, mọi nhân viên đi qua cửa vào. Hàng R1f vá ba chỗ hở có nguồn: #31
biểu mẫu Quên mật khẩu mất logo khi nạp xong, #32 đăng xuất lỗi hiện câu tiếng Anh của thư viện, #33
API gộp «không đọc được phiên» với «không có phiên» thành 401 nên proxy đá người còn phiên về
`/sign-in` (Known limits Ngoài-1/4 của `phien-chet-ve-dang-nhap`), và app không có trang lỗi nào.
Cùng lượt trả nợ thước `cua-vao-dang-nhap` (E16 `soi-ma` đo diff nhánh).

Source input: `docs/plan/lo-trinh-okr.json` hàng R1f; `_acceptance/cua-vao-va/opportunity.md`
(Cổng Đáng `build`, 04/10); thiết kế `docs/superpowers/specs/2026-10-05-cua-vao-va-design.md`.

## Criteria

- AC-1: Given một yêu cầu tRPC mang cookie phiên tới thủ tục sau `AuthMiddleware`, When `auth.api.getSession` ném lỗi (cơ sở dữ liệu không đọc được), Then API trả HTTP 503 mã `SERVICE_UNAVAILABLE` — không phải 401 — và ghi đúng một dòng log lỗi «Could not read the session» không chứa cookie hay header; cùng thủ tục khi `getSession` trả `null` vẫn trả 401.
- AC-2: Given ba lớp middleware cần đăng nhập (`AuthMiddleware` và các lớp con phạm vi, `SignedInMiddleware` của `workspace.get`, `SessionOnlyMiddleware`), When `getSession` ném lỗi, Then cả ba trả 503; When không có phiên, Then cả ba vẫn trả 401 (ma trận 3 × 2); và mọi thủ tục tRPC đang trả 401 khi không có phiên đều trả 503 khi `getSession` ném — không thủ tục nào sót.
- AC-3: Given một thủ tục công khai (không middleware đăng nhập), When `getSession` ném lỗi trong lúc dựng ngữ cảnh, Then thủ tục vẫn trả kết quả bình thường (200), không 503.
- AC-4: Given proxy của app hỏi `workspace.get` cho một yêu cầu có cookie phiên, When API trả 503, Then proxy cho yêu cầu đi tiếp, không chuyển về `/sign-in`; When API trả 401, Then proxy vẫn chuyển về `/sign-in`.
- AC-5: Given người đang ở một trang dưới `/<slug>/…`, When nội dung trang ném lỗi lúc dựng (vd cơ sở dữ liệu không đọc được phiên, API trả 503), Then trang lỗi hiện trong khung app (đầu trang còn) với tiêu đề «Hệ thống đang trục trặc», câu nói phiên vẫn còn, và nút «Thử lại» gọi `retry`; không có nút đăng xuất, không chuyển hướng.
- AC-6: Given layout của `/<slug>` ném lỗi ở phần không nằm trong vùng chờ (Suspense) của nó, When trang được mở, Then trang lỗi ngoài khung hiện cùng tiêu đề, câu và nút «Thử lại» gọi `retry`.
- AC-7: Given một người đã đăng nhập ở khổ 375 và 1440, When API không đọc được phiên vì lỗi cơ sở dữ liệu và người mở `/<slug>`, Then địa chỉ vẫn là `/<slug>` (không qua `/sign-in`, không vòng chuyển hướng), trang lỗi hiện với nút «Thử lại» trong khung nhìn; khi lỗi được gỡ và người bấm «Thử lại», trang trở lại bình thường. (cross-layer)
- AC-8: Given trang Quên mật khẩu ở khổ 375 và 1440, When biểu mẫu đã nạp xong ở trạng thái nhập email và sau khi gửi ở trạng thái «đã gửi», Then logo OneHub (liên kết về `/`) đứng trên tiêu đề ở cả hai trạng thái, không tràn ngang.
- AC-9: Given `signOut()` trả lỗi có câu tiếng Anh, hoặc ném lỗi mạng, When người bấm đăng xuất ở đầu trang app, trang hết quyền hay trang cấp quyền hộp thư, Then toast chỉ hiện câu tiếng Việt do nơi gọi truyền vào, không chứa câu của thư viện, và người ở lại trang; When `signOut()` thành công, Then trình duyệt sang `/sign-in`.
- AC-10: Given các chữ mới (trang lỗi) ở `apps/app/lib/messages`, When soát bằng `messages-guard`, Then đủ bản vi và en, bản vi có dấu, không chữ nào để trống.
- AC-11: Given thước `soi-ma.mjs` của hồ sơ `cua-vao-dang-nhap`, When chạy trên nhánh không chạm `apps/app`, trên đỉnh `onehub` và trên clone nông không có ref nhánh, Then danh sách tệp «vòng này» đọc từ một tệp đóng băng commit trong hồ sơ (`_acceptance/cua-vao-dang-nhap/rang/tep-vong.txt`), tệp này bằng đúng tập `git diff --name-only d864d529^1 d864d529 -- apps/app` (PR #155) khi có đủ lịch sử, và thước xanh cả ba nơi; When một tệp trong danh sách bị chèn nhập `@crm/auth` vào tệp client (bản sao), Then thước đỏ gọi tên vạch (a); When một dòng bị xoá khỏi tệp đóng băng (bản sao), Then phép so tập đỏ gọi tên tệp thiếu.
- AC-12: Given vòng này chạm vùng đo của `cua-vao-dang-nhap`, When làn ghim lại chạy trên đỉnh của vòng, Then mọi eval máy của `cua-vao-dang-nhap` (gồm E16 và vạch `khong-shader`) và của `cua-vao-va` thoát 0 trong cùng một lượt làn.
- AC-13: Given các tệp giao diện mới hoặc sửa của vòng (`error.tsx` hai cấp, thành phần trang lỗi, khối tiêu đề cửa vào, biểu mẫu Quên mật khẩu), When chạy sàn thiết kế của kho và quét JSX, Then không vi phạm P0, và không phần tử nào nhập từ `@crm/ui` mang `className` có lớp màu (`bg-`, `text-<màu>`, `border-<màu>`), lớp góc (`rounded`) hay lớp khoảng cách (`p-`, `m-`, `gap-`).

## Coverage

Quét bằng `morphological-scan` preset test-matrix (S1, 05/10).

- Trục A — Lớp: API ngữ cảnh/middleware | proxy app | trang app | trang cửa vào | hàm đăng xuất | thước hồ sơ cũ [thước CE: sơ đồ đường lỗi ở Known limits Ngoài-1/4 của `phien-chet-ve-dang-nhap`]
- Trục B — Tình trạng phiên/API: khoẻ | không phiên | phiên còn nhưng API không đọc được | lỗi trang không liên quan phiên [thước CE: RFC 9110 (401 vs 503) + mục «Gates in proxy.ts» của `docs/api.md`]
- Trục C — Khổ: 375 | 1440 [thước CE: luật kho đo hai khổ cho mặt người nhìn]
- Core → AC: 503/401 (AC-1, AC-2) · công khai không 503 oan (AC-3) · proxy (AC-4) · trang lỗi hai cấp (AC-5, AC-6) · màn thật (AC-7) · logo hai trạng thái hai khổ (AC-8) · đăng xuất (AC-9) · chữ (AC-10) · nợ thước (AC-11, AC-12) · sàn thiết kế (AC-13).
- Later: `global-error.tsx`; trang lỗi cho trang cửa vào; lượt tự thử lại của truy vấn phía trình duyệt; `cookieCache` 5 phút.
- Never: tự đăng xuất người khi API lỗi; proxy tự phân biệt 5xx.

## Đường đo

- Thước: trang Quên mật khẩu có logo trên production · số từ: phép đo màn `rang/do-man.mjs` ở 375 và 1440, lặp lại tay trên `https://www.onehub.center/quen-mat-khau` ở lái-thử · bảo đảm bởi: AC-8
- Thước: 0 câu tiếng Anh khi đăng xuất lỗi · số từ: test DOM ma trận câu của thư viện → toast · bảo đảm bởi: AC-9
- Thước: lỗi đọc phiên không đá người về `/sign-in` · số từ: dòng log «Could not read the session» của API trên production (đếm qua `vercel logs`) đi cùng mã 503, không 401 · bảo đảm bởi: AC-1, AC-7
- Thước: `cua-vao-dang-nhap` ghim lại xanh · số từ: dòng `kind: repin` trong `_acceptance/cua-vao-dang-nhap/run-log.jsonl` · bảo đảm bởi: AC-12

## Out of scope

- `app/global-error.tsx` và trang lỗi cho các trang cửa vào `(landing)`.
- Lượt tự thử lại của truy vấn phía trình duyệt khi API trả 503.
- Độ trễ 5 phút của `cookieCache` khi phiên bị thu hồi.
- Tự đăng xuất người khi API lỗi.
- Sửa `apps/app/proxy.ts` hay `lib/onboarding.ts` — proxy đã bỏ qua mọi mã khác 401; vòng này chỉ khoá hành vi đó bằng test.
- Chạm `apps/api/src/auth/**` hay `packages/auth/**` (giữ hạng T2).

## Notes

- Dữ liệu production chỉ đọc. Không có migration.
- Phép đo màn AC-7 dựng lỗi đọc phiên bằng một lỗi hoàn lại được trong kho đo dùng-một-lần (`crm_<cây>_do`), và xoá cookie `session_data` của better-auth trước lượt gây lỗi — `cookieCache` 5 phút làm `getSession()` không chạm cơ sở dữ liệu nếu cookie đó còn.
