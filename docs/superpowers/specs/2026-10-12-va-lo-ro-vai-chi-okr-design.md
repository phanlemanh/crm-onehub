# Vá lỗ rò vai «chỉ OKR» ở kế hoạch 30 ngày — thiết kế

Hàng DA0a của `docs/plan/lo-trinh-viec-du-an.json`, hồ sơ `_acceptance/va-lo-ro-vai-chi-okr/`. Hạn trước
14/10/2026, ngày mọi phòng ban dùng thật.

## Vấn đề

Vai `okr` («chỉ OKR») đọc phạm vi `okr`, `chung`, `to-chuc`, không bao giờ đọc dữ liệu đối tác
(`docDuocPhamVi`, `packages/validation/src/vai-workspace.ts`). Cửa tRPC, cầu nối REST, khoá API và cầu
nối agent đều chặn đúng luật đó. Kế hoạch 30 ngày thì không: người vai `okr` vẫn **giữ** được việc của
một kế hoạch đối tác, và việc giữ đó đưa tên công ty ra ngoài qua tin nhắc buổi sáng.

Đọc mã ngày 12/10 thấy năm đường:

| # | Đường | Chỗ | Lỗi |
| --- | --- | --- | --- |
| 1 | Giao bước, thêm bước có người làm, đổi người cầm trịch, chuyển việc 30 ngày | `apps/api/src/onboarding/onboarding-ghi.ts`, hàm `thanhVien` | chỉ hỏi «có hàng `member` nào không», không hỏi vai |
| 2 | Tạo kế hoạch từ khuôn | `onboarding.service.ts`, `createFromTemplate` | không kiểm người cầm trịch là thành viên |
| 3 | Đổi vai một người đang giữ việc sang `okr` | `apps/api/src/workspace/workspace.service.ts`, `setMemberRole` | bước, kế hoạch, lượt theo dõi đang mở giữ nguyên |
| 4 | Bộ gom nhắc | `packages/db/src/onboarding-nhac.ts`, `viecCanNhac` | việc kế hoạch (mang `companyName`) gom cho mọi thành viên, không lọc vai; `nhac-ke-hoach.ts` gửi nguyên qua Zalo/Slack |
| 5 | Ô chọn người ở ba màn | `plan-steps.tsx`, `tao-ke-hoach.tsx`, `chuyen-viec-dialog.tsx` | đọc `users.list` — mọi người dùng, kể cả vai `okr` và người đã rời |

Đường đã kín, không sửa: tự theo dõi và tự nhận bước đi qua router phạm vi đối tác (vai `okr` bị chặn);
Tổng quan (`dashboard.*`) cũng thế, và `dashboard.service.ts` chỉ đọc `assigneeId` của chính người gọi;
`okr.viecCuaToi` chỉ lấy mục OKR (AC-7 đo lại cả hai); trả lời «xong n» qua Zalo đã từ chối vai `okr` (`tra-loi-nhac.ts`).

## Một luật, một hàm

Thêm vào `packages/validation/src/vai-workspace.ts`:

```ts
export function docDuocDoiTac(role: string): boolean {
	return docDuocPhamVi(toWorkspaceRole(role), "doi-tac");
}
```

Đầu vào là chuỗi vai thô của bảng `member`, qua `toWorkspaceRole` như mọi chỗ khác — vai lạ rơi về
`member` đúng như cửa tRPC đọc. Mọi chỗ dưới đây gọi hàm này, không so chuỗi `"okr"`.

## Năm thay đổi

**T1 — Đường ghi của kế hoạch.** `thanhVien(tx, userId)` đổi thành `kiemNguoiNhanViec(tx, userId)`: đọc
hàng `member` của `WORKSPACE_ID`, không có → lời cũ `khongPhaiThanhVien`; có mà `!docDuocDoiTac(role)`
→ `BadRequestException` lời mới `ONBOARDING.thongDiep.vaiChiOkr(ten)`. Áp cho `assignStep`, `addStep`,
`setPlanOwner`, `transferWork` (đích). Từ chối trước mọi lệnh ghi, nên không bước, không vết nào được ghi.
`transferWork` **từ** người vai `okr` vẫn chạy — đó là đường dọn.

**T2 — Tạo từ khuôn.** `createFromTemplate` gọi `kiemNguoiNhanViec` cho `ownerId` trong giao dịch, trước khi
tạo kế hoạch. Đóng luôn lỗ «người cầm trịch không phải thành viên».

