---
schema_version: 1
feature: "Mọi chỗ AI nói đều mang tên Kara: tab bản ghi, tóm tắt tuần, Soạn OKR, Cài đặt, Tài liệu, Zalo"
slug: kara-mot-ten
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-13
design_doc: docs/superpowers/specs/2026-10-13-kara-mot-ten-design.md
---

# Acceptance Contract: kara-mot-ten

## Context

Hàng K6a của `docs/plan/lo-trinh-okr.json`, dãy P1 đợt r2, Cổng Đáng ký `build` 2026-10-12. Luật chốt
01/10 (`docs/ai-ux.md` §1, `CONTEXT.md` «Kara»): AI chỉ có một tên trên màn là Kara; «Tác nhân» là vật
đội dựng; chỗ cần phân biệt phần chạy ghi «Kara · OKR», «Kara · hồ sơ», «Kara · Tài liệu». Kiểm kê 13/10
(`kiem-ke.json`) còn 118 chuỗi người dùng thấy gọi AI bằng tên khác trên năm bề mặt; Zalo không còn chuỗi nào sai ngoài
câu Kho tài liệu (đếm vào Tài liệu). Hàng này đổi chữ, thêm một luật máy giữ một tên, không đổi bố cục.

Source input: hàng K6a và `docs/ai-ux.md` (bảng «Lộ trình áp luật», dòng `tu-vung-tac-tu`) · kiểm kê
trong design doc.

## Criteria

