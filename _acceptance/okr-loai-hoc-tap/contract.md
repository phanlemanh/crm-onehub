---
schema_version: 1
feature: Loại mục tiêu thứ ba «Học tập» cho OKR
slug: okr-loai-hoc-tap
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [api, ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-07T14:50:00Z
design_doc: docs/superpowers/specs/2026-10-07-okr-loai-hoc-tap-design.md
---

# Acceptance Contract: okr-loai-hoc-tap

## Context

OKR có hai loại mục tiêu, «Cam kết» và «Tham vọng». Đội cần loại thứ ba cho mục tiêu kiểm một
giả thuyết chưa biết đáp án: thành công là học được điều gì, không phải tới một con số. Vòng
này thêm loại «Học tập» với cách đọc riêng giữa kỳ và cuối kỳ, và bắt buộc ghi «Điều học được»
trước khi khép kỳ. Quyết định do chủ kho chốt 07/10 (ba câu trả lời trong phiên, một câu chọn
«Đã trả lời = đã ghi điều học được»).

Source input: prompt (chủ kho, 07/10).

## Criteria

- AC-1: Given ba loại mục tiêu, When đọc danh sách loại ở mọi nơi kho dùng — `LOAI_MUC_TIEU`, `LOAI_MUC_TIEU_NHAP` của soạn OKR, enum `loaiMucTieu` của hợp đồng API — Then cả ba là cùng tập `{cam-ket, tham-vong, hoc-tap}`; And `okr.createObjective` với `kind: "hoc-tap"` lưu được và `okr.objective` đọc lại `kind: "hoc-tap"`.
- AC-2: Given một mục tiêu học tập có vạch kỳ vọng, When máy đọc tình trạng giữa kỳ ở các mức tỉ lệ tiến độ/kỳ vọng 0 · 0,49 · 0,5 · 0,69 · 0,7 · 0,85 · 1, Then kết quả giống hệt mục tiêu tham vọng ở cùng mức (Chậm nhịp dưới 0,7, Đúng nhịp từ 0,7) và không mức nào ra «Trượt»; And mục tiêu cam kết ở cùng các mức vẫn đọc như hôm nay.
- AC-3: Given một mục tiêu học tập ở pha Chấm điểm, When bảng chấm (`okr.bangCham`) được đọc trước và sau khi ghi «Điều học được», Then cách đọc của nó là «Chưa trả lời» rồi «Đã trả lời», kể cả khi KR của nó chưa có điểm; And điều học được chỉ có khoảng trắng vẫn là «Chưa trả lời»; And mục tiêu cam kết, tham vọng giữ cách đọc theo điểm như hôm nay.
- AC-4: Given chu kỳ ở pha Chấm điểm, mọi KR đã chấm, và một mục tiêu học tập đã công bố chưa ghi điều học được, When quản trị chuyển chu kỳ sang «Đã đóng», Then API từ chối với thông điệp nêu số mục tiêu và tên của nó, chu kỳ giữ pha Chấm điểm; And khi đã ghi điều học được thì chuyển được. (cross-layer)
- AC-5: Given bốn chu kỳ, mỗi chu kỳ một mục tiêu học tập chưa ghi điều học được ở một trạng thái — nháp · chờ duyệt · công bố · đã bỏ — và mọi KR của mục tiêu đã công bố đã chấm, When chuyển từng chu kỳ sang «Đã đóng», Then chỉ chu kỳ có mục tiêu học tập đã công bố bị chặn; ba chu kỳ kia chuyển được.
- AC-6: Given hộp khép kỳ ở Cài đặt › OKR mở cho chu kỳ có mục tiêu học tập chưa ghi điều học được (mọi KR đã chấm), When hộp tải xong, Then nó là hộp chặn (không có nút khép) liệt kê tên từng mục tiêu học tập chưa ghi, tên đánh dấu để trình duyệt không tự dịch; And khi không còn mục tiêu nào như vậy thì hộp là hộp xác nhận như hôm nay.
- AC-7: Given màn chấm điểm có một mục tiêu học tập mà KR của nó chưa có điểm, When người ghi điều học được và bấm lưu, Then — không tải lại trang — nhãn cách đọc đổi từ «Chưa trả lời» sang «Đã trả lời», và trước đó dưới ô điều học được có chú thích «Bắt buộc trước khi đóng kỳ»; And mở hộp khép kỳ ngay sau đó (bằng bấm, không tải lại) không còn liệt kê mục tiêu này; And mục tiêu cam kết không có chú thích đó. (cross-layer)
- AC-8: Given hộp thoại thêm/sửa mục tiêu, When mở hộp chọn «Loại», Then có đúng ba lựa chọn «Cam kết», «Tham vọng», «Học tập» (tiếng Anh: «Committed», «Aspirational», «Learning»); And chọn «Học tập» rồi lưu thì mục tiêu hiện chip «Học tập». (cross-layer)
- AC-9: Given lời dặn của Kara khi soạn OKR, When đọc mục nói về loại mục tiêu, Then nó cho phép `hoc-tap` và nói rõ khi nào dùng (mục tiêu kiểm một giả thuyết chưa biết đáp án), không mâu thuẫn với cách đọc «không bao giờ Trượt» và luật bắt buộc ghi điều học được; And lược đồ đầu ra của soạn OKR nhận `loaiMucTieu: "hoc-tap"`. (judgment)

## Coverage

Quét bằng `morphological-scan` (preset entity-feature × test-matrix), 07/10.

- Trục A — loại mục tiêu: cam-ket | tham-vong | hoc-tap [thước CE: `LOAI_MUC_TIEU` + mọi chỗ rẽ nhánh theo loại — `tinhTrang`, `cachDoc` (git grep 07/10)]
- Trục B — thời điểm đọc: giữa kỳ (tình trạng) | cuối kỳ (cách đọc) | khép kỳ (điều kiện chặn) [thước CE: ba hàm `tinhTrang`, `cachDoc`, `setCyclePhase` nhánh `da-dong`]
- Trục C — trạng thái mục tiêu học tập lúc khép: nháp | chờ duyệt | công bố | đã bỏ [thước CE: `TRANG_THAI_MUC_TIEU` — đủ bốn giá trị, AC-5]
- Trục D — điều học được: vắng | chỉ khoảng trắng | có chữ [thước CE: `OkrNhinLai.dieuHocDuoc` là String mặc định rỗng]
- Trục E — mặt: API | màn chấm điểm | hộp khép kỳ | hộp chọn loại | Kara [thước CE: chỗ gọi của ba hàm + `instructions.md` của agent-okr]
- Ô Core: A×B giữa kỳ (AC-2) · A×B cuối kỳ × D (AC-3) · C×D lúc khép (AC-4, AC-5) · E mỗi mặt một AC (AC-1, AC-6, AC-7, AC-8, AC-9).
- Đối chiếu ngành: [NGÀNH: Google re:Work — «committed» và «aspirational» OKR] chỉ có hai loại. [GIẢ ĐỊNH: chưa có chuẩn ngành đúng loại cho «learning OKR»] — loại thứ ba là chủ ý của chủ kho, chốt trong phiên 07/10.
- Later: thống kê riêng mục tiêu học tập ở Toàn cảnh; nhắc ghi điều học được trước hạn khép.

## Out of scope

- Thống kê hay tỉ lệ riêng của mục tiêu học tập ở «Toàn cảnh» hay báo cáo xuất.
- Nhắc (việc OKR, Zalo) người phụ trách ghi điều học được trước khi khép kỳ.
- Một ô đánh dấu riêng «chưa trả lời được câu hỏi» — chủ kho chọn «đã trả lời = đã ghi điều học được».
- Đổi điểm của mục tiêu học tập: KR vẫn chấm và gộp điểm như hôm nay, chỉ cách đọc đổi.
- Sửa câu cũ trong `CONTEXT.md` (mục «Tình trạng», «Điểm cuối kỳ»): luật 7 của đợt chỉ cho thêm dòng.

## Notes

- Không migration: `okrObjective.kind` là `String` không CHECK.
- Vòng đời (`docs/vong-doi.md`): không thêm loại bản ghi hay trạng thái kết thúc mới, ba câu không áp.
- `CONTEXT.md` thêm mục «Loại mục tiêu».
