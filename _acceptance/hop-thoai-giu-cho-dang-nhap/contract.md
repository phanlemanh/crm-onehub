---
schema_version: 1
feature: Hộp thoại và ngăn trượt không mất chữ đang nhập dở — thành phần dùng chung tự biết có thay đổi; bấm ra ngoài khi đã nhập thì không đóng; Esc, dấu X, nút Huỷ và vuốt xuống hỏi lại «Bỏ những gì vừa nhập?»
slug: hop-thoai-giu-cho-dang-nhap
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Manh Phan
approved_at: 2026-09-27T05:47:09Z
design_doc: docs/superpowers/specs/2026-09-27-hop-thoai-giu-cho-dang-nhap-design.md
---

# Acceptance Contract: hop-thoai-giu-cho-dang-nhap

## Context

Chủ kho nhập một KR, lỡ bấm ra ngoài hộp thoại: hộp đóng và mất chữ vừa gõ.
`Dialog`, `Sheet`, `Drawer` của `packages/ui` đóng ngay ở mọi đường — bấm ngoài,
Esc, dấu X, vuốt — và không biết bên trong có chữ chưa lưu. 25 hộp thoại và ngăn
trượt có ô nhập trong `apps/app` (không kể `/proto`) cùng ngăn bản ghi có ô trao
đổi đều chịu lỗi này; 14 trong số đó có nút Huỷ gọi thẳng hàm đóng. Lượt này thêm
một bộ giữ dùng chung vào ba khung, chuyển `ConfirmDialog` vào `packages/ui` làm
hộp hỏi lại, và nối mọi nút Huỷ qua nút đóng của khung.

Source input: câu hỏi của chủ kho trong phiên 2026-09-27 và hướng chủ kho đồng ý
cùng phiên · `docs/design.md` (dùng lần hai thì vào `packages/ui`, bảng «Dấu hiệu
vẽ tay») · `_acceptance/hop-thoai-giu-cho-dang-nhap/coverage-scan.md`.

## Criteria