- AC-1: Given tab bản ghi, CRM và onboarding (`crm.ts` trường tuỳ chỉnh và tra cứu, `record-sheet.ts` cảnh báo xoá, `companies.ts`, `khung-ung-dung.ts`, `auth.ts`, ảnh sản phẩm ở trang giới thiệu), When đọc mọi chữ vi và en của các khoá trong bảng kiểm kê, Then mỗi chữ gọi AI là «Kara» và không còn «tác nhân», «Agent» hay «agent» theo nghĩa người điền, người tra cứu, người trò chuyện.
- AC-2: Given tóm tắt tuần và nhắc buổi sáng (`okr-toan-canh.ts`, `nhac-qua-zalo.ts`, khoá tóm tắt của `tro-ly-okr.ts`, tiêu đề nhóm và thông báo trần trong `apps/agent/agent/lib/tin-nhac.ts`), When đọc các chữ đó, Then tiêu đề nhóm là «Kara · OKR», câu nói người làm là «Kara», và không còn «Trợ lý OKR» hay «Máy tóm tắt».
- AC-3: Given Soạn OKR (`okr-soan.ts`, `to-chuc.ts` mô tả gợi ý, các câu trả về từ `apps/api/src/okr/okr-config.ts`), When đọc các chữ đó, Then nút, hội thoại, lý do hỏng, cuộc soạn và câu lỗi đều gọi AI là «Kara», và không còn «Trợ lý», «trợ lý phụ» hay «Máy ghi».
- AC-4: Given Cài đặt (`tro-ly-okr.ts` trang và sổ chi phí, `settings.ts` mô hình và nghiên cứu), When đọc các chữ đó, Then trang mang tên «Kara · OKR», nhóm sổ chi phí là «Kara · hồ sơ» và «Kara · OKR», câu mô tả nói «Kara», và nhóm «Tác nhân» (vật đội dựng) giữ nguyên.
- AC-5: Given Tài liệu (`tai-lieu.ts`, `packages/validation/src/tai-lieu-nguon.ts`, `tai-lieu-hoi.ts`, `apps/api/src/tai-lieu/tai-lieu-config.ts`, `apps/agent/agent/lib/tai-lieu-config.ts`, tiêu đề phiên và câu đóng việc ở `tai-lieu-phien.ts`, `tai-lieu-hoi-phien.ts`), When đọc các chữ đó — kể cả câu hết hạn mức người hỏi qua Zalo thấy, Then mọi chỗ «Trợ lý AI», «máy soạn», «bản máy soạn», «Máy đang soạn», «the composer», «AI assistant» thành «Kara».
- AC-6: Given nhãn người nói khi tải hội thoại về (`packages/ui` `chatMessage.roleAssistant`), When đọc vi và en, Then cả hai là «Kara».
- AC-7: Given luật máy mới «một tên AI» chạy trên mọi kho chữ của `apps/app`, kho chữ `packages/ui`, và mọi chuỗi viết cứng trong `apps/app/app`, `apps/app/components` (trừ `proto`), `apps/api/src`, `apps/agent/agent`, `packages/validation/src`, When có một chuỗi chứa một trong 16 cụm cấm (vi so đúng chữ: «Trợ lý», «trợ lý», «Máy soạn», «máy soạn», «Máy góp ý», «máy góp ý», «Máy tóm tắt», «máy tóm tắt», «Máy ghi số», «Máy chạy ở chế độ ẩn», «Máy đang soạn», «máy không đọc», «Tác nhân nghiên cứu»; en không phân biệt hoa thường: «assistant», «composer», «your agent») hoặc «tác nhân»/«agent» ở khoá không thuộc danh sách vật-đội-dựng, Then bài đỏ và nêu tệp, khoá hay dòng, và cụm; And trên cây sau hàng này bài xanh; And danh sách 118 chuỗi phải đổi, 8 chữ giữ và 7 chỗ miễn được ghim trong `kiem-ke.json` trước khi sửa chữ đầu tiên.
- AC-8: Given các chữ không phải tên AI — «Tác nhân» vật đội dựng (nhóm `tac-nhan` sổ chi phí, khối Slack của Kết nối), «bot» Zalo, «máy chủ», «Máy đếm»/«Số máy»/«Máy gợi ý» của số đo OKR, «agent»/«tác tử» chỉ máy chủ tác tử, «tác tử» của trang sức khoẻ — When đọc sau hàng này, Then chúng giữ nguyên như trên `onehub` trước hàng.
- AC-9: Given bài kiểm có sẵn ghim chữ cũ (`messages-guard.spec.ts` và các bài giao diện nhắc «Trợ lý OKR», «máy soạn», «tác nhân»), When chạy bộ kiểm của kho, Then chúng khẳng định chữ mới, không bài nào bị gỡ hay bỏ qua, và cả bộ xanh.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — bề mặt:** tab bản ghi · tóm tắt tuần · Soạn OKR · Cài đặt · Tài liệu · dùng chung · Zalo [thước CE: sáu bề mặt câu giao + kiểm kê 13/10] → AC-1…AC-6
- **Trục B — nơi chữ sống:** kho chữ `apps/app` · kho chữ `packages/ui` · chuỗi trong validation · câu api trả về · chuỗi agent ghi xuống hay gửi đi · chữ cứng trong tệp giao diện [thước CE: bảng kiểm kê] → AC-1…AC-7
- **Trục C — nghĩa chữ:** tên AI (đổi) · vật đội dựng (giữ) · cửa vào Zalo (giữ) · công thức số đo (giữ) · hạ tầng (giữ) [thước CE: `docs/ai-ux.md` §1, mục từ «Kara», «Tác nhân», «Bot Zalo»] → AC-7, AC-8
- **Trục D — giữ lâu:** luật máy chặn tên cũ quay lại · bài có sẵn đổi theo [thước CE: luật «Ghim khoá mới ở messages-guard» trong ghi chú hàng] → AC-7, AC-9
- [GIẢ ĐỊNH] «Zalo» trong câu giao được phủ bằng câu Kho tài liệu Zalo thấy; lời tự xưng của mô hình trên Zalo là Hỏi-1.

## Out of scope

- Lời dặn mô hình tự xưng («Trợ lý OKR», «máy soạn», «Comp AI CRM») — chờ Hỏi-1.
- Đổi tên khoá, tên tệp, tên thư mục mã (`tro-ly-okr.ts`, `tro_ly_okr`, `may_soan`).
- Trang mẫu `apps/app/app/proto/**`.
- Bố cục, thành phần, dấu tia sáng — đã thuộc `nen-kara`, `bo-xuong-kara`, K4.

