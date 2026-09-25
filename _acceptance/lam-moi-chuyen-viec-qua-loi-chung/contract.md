---
schema_version: 1
feature: Hộp «Chuyển việc 30 ngày» làm mới danh mục, bảng cột và phần xem trước qua lối làm mới chung useCrmCache() thay vì liệt query key tại chỗ gọi — hành vi giữ nguyên
slug: lam-moi-chuyen-viec-qua-loi-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
design_doc: docs/superpowers/specs/2026-09-25-lam-moi-chuyen-viec-qua-loi-chung-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T15:17:50Z
---

# Acceptance Contract: lam-moi-chuyen-viec-qua-loi-chung

## Context

`docs/api.md` mục «Freshness» đòi mutation làm mới trong `onSuccess` qua `useCrmCache()`
(`apps/app/lib/trpc/cache.ts`), không liệt query key tại chỗ gọi. Hộp «Chuyển việc 30 ngày»
(`chuyen-viec-dialog.tsx`, hồ sơ `moi-phia-deu-thay-ke-hoach`) đang liệt ba khoá
`onboarding.manDanhMuc`, `onboarding.bangCot`, `onboarding.transferPreview` và chờ cả ba bằng
`Promise.all` trước khi đóng hộp. Vòng này dời ba khoá vào một mục có tên của `cache.ts` và
giữ nguyên hành vi.

«Người đi» là thành viên có việc bị chuyển (Hương, `u-h`), «người nhận» là người được chọn
(Tuấn, `u-t`). «Làm mới» một query = gọi `invalidateQueries` cho khoá của nó: query không ai
đang xem bị đánh dấu cũ, query đang xem được tải lại.

## Criteria

- AC-1: Given hộp chuyển việc đang mở cho Hương (2 kế hoạch, 3 bước), bộ nhớ query đang giữ danh mục (hai bộ lọc khác nhau), bảng cột, phần xem trước, và các query không liên quan — `onboarding.planById`, `onboarding.listSteps`, `onboarding.listEnrollments`, `activities.myTasks`, `companies.byId` — When quản trị chọn Tuấn và bấm «Chuyển» và `transferWork` thành công, Then `invalidateQueries` được gọi đúng ba lần với đúng ba khoá `onboarding.manDanhMuc`, `onboarding.bangCot`, `onboarding.transferPreview` (không khoá nào khác); cả hai query danh mục và query bảng cột bị đánh dấu cũ; phần xem trước được tải lại đúng một lần; và năm query không liên quan không bị đánh dấu cũ.
- AC-2: Given như AC-1 nhưng lần tải lại phần xem trước chưa trả về, When `transferWork` thành công, Then hộp vẫn mở và lệnh đóng hộp chưa được gọi; và khi lần tải lại trả về thì hộp đóng.
- AC-3: Given như AC-1, When `transferWork` trả lỗi, Then `invalidateQueries` không được gọi lần nào, hộp vẫn mở, và câu lỗi của máy chủ hiện trong vùng `role="alert"` của hộp; và khi quản trị bấm «Chuyển» lần nữa và lần này thành công thì đúng ba lời gọi làm mới của AC-1 xảy ra và hộp đóng.
- AC-4: Given mã sau vòng này, When soi cây cú pháp của `chuyen-viec-dialog.tsx` và `apps/app/lib/trpc/cache.ts`, Then dialog không có lời gọi `invalidateQueries`, `refetchQueries`, `.queryKey()` hay `useQueryClient`, và có gọi `useCrmCache()` cùng `.workTransferred(`; `cache.ts` khai `workTransferred` trong kiểu `CrmCache` và có mục `workTransferred` trong đối tượng `useCrmCache()` trả về.
- AC-5: Given ba tệp mã của vòng này (`chuyen-viec-dialog.tsx`, `apps/app/lib/trpc/cache.ts`, `apps/app/test/lam-moi-chuyen-viec.dom.tsx`) và tập eval máy (`test`/`script`, không tự khai `status: not-run`) của mọi hồ sơ `signed-off`/`machine-cleared` khác mà `paths` của chính eval khớp ít nhất một tệp trong ba tệp đó — tập do máy rút, không viết tay; bộ rút trên một tệp cố định trả về `moi-phia-deu-thay-ke-hoach:E3` (cho hộp) và `thanh-vien-hai-khoi-cung-khuon:E19` (cho `cache.ts`); lượt quét dựng cây gốc khác bị loại và in tên — When chạy từng lệnh của tập ở HEAD, chạy lại tuần tự một lần mỗi lệnh đỏ, và chạy lệnh còn đỏ trên cây `merge-base(HEAD, origin/onehub)`, Then không lệnh nào đỏ ở HEAD (sau lần chạy lại) mà xanh ở `merge-base`; và `diff` so với `merge-base` không có tệp mã nào ngoài ba tệp đó.

