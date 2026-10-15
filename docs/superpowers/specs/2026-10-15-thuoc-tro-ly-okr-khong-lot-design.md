# Thước E22/E24 của Trợ lý OKR không lọt lượt rỗng, không chia kho giữa các cây — thiết kế

Hồ sơ `_acceptance/thuoc-tro-ly-okr-khong-lot/`, hạng T2, chỉ đổi thước của hồ sơ đã ký `tro-ly-okr-de-xuat`. Việc (a) chủ kho
duyệt 14/10 («Đồng ý cả ba»), giám sát r2 giao sau khi #406 gộp.

## Hai lỗi đã gặp ngày 14/10

1. **Lượt rỗng lọt làn ghim.** AI Gateway trả 402 (số dư âm), 20/20 lượt E24 `hong:turn-failed`; `do-tre.mjs` thoát mã 1 —
   trùng `expected_exit: 1` đã khai cho «chậm» — nên làn ghim F24 coi là đạt.
2. **Kho E22 dùng chung.** `eval-gop-y.mjs` gọi `taoKho("tdx-e22")` qua `db:do --ten`, tên đè tên cây; hai cây chạy E22 cùng lúc
   dựng lại và xoá kho của nhau (14:52Z và 15:06:41Z). `bo-ca-mau-quy-4` cũng gọi `taoKho` với tên cố định.

## Cách sửa (chỉ thước, không mã sản phẩm)

- `phien-tro-ly.mjs`: `soDuGateway` đọc `GET /v1/credits` bằng khoá Trợ lý OKR; `chanSoDu` trả lý do khi số dư ≤ 0; không đọc
  được thì cảnh báo một dòng và đo tiếp (phép «hỏng hết» bên dưới vẫn bắt được). `tenKhoTheoCay` ghép tên cây vào trước tên kho;
  `taoKho`/`xoaKho` dùng nó — sửa luôn cho `bo-ca-mau-quy-4`.
- `do-tre.mjs`: chặn số dư trước khi đo; sau khi đo, mọi lượt hỏng → mã 2 với câu «N/N luot hong (<kết cục> <số>) — khong phai do
  tre; <dòng lỗi model nguyên văn từ tac-tu.log>». Phần chạy bọc `import.meta.main` để bài kiểm nhập được hàm.
- `eval-gop-y.mjs`: chặn số dư trước khi đo.

## Hỏi-1: `do-tre.sql`

Câu SQL không chỉ là thước: `apps/api/test/tro-ly-okr-so-do.spec.ts` đòi API `tro-ly-so-do.ts` khớp từng số với nó, tức nó là
bản đối chiếu của số đo độ trễ quản trị thấy trên màn. Lọc SQL theo lượt đã nộp = đổi số đo sản phẩm. Khuyến nghị: không đổi ở
hàng này (lỗ «lượt hỏng trông như nhanh» ở thước đã bị chặn bằng mã 2); tách thành hàng riêng nếu muốn đổi số đo.

## Đo

- `rang/kiem.test.ts`: ma trận số dư {âm, 0, dương nhỏ, dương} và hai ca không đọc được; `hongHet` trên nhật ký tác tử thật (lượt
  khoá sai); hai cây ra hai kho khác nhau và khác kho chung cũ; nguồn `taoKho`/`xoaKho` của bản sửa theo cây, bản trước vòng thì không.
- `rang/khoa-sai.mjs`: E24 thật với khoá Gateway sai (không tốn tiền) — bản sửa mã 2 «2/2 luot hong», bản trước vòng mã 1
  «KHONG DAT».
- Ghim lại `tro-ly-okr-de-xuat` trong cùng PR (E22, E24 gọi model thật).

## Đặc tả UX

Không chạm màn nào.
