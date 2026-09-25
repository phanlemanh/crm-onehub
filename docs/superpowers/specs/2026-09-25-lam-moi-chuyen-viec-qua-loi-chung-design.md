# Làm mới sau «Chuyển việc 30 ngày» qua lối chung — thiết kế

Hồ sơ: `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/` · T2 · 25/09/2026

## Vì sao

`docs/api.md` mục «Freshness»: mutation làm mới trong `onSuccess` qua `useCrmCache()`
(`apps/app/lib/trpc/cache.ts`), không liệt query key tại chỗ gọi; mutation mới thêm một
lời gọi ở đó, không thêm một danh sách khoá. Hộp «Chuyển việc 30 ngày»
(`apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx`, của hồ sơ
`moi-phia-deu-thay-ke-hoach`) đang liệt ba khoá bằng `queryClient.invalidateQueries`.
Vòng `thanh-vien-hai-khoi-cung-khuon` thấy lệch này và cố ý để lại (Out of scope của nó).

## Hành vi hiện có — thứ phải giữ

Khi `onboarding.transferWork` thành công:

1. hiện toast «Đã chuyển …» (không đổi);
2. làm mới đúng ba họ query — `onboarding.manDanhMuc`, `onboarding.bangCot`,
   `onboarding.transferPreview` — bằng `Promise.all`, tức **chờ** cả ba (query đang xem
   được tải lại, query không ai xem chỉ bị đánh dấu cũ);
3. chỉ sau đó mới đóng hộp (`dong()`).

Khi mutation lỗi: không làm mới gì, hộp giữ mở, câu lỗi hiện dưới ô chọn.

## Cách làm

- **Không mở rộng `cache.plan()`.** `plan()` không phủ `transferPreview`, và làm mới
  thêm `planById`, `listSteps`, `listEnrollments`, ba khoá activity, `companies.byId`.
  Mở rộng nó đổi hành vi của hộp này và của mọi chỗ đang gọi `plan()`.
- **Thêm mục có tên `workTransferred(options?)`** vào `CrmCache` và vào đối tượng trả về
  của `useCrmCache()`, kiểu sự kiện như `conversationRemoved`:
  `run([manDanhMuc, bangCot, transferPreview], [], options)`. `settle` mặc định là `"all"`
  nên cả ba được chờ, đúng bằng `Promise.all` cũ.
- Dialog: `const cache = useCrmCache();` thay `useQueryClient()`; `onSuccess` gọi
  `await cache.workTransferred();` rồi `dong()`. Không đổi gì khác.

## Đo

- Test DOM mới `apps/app/test/lam-moi-chuyen-viec.dom.tsx`: `cache.ts` THẬT. `useTRPC` trả
  `createTRPCOptionsProxy<AppRouter>` thật của `@trpc/tanstack-react-query` trên
  `createTRPCClient` với một link giả trả dữ liệu theo `op.path`, nên khoá query do chính thư
  viện sinh (đã thử 25/09: mock `@/lib/trpc/client` theo bí danh chặn luôn `import "./client"`
  của `cache.ts`). Ghi lại mọi lời gọi `invalidateQueries` của `QueryClient` và đọc trạng thái
  từng query sau khi chuyển. Ba ca: đúng ba khoá; hộp đóng sau khi làm mới xong; lỗi thì
  không làm mới. Cả ba xanh trên mã **trước** sửa (phép đo «giữ nguyên»); chiều đỏ lấy
  bằng phá thử (bỏ một khoá khỏi mục; dời ba khoá sang nhóm không chờ `run([], [...], { settle: "record" })`; gọi làm mới trong `onSettled`).
- Soi cú pháp (`rang/soi-ma.mjs`, khuôn `lam-moi.mjs` của vòng trước): dialog hết
  `invalidateQueries`/`queryKey()`/`useQueryClient`, có `useCrmCache()` và
  `.workTransferred(`; `cache.ts` có mục trong kiểu và trong đối tượng. Đỏ trên mã trước sửa.
- Không hồi quy (`rang/khong-hoi-quy.mjs`): máy rút mọi eval máy đã ký có `paths` của chính
  eval chạm ba tệp mã của vòng (danh sách cố định trong script; `diff` so `merge-base` không được
  có tệp mã nào ngoài ba tệp đó; lượt quét dựng cây gốc khác bị loại để không lồng nhau), chạy ở HEAD, chạy lại lệnh đỏ, rồi chạy lệnh
  còn đỏ trên cây `merge-base`; hứa quan hệ «không lệnh nào đỏ ở HEAD mà xanh ở merge-base»,
  không hứa «thoát 0» (nhiều eval đo màn thật đỏ sẵn khi không có máy chủ dev). Bản nháp đầu
  viết tay tám khoá; rút bằng máy ra 49 lệnh, vì nhiều hồ sơ khai `paths` rộng (`apps/app/**`).

## Không làm

- Không đổi giao diện: không design-pass, không đặc tả UX, không ảnh ui-observed.
- Không làm mới thêm `planById`/`listSteps` sau khi chuyển (sheet kế hoạch đang mở có thể
  hiện người cầm trịch cũ tới hết `staleTime`) — lệch có sẵn, ghi Out of scope.
- Không sửa `apps/app/test/moi-phia-ke-hoach.dom.tsx` (của hồ sơ đã thông máy); mock
  `useCrmCache` kiểu Proxy của nó nhận được mục mới.
