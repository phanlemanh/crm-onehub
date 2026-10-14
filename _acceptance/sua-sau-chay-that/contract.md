---
schema_version: 1
feature: Mười hai hạn chế người dùng thấy còn mở trong Kho tài liệu được sửa trong một lượt — đề xuất kẹt trên trang đã lưu trữ, số bản chờ sai, lỗi tải bị nuốt, mục lục ký tự đặc biệt, liên kết http mất khi đọc, trợ lý trả tiếng Việt cho giao diện tiếng Anh, bảng đổi cột rối trên màn duyệt — rồi đo lại trên bộ câu hỏi mẫu
slug: sua-sau-chay-that
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: _acceptance/sua-sau-chay-that/design.md
---

# Acceptance Contract: sua-sau-chay-that

## Context

Hàng `l5` của `docs/plan/lo-trinh-kho-tai-lieu.json`. Cổng Đáng đã ký `build` (2026-10-12). Chạy thật với phòng
ban chưa diễn ra; chủ kho chọn hướng A ngày 2026-10-14 (yêu cầu `P6-9`): danh sách góp ý là các hạn chế người dùng
thấy còn mở trong tám hồ sơ Kho đã ký, đo lại trên bộ câu hỏi mẫu sau khi sửa. Bảng mục G1–G12 và chỗ hỏng ở
`design.md`.

Source input: `design.md` · Known limits của tám hồ sơ Kho · `.acceptance-runs/sua-sau-chay-that/kiem-ung-vien.md`
(kiểm mã trên `c4c8ab0ab`) · `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md`.

## Criteria

- AC-1: Given trang A đã lưu trữ, trang B chưa từng duyệt do người khác tạo, When một thành viên tải nguồn cập nhật lên A, rồi lên B, Then A bị từ chối với câu «trang đã lưu trữ» và B bị từ chối `NOT_FOUND` như `taiLieu.get`, cả hai không ghi nguồn hay đề xuất nào; And khi máy soạn nộp bản cho một nguồn có trang đích vừa được lưu trữ, nguồn sang «lỗi» với lý do nói trang đã lưu trữ và không có đề xuất mới. (cross-layer)
- AC-2: Given trang đang có một đề xuất sửa nội dung và một đề xuất lưu trữ cùng chờ, rồi trang chỉ có một đề xuất lưu trữ chờ, When mở màn đọc, Then số bản chờ và nút «Xem bản chờ» chỉ tính đề xuất sửa nội dung — trường hợp đầu «1 bản» dẫn tới đề xuất sửa, trường hợp sau không có số và không có nút.
- AC-3: Given tải danh sách đề xuất của màn đọc thất bại, When mở màn đọc, Then thấy dòng «Chưa tải được bản chờ duyệt» kèm «Thử lại», không có số bản chờ nào; bấm «Thử lại» thì tải lại.
- AC-4: Given phiên bản 1 chỉ khác bản đang dùng ở tên trang, When gọi `taiLieu.quayLai` với số 1, Then có một đề xuất mang tên của phiên bản 1; And phiên bản trùng cả tên lẫn nội dung bản đang dùng vẫn bị từ chối «chưa đổi», không ghi hàng nào.
- AC-5: Given trang có tiêu đề «Lương & thưởng», «A < B» và một tiêu đề có ký tự thoát `\*`, When mở màn đọc, Then mục lục hiện đúng chữ đó (không `&amp;`, không `\`), và mỗi mục lục trỏ tới đúng id của tiêu đề trên trang.
- AC-6: Given trình soạn, bộ lọc dán và trình đọc, When người viết nhập liên kết `http://…`, dán một đoạn có liên kết `http://…`, hay nhập `https://…`, Then trình soạn báo «Chỉ nhận liên kết https» và không lưu liên kết `http`; bộ lọc dán giữ chữ và bỏ liên kết `http`; liên kết `https` lưu và đọc được như cũ; cả ba dùng chung một luật.
- AC-7: Given tải danh sách thành viên hay cây đơn vị thất bại, When mở trang mới hay hộp tải nguồn, Then thấy dòng «Chưa tải được danh sách …» kèm «Thử lại», không phải ô chọn rỗng.
- AC-8: Given tìm công ty, người hay thoả thuận thất bại còn tìm trang thành công, When gõ vào hộp tìm nhanh, Then thấy một dòng báo các nhóm đó chưa tìm được, cùng kết quả trang nếu có; không hiện «Không có gì khớp» khi nguyên nhân là lỗi.
- AC-9: Given người dùng chọn giao diện tiếng Anh, When trợ lý kho từ chối, báo lỗi hay câu hỏi quá hạn trên màn Hỏi, Then các câu đó bằng tiếng Anh; And cùng các tình huống đó với giao diện tiếng Việt vẫn bằng tiếng Việt như cũ.
- AC-10: Given một đề xuất thêm một cột vào bảng (và một đề xuất bớt một cột), When mở màn duyệt, Then bảng cũ (tô bỏ) và bảng mới (tô thêm) hiện thành hai bảng riêng, mỗi bảng có đúng tiêu đề của nó; không có hàng tiêu đề nào nằm trong thân bảng.
- AC-11: Given một đề xuất máy soạn đã cũ (một đề xuất khác được duyệt trong lúc chờ), When mở màn duyệt, Then thẻ so sánh mang nhãn «So với bản gốc lúc máy soạn», không phải «so với bản đang dùng».
- AC-12: Given hộp tải nguồn, When chọn một tệp không phải Word hay PDF, Then câu báo nêu đúng các loại nhận được; And danh sách loại tệp của hộp tải và của máy chủ đọc từ một nguồn.
- AC-13: Given bộ 50 câu hỏi mẫu và kết quả đo đã ký của `bo-cau-hoi-mau`, When đo lại trợ lý kho trên cây của lượt này, Then mỗi ô của bảng theo tầng và theo kiểu chữ không có câu đạt nào thành không đạt; câu lỗi gọi model được tách riêng như ở lượt đo đã ký.

## Coverage

Không quét không gian: danh sách mục là đầu vào chủ kho đã chọn (hướng A), không phải không gian cần liệt kê — xem entry
`descope` «bỏ coverage-scan» trong `decisions.jsonl`. Đối chiếu đủ: 17 mục người dùng thấy → 12 vào (G1–G12), 3 đã sửa
(K7, K8, T13), 1 hoãn vì T3 (TL7), 1 phát hiện thêm gộp vào G1 (G1b).

## Out of scope

- «Câu hỏi chờ hàng đợi còn ít hơn ba phút» — cần `migration`, hạng T3, lượt sau.
- Nợ phép đo và nợ hạ tầng của tám hồ sơ (phép kiểm thiếu đối chứng dương, log vận hành, kho Blob private).
- Góp ý từ chạy thật với phòng ban — lượt sau.
- Nâng `http` thành `https` khi soạn hay dán.

## Notes

- Mọi sửa là T2: không `migration`, không chạm `packages/auth` hay module T3 của API.
- AC-13 gọi model thật qua AI Gateway (khoảng 96 lượt hỏi, ước $2–4 như lượt đo của `bo-cau-hoi-mau`).
