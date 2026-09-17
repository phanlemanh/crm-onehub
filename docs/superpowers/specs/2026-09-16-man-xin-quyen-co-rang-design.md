# Thiết kế — Màn xin quyền có răng (`man-xin-quyen-co-rang`)

Ngày 16/09/2026 · hạng T2 · surface `ui` · làn design D1

## Vấn đề

Hợp đồng `cua-vao-noi-tieng-viet` mở phạm vi sang màn thứ tư `/grant-access` ở
vòng 1 ngày 04/09, vì màn đó dùng chung khung `AuthShell` với ba màn kia. Lớp
nguồn theo kịp: `rang/lat.mjs` quét đệ quy cả `apps/app/app/(landing)`, nên các
thước đọc cây cú pháp (AC-11) và kho chuỗi (AC-12) đã gom màn này từ đầu.

Lớp chạy thì không theo kịp, và hợp đồng gốc khai điều đó thành giới hạn:

- AC-8: «Màn thứ tư `/grant-access` KHÔNG nằm trong tiêu chí này: nó chỉ được
  bảo chứng bởi AC-11 (quét cú pháp), xem Known limits.»
- AC-10: «BA màn mà phép đo mở được (không gồm `/grant-access` — xem Known
  limits)»

Mười hai eval lái trình duyệt của hồ sơ gốc đi qua một danh sách đường viết tay,
ba đường, chép ở ba chỗ trong `rang/cua-vao.mjs` (dòng 271, 374, 538).
`/grant-access` không xuất hiện ở đâu. Hệ quả người dùng: một câu tiếng Anh sót
trên màn đó, hoặc một chuỗi tiếng Việt bị cắt trần, đi qua mọi cổng.

`_acceptance/NO-CAN-TRA.md` ghi hai mục nặng cho đúng lỗ này.

## Vì sao màn này thoát được phép đo

Nó không phải màn mở bằng một đường dẫn. `page.tsx` đòi hai điều kiện:

```
requireSession()                                → cần cookie phiên
mailboxGrantsNeeded(signInAccounts(user.id))    → rỗng thì redirect("/")
```

Một phiên dev trần không vào được. Phải có tài khoản liên kết đang thiếu quyền
hộp thư. Đó là lý do kỹ thuật thật khiến ba màn kia có thước còn màn này không.

## Cách làm

### Gieo trạng thái

Một script dev đứng cạnh `apps/api/scripts/dev-session.ts`, dựng phiên có tài
khoản liên kết thiếu quyền hộp thư, để `mailboxGrantsNeeded` trả mảng khác rỗng.
`apps/api/scripts/` không nằm trong `t3_paths`, nên hạng vẫn T2.

Gieo hỏng là TỪ CHỐI ĐO, thoát mã 2, gọi tên trạng thái thiếu — không phải một
lượt đạt. Nếu màn redirect về `/` thì mọi khẳng định sau đó vô nghĩa.

### Thước

`_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs` đứng riêng, `import`
lại `may-chu.mjs` của hồ sơ gốc để dùng `chotMayChu()` — phép khẳng định máy chủ
đang phục vụ ĐÚNG cây này, không phải một bản dev ở checkout khác.

Thước KHÔNG chạm `cua-vao.mjs`. Hệ quả cố ý: 12 eval của hồ sơ gốc không phải
chạy lại, bằng chứng đã ghim của nó không hoá cũ. Đổi lại, nợ «browser check vẫn
đếm ba» vẫn đúng với hồ sơ gốc — ghi thành giới hạn đã khai, không giả vờ đã vá.

### Danh sách đường

Vòng này KHÔNG rút danh sách đường của `cua-vao.mjs` thành bản khai chung. Việc
đó vá được cả hai mục nợ và chặn trôi về sau, nhưng chạm thước của hồ sơ khác.
Ghi thành mục nợ có tên thay vì làm lặng.

## Đo gì

Mười ô Core từ quét hình thái, trục: lớp bằng chứng × nhánh nhà cung cấp ×
trạng thái × thứ tiếng. Bảng CE là 14 AC đã chứng trên ba màn anh em — hỏi từng
cái xem có áp cho màn thứ tư không.

Bảy AC cũ áp được: AC-1 (chuỗi hai tiếng, quan hệ ba vế), AC-5 (trạng thái đang
gửi), AC-6 (`translate="no"`), AC-7 (ghép động không đúc sẵn), AC-8 (tiêu đề tài
liệu), AC-10 (không cắt trần ở tiếng Việt), AC-14 (câu lỗi dự phòng của client).

Bốn AC cũ không áp: AC-9 đã đo ở `/sign-in` bằng cơ chế dùng chung; AC-11, AC-12,
AC-13 lớp nguồn và khung chung đã phủ màn này rồi. Đo lại là hai thước cùng đo
một lời hứa, và một trong hai sẽ mục mà không ai biết.

Ba ô mới, không có tiền lệ ở hồ sơ gốc: mô tả đổi theo ba nhánh nhà cung cấp;
câu lỗi đăng xuất (`error.signOut` — mục nợ nặng số 4); và chính tiền đề gieo
trạng thái.

## Cặp hai chiều

Mọi phép đo mới đi kèm cặp hai chiều trên cùng fixture: vật lành thì thước xanh,
phá vật thật trong bản sao thì thước đỏ kèm thông điệp ghim tên ô. Màu xanh của
một thước chưa từng đỏ không phân biệt được vật lành với thước chưa bao giờ chạy.

## Ba chỗ cố ý bỏ

Vòng này không sinh hay đổi một pixel giao diện nào — nó thêm thước cho màn đã
có. Nên bỏ nghi thức S1-D (design-pass), bỏ section Đặc tả UX, và không gọi kỹ
năng chuẩn giao diện nội `web-design-guidelines`. Cả ba ghi thành mục có tên
trong sổ quyết định, không bỏ lặng.

Vẫn giữ một eval `ui-check` qua sàn thiết kế: nó là lớp nhìn-thấy của hợp đồng,
không phải một lượt thiết kế.
