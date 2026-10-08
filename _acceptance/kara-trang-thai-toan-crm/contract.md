---
schema_version: 1
feature: «Ở mọi nơi, lỗi tải không còn hiện như chưa có gì; lưu trữ bản ghi có Hoàn tác» — dòng thời gian, hoạt động trên website và 30 ngày đầu của ngăn bản ghi có khung «không tải được» kèm «Thử lại» thay vì rỗng hay biến mất; tóm tắt tuần nói «Kara đang…» và lỗi theo ai-ux; lưu trữ cá nhân, công ty, thoả thuận có Hoàn tác ngay trên toast; bước Kara không lưu được hiện khác bước đã lưu; ba việc chữ
slug: kara-trang-thai-toan-crm
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
design_doc: docs/superpowers/specs/2026-10-08-kara-trang-thai-toan-crm-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-08T05:06:50Z
---

# Acceptance Contract: kara-trang-thai-toan-crm

## Context

Hàng K6b của lộ trình OKR, dãy P2 đợt `sau-14-10`, sau K4 `khung-ban-ghi-kara` (#306). Khảo sát 04/10 trên production
thấy nhiều vùng của ngăn bản ghi nuốt lỗi thành «chưa có gì» hoặc biến mất (dòng thời gian, hoạt động trên website,
30 ngày đầu), tóm tắt tuần chờ bằng `Shimmer` trần và báo lỗi bằng `Alert`, lưu trữ bản ghi không có Hoàn tác trong khi
Cài đặt có, cùng ba chỗ chữ lệch. Ngoài-5 của K4 (bước Kara không lưu được vẫn hiện xong) được giám sát gộp vào hàng
này (P2-14). Anh chọn K6b dựng toast lưu trữ có Hoàn tác dùng chung và áp cho ba ngăn bản ghi (sổ
`d-20261008T043131Z-1`); V2 dùng lại cho bảng, Kanban, Cài đặt. Không đổi API: Hoàn tác gọi lệnh khôi phục có sẵn.

## Criteria

- AC-1: Given ngăn của một bản ghi mở ở tab Hoạt động, When truy vấn dòng thời gian trả lỗi, Then vùng hiện «Không tải được hoạt động» kèm một câu mô tả tiếng Việt và nút «Thử lại», không hiện trạng thái rỗng «chưa có hoạt động» nào và không in thông điệp lỗi thô; bấm «Thử lại» gọi lại truy vấn dòng thời gian đúng một lần; khi truy vấn thành công mà không có mục nào thì vẫn hiện trạng thái rỗng như trước.
- AC-2: Given ngăn của một cá nhân hay công ty ở tab Tổng quan, When truy vấn hoạt động trên website đang chờ hoặc trả lỗi, Then mục «Hoạt động trên website» vẫn hiện — lúc chờ có khung chờ và chữ đọc màn «Đang tải», lúc lỗi có «Không tải được hoạt động trên website» kèm «Thử lại» gọi lại đúng truy vấn đó; khách chưa nhận diện hay chưa có dữ liệu thì mục vẫn ẩn như trước.
- AC-3: Given ngăn của một cá nhân ở tab Tổng quan, When truy vấn kế hoạch của cá nhân đang chờ hoặc trả lỗi, Then mục «30 ngày đầu» vẫn hiện — lúc chờ có khung chờ và chữ đọc màn «Đang tải», lúc lỗi có «Không tải được kế hoạch» kèm «Thử lại» (cùng một khung với AC-1, AC-2); chưa có kế hoạch nào thì mục vẫn ẩn như trước.
- AC-4: Given khối Tóm tắt tuần ở trang Họp tuần của OKR, When Kara đang soạn tóm tắt, Then khối hiện «Kara đang tóm tắt tuần này…» bằng chỉ báo đang làm của Kara (không `Shimmer` trần), và khi chờ quá hạn vẫn có dòng mô tả cùng nút «Tải lại»; When truy vấn tóm tắt trả lỗi, Then khối hiện «Kara chưa tải được tóm tắt tuần» với câu «Bảng đáng bàn bên dưới vẫn dùng được.» và nút «Thử lại» gọi lại đúng truy vấn đó — không `Alert`.
- AC-5: Given ngăn của một cá nhân, một công ty hay một thoả thuận đang dùng, When người chọn «Lưu trữ» trong menu của ngăn rồi bấm «Hoàn tác» trên toast «Đã lưu trữ <tên>.», Then lệnh khôi phục của đúng loại bản ghi được gọi đúng một lần với id đó dù bấm «Hoàn tác» nhiều lần, toast «Đã khôi phục <tên>.» hiện, và trên máy chủ bản ghi về trạng thái đang dùng (không còn ngày lưu trữ). (cross-layer)
- AC-6: Given toast lưu trữ có «Hoàn tác», When lệnh khôi phục trả lỗi, Then hiện toast «Chưa hoàn tác được. Bản ghi vẫn ở mục Đã lưu trữ.», không in thông điệp lỗi thô, và «Khôi phục» trong menu của ngăn vẫn dùng được.
- AC-7: Given tab Kara của ngăn bản ghi, When một bước của Kara trả về kết quả không lưu được (`stored: false` hay `written: false`), Then bước đó hiện trạng thái «chưa lưu» — khác bước đã lưu ở chấm màu, ở chữ đọc màn «chưa lưu được» và ở dấu `data-trang-thai` — và khi không còn bước đang chạy hay lỗi thì tiêu đề khối bước là «Kara chưa lưu được: <tên bước>»; tab tiếng Việt không in lý do tiếng Anh của tác tử, tab tiếng Anh vẫn in như trước; bước lỗi (`output-error`) vẫn là lỗi, bước đã lưu vẫn là xong.
- AC-8: Given ngăn thêm nhanh một cá nhân, một công ty hay một thoả thuận, When tạo xong, Then toast nói «Đã thêm <tên>.» bằng tiếng Việt (tiếng Anh «<name> added.» qua tệp chữ); không tệp giao diện nào còn chuỗi «added.» viết cứng.
- AC-9: Given giao diện tiếng Việt của OKR, When nút sửa mục tiêu hiện ở bất kỳ chỗ nào (góp ý của Kara, hộp thoại mục tiêu, menu khung), Then chữ là «Sửa mục tiêu» — không còn «Sửa Mục tiêu».
- AC-10: Given khối Tóm tắt tuần, When người chọn «Hữu ích» hay «Không hữu ích», Then lời cảm ơn nói điều gì xảy ra tiếp: «Đã ghi — quản trị viên thấy số phản hồi này ở Toàn cảnh › Sức khoẻ chương trình.», thay cho «Cảm ơn, đã ghi».
- AC-11: Given bản chạy thật của cây này, ảnh khổ 1440 và 390 của: mục «Hoạt động trên website» khi truy vấn bị chặn, toast lưu trữ có «Hoàn tác», ngăn sau khi hoàn tác, When một người không làm lượt này đọc ảnh, Then họ thấy khung lỗi nói rõ không tải được kèm «Thử lại» (không phải chỗ trống), toast có «Hoàn tác» đúng tên bản ghi, và ở 390 không có gì tràn ngang. (judgment)

## Coverage

- Quét bằng `morphological-scan` (`_acceptance/kara-trang-thai-toan-crm/coverage-scan.md`), trục tự dựng: K6b là lớp chạy ngang (tải/lỗi/rỗng, lưu trữ–khôi phục) của nhiều vùng nên preset `entity-feature` không khớp trọn.
- Trục A — vùng: dòng thời gian | hoạt động trên website | 30 ngày đầu | tóm tắt tuần | toast lưu trữ (cá nhân, công ty, thoả thuận) | bước Kara | chữ [thước CE: `khao-sat-dong-nhat.md` mục 5, 6, 12 và hàng K6b của `de-xuat-lo-trinh.md` — SUY-TỪ-REPO; Ngoài-5 của `khung-ban-ghi-kara`]
- Trục B — trạng thái: đang tải | lỗi | rỗng thật | thành công | hoàn tác thành công | hoàn tác lỗi [thước CE: `docs/ai-ux.md` §7–8 và `docs/vong-doi.md` — SUY-TỪ-REPO; NGÀNH: Material Design Snackbar (hoàn tác thay cho hỏi trước), Nielsen Norman Group Error-Message Guidelines (lỗi phải nhìn thấy, kèm cách sửa)]
- Trục C — khổ × ngôn ngữ: 1440 tiếng Việt | 390 tiếng Việt | tiếng Anh — 1440 và 390 đo ở AC-11; tiếng Anh đo ở AC-1, AC-5, AC-7, AC-8 (khung lỗi, toast lưu trữ, tab Kara giữ lý do, toast tạo); các vùng còn lại dùng cùng khoá chữ en/vi nên messages-guard giữ cặp.
- Ô giữ nguyên (không phải tiêu chí): rỗng thật của hoạt động trên website và 30 ngày đầu vẫn ẩn mục; dòng thời gian lúc tải giữ chỉ báo cũ.
- Later: Hoàn tác ở bảng, Kanban, Cài đặt (V2); khung bản ghi theo lý do (K4b); tóm tắt quản trị; lỗi «Tải thêm»; phím tắt hoàn tác — xem Out of scope.

## Đường đo

- Thước: lái thử người lạ gây lỗi tải ở bốn vùng và lưu trữ rồi hoàn tác ba loại bản ghi, không vấp chỗ nào trông như rỗng · số từ: nhật ký vấp của nghi thức lái thử (khuôn `stranger-drive-template.md`) · bảo đảm bởi: đã có sẵn: nghi thức lái-thử của `/acceptance-gate:uat-session` §0
- Thước: 0 nhánh `return null` khi tải hay lỗi trong các vùng con của ranh giới và 0 toast «added.» viết cứng · số từ: răng `_acceptance/kara-trang-thai-toan-crm/rang/chu.mjs` · bảo đảm bởi: AC-2, AC-3, AC-8
- Thước: bước Kara không lưu được hiện khác bước đã lưu · số từ: bài DOM của tab Kara · bảo đảm bởi: AC-7

## Out of scope

- Hoàn tác lưu trữ ở bảng, thao tác hàng loạt, Kanban và Cài đặt; dải báo «Đã lưu trữ ngày …» đầu ngăn — V2 `vong-doi-mot-cach-cat`, dùng lại toast của hàng này.
- Khung bản ghi phân biệt «đã xoá», «không có quyền», «mất kết nối» — K4b `khung-loi-ban-ghi-dung-ly-do`.
- Tóm tắt quản trị (`tom-tat-quan-tri.tsx`) vẫn báo lỗi bằng `Alert` và nút xs.
- Lỗi khi «Tải thêm» trang sau của dòng thời gian.
- Lý do «không lưu» bằng tiếng Việt — chữ do tác tử sinh (`apps/agent`), không dịch ở giao diện.
- Phím tắt hoàn tác cho toast.

## Notes

- Vòng đời (luật 14 của đợt, `docs/vong-doi.md` «ba câu»): (1) Dọn thế nào — không đổi: cá nhân, công ty, thoả thuận vẫn Lưu trữ → Khôi phục → Xoá vĩnh viễn, K6b chỉ thêm Hoàn tác vào toast lưu trữ; (2) «Lịch sử» — không đổi, K6b không thêm nút Xoá; (3) Danh sách mặc định — không đổi: lọc bản ghi đang dùng, nút «Đã lưu trữ» có sẵn; bản ghi hoàn tác về lại danh sách chính.
- Ranh giới của giám sát (`hang-viec.json`) có `bulk-actions.tsx` và `archived-list.tsx`; theo lựa chọn (a) K6b không chạm hai tệp đó.
- Tệp ngoài ranh giới (toast tạo, «Sửa Mục tiêu», mảnh mới trong `packages/ui`, khoá chữ, bài kiểm, proto) xin ở yêu cầu P2-15.
