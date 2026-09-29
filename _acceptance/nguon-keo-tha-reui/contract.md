---
schema_version: 1
feature: Vùng kéo-thả tệp nguồn (NguonKeoTha) dựng lại trên móc ReUI use-file-upload theo bố cục c-file-upload-3, thay bản vẽ tay bậc 5
slug: nguon-keo-tha-reui
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-28-nguon-keo-tha-reui-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T11:35:25Z
---

# Acceptance Contract: nguon-keo-tha-reui

## Context

Vùng kéo-thả một tệp Word/PDF trong hộp «Tải nguồn lên» của kho tài liệu
(`packages/ui/src/components/nguon-keo-tha.tsx`) được vẽ tay ở bậc 5 của thang «Vẽ tay là
bậc cuối» (`docs/design.md`), trong khi ReUI có thành phần miễn phí `file-upload` (móc
`@reui/use-file-upload`) và ví dụ `c-file-upload-3` ở bậc 3. Vòng này cài móc vào
`packages/ui` theo `docs/reui.md` và dựng lại vùng trên móc theo bố cục của ví dụ, giữ
nguyên mọi hành vi mà phép đo của hồ sơ `may-soan-de-xuat` (đã ký) đang ghim.

Source input: prompt — «thay nguon-keo-tha bằng ReUI c-file-upload-3, cài đúng bốn chỗ ở
docs/reui.md (--dry-run trước, không --overwrite), giữ hành vi đang được đo»; hướng A duyệt
trong brainstorm 28/09.

## Criteria

- AC-1: Given `packages/ui` trước vòng, When vòng cài `@reui/use-file-upload` theo `docs/reui.md`, Then có `packages/ui/src/hooks/use-file-upload.ts` export `useFileUpload`, tệp đó và `nguon-keo-tha.tsx` không có chú thích, không import `cn` hay `lucide-react`; `packages/ui/package.json` không có phụ thuộc `cn`; nhánh của vòng không chạm `button.tsx`, `alert.tsx`, `styles/globals.css` (so với điểm rẽ khỏi `onehub`); không có `src/components/reui/alert.tsx` hay thư mục `src/components/examples/`.
- AC-2: Given `nguon-keo-tha.tsx` sau vòng, When đọc mã của nó, Then nó lấy trạng thái kéo, bốn bộ bắt kéo-thả, việc mở hộp chọn tệp và ô tệp từ `useFileUpload`, và không tự khai bộ bắt `DragEvent` nào.
- AC-3: Given vùng kéo-thả với `chapNhan=".docx,.pdf"` và `toiDaByte` 20 MB, When người chọn qua ô tệp hay thả một tệp đúng loại, đúng cỡ, Then `onChon` nhận đúng tệp đó; When tệp sai loại hay quá cỡ, Then `onChon` không được gọi và `onTuChoi` nhận tệp kèm lý do `loai` hoặc `co`.
- AC-4: Given vùng có `loi`, When hiển thị, Then câu lỗi nằm trong `FieldError` và cả ô tệp lẫn nút «Chọn tệp» mang `aria-describedby` trỏ tới nó; ô tệp mang `aria-invalid="true"`.
- AC-5: Given vùng nhận `tat`, When hiển thị và người thả một tệp, Then ô tệp và nút «Chọn tệp» khoá, lý do hiện ra, `onChon` không được gọi, vùng mang `data-tat="true"`.
- AC-6: Given vùng thường, When người bấm nút «Chọn tệp» (nhãn từ prop `nutChon`, biến thể `outline`), Then hộp chọn tệp của trình duyệt được mở qua ô tệp; ô tệp nằm ngoài thứ tự Tab (`tabIndex=-1`) nên Tab chỉ dừng ở nút, và mang `aria-label` bằng nhãn nút.
- AC-7: Given vùng thường, When một tệp được kéo vào vùng, Then vùng mang `data-keo="true"`; When kéo ra khỏi vùng hoặc thả, Then `data-keo="false"`; Given vùng nhận `tat`, When kéo tệp vào, Then `data-keo` vẫn `"false"`.
- AC-8: Given hộp «Tải nguồn lên» có đích «Trang mới» đã điền tên, When người chọn tệp `.jpg` hay `.docx` 21 MB, Then câu «Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB» nằm dưới ô tệp, `xinCho` không được gọi, tên trang giữ nguyên; đối chứng: tệp `.docx` 1 MB đi hết `xinCho` → PUT → `nhan`.
- AC-9: Given hộp tải và danh sách nguồn, When lưu tệp nguồn chưa bật hoặc tệp tải lên trùng nguồn đã có, Then nút «Tải nguồn lên» khoá kèm câu giải thích, và hộp báo «Nguồn này đã có» dẫn tới nguồn cũ — như trước vòng.
- AC-10: Given tệp chữ `apps/app/lib/messages/tai-lieu.ts`, When hộp tải thật hiển thị bằng tiếng Việt hay tiếng Anh, Then tên nút trong vùng kéo-thả đúng trọn chuỗi `keoThaNut` của ngôn ngữ đó («Chọn tệp» / «Choose file»), và bộ canh chữ `messages-guard` xanh.
- AC-11: Given ứng dụng thật chạy trên phiên đo riêng, When người mở hộp «Tải nguồn lên» ở 1440 và 390, chọn tệp mẫu `.docx`, điền đích và bấm «Tải lên», Then hộp có vùng kéo-thả, hộp không tràn ngang ở 390, và tab Nguồn có hàng tên tệp với trạng thái «Máy đang soạn».
- AC-12: Given `nguon-keo-tha.tsx` và các tệp của khu tài liệu, When design-gate quét tĩnh, Then không tệp nào có màu, góc hay khoảng cách ngoài thang của `docs/design.md`.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix). Chân ngành: móc `use-file-upload`
của ReUI [NGÀNH: ReUI file-upload], `react-dropzone` [NGÀNH: react-dropzone — click,
bàn phím, thả là ba đường vào tệp], `input type=file` của HTML.

