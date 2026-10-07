# so-moi-khong-chap-chon — design

Hàng F13 của đợt `sau-14-10`, dãy P4. Hạng T2. Không chạm UI.

## Vấn đề

Bài «số người gõ đọc trên mọi phiên của cuộc…» của `apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`
đỏ một lần trên CI của #290: số thử 41 phải vắng khỏi gói để dòng bị loại `so-moi` trước khi người
gõ, nhưng 41 có trong gói.

## Gốc lỗi (đo tại chỗ, 07/10)

1. `ma()` của `test/support/gieo.ts` = `` `sokr-${Date.now().toString(36)}x${++dem}` ``. Bộ phận, phòng,
   phòng ngang và mọi chu kỳ của `gieoCanhGoi` lấy tên từ `ma()`.
2. Tên đó vào chữ gói: `chuCacLop` của `agent/lib/goi-soan.ts` in lớp 1, 2a và `cham` bằng
   `JSON.stringify`; `chuCuaGoi` chỉ lọc id của lớp 2a (`idCuaGoi`), không lọc tên.
3. `soCuaGoi` đưa mọi số `trichSo` đọc được từ chữ gói vào `soTrongGoi`. `trichSo` tách chuỗi chữ số
   ra khỏi chữ cái: `trichSo("sokr-mgh9k41ax12")` = `[9, 41, 12]`, `trichSo("sokr-mgh3kabcx41")` = `[3, 41]`.
4. `soMoiCua` (`packages/validation/src/okr-kiem-ban-nhap.ts`) cho qua mọi số có trong
   `soTrongGoi ∪ soNguoiGo`. Luật đúng — bài sai khi giả định một hằng luôn vắng.

Hai nguồn chữ số lạc: dấu thời gian (đổi theo mili-giây) và bộ đếm `dem` — bun chạy mọi tệp kiểm của
gói trong một tiến trình, nên `dem` của tên gieo phụ thuộc số lần các tệp chạy trước đã gọi `ma()`.

## Bốn bài cùng lớp

| Bài | Số «vắng» | Khẳng định dựa vào nó |
|---|---|---|
| 1 «bản nháp trộn» | 100 (`k13` «Đạt 100 % đối tác gia hạn») | `["k13","so-moi"]` trong danh sách bị loại; `soDong` = 5 |
| 2 «nộp lại dòng có khoá đã bác» | 37 (`SO_NGUOI_GO`) | `m3` bị loại `so-moi` trước khi gõ |
| 3 «số người gõ đọc trên mọi phiên» | 41 (`SO_NGUOI_GO + 4`) | `chuaGo: "so-moi"` |
| 4 «so-moi đọc mọi chữ gói» | 2031 | `k3` bị loại, `viPham: "số mới: 2031"` |

## Cách sửa (chỉ spec)

Một hàm trong spec:

```ts
async function soVangKhoiGoi(cuocSoanId: string, tu: number): Promise<number>
```

đọc `goiSoan(cuocSoanId, { vai: "member" })` rồi `goiKiemTu(goi, { soNguoiGo: new Set() }).soTrongGoi`
— đúng đường sản phẩm dùng lúc nộp — và trả số nguyên nhỏ nhất `≥ tu` mà gói không chứa. Mỗi bài
gọi nó cho chính cuộc nó nộp vào:

- bài 1: số `k13` tính trong `beforeAll` cho `canh.cuocSoanId` (gợi ý 100), `tron()` đọc biến mô-đun;
- bài 2: gợi ý 37, cuộc `canh.cuocSoanId`; thay hằng `SO_NGUOI_GO`;
- bài 3: gợi ý 41, cuộc mới của bài;
- bài 4: gợi ý 2031, cuộc mới của bài; `viPham` mong `số mới: ${so}`.

Không thêm lời gọi `db.find*` nào (răng `quet-mau` của hồ sơ `nop-ban-nhap-chon-theo-khoa` so danh
sách lời gọi đó), và giữ nguyên mọi mốc chuỗi mà `dao-thu-tu.mjs` của hồ sơ đó chèn vào.

Vì sao đọc gói thay vì đổi tên gieo cho hết chữ số: đổi tên phải biết hết mọi nguồn chữ số lạc
(hôm nay là `ma()`, mai có thể là tên khác); đọc `soTrongGoi` thì đầy đủ theo cấu tạo, vì nó là
chính tập luật dùng. Sửa `ma()` thì đúng hơn cho cả gói nhưng nằm ngoài ranh giới hàng này.

## Đo

- Đường thường: cả tệp xanh (`nbn_ca_tep`).
- Fixture va chạm: bản sao của gói ở `.acceptance-runs/so-moi-khong-chap-chon/sao-*` (gitignore, oxlint bỏ
  qua; symlink `node_modules`) với `ma()` chèn `so37so41so100so2031so` vào mọi tên gieo, cộng một bài
  dò in bốn số nào thật sự có trong `soTrongGoi`. Spec mới → xanh; spec cũ (bản ghim
  `fixtures/spec-truoc.ts.txt`) → đúng bốn bài đỏ. Hai chiều cùng fixture, chỉ khác tệp spec.
- Spec cũ đọc từ bản ghim chứ không từ `git show <merge-base>`: sau khi gộp, merge-base đổi và thước
  tự hết hạn (bẫy đã đo ở kho này).
- Thước của hồ sơ khác: ba răng của `nop-ban-nhap-chon-theo-khoa` chạy lại trên spec mới.

## Hệ quả ngoài hàng

Spec nằm trong `paths` eval của `nop-ban-nhap-chon-theo-khoa` và `soan-okr-cung-tro-ly`; ghim lại hai
hồ sơ đó ở cuối nhánh (giám sát đã duyệt, `tra-loi/P4-1.json`).
