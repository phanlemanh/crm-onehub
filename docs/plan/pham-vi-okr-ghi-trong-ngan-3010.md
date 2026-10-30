# Bản phạm vi — nợ còn lại sau luật «Ghi vào bản ghi: ngay trong ngăn» (30/10)

Chủ kho 30/10 duyệt luật mới ở `docs/design.md` mục «Ghi vào bản ghi: ngay trong ngăn» (PR #586) và hàng SV8 (cập nhật KR
trong ngăn). Bản soát sáu loại ngăn bản ghi (Deal, Liên hệ, Công ty, Kế hoạch, Mục tiêu, KR) trên onehub `6b2a9742d` và
production còn ba chỗ lệch nằm ngoài SV8. Lời chủ kho nguyên văn: «Cắt lượt và đưa vào tri thức». Bản soát đầy đủ ở kho
tri thức (dòng `nguon`).

<!-- <<<PHAM-VI-MA -->
```
dot: okr-ghi-trong-ngan-3010
dang: lan-va
nguon: crm-onehub-nguon:wiki/chu-de/ghi-trong-ngan.md#798fbc29a6e90b4723c88fb9990b3e202dcb6cca

- `N1` — sửa tên, mô tả, người phụ trách của mục tiêu và KR ngay trong ngăn, không mở Sheet sửa chồng lên ngăn (HopThoaiKr, HopThoaiMucTieu qua NganOkr ở objective-sheet.tsx)
- `N2` — ghim bằng chứng của KR một lối, một ô trong ngăn KR, thay Dialog ở kr-bang-chung.tsx và ô URL trong hộp cập nhật
- `N3` — bảng KR trong ngăn mục tiêu ở khổ 1280: chip người phụ trách không đè tên KR
```
<!-- PHAM-VI-MA>>> -->

Ra khỏi kho: không có việc vận hành.