- AC-1: Given một `Dialog` của `packages/ui` có ô gõ bên trong, When người dùng gõ ít nhất một ký tự rồi bấm vào lớp phủ bên ngoài, Then hộp vẫn mở, chữ trong ô còn nguyên và `onOpenChange` của chỗ gọi không được gọi; và When chưa gõ gì mà bấm lớp phủ, Then hộp đóng và `onOpenChange(false)` được gọi đúng một lần như trước lượt này.
- AC-2: Given một `Dialog` đã có chữ gõ vào, When người dùng nhấn Esc hoặc bấm dấu X, Then hộp hỏi lại hiện với tiêu đề «Bỏ những gì vừa nhập?» và hai nút «Tiếp tục sửa», «Bỏ», hộp đang sửa vẫn mở và `onOpenChange` chưa được gọi; When chọn «Tiếp tục sửa» hoặc nhấn Esc trên hộp hỏi, Then hộp hỏi đóng, chữ còn nguyên và focus về lại ô đang gõ; When chọn «Bỏ», Then hộp đóng và `onOpenChange(false)` được gọi đúng một lần; và When hộp chưa có thay đổi, Esc hoặc X đóng ngay không hỏi.
- AC-3: Given một `Sheet` của `packages/ui` có ô gõ bên trong, When đi lần lượt bốn đường bấm lớp phủ, Esc, dấu X và một nút bọc `SheetClose`, mỗi đường ở hai trạng thái chưa gõ và đã gõ, Then kết quả từng ô bằng bảng viết trước của AC-1 và AC-2 (bấm ngoài khi đã gõ không làm gì; ba đường còn lại khi đã gõ thì hỏi; chưa gõ thì đóng ngay).
- AC-4: Given một `Drawer` của `packages/ui` (ngăn bản ghi ở khổ điện thoại) có ô gõ bên trong, When đã gõ rồi bấm lớp phủ, Then drawer không đóng, chữ còn nguyên và không hỏi; When đã gõ rồi nhấn Esc hoặc kéo tay nắm drawer xuống quá ngưỡng đóng, Then drawer quay về vị trí mở và nằm trọn trong màn hình, chữ còn nguyên, hộp hỏi lại hiện, và sau «Tiếp tục sửa» trang vẫn bấm được; và When chưa gõ, Then cả ba đường đóng drawer như trước lượt này.
- AC-5: Given một hộp thoại đã có chữ gõ vào, When chỗ gọi tự đóng hộp (đặt `open` về `false` sau khi lưu thành công, hoặc gỡ hộp), hoặc người bấm một nút bọc `DialogClose`/`SheetClose` có prop `dongNgay` (nút lưu của hộp không kiểm soát), Then hộp đóng và không hộp hỏi lại nào hiện; When mở lại hộp đó, Then hộp ở trạng thái chưa có thay đổi (bấm ngoài đóng ngay); và Given một hộp không kiểm soát (mở bằng `DialogTrigger`, chỗ gọi không truyền `open`), When đã gõ rồi bấm ngoài, Esc, hoặc bấm nút `DialogClose` không có `dongNgay`, Then hành vi giống hệt hộp có kiểm soát ở AC-1 và AC-2.
- AC-6: Given một hộp thoại đã có chữ gõ vào đang mở một ô chọn con (`Select`, `Combobox` hoặc lịch của `DatePicker`), When nhấn Esc, Then chỉ ô chọn con đóng, hộp thoại vẫn mở và không hộp hỏi lại nào hiện.
- AC-7: Given một hộp thoại mà chỗ gọi khai `coThayDoi` là `true` (chưa gõ ký tự nào, vd mới đổi một ô chọn), When bấm lớp phủ hoặc nhấn Esc, Then hành vi như hộp đã có thay đổi (bấm ngoài không làm gì, Esc hỏi); và trên màn thật, ở hộp thoại KR, hộp thoại mục tiêu và hộp thoại đơn vị trong `apps/app`, When chỉ đổi một ô chọn (không gõ ký tự nào) rồi bấm ra ngoài, Then hộp vẫn mở với giá trị vừa chọn.
- AC-8: Given `ConfirmDialog`, When đọc cây mã sau lượt này, Then thành phần nằm ở `packages/ui/src/components/confirm-dialog.tsx` với API cũ, tệp `apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx` không còn, cả 13 chỗ dùng cũ nhập từ `@crm/ui/components/confirm-dialog`, và bộ kiểm có sẵn của các chỗ đó vẫn xanh.
- AC-9: Given danh sách 26 tệp hộp thoại, ngăn trượt và drawer có ô nhập (viết trước trong phép soát), cộng danh sách khai tay các hộp có ô nhập nằm trong thành phần con (hộp cập nhật KR hằng tuần) và các phần hiện bên trong ngăn (phần đầu ngăn chi tiết bản ghi), When phép soát tĩnh chạy, Then tập tệp máy tự rút từ `apps/app` (không kể `/proto`) bằng đúng danh sách 26 tệp — tệp mới xuất hiện hay tệp biến mất đều in ra và làm soát đỏ; và trong mỗi tệp, không nút nào nằm bên trong `DialogContent`, `SheetContent` hay `DrawerContent` gọi thẳng hàm đóng — mọi nút Huỷ đi qua `DialogClose`/`SheetClose`/`DrawerClose` (`asChild`); và `docs/design.md` có dòng tương ứng trong bảng «Dấu hiệu vẽ tay».
- AC-10: Given phiên đo riêng của cây này, When mở màn thật ở khổ 1440 và 390 trong trình duyệt, Then: hộp thoại «Thêm KR» gõ tên rồi bấm ra ngoài vẫn mở với chữ còn nguyên, nhấn Esc thấy hộp hỏi lại với chữ tiếng Việt đúng bảng trạng thái, «Tiếp tục sửa» về hộp, «Bỏ» đóng hộp; ngăn «Tạo thoả thuận» gõ tên rồi bấm nút Huỷ thấy hộp hỏi lại; ngăn bản ghi ở khổ 390 (drawer) gõ vào ô trao đổi rồi đóng thấy drawer giữ chỗ và hộp hỏi lại.
- AC-11: Given các tệp lượt này thêm hoặc sửa, When chạy cổng thiết kế tĩnh và soi mã, Then không vi phạm P0; không `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui` ở chỗ gọi; không prop `variant`/`tone`/`size` có mặc định chuỗi trong tham số; không chú thích mã mới; không `useEffect` trần trong tệp mới; chữ mới của hộp hỏi lại có bản vi và en khác nhau trong `packages/ui/src/lib/messages.ts`.
- AC-12: Given một hộp thoại có ô tìm hoặc ô lọc (`input[type=search]`, ô `role=combobox` như ô lọc của `Combobox` và `Command`), When chỉ gõ vào ô đó rồi bấm ra ngoài, Then hộp đóng như trước lượt này (ô lọc không phải dữ liệu); When chỗ gọi truyền `giuThayDoi={false}` cho `Dialog`, `Sheet` hoặc `Drawer`, Then hộp đó không giữ dù đã gõ vào ô thường; và `PickListDialog` của `packages/ui` gõ vào ô tìm rồi bấm ngoài thì đóng.
- AC-13: Given một hộp thoại mà chỗ gọi khai `coThayDoi` từ trạng thái form (hộp KR, hộp mục tiêu, hộp đơn vị) và người đã gõ vào đó, When lưu thành công mà hộp vẫn mở (vd hộp KR nguồn bảng tính) nên `coThayDoi` của chỗ gọi chuyển từ `true` về `false`, Then cờ «đã gõ» của bộ giữ cũng được xoá — bấm lớp phủ, Esc và dấu X đóng hộp ngay, không hộp hỏi lại nào hiện; và When sau đó người gõ tiếp, Then hộp lại được giữ như AC-1 và AC-2.
- AC-14: Given ngăn chi tiết bản ghi (`DetailSheet`: ngăn trượt ở máy tính, drawer ở điện thoại), When người chỉ sửa một ô tự lưu khi rời ô (ô trong bảng thuộc tính của liên hệ, thoả thuận, công ty) và ô đã lưu, hoặc vừa gửi xong một bình luận ở ô trao đổi (ô trống lại), Then ngăn cư xử như chưa có thay đổi — bấm lớp phủ đóng ngăn, Esc và dấu X đóng không hỏi, drawer vuốt đóng được; When ô trao đổi còn chữ chưa gửi, Then ngăn được giữ như AC-4 và AC-10; và trên màn thật ở khổ 1440, ngăn một liên hệ: sửa một ô tự lưu, rời ô, bấm ra ngoài → ngăn đóng, không hộp hỏi lại.

