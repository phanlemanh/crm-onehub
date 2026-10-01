# Vá Trợ lý OKR sau lượt thử 30/09 — thiết kế

Slug: `va-tro-ly-okr-sau-thu` · hạng T2 · chủ kho duyệt thiết kế 01/10/2026 (dán dòng `/goal`).

## Vì sao

Lượt thử Trợ lý OKR trên bản demo và trên prod ngày 30/09 tìm ra bốn chỗ:

1. Prod báo «Chưa sẵn sàng — Chưa có khoá mô hình» và đóng mọi việc góp ý, tóm tắt tuần.
   Tác tử prod (`crm-onehub-agent`) không có `AI_GATEWAY_API_KEY`; OIDC của dự án bật
   (`oidcTokenConfig.enabled: true`); bộ dựng tác tử đã gọi model trên prod ngày 27/09.
   `coKhoaMoHinh()` (`apps/agent/agent/lib/okr/viec.ts`) chỉ đọc `process.env`, trong khi
   `@ai-sdk/gateway` (`getGatewayAuthToken`) tìm khoá trong biến rồi gọi
   `getVercelOidcToken()` của `@vercel/oidc`, hàm đọc header `x-vercel-oidc-token` của lượt
   gọi trước biến `VERCEL_OIDC_TOKEN`. `docs/environment.md` đã ghi «Not needed on Vercel
   (OIDC)» cho khoá model — bước kiểm của Trợ lý OKR đi ngược câu đó.
2. Quyết định 26/09 «cần khoá riêng có trần tháng» chưa từng được dựng: Trợ lý dùng chung
   khoá với mọi việc AI.
3. Trợ lý đề xuất Căn chỉnh Mục tiêu vào chính Mục tiêu cấp trên mà nó đã góp qua một KR
   của Mục tiêu đó. `dichCanChinhCua` (`lib/okr/goi-ngu-canh.ts`) đưa mọi Mục tiêu cấp trên
   cùng KR của chúng mà không nhìn căn chỉnh sẵn có.
4. Hộp sửa KR có hai giọng trái nhau: gợi ý tĩnh `kr-la-viec` nói «Câu này đọc như một việc
   làm» cho «Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng», Trợ lý nói «Tên KR đã đọc ổn». Gốc:
   `laViec` (`packages/validation/src/okr-kiem.ts`) bỏ dấu rồi mới so, «hợp» thành «hop» và
   khớp động từ «họp».

Kèm hai vá chữ: dòng xu hướng thiếu đơn vị; đầu cột ghi «0 đề xuất.» sau khi quyết hết.

## Thiết kế

### 1. Một hàm «có đường tới model»

`apps/agent/agent/lib/mo-hinh-khoa.ts` (mới) xuất `nguonKhoaMoHinh(env?, layVe?)` trả
`"khoa-rieng" | "khoa-chung" | "oidc" | null`, theo đúng thứ tự Gateway dùng:
`OKR_AI_GATEWAY_API_KEY` → `AI_GATEWAY_API_KEY` → vé OIDC (`getVercelOidcToken()` bọc
try/catch, trả rỗng hoặc ném đều là «không có»). Không gọi model, không ném. Tên biến đọc
từ `TRO_LY_OKR.khoa` (config một chỗ).

Ba chỗ dùng: `chayKiemSanSang` ghi kết quả có nguồn; `lyDoChanTruocKhiGui` chặn khi `null`;
mục `MO_HINH_AI` của `capabilities.ts` gọi hàm ở chế độ bỏ qua khoá riêng
(`{ rieng: false }`) — mục nói về mọi việc AI, nên khoá riêng không được che khoá chung
hay vé OIDC đứng sau nó (phản biện P0).

Vé OIDC: hàm dùng đúng `getVercelOidcToken` của thư viện; vé hết hạn hay sai khuôn thì
thư viện thử làm mới qua `.vercel` và phiên CLI — trên máy không liên kết Vercel hay trên
prod ngoài request, lượt đó ném và hàm trả `null`.

`KET_QUA_KIEM_SAN_SANG` (`packages/db/src/okr-tro-ly-danh-muc.ts`) thêm
`san-sang-khoa-rieng`, `san-sang-khoa-chung`, `san-sang-oidc`; giữ `san-sang` cho hàng cũ.
Không đổi cột: `outcome` là chuỗi.

