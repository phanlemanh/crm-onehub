# Dọn giao diện sau K7 — kế hoạch thi công

Hồ sơ `_acceptance/don-sau-cho-tac-nhan/` (Cổng Phạm vi duyệt 27/10, Hỏi-1 theo khoảng mặc định của `Card`). Thiết kế:
`docs/superpowers/specs/2026-10-27-don-sau-cho-tac-nhan-design.md`. Một dãy, tuần tự: các bước chung một tệp thẻ.

## Bước 1 — bài kiểm chiều đỏ trước

- `apps/app/test/the-dang-dung-noi-song.spec.ts` (E1): `kiemNoiSong(tep)` nhận bản đồ đường → nội dung của toàn cây
  `apps/app` và `packages/ui` (bỏ `node_modules`, `.next`, thư mục `test`), trả danh sách vi phạm. Ca `cay-that` và chín
  ca chiều đỏ (a)–(i) đúng thông điệp ghim của `evals.yaml`.
- `packages/ui/test/the-dang-dung.dom.tsx` (E2): `lechLop(the, mau)` so lớp `card-action`, `card-footer` của thẻ với bản
  không tham số.
- `apps/app/test/the-dang-dung.dom.tsx` (E3): `kiemBuoc(khung, daXong, chu)` cho ma trận `daXong ∈ {0,1,3,4}`; đồng hồ và
  dòng quá ngưỡng; chân thẻ.

Chạy cả ba trên cây cũ: đỏ (tệp thẻ ở `packages/ui` chưa có).

## Bước 2 — thẻ ở `packages/ui`

`packages/ui/src/components/the-dang-dung.tsx`: chỉ vẽ. Tham số `buoc` (`nhan`, `vat` đã gọn), `daXong`, `chu`
(`tieuDe`, `nhanTienDo`, `tienDo`, `xong`, `dangLam`, `dangXep`, `roiTrang`, `daTroi`, `lauHon`, `dangGhi`), `nutDung`.
`CardAction`, `CardFooter` không `className`; màu, cỡ chữ, chữ số đều hàng xuống `span` con.

## Bước 3 — hook ở app, hai chỗ gọi

- `apps/app/lib/agent-builder-the-dang-dung.ts`: `useTheDangDung({ t, buocVat, daXong, dangGhi, batDauLuc })`.
- `agent-builder-chat.tsx` và `proto/_modules/cho-tac-nhan-lau/index.tsx` gọi hook, nhập thẻ từ
  `@crm/ui/components/the-dang-dung`.
- Xoá `apps/app/components/agent-builder/the-dang-dung.tsx`.

## Bước 4 — chứng

Ba bài mới xanh, `dsctn_k7_nguyen` xanh, rồi năm lệnh chứng qua khoá máy; S4 chạy E5 trên màn thật.