## Notes

- Bảng thay chữ một chiều nằm trong design doc.
- Hồ sơ đã ký có bài kiểm phải đổi chữ theo hàng này được liệt ở `evidence/ho-so-bai-doi.md` (E12) và ghim lại ở đuôi vòng, theo điều kiện giám sát khi duyệt sửa tệp chữ chung (P1-2).
- Known limits — chọn ở Cổng Bằng chứng 2026-10-13:
  - Ngoài-1: Ảnh bằng chứng của màn Soạn OKR chỉ cho thấy thông báo «chưa bật Kara», không cho thấy khung soạn thật. Chữ trong khung soạn đang chạy vì vậy chưa được kiểm bằng ảnh, chỉ được kiểm bằng luật quét chữ.
  - Ngoài-3: Nếu sau này ai đó sửa chữ ở tab Kara của bản ghi, hệ thống có thể vẫn coi ảnh và kiểm kê cũ là còn hiệu lực. Chữ đổi rồi có thể không bị buộc kiểm lại.
  - Ngoài-5: Trên máy chạy kiểm tra tự động, phép kiểm bản ghim danh sách chữ cần đổi âm thầm bỏ qua nhưng vẫn báo xanh. Có người sửa danh sách ghim thì vẫn có thể không bị phát hiện ở bước đó.
  - Ngoài-6: Phép kiểm màn Soạn OKR chỉ đạt khi Kara · OKR chưa được nối, và sẽ đỏ oan ở máy đã nối. Phần chữ trong khung soạn thật chưa được kiểm bằng ảnh.
  - Ngoài-7: Phép đo sổ chi phí báo đúng cả ba nhóm nhưng thực ra chỉ kiểm hai, và kiểm trên chữ của cả trang. Nhãn «Kara · OKR» của sổ chi phí có thể sai mà phép đo vẫn xanh.
  - Ngoài-8: Phép kiểm «không còn cụm từ cấm» ở màn Soạn OKR chỉ quét thông báo chưa bật Kara. Chữ trong khung soạn đang chạy chưa được ảnh chứng minh.
  - Ngoài-9: Phép đếm nguồn kẹt vì «dừng giữa chừng» chưa được thử với dòng ghi theo câu cũ. Nếu nó đếm sai dòng cũ thì cũng không bài kiểm nào báo.
  - Ngoài-10: Một tệp mẫu của trang Lộ trình bị sửa lẫn vào lượt đổi tên Kara. Người dùng không thấy gì khác, nhưng hai hồ sơ cũ không liên quan sẽ phải xét lại.
  - Ngoài-11: Ảnh minh chứng cho màn Soạn OKR thực ra là trang báo không tìm thấy, nên chưa ai thấy tận mắt màn đó đã đổi sang tên Kara. Chữ trong sản phẩm không bị ảnh hưởng.
  - Ngoài-12: Một phép kiểm màn của hồ sơ cũ còn tìm câu báo model bị gỡ theo chữ cũ, nên lần xét lại sau sẽ báo lỗi giả. Người dùng thấy câu mới đúng.
  - Ngoài-13: Một phép kiểm màn Tài liệu của hồ sơ cũ còn đòi nhãn «Máy đang soạn», nên lần xét lại sau sẽ báo lỗi giả. Người dùng thấy nhãn mới đúng là «Kara đang soạn».
  - Ngoài-14: Phép chụp màn chưa chứng minh chắc rằng tab Kara và màn Soạn OKR đã đúng chữ, vì nó có thể qua cả khi mở nhầm trang. Chữ thật trong sản phẩm vẫn do luật quét chữ giữ.
  - Ngoài-15: Nếu ai xoá một câu hoặc thay bằng chữ khác thì máy vẫn báo xanh, dù câu đó đáng lẽ phải nhắc tên Kara. Chữ hiện tại trên màn không sai.
  - Ngoài-16: Bài giữ nguyên các chữ không phải tên AI chưa phủ hết, nên một số nhãn tiếng Anh có thể bị đổi nhầm thành Kara mà máy không báo.
  - Ngoài-17: Phép kiểm màn Cài đặt có thể báo đạt dù tiêu đề thẻ cấu hình thiếu, vì tên nhóm ở sổ chi phí trùng chữ. Chữ trên màn không bị chỉ ra là sai.
  - Ngoài-18: Bài đối chiếu chữ giữ nguyên với bản gốc chỉ tìm chuỗi ở đâu đó trong tệp, nên có thể bỏ sót một nhãn bị đổi giá trị.
  - Ngoài-19: Danh sách ngoại lệ có thể giữ lại một mục đã lỗi thời mà máy vẫn không báo. Người dùng không thấy khác biệt trên màn.
  - Ngoài-20: Câu nói về việc Kara nhờ một phần việc phụ có thể bị viết lại làm mất ý «nhờ trợ tác» mà máy vẫn báo xanh.
  - Ngoài-21: Phép chụp màn quét thiếu hai cụm chữ cũ nên có thể bỏ sót chúng, trong khi luật quét chữ chính vẫn đủ.
  - Ngoài-22: Phép thử luật chỉ biết đỏ ở đúng tệp chứ không chỉ ra đúng câu, nên khó chắc luật bắt đúng chỗ. Người dùng không thấy khác biệt.
  - Ngoài-23: Không gì trên màn. Hồ sơ cũ «khung không còn dùng chữ» có một phép đo đòi tệp bài chung messages-guard không đổi; hàng này phải sửa tệp đó để ghim chữ Kara, nên ghim lại hồ sơ đó trên nhánh này sẽ đỏ. Lưới trước-merge KHÔNG chặn vì PR không chạm thư mục hồ sơ đó (đo 13/10: pre-merge-check chỉ gọi tên kara-mot-ten và kho-nguon-khong-ket). Hai lối: (a) không ghim lại nó trong PR này, ghim ngay sau khi gộp — merge-base dời lên đỉnh mới, phép đo tự xanh, không đợi F8; (b) mở lại hồ sơ đó trong PR này và đổi luật đo sang neo cặp sha của vòng đó (đúng việc của hàng F8 neo-thuoc-het-han, dãy P7) — phải đợi hoặc làm thay F8. Máy khuyên (a).