## Coverage

Nguồn: `coverage-scan.md` (preset test-matrix, 2026-09-27).

- **Trục A — người đóng bằng đường nào:** bấm ra ngoài · Esc · dấu X · nút Huỷ · vuốt xuống  [thước CE: ba đường tự đóng của Radix Dialog + vuốt của vaul + nút Huỷ do chỗ gọi dựng — NGÀNH: Radix UI Dialog, vaul] → AC-1, AC-2, AC-3, AC-4, AC-9
- **Trục B — trạng thái bên trong:** sạch · đã gõ chữ · đã đổi ô không gõ · gõ rồi xoá về như cũ  [thước CE: bảy loại ô nhập trong 25 chỗ] → AC-1, AC-2, AC-7; «gõ rồi xoá về» ở Later
- **Trục C — khung:** Dialog · Sheet · Drawer điện thoại  [thước CE: ba khung của packages/ui] → AC-1..AC-4, AC-10
- **Trục D — trả lời hộp hỏi:** Tiếp tục sửa · Bỏ · Esc trên hộp hỏi  [thước CE: AlertDialog hai nút + Esc — NGÀNH: Material Design Dialogs] → AC-2
- **Cross-cutting:** máy đóng và hộp không kiểm soát (AC-5) · lớp con (AC-6) · hộp hỏi lại là `ConfirmDialog` dùng chung (AC-8) · ô tìm, ô lọc và cách tắt (AC-12) · chữ vi/en, sàn thiết kế (AC-11) · đã lưu mà hộp còn mở (AC-13) · ngăn bản ghi có ô tự lưu và ô trao đổi (AC-14)
- [GIẢ ĐỊNH] Bấm ra ngoài khi đã nhập thì im lặng giữ hộp, không hỏi (theo Linear, GitHub, Apple HIG).
- [GIẢ ĐỊNH] Ô không gõ chỉ được giữ ở chỗ tự khai; lượt này khai ở hộp thoại KR, mục tiêu, đơn vị — 22 chỗ còn lại chỉ giữ khi có gõ chữ.
- [GIẢ ĐỊNH] Gõ rồi xoá về như cũ vẫn tính là có thay đổi (hỏi thừa một lần thay vì so giá trị từng ô).
- [GIẢ ĐỊNH] Ô tìm và ô lọc (`input[type=search]`, `role=combobox`) không tính là thay đổi; chọn một giá trị trong `Combobox` chỉ được giữ ở chỗ tự khai.
- [GIẢ ĐỊNH] Ngăn chi tiết bản ghi chỉ giữ khi ô trao đổi còn chữ chưa gửi; ô tự lưu khi rời ô không bao giờ làm ngăn bị giữ.

