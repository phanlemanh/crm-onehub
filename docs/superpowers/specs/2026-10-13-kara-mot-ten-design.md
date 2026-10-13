# Kara một tên toàn CRM (K6a) — thiết kế

Hàng K6a của `docs/plan/lo-trinh-okr.json`, dãy P1 đợt r2. Câu giao: «Mọi chỗ AI nói đều mang tên
Kara: tab bản ghi, tóm tắt tuần, Soạn OKR, Cài đặt, Tài liệu, Zalo». Luật đã chốt 01/10 ở
`docs/ai-ux.md` §1 và mục «Kara» của `CONTEXT.md`: AI chỉ có một tên trên màn; «Tác nhân» là vật đội
dựng, Kara chạy nó; chỗ cần phân biệt phần chạy ghi «Kara · OKR», «Kara · hồ sơ», «Kara · Tài liệu».
Lượt `tu-vung-tac-tu` đã chuyển phần màn sang K4 (đã gộp) và hàng này.

## Hiện trạng (kiểm kê 13/10 trên `onehub` 4abc05e0)

118 chuỗi người dùng thấy còn gọi AI bằng tên khác (danh sách ghim ở `_acceptance/kara-mot-ten/kiem-ke.json`) — «Trợ lý OKR», «Trợ lý AI», «Trợ lý», «máy soạn»,
«máy góp ý», «Máy tóm tắt», «Tác nhân nghiên cứu», «tác nhân» (khi nghĩa là người điền, người tra cứu),
«Agent», «Assistant», «Composer». Lộ trình ghi «khoảng 30 chỗ»; con số thật lớn hơn vì Tài liệu và
Cài đặt mới thêm từ 04/10.

| Bề mặt | Chuỗi | Nơi |
|---|---|---|
| Tab bản ghi, CRM, onboarding, ảnh sản phẩm | 17 | `crm.ts`, `record-sheet.ts`, `companies.ts`, `khung-ung-dung.ts`, `auth.ts`, `components/landing/product-shot/*` |
| Tóm tắt tuần và nhắc | 8 | `okr-toan-canh.ts`, `nhac-qua-zalo.ts`, `tro-ly-okr.ts`, `apps/agent/agent/lib/tin-nhac.ts` |
| Soạn OKR | 24 | `okr-soan.ts`, `to-chuc.ts`, `apps/api/src/okr/okr-config.ts` |
| Cài đặt (trang Kara, sổ chi phí, mô hình) | 25 | `tro-ly-okr.ts`, `settings.ts`, `apps/agent/agent/lib/tin-nhac.ts` |
| Tài liệu | 43 | `tai-lieu.ts`, `packages/validation/src/tai-lieu-nguon.ts`, `tai-lieu-hoi.ts`, `apps/api/src/tai-lieu/tai-lieu-config.ts`, `apps/agent/agent/lib/tai-lieu-config.ts`, `tai-lieu-phien.ts`, `tai-lieu-hoi-phien.ts` |
| Dùng chung | 1 | `packages/ui/src/lib/messages.ts` `chatMessage.roleAssistant` |

Zalo: không chuỗi nào trên Zalo gọi AI bằng tên cấm; câu Zalo thấy từ Kho tài liệu
(«Trợ lý AI tạm dừng vì hết hạn mức», `tai-lieu-hoi.ts`) nằm trong dòng Tài liệu. «bot Zalo» là cửa vào
và giữ nguyên (mục «Bot Zalo» của `CONTEXT.md`).

## Dựng gì

1. **Đổi giá trị chữ** (vi và en) của các khoá trên, không đổi tên khoá, không xoá khoá. Tên tệp
   (`tro-ly-okr.ts`), tên thư mục mã (`tro_ly_okr`, `may_soan`) và khoá máy (`troLy.*`) giữ nguyên:
   chúng là định danh, không hiện trên màn, và đổi chúng kéo theo mọi chỗ nhập.
2. **Bảng thay chữ** — một chiều, theo nghĩa:

| Chữ cũ (nghĩa) | Chữ mới |
|---|---|
| «Trợ lý OKR» là tên trang, tên nhóm trong sổ chi phí, tiêu đề nhóm tin nhắc | «Kara · OKR» |
| «Trợ lý OKR» / «Trợ lý» trong câu (đang soạn, tạm nghỉ, đọc mô tả) | «Kara» |
| «Trợ lý AI» nhóm sổ chi phí (tab bản ghi, tra cứu) | «Kara · hồ sơ» |
| «Trợ lý AI» / «trợ lý AI» ở Tài liệu, «máy soạn», «bản máy soạn» | «Kara», «bản Kara soạn» |
| «Máy góp ý», «Máy tóm tắt», «Máy chạy ở chế độ ẩn», «Máy ghi số đích» | «Kara góp ý», «Kara tóm tắt», «Kara chạy ở chế độ ẩn», «Kara ghi số đích» |
| «tác nhân» khi là bên điền trường, bên tra cứu, bên trò chuyện trong bản ghi; «Tác nhân nghiên cứu» | «Kara» |
| en «Assistant», «the OKR assistant», «AI assistant», «the composer», «your agent(s)» (khi là AI) | «Kara» |
| «trợ lý phụ» (bước giao việc cho trợ tác con, `okr-soan.ts`, `kara-ban-ghi.ts`) | «Kara nhờ một phần việc cho trợ tác» — giữ nghĩa trợ tác con, bỏ chữ «trợ lý» |

3. **Giữ nguyên** (không phải tên AI): «Tác nhân» khi là vật đội dựng (mọi `agent-builder-*.ts`, `settings-ket-noi.ts`,
   nhóm `tac-nhan` của sổ chi phí); «agent»/«tác tử» khi là máy chủ tác tử; «Máy chạy CI» của khoá API; «bot» của Zalo; «máy chủ»; «Máy đếm», «Số
   máy», «Máy gợi ý» ở khu số đo OKR (công thức, không phải AI); «tác tử» là tên dịch vụ hạ tầng ở trang
   sức khoẻ; trang mẫu dưới `apps/app/app/proto/**`.
4. **Luật máy giữ một tên** — bài mới `apps/app/test/kara-mot-ten.spec.ts`:
   - nạp mọi kho chữ `apps/app/lib/messages/*` (cùng cách `messages-guard.spec.ts` nạp) và kho chữ
     `packages/ui`, rải phẳng mọi giá trị vi và en (hàm thì gọi với đối số mẫu), và đọc dạng chữ các tệp
     chuỗi ngoài kho chữ ở bảng hiện trạng (validation, api, agent, landing);
   - danh sách cụm cấm viết trước: «Trợ lý», «trợ lý», «Máy soạn», «máy soạn», «Máy góp ý», «máy góp
     ý», «Máy tóm tắt», «Tác nhân nghiên cứu», «AI assistant», «Assistant», «the composer»; và «tác
     nhân»/«Tác nhân»/«agent» chỉ được ở khoá nằm trong danh sách vật-đội-dựng viết trước;
   - lỗi gọi tên tệp, khoá và cụm; chiều đỏ ghim bằng bản sao giá trị có cụm cấm.
5. **Bài kiểm có sẵn**: các ghim chữ của `messages-guard.spec.ts` và các bài DOM khẳng định chữ cũ đổi
   theo chữ mới; không bài nào bị gỡ.
6. **Lộ trình áp luật** trong `docs/ai-ux.md`: thêm dòng `kara-mot-ten` (T2, đã làm phần chữ).

## Ngoài phạm vi (chờ quyết ở Cổng Phạm vi — xem sổ)

- Lời dặn mô hình tự xưng (Hỏi-1): `subagents/tro_ly_okr/instructions.md`, `apps/agent-okr/agent/
  instructions.md`, `tai-lieu-loi-dan.ts` («Bạn là máy soạn…»), lời dặn gốc «Comp AI CRM». Đổi chúng
  đổi hành vi mô hình và chạm `paths` của nhiều hồ sơ đã ký có eval mô hình thật.
- Đổi tên khoá, tên tệp, tên thư mục mã.
- Trang mẫu `/proto/**`.

## Đặc tả UX

Không đổi bố cục, thành phần hay trạng thái nào — chỉ chữ (sổ: «bỏ đặc-tả-UX»). Mọi chữ mới đi qua
`lib/messages`, theo §9 của `docs/ai-ux.md`.