Kiểm lại khi nguồn đổi: nhịp điều phối truyền nguồn hiện tại vào `xepKiemLaiKhoa`;
`canKiemLaiKhoa` xếp một việc kiểm khi kết quả gần nhất cũ hơn hạn 10 phút VÀ khác nguồn
hiện tại (thiếu khoá → có vé; hàng cũ `san-sang` → bất kỳ nguồn nào; oidc → khoá riêng;
có khoá → không còn gì). Trùng nguồn thì không xếp, nên không có hàng kiểm lặp mỗi nhịp.
Prod tự lên «Sẵn sàng · qua Vercel» sau deploy, và tự đổi dòng khi chủ kho cắm khoá riêng.

### 2. Khoá riêng

`lib/okr/mo-hinh.ts` dựng model bằng `createGateway({ apiKey })` khi có
`OKR_AI_GATEWAY_API_KEY`, còn không thì `gateway` mặc định như hiện nay — tiền lệ
`lib/tai-lieu-model.ts`. Dựng tĩnh ở subagent (eve nhận `LanguageModel` tĩnh ở subagent —
`tro_ly_okr` đã làm vậy). Middleware giữ ZDR, nhãn `onehub:tro-ly-okr`, trần ra.

Biến vào ba chỗ như `KHO_TAI_LIEU_AI_GATEWAY_API_KEY`: `.env.example`,
`turbo.json` `globalPassThroughEnv`, pass-through `dev` của agent; thêm dòng ở
`docs/environment.md`.

`okr.aiChiTieu` thêm `nguonKhoa: "khoa-rieng" | "khoa-chung" | "oidc" | "chua-ro" | null`
rút từ kết quả kiểm gần nhất (`chua-ro` = hàng cũ `san-sang`); thẻ Trợ lý OKR ở Cài đặt đọc
nó. Không có ô nhập khoá.

### 3. Căn chỉnh chồng cùng nhánh

`docMucTieu` đọc thêm căn chỉnh sẵn có (`alignments`: `targetObjectiveId`,
`targetKeyResult.objectiveId`). `dichCanChinhCua` bỏ trọn nhánh của mọi Mục tiêu X mà Mục
tiêu nguồn đã góp vào X hoặc một KR của X: bỏ X và mọi KR của X. Trợ lý không thấy nhánh
đó; nó tự nộp vẫn bị `dich-ngoai-tap` loại; dòng `cho` cũ bị lọc khi đọc lại (`kiemLaiCua`
dùng cùng gói). Không mã loại mới.

### 4. Luật động từ theo dấu

`OKR_KIEM.dongTuViec` thành danh sách có dấu (gọi, gửi, tổ chức, triển khai, hoàn thành,
hoàn thiện, xây dựng, thực hiện, làm, viết, họp, tham gia, đào tạo, chạy, ra mắt, và
động từ tiếng Anh). `laViec`: câu có dấu tiếng Việt → so chữ thường giữ dấu; câu không có
dấu nào → so bản bỏ dấu của danh sách. Bỏ dấu một chiều từ danh sách, không chép hai bản.

Hai giọng: `CotGopY` nhận `coGoiYTinh` từ hộp thoại (có gợi ý tĩnh nào đang hiện trong
phạm vi của cột). Khi cột rỗng mà `coGoiYTinh`, mô tả rỗng là «Trợ lý OKR không có góp ý
thêm ngoài gợi ý dưới ô.» thay cho «… đã đọc ổn.». Gợi ý tĩnh luôn hiện.

### 5. Hai vá chữ

