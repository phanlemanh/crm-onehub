# Thước lái-ra-màn phải đỏ được — thiết kế

Ngày 12/09/2026 · slug `thuoc-lai-ra-man-phai-do` · T2 · bounded

## Vì sao

Thước «lái từng component ra màn» đã ngừng canh sáu component mà không ai được
báo. Bằng chứng đo được, không suy đoán:

| Đo gì | Số |
| --- | --- |
| Component AI Elements bị xoá ở `84440ce` | 19 |
| Mục trong danh sách thước còn trỏ file đã xoá | 6 |
| Bản vẽ `ve-that.json`: dòng trước → sau | 461 → 15 |
| Ca test chạy qua | 114/114 XANH |

Một thước xanh vì không nhìn tệ hơn không có thước: nó chiếm chỗ của thước
thật và mua sự yên tâm bằng tiền giả.

## Bốn lỗ độc lập

**L1 — hai đầu trôi khỏi nhau.** Bên VẼ (`packages/ui/test/lai-ra-man.spec.tsx`)
lấy danh sách từ `evidence/mac-dinh.json` — file bằng chứng đã commit hôm 06/09.
Bên CHẤM (`rang/lai-ra-man.mjs`) gọi `docMacDinh()` quét kho tươi. Một bên đọc
quá khứ, một bên đọc hiện tại; không có gì buộc chúng khớp.

**L2 — phép VÀ ở chỗ bắt lỗi.** `every(b => b.loi_dong !== null && b.loi_mo !== null)`
chỉ tính là hỏng khi CẢ HAI trạng thái cùng lỗi. Module không nạp được chỉ
hỏng một chiều (`loi_mo` = null), nên lọt. Đây là đối ngẫu của lớp lỗi «phép
HOẶC trong assert là chỗ trốn»: ở chỗ BẮT lỗi thì `&&` mới là chỗ trốn.

**L3 — bộ vẽ chết vẫn đi tiếp.** `chayBanVe()` bắt lỗi của `bun test`, in ra
màn hình, rồi chấm tiếp trên bản vẽ cũ còn sót trên đĩa.

**L4 — câu khẳng định luôn đúng.** `expect(veDuoc.length).toBeGreaterThan(0)`
— một component vẽ được là đủ xanh, kể cả khi 49 cái kia hỏng.

Bốn lỗ này độc lập: vá một cái không cứu ba cái kia. L1 sinh ra mục trỏ file
chết, L2 để mục chết lọt phân loại, L3 để cả bộ vẽ chết lọt, L4 để phần còn
lại lọt.

## Tác dụng phụ vận hành

Bản vẽ vừa là vật-do-lần-chạy-sinh vừa được commit. Hệ quả đo được trong phiên
12/09: mỗi `bun run test`, mỗi làn ghim-lại, và cả móc trước-khi-đẩy đều sửa
`_acceptance/chan-lai-component-ra-man/evidence/ve-that.json`. Ba lần trong một
phiên. Một `git add -A` sau đó sẽ ghi đè bằng chứng đã ký của hồ sơ khác —
không ai thấy, vì diff nằm lẫn trong một commit về việc khác.

## Cách sửa

| Lỗ | Sửa | Chiều đỏ |
| --- | --- | --- |
| L1 | Bên VẼ gọi `docMacDinh()` — cùng hàm bên CHẤM dùng | Xoá một component thật trong bản sao ⇒ hai danh sách cùng ngắn đi; bên vẽ còn trỏ file chết ⇒ đỏ |
| L2 | `some(lỗi ≠ null)` thay `every(cả hai ≠ null)` | Ma trận 4 ô (có,null)(null,có)(có,có)(null,null) — ba ô đầu phải vào nhóm không-vẽ-được |
| L3 | `chayBanVe` trả mã; mã ≠ 0 ⇒ thước thoát ≠ 0 | Tiêm lỗi cú pháp vào spec bản sao, để sẵn một bản vẽ cũ hợp lệ trên đĩa ⇒ vẫn phải đỏ |
| L4 | Đòi `số vẽ được === N`, gọi tên từng cái thiếu | Tiêm một mục hỏng ⇒ N-1/N ⇒ đỏ, nêu tên |
| Bẩn cây | Bản vẽ của lượt chạy đi vào chỗ tạm; ghi đè bằng chứng chỉ khi lệnh thước gọi có chủ đích | Chạy suite ⇒ `git status` sạch; gọi lệnh ghi ⇒ file phải đổi |

Bản vẽ **ở lại trong kho**. Nó là bằng chứng đã ký; đóng băng ở ngày ký đúng
bản chất của bằng chứng. Cái phải sống cùng kho là THƯỚC.

Sáu component đã xoá tự biến khỏi danh sách khi bên vẽ quét kho tươi — không
dọn tay, nên không có danh sách thứ hai để trôi lần nữa.

## Ranh giới

Hồ sơ `chan-lai-component-ra-man` đã ký 06/09: hợp đồng, bằng chứng, chữ ký
giữ nguyên. Vòng này chỉ đụng `rang/*.mjs` của nó và bộ ca ở `packages/ui/test`.
Con trỏ «thay thế» ghi bằng một entry `revisit` trong sổ quyết định của hồ sơ
cũ — đó là dòng duy nhất chạm hồ sơ đó.

Các thước khác của kho có thể mắc cùng lớp lỗi. Quét cả lớp là việc riêng,
không gộp vào vòng này.