- Lượt ghim lại trước gộp (13/10): lượt 45 hồ sơ `repin-20261013T173430Z-44222` (vết ở `.acceptance-runs/agent-builder-noi-tieng-viet/`) đỏ ở bo-chu-lap-keo-tha E5b (không chạm thước so nhánh chính) và E5c (răng còn nhãn «Máy đang soạn»), dừng giữa chừng; lượt ba hồ sơ `repin-20261013T231138Z-12410` (vết ở `.acceptance-runs/kara-mot-ten/`) đỏ ở bo-ca-mau-quy-4 E7 mã 3 và vì răng ghi vào hồ sơ đã ký. Chủ kho chọn: trước gộp chỉ ghim kara-mot-ten, kho-nguon-khong-ket, bo-ca-mau-quy-4; răng còn chữ cũ thành hàng P1-9; các hồ sơ còn lại ghim sau gộp.
- Sau gộp #391 (l3b, 14/10): luật một tên bắt ba câu «trợ lý AI» / «the AI assistant» của `apps/app/lib/messages/tai-lieu-lich-su.ts`; đổi thành «Kara» theo cham-tep P1-11. Ảnh bằng chứng E13j của hồ sơ `lich-su-va-luu-tru-trang` chụp chữ cũ nên sẽ lệch chữ; hồ sơ đó vào danh sách ghim lại sau gộp (cùng nhóm hàng P1-9).