`xuHuong(moiTuan, uoc, donVi)` nối đơn vị của KR khi có. Đầu cột khi mọi dòng đã quyết:
«Đã quyết hết đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ lý OKR».»

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Chương trình OKR → thẻ Trợ lý OKR → dòng trạng thái «Sẵn sàng · <nguồn khoá>» (điểm ra: không đổi)
- Suôn sẻ: Sửa KR → gợi ý dưới ô tên chỉ khi tên thật là một việc → Nhờ góp ý → cột rỗng nói đúng một giọng
- Biên: không nguồn khoá nào → dòng trạng thái nói cắm biến nào vào dự án tác tử hoặc bật OIDC
- Lỗi & quay lại: không có luồng lỗi mới

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ Trợ lý OKR (Cài đặt › Chương trình OKR) | cho quản trị biết trợ lý chạy được không và bằng khoá nào | Cài đặt / không đổi |
| Hộp sửa KR | sửa một KR, có gợi ý và cột góp ý | Mục tiêu › KR › Sửa / đóng hộp |
| Hộp sửa Mục tiêu | sửa Mục tiêu, có cột góp ý | Mục tiêu › Sửa / đóng hộp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-caidat-san-sang-rieng | Thẻ Trợ lý OKR | «Sẵn sàng · khoá riêng của Trợ lý OKR» | không cần làm gì |
| ST-caidat-san-sang-chung | Thẻ Trợ lý OKR | «Sẵn sàng · khoá chung của tác tử» | cắm khoá riêng nếu muốn tách chi tiêu; dòng tự đổi trong khoảng 10 phút sau deploy |
| ST-caidat-san-sang-oidc | Thẻ Trợ lý OKR | «Sẵn sàng · qua Vercel» | cắm khoá riêng nếu muốn tách chi tiêu; dòng tự đổi trong khoảng 10 phút sau deploy |
| ST-caidat-san-sang-cu | Thẻ Trợ lý OKR | «Sẵn sàng» (lượt kiểm cũ chưa ghi nguồn) | không cần làm gì; lượt kiểm lại tự ghi nguồn |
| ST-caidat-thieu-khoa | Thẻ Trợ lý OKR | «Chưa sẵn sàng — Chưa có khoá mô hình» + mô tả: cắm OKR_AI_GATEWAY_API_KEY hoặc AI_GATEWAY_API_KEY vào dự án tác tử, hoặc bật OIDC của dự án đó trên Vercel | cắm khoá, chờ kiểm lại trong 10 phút |
| ST-kr-goi-y-viec | Hộp sửa KR | gợi ý «Câu này đọc như một việc làm…» chỉ khi tên bắt đầu bằng động từ việc | sửa tên |
| ST-kr-rong-co-goi-y | Hộp sửa KR | cột: «Trợ lý OKR không thấy chỗ nào cần sửa» + «Trợ lý OKR không có góp ý thêm ngoài gợi ý dưới ô.» | đọc gợi ý dưới ô |
| ST-kr-rong-khong-goi-y | Hộp sửa KR | cột: «Trợ lý OKR không thấy chỗ nào cần sửa» + «Tên KR đã đọc ổn.» | lưu hoặc đóng |
| ST-kr-xu-huong-don-vi | Hộp sửa KR | «… cuối kỳ ước khoảng 6,61 tỷ đồng» | không cần làm gì |
| ST-muctieu-da-quyet-het | Hộp sửa Mục tiêu | đầu cột «Đã quyết hết đề xuất. …» | đóng cột |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không đổi bố cục, không thêm điều khiển; chỉ đổi chữ và một điều kiện chọn chữ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| StatusIndicator | dùng | dòng trạng thái đã có trên thẻ |
| Empty (cột góp ý) | dùng | chỉ đổi chữ mô tả |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã có, vòng này không đổi cấu trúc — chỉ đổi chữ trên màn sẵn có.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- Hàm nguồn khoá: ma trận env × vé (riêng, chung, header OIDC, env OIDC, không có, vé hết
  hạn, vé sai khuôn, lấy vé ném, khoá rỗng); vé giả là JWT đúng khuôn, kiểm bằng bộ giải mã
  của thư viện; ô không vé chạy với HOME và cwd tạm, spy `fetch` đếm 0.
- Kiểm lại khi nguồn đổi: bảng bốn lượt đổi + ô trùng nguồn + ô chưa quá hạn.
- Kiểm sẵn sàng và chặn trước khi gửi trên kho kiểm, với vé OIDC giả qua request context.
- Model khoá riêng: nhà Gateway giả ghi `apiKey` nhận được; providerOptions giữ ZDR và nhãn.
- Bộ lọc nhánh: dựng gói trên bộ OKR mẫu với căn chỉnh sẵn có tới KR của X.
- Luật động từ: bảng ca viết trước, mỗi động từ một cặp có dấu / không dấu, và các cặp mặt
  chữ trùng khi bỏ dấu (hợp/họp, gói/gọi, lâm/làm).
- Một lượt nhìn thật trên bộ mẫu: hộp KR «Hợp đồng bán lẻ…» và thẻ Trợ lý OKR.

## Giả định

- [GIẢ ĐỊNH] Việc kiểm sẵn sàng chạy trong nhịp điều phối nên có header OIDC; đo lại trên
  prod sau deploy (thẻ phải lên «Sẵn sàng · qua Vercel» trong 10 phút).
- [GIẢ ĐỊNH] Căn chỉnh chồng loại trọn nhánh, kể cả KR khác của cùng Mục tiêu cấp trên.
- [GIẢ ĐỊNH] Gợi ý tĩnh luôn hiện; chỉ lời của Trợ lý đổi khi hai bên cùng có mặt.
