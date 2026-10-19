# Hạt giống — Thước của giam-phut-ci-nhap-t1: ba eval không chạy xanh được trên máy M5

Gốc: `_acceptance/giam-phut-ci-nhap-t1/` (ký Cổng 2 ngày 11/10/2026, lần ghim cuối `repin-20261012T222532Z-81286`).
Phát hiện ở làn ghim lại `repin-20261018T165912Z-76633` (18/10, M5, sau gộp #481 C-1c). Làn chạy pre-push-t1,
giam-phut-ci-nhap-t1 và t1-ma-doc: 7 suite xanh, pre-push-t1 và t1-ma-doc xanh 10/10, chỉ giam-phut-ci-nhap-t1 đỏ ba eval.
Làn đỏ không ghi pin. Dòng `repin-do` cũng KHÔNG được commit: `pre-merge-check --slug` báo cả ba hồ sơ không hoá cũ,
nên Điều phối M5 bỏ lượt ghim. Nhật ký trọn của làn (sáu tệp lệnh đỏ, ba bản diff dòng `repin-do`, nhật ký làn) chép ở
thư mục ghi chú chung của đợt, mục `repin-20261018T165912Z-76633/` (phiên Điều phối M5).

Hạt giống là SỔ, không phải ô. Không sửa thước của hồ sơ đã ký trong vòng này. Tệp này đi kèm PR thật kế tiếp, không
PR riêng.

## Lỗ

1. **E1 (`rang/phan-loai.mjs`): hook git-secrets của máy chặn commit trong kho tạm.** Răng commit bản chép
   `_acceptance/config.yaml` vào kho git tạm. Hook hệ thống `/opt/git-secrets/hooks` của M5 chặn commit đó, vì config có
   hai dòng giống khoá (`sol_man_that`, `tl45_man_that`). Đây là lỗi môi trường, không phải lỗi vật. Cùng lý do,
   t1-ma-doc đã khai E8b `status: not-run`. Làn ghim lại của hồ sơ này chỉ xanh được trên máy không có hook đó.
2. **E2 (`rang/mot-nguon.mjs`, ca `ngu-nghia-pre-merge`): thước lệch vì luật đã đổi.** Ca này đòi tập T1 của bộ phân
   loại CI bằng đúng tập T1 của `pre-merge-check`. Từ #480 (t1-ma-doc), bộ phân loại cố ý trừ các tệp khai trong
   `risk_tiers.t1_ma_doc` (CONTEXT.md, LO-TRINH.html, `_acceptance/dieu-huong-khu-muc-tieu/contract.md`,
   `_acceptance/soan-okr-cung-tro-ly/rang/ma-tran-quyen.md`, `apps/agent/agent/instructions.md`, …). Hai tập vì thế lệch
   đúng các tệp đó. Lệch này có chủ ý, và thước đã gãy từ #480, không phải từ #481. Người quyết: sửa thước để so hai tập
   sau khi trừ `t1_ma_doc`, hay khai ca này đã được hồ sơ t1-ma-doc thay thế.
3. **E11 (`rang/luot-that.mjs`): đòi nhánh hiện tại có PR mở.** Răng thoát 2 «nhanh … khong co PR mo» khi làn ghim lại
   chạy trên nhánh chưa có PR. Làn ghim lại thường chạy TRƯỚC khi mở PR, nên eval này chặn đúng lượt ghim đầu của nhánh.

## Vì sao chưa làm

Cả ba hồ sơ không hoá cũ (`pre-merge-check --slug`: OK), nên không có việc ghim lại nào phải xong ngay. Sửa thước của hồ
sơ đã ký cần chữ chủ kho. Lớp «Cho sửa cả lớp này» (09/10) chỉ phủ thước gãy vì gốc so `merge-base`, không phủ ba lỗ này.

## Hướng

Một hàng vệ sinh riêng khi giam-phut-ci-nhap-t1 thật sự cần ghim lại:
- E1: chép config vào cây làm việc mà không commit, như các bài kiểm của t1-ma-doc và push-ghim-lai-t1 đã làm; hoặc khai
  `not-run` kèm máy chạy được.
- E2: người chọn một trong hai lối đã nêu ở mục 2.
- E11: cho răng nhận «chưa có PR» là trạng thái đọc riêng, không phải mã 2; hoặc đưa eval ra khỏi làn ghim lại.