- Trục A — đường vào tệp: nút «Chọn tệp» | ô tệp (`change`) | thả vào vùng [thước CE: API móc `openFileDialog`/`getInputProps`/`handleDrop`; NGÀNH react-dropzone]
- Trục B — tệp: đúng loại & cỡ | sai loại | quá cỡ | rỗng 0 byte | nhiều tệp một lần [thước CE: `lyDoTuChoiTep` + `kiemTep` trong `hop-tai-nguon.tsx`]
- Trục C — trạng thái vùng: thường | đang kéo | có lỗi | tắt [thước CE: bốn biến thể `cva` của bản cũ]
- Trục D — khổ: 1440 | 390 [thước CE: E2u của `may-soan-de-xuat`]
- Cross-cutting: độ sạch bản cài (AC-1), vùng lấy việc từ móc (AC-2), chữ vi/en (AC-10), luật màu/góc (AC-12).
- Core: ô×đúng, thả×đúng, ô×sai loại, thả×quá cỡ (AC-3); có lỗi (AC-4); tắt×thả + nút khoá (AC-5); nút mở hộp chọn (AC-6); đang kéo (AC-7); hộp tải×sai loại/quá cỡ/đúng (AC-8); 1440/390 (AC-11).
- Later: rỗng 0 byte và nhiều tệp một lần — hành vi không đổi (rỗng do `kiemTep` của hộp; nhiều tệp lấy tệp đầu), chưa có phép đo riêng; xem Out of scope.

## Out of scope

- Cài tệp ví dụ `c-file-upload-3`, `@reui/alert`, 18 biến màu ReUI hay ghi đè `button.tsx` (hướng B bị loại).
- Ảnh xem trước tệp, nhiều tệp, xoá tệp đã chọn trong vùng — hộp tải chỉ nhận một tệp và đã có dòng «tệp đã chọn».
- Phép đo riêng cho tệp rỗng 0 byte và thả nhiều tệp một lần — hành vi giữ như bản cũ.
- Đổi luồng tải (xin chỗ → PUT → nhận), câu chữ khác của hộp, hay tab Nguồn.
- Chuyển các vùng tải tệp khác của kho (nếu có) sang móc.

## Notes

- Phép đo của hồ sơ đã ký `may-soan-de-xuat` (`nguon-canh-nhau.dom.tsx`, `tai-lieu-nguon.dom.tsx`, `rang/man-tai-nguon.mjs`) chạy nguyên văn, không sửa.
- Móc được gọi không có `accept`/`maxSize` để khỏi sinh câu lỗi tiếng Anh; phân loại vẫn là `lyDoTuChoiTep`.
- E1 kiểm «nhánh không chạm» bằng diff từ điểm rẽ với `origin/onehub`; sau khi gộp vào `onehub` điểm rẽ trùng HEAD nên kiểm đó xanh rỗng — lời hứa là của vòng này.
- Móc tạo URL xem trước (`URL.createObjectURL`) cho mọi tệp thêm vào và chỉ thu hồi URL của ảnh; mỗi tệp Word/PDF chọn trong hộp giữ một URL tới khi đóng trang. Giữ như bản ReUI, không vá móc.

Known limits — chấp nhận tại Cổng Bằng chứng 2026-09-28 (Phan Le Manh), từ mục ngoài hợp đồng của S4 round 1 (sổ d-20260928T120837Z-6 tới -12):

- Ngoài-1: gợi ý «Kéo tệp vào đây, hoặc chọn tệp» lặp chữ «chọn tệp» của nút «Chọn tệp» ngay cạnh; câu chữ của hộp nằm ngoài phạm vi vòng này.
- Ngoài-2: móc `use-file-upload` giữ một URL xem trước cho mỗi tệp Word/PDF đã chọn tới khi đóng trang (chỉ URL ảnh được thu hồi).
- Ngoài-3: ở chế độ nhiều tệp, móc `use-file-upload` gặp một tệp trùng thì bỏ cả loạt mà không báo lỗi; `NguonKeoTha` gọi móc ở chế độ một tệp nên đường này chưa chạy trong sản phẩm. Nơi đầu tiên bật chế độ nhiều tệp phải sửa móc trước.
- Ngoài-4 và Ngoài-7: ca «chọn lại đúng tệp vừa bị từ chối» (`nguon-keo-tha.dom.tsx`) tự dựng sự kiện `change`, nên không bắt được lỗi quên đặt lại `value` của ô tệp.
- Ngoài-5 và Ngoài-6: E2 (`rang/cai-sach.mjs --phan moc`) chỉ soi bốn bộ bắt trên vùng và dòng import `DragEvent`, không quét `onDrag*`/`onDrop` trên mọi thẻ; chiều đỏ của nó mới phá nhánh `onDrop`.