**T3 — Đổi vai.** Trong giao dịch của `setMemberRole`, khi vai mới `!docDuocDoiTac` — kể cả khi vai cũ
đã là `okr` (lưu lại vai là đường dọn dữ liệu cũ qua API): đếm kế hoạch đang mở
người đó cầm trịch và bước chưa xong của kế hoạch đang mở người đó làm. Lớn hơn 0 → `ConflictException`
nêu hai con số và chỉ sang «Chuyển việc» ở màn Thành viên; vai không đổi. Bằng 0 → xoá mọi
`onboardingWatch` của người đó cùng giao dịch, rồi đổi vai; dòng log «Workspace role changed» thêm
`theoDoiDaXoa`. Lượt theo dõi xoá tự động vì không ai «nhận thay» một lượt theo dõi; bước và kế hoạch thì
phải có người nhận, nên quản trị chọn qua «Chuyển việc» có sẵn.

**T4 — Bộ gom nhắc.** `viecCanNhac` đọc thêm `role` của thành viên, dựng tập `tapDoiTac` = thành viên
`docDuocDoiTac`, và chỉ gom việc kế hoạch (`buoc-qua-han`, `buoc-sap-han`, `ke-hoach-im`, `moc-ngay`)
cho người trong tập đó. Mục OKR, Kho tài liệu, Tóm tắt tuần, ngân sách AI không đổi — người vai `okr` chỉ
có việc OKR vẫn nhận tin. Sửa ở gói dùng chung nên nhắc buổi sáng, thẻ «Việc của bạn», Tổng quan cùng
đổi một lần. Không lọc thêm ở `nhac-ke-hoach.ts`: agent đọc đúng tập bộ gom trả.

**T5 — Ô chọn người.** Thủ tục mới `onboarding.nguoiNhanViec` (phạm vi đối tác): thành viên
`docDuocDoiTac`, khuôn `{ id, name, email, image }`, xếp như `users.list`. Ba ô chọn đọc thủ tục này.
Người đang giữ việc mà không còn trong danh sách (dữ liệu cũ) vẫn hiện tên ở ô của chính bước đó — tên
lấy từ `assignee` của bước, không từ danh sách.

## Dữ liệu đã có trên production

Chờ số đo của `rang/ro-vai-chi-okr.mjs` (chỉ đọc). Chủ kho quyết cách dọn ở Cổng 1 trên số đó. Đường máy
khuyên khi số nhỏ: không mã mới — quản trị dùng «Chuyển việc» cho từng người; sau T3, lưu lại vai `okr`
xoá lượt theo dõi còn sót — qua API thì được (AC-6); ô chọn vai ở màn Thành viên có thể không phát sự
kiện khi chọn lại đúng vai cũ, nên ở màn có thể phải đổi sang `member` rồi về `okr`. Số lớn thì một migration dọn là việc của chủ kho chọn, vì nó ghi production
lúc triển khai.

## Đường đo

`_acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs` mở giao dịch `READ ONLY`, in số đếm và mã
người: người vai `okr`; bước, kế hoạch, lượt theo dõi đang mở của họ; tin nhắc đã gửi tới họ có dòng kế
hoạch. Thoát 0 khi ba số «đang mở» bằng 0. Đây là câu «truy vấn production» của `bat_khi`. Cờ `--trong
<mã,...>` giới hạn phép đếm vào vài người — để bài kiểm đo được nhánh thoát 0 trên kho thử dùng chung;
chạy production thì không cờ.

## Đã cân và bỏ

- **Tự gỡ bước khi đổi vai** (gán `null`): ít ma sát hơn, nhưng đổi dữ liệu người bấm không thấy, và kế
  hoạch không gỡ được (cầm trịch bắt buộc) — vẫn phải từ chối một nửa. Một luật «từ chối, chỉ sang
  Chuyển việc» dễ hiểu hơn.
- **Lọc ở `nhac-ke-hoach.ts`**: chỉ vá Zalo/Slack, để thẻ «Việc của bạn» và Tổng quan lệch với tin nhắc.
- **Thêm `role` vào `users.list`**: `users.list` có 28 chỗ gọi; đổi khuôn nó là việc của module `users`
  (T3) và kéo theo mọi ô chọn chủ sở hữu deal, công ty, liên hệ — ngoài hàng này.

## Ngoài hàng này

Chủ sở hữu deal, công ty, liên hệ vẫn chọn được người vai `okr` (cùng lớp lỗi, thực thể khác) — mở chip
riêng. `users.list` liệt kê cả người đã rời. Tin đã gửi không thu hồi được.