## Coverage

Bỏ quét — xem entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`: dời một lời gọi làm mới sang lối chung, không gian AC một chiều (thành công / chờ / lỗi) và đã liệt đủ ở AC-1..AC-3.

## Out of scope

- Làm mới thêm `onboarding.planById`, `onboarding.listSteps`, `onboarding.listEnrollments` sau khi chuyển. Sheet kế hoạch đang mở có thể hiện người cầm trịch cũ tới hết `staleTime` — lệch có từ trước; vòng này giữ nguyên hành vi, sửa là một hợp đồng khác.
- Sửa `apps/app/test/moi-phia-ke-hoach.dom.tsx` của hồ sơ đã thông máy — mock `useCrmCache` kiểu Proxy của nó nhận mục mới mà không cần đổi.
- Dựng máy chủ dev cho các eval màn thật trong tập AC-5 (`tvhk_do_khoi`, `ttv_do_bang`…) — chúng đỏ (mã 2) ở cả HEAD lẫn `merge-base` khi không có máy chủ, nên AC-5 tính chúng là «đỏ sẵn»; chúng không mở hộp chuyển việc, và giao diện không đổi. Eval `ui-check` (E17 của `moi-phia-deu-thay-ke-hoach`) ngoài làn máy, không chạy lại.
- Dời các lời gọi `invalidateQueries` tại chỗ khác trong `apps/app` (nếu có) — vòng này chỉ chạm hộp chuyển việc.

## Notes

- Không có `opportunity.md` — việc giữ luật kho, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
- AC-1..AC-3 là phép đo «giữ nguyên»: phải xanh trên cả mã trước sửa lẫn sau sửa. Chiều đỏ của chúng lấy bằng phá thử (xem `expected` từng eval). AC-4 là phép đo đổi chỗ: đỏ trên mã trước sửa.
- S3 (25/09): E1–E3 xanh 3/3 trên mã TRƯỚC sửa (`b3827cfa`) và sau sửa (`0fdec41a`); E4 đỏ `0 DUNG, 10 SAI` trước sửa, xanh `6 DUNG, 0 SAI` sau sửa, cùng kết quả khi chạy từ `/tmp`. Phá-thử tại chỗ sau commit, hoàn nguyên bằng `git checkout`: bỏ `transferPreview` khỏi mục → E1 đỏ «Expected dung ba khoa lam moi»; thêm `planById` vào mục → E1 đỏ cùng thông điệp, ở khẳng định đầu (dòng «onboarding.planById khong bi danh dau cu» mà `expected` E1 nêu không được chạy tới vì khẳng định đầu đã đỏ); ba khoá sang nhóm không chờ `settle: "record"` → E2 đỏ «hop dong truoc khi lam moi xong»; bỏ `await` → E2 đỏ cùng thông điệp; làm mới trong `onSettled` → E3 đỏ «khong lam moi khi loi». Sau hoàn nguyên 3/3 xanh. `moi-phia-ke-hoach.dom.tsx` 14/14 sau sửa.
- Ngoài hợp đồng, thấy ở S3: `dienNode` của hộp cho hai phần tử cùng khoá `0` khi mẫu bắt đầu bằng `{ten}` (React cảnh báo mỗi lần vẽ) — có từ trước, không đổi ở vòng này; đã mở chip riêng.
- E5 ở S3 (25/09): lượt đầu thoát 1 — `tcds_khong_hoi_quy` đỏ ở HEAD, xanh ở `b7951341`, vì suite `lint_slop` bắt hai chỗ `typeof` trong chính `rang/khong-hoi-quy.mjs`; sửa vật (xem sổ). Lượt ở `72b1224b`: 90 hồ sơ quét (82 đã ký), 61 eval, 48 lệnh chạy, 4 lệnh loại vì quét lồng (`ktcd_khong_hoi_quy`, `tcds_khong_hoi_quy`, `ndk_cay_that`, `ndk_pham_vi`), 21 lệnh đỏ ở HEAD sau chạy lại và đỏ cùng mã ở `b7951341` — mã 0. Phá-thử trên bản sao script: xoá `chuyen.mutate(...)` → mã 1 «vong nay lam do them 1 lenh: config:executors.test.kh2_chuyen_giao_man (moi-phia-deu-thay-ke-hoach:E3)»; đối chứng dương rút trên tệp không tồn tại → mã 1 «bo rut tap hong». Một lượt E5 mất ~25 phút.