## Out of scope

- Lưu nháp để mở lại lần sau — một tính năng khác.
- Chặn điều hướng trang hay đóng tab trình duyệt khi hộp đang có thay đổi.
- So giá trị từng ô để biết người đã xoá về như cũ.
- Hộp hiện khoá API một lần (không có chữ người gõ; đóng là mất khoá).
- Hộp thoại dưới `/proto`.

## Notes

- Luật đã đọc: `AGENTS.md`, `docs/design.md` (kể cả «Vẽ tay là bậc cuối» và bảng «Dấu hiệu vẽ tay»), `docs/reui.md` (không cài thành phần mới); skill `.agents/skills/no-use-effect`, `.agents/skills/shadcn`, `web-design-guidelines` (khai ở `feature_loop.ui_standards_skill`).
- Hạng T2: chạm `packages/ui` và `apps/app`, không chạm đường T3.
- Vuốt drawer: nếu S3 thấy vaul không trả drawer về chỗ khi lời đóng bị chặn, S3 dừng và trình người (không tự hạ lời hứa AC-4).
- Không có `opportunity.md` (vòng không đi từ Cổng Đáng) → không mục «Đường đo», ship thẳng sau cổng.
- Nền hạ tầng (`duong-nen.md`): hai dòng «THIEU merge-base» là báo giả của bộ kit; `build_khong_cache` đỏ vì shell đăng nhập nhận Node 22 — làn S4 chạy với PATH Node 24 như các lượt OKR; hai dòng «cây bẩn sau suite» là tệp S1 viết trong lúc suite chạy.
- Mở lại hợp đồng 2026-09-27 theo quyết định Cổng Bằng chứng của Manh Phan: Ngoài-2, 3, 4 nâng phạm vi thành AC-13, AC-14 (sổ d-20260927T053525Z-16 … -18); AC-9 nâng 25 lên 26 tệp theo quyết định treo đã phê (d-20260927T032824Z-10).

Known limits — Cổng Bằng chứng (Manh Phan 2026-09-27, định đoạt mục ngoài hợp đồng của vòng chấm 2; sổ d-20260927T053525Z-15, -19):

- Ngoài-1 (`_acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs`): phép soát nút Huỷ chỉ soát những phần hiện trong ngăn đã liệt kê tay; một nút đóng nằm trong thành phần dùng chung khác (phần đầu hay chân của hộp) hiện bên trong hộp lúc chạy có thể lọt phép soát.
- Ngoài-5 (`packages/ui/test/messages-guard.spec.ts`): phép kiểm chữ đi vào nhóm lồng nhau chỉ có khẳng định rỗng, chưa có đối chứng dương chứng rằng nó thật sự quét tới các nhóm đó.
