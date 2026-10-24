# Vỏ khu Mục tiêu học từ Tability (18/10) — tóm tắt và đối chiếu 24/10

Bộ nghiên cứu gốc của đợt `okr-vo-khu-1810` (hàng VK1–VK13) bị thất lạc khi mở lộ trình: các hàng chỉ trỏ tới một
artifact riêng tư. Chủ kho lấy lại bộ này ngày 24/10 vào kho riêng tư `phanlemanh/crm-onehub-nguon`, commit `88462c4`.
Tệp này là bản tóm tắt đã làm sạch cùng con trỏ ghim, theo luật chủ kho chốt 24/10 (`TRI-THUC.md` của kho nguồn):
«kho crm công khai chỉ giữ con trỏ ghim theo commit và bản tóm tắt đã làm sạch».

Ngày 24/10 giám sát đợt `vo-khu-muc-tieu` đối chiếu bộ nghiên cứu với hiện trạng `onehub` @ `1591d8b77` và các nhánh
đang làm, rồi trình mười câu hỏi C1–C10. Chủ kho trả lời nguyên văn «Đồng ý hết theo khuyến nghị» (24/10, khoảng
06:05Z). Phần dưới ghi kết quả của lần đối chiếu đó: điều nào trong nghiên cứu nay lỗi thời, điều nào thiếu và hàng
nào gánh. Phần cắt hàng nằm ở `docs/plan/pham-vi-okr-doi-chieu-vo-khu-2410.md`.

## 1. Quyết định 18/10

Chủ kho mở đợt với câu «Kết quả mong muốn của tôi là điều chỉnh ux/ui lại cho tính năng okr/mục tiêu trên onehub crm
dễ dùng hơn», và yêu cầu học trực tiếp từ Tability cả kiến trúc thông tin lẫn cách đặt tên.

| Quyết định | Lời chủ kho hay căn cứ | Hàng nhận |
| --- | --- | --- |
| Khu Mục tiêu dùng thanh bên hai lớp như Cài đặt và Hội thoại; màn sơ đồ mở toàn vùng | «kiến trúc của OneHub đang sẵn cấu trúc navigation 2 lợp như mục cài đặt, chat … hoàn toàn tương thích» | VK1, VK2, VK6 |
| Thanh bên chia theo việc và vật, không theo phạm vi; phạm vi thành bộ lọc trong trang | «cách chia: Của tôi / Tất cả đơn vị / Cả Công ty — Nó khó hiểu vì không rõ cấp độ chia vậy là đang nói về bộ OKR hay gì» | VK2, VK3 |
| Thanh bên: Của tôi · Cập nhật gần đây; nhóm OKR (Bộ OKR · Lấy ý kiến); nhóm Báo cáo (Sức khoẻ · Mọi KR · Sơ đồ); ô chu kỳ đầu thanh | bản mẫu `/proto/vo-khu-muc-tieu` | VK2, VK3, VK11, VK12 |
| Ba tên: «Góp vào» là nhãn màn của căn chỉnh, «Lấy ý kiến» thay «Hỏi ý», gốc tổ chức là «OneHub» | «Chốt cả ba tên» | VK4, VK5 |
| Giữ nhãn nhóm «OKR» («OKR và KPI» khi có KPI), mục bản đồ là «Sơ đồ» | «Đồng ý: giữ nhãn nhóm «OKR» …, đổi mục bản đồ thành «Sơ đồ».» | VK2, `CONTEXT.md` |
| Xếp hạng mục trước khi đổi nhãn | «nên xếp thành hạng mục trước khi đi vào thực thi chi tiết cho đổi nhãn?» | bản phạm vi 18/10 |
| Không chép từ Tability: kế hoạch tạo tự do, quyền theo từng kế hoạch, ngày riêng cho mỗi kế hoạch, KPI · Standup · Dashboard | bảng «Không chép từ Tability» của báo cáo | `CONTEXT.md` mục Bộ OKR |

## 2. Tám nguyên tắc học từ Tability

1. Ba câu hỏi, ba chỗ: tôi cần làm gì (Của tôi), đội làm gì (Bộ OKR), cả công ty ra sao (Báo cáo).
2. Mỗi vật chứa một trang: mỗi bộ OKR có đường dẫn riêng, không có ô chọn đơn vị trên một màn chung.
3. Một khuôn cho mọi vật chứa: trang một bộ và trang một người cùng khuôn — hàng số, KR, việc, hoạt động, cột phải là
   quan hệ.
4. Một vật, một chỗ: KR chỉ có một chỗ chi tiết, mở chồng lên trang đang xem, có ‹ › sang KR kế.
5. Hành động chính ở đầu vật; trang báo cáo không có nút tạo.
6. Viết và theo dõi là hai chế độ; góp ý của Kara ở cột bên của chế độ Soạn.
7. Nhìn ngang dồn về một chỗ: Báo cáo.
8. Ít danh từ: một tên cho mỗi khái niệm.

## 3. Điều trong nghiên cứu nay lỗi thời, hoặc giữ hiện trạng

Phiên nào đọc bộ nghiên cứu gốc phải đọc bảng này trước. Cột «Thay bằng» là quyết định đang có hiệu lực.

| Nghiên cứu nói | Thay bằng | Vì sao |
| --- | --- | --- |
| Giữ bảng cập nhật hàng loạt ở Của tôi; «Cập nhật cả tuần trong một bảng» là chỗ OneHub hơn Tability | «Lối (b)», chủ kho 24/10: chỉ cập nhật từng KR qua hộp một KR, mở từ chi tiết KR; Của tôi chỉ liệt KR (hàng SV1) | Bản 18/10 khuyên **giữ** bảng; hướng «cập nhật trong bộ» xuất hiện lần đầu ở câu hỏi 22/10 (`docs/findings/2026-10-22-hop-tuan/README.md` §1), không phải 18/10 |
| Đường dẫn `/okr/bo-okr/[đơn vị]`, `/okr/nguoi/[id]`, `/okr/cap-nhat`, `/okr/bao-cao/…` | Một bộ giữ tham số `?donOkr=` (VK3); `/okr/suc-khoe`, `/okr/moi-kr`, `/okr/so-do` (VK2); `/okr/cap-nhat-gan-day` (VK12) | Quyết định ở Cổng Phạm vi VK2, VK3 (19–21/10) |
| Thanh bên khu hiện từ khổ 1024px | Giữ `md` (768px) như VK1 và `docs/design.md` | C7 «giữ hiện trạng» |
| Tiêu đề trang một bộ là tên đơn vị | Giữ tiêu đề «Mục tiêu», dòng vị trí «Bộ OKR › tên đơn vị» (VK3); không có hàng đổi tiêu đề | C6 «giữ «Mục tiêu», xoá lời hứa «một hàng riêng»» |
| «Cập nhật tuần» thuộc nhóm tên giữ nguyên; «ngăn KR» | «Cập nhật» và «chi tiết KR» (`CONTEXT.md`, `docs/design.md` mục «Bấm vào KR và cập nhật», 24/10) | Dữ liệu không có khoá duy nhất theo tuần |
| Nút «Soạn OKR» ở đầu trang một bộ, cạnh «Thêm mục tiêu» | Một nút «Thêm mục tiêu» mở hộp chọn đường (VK9); chế độ Soạn vào qua «Soạn cả bộ» trong hộp và câu rỗng (VK10) | Luật một nút `primary` ở đầu trang |
| Lấy ý kiến chỉ hiện trên thanh bên ở pha Lập kế hoạch hoặc khi đã có kết quả | Luôn hiện, số đếm báo khi có việc (VK2 AC-1) | C10 «giữ hiện trạng»: ít đổi bố cục |
| Của tôi có khối «Người trong đơn vị bạn dẫn — ai chưa cập nhật» | Không liệt người chưa cập nhật; họp tuần bàn KR, không bàn người (`CONTEXT.md` mục Họp tuần) | C9 «giữ hiện trạng»; mục chờ VK-C2 ghi lại |
| Chọn thanh bên khi «khu có từ năm nơi đến» | Chọn theo câu hỏi «đổi nơi hay đổi phần» (`docs/design.md`, «Thanh bên khu và thẻ con») | Luật của kho rõ hơn |
| Wiki kho nguồn: «mã DH11 đã vào onehub … không có hồ sơ» | DH11 có tiêu chí trong hợp đồng VK2 (AC-8) | Sửa ở wiki kho nguồn, không ở đây |

Một điều nghiên cứu nói đúng và **thắng** hiện trạng: ô chu kỳ áp cho mọi nơi trong khu. VK2 cho mỗi màn giữ chu kỳ
mặc định của mình, nên Của tôi và Lấy ý kiến có thể hiện hai chu kỳ khác nhau. C4 chọn «một chu kỳ cho cả khu» — hàng
VK17.

## 4. Mâu thuẫn và chỗ thiếu, kèm hàng gánh

| Chỗ | Nghiên cứu | Hiện trạng trước 24/10 | Quyết định 24/10 | Hàng gánh |
| --- | --- | --- | --- | --- |
| Thẻ con «Sơ đồ» của một bộ | Sơ đồ của một bộ là đơn vị đó cùng đơn vị cha và con | VK3 dựng thẻ «Sơ đồ góp vào» bằng cây cả chu kỳ; VK6 bỏ Cây căn chỉnh. Gộp cả hai thì thẻ con bật ra Báo cáo › Sơ đồ, rời trang bộ | C1 (a): bỏ thẻ khỏi trang bộ tới khi có hàng mới; lối tạm cụ thể chủ kho chọn ở hàng gộp sau trong VK3, VK6 | VK14 |
| Cột phải của trang một bộ | Khối «Góp vào» (đơn vị góp vào đâu) và «Đơn vị trực thuộc»; «Thấy đơn vị góp vào đâu: 2 bấm → 0» | Không mã nào của phạm vi 18/10 | C2: cắt hàng sau VK8 | VK15 |
| Một tín hiệu trên dòng (P12) | Giữ tình trạng và mức tự tin cạnh nhau; bỏ nhãn loại và «Đã công bố» khỏi dòng; nhãn trạng thái chỉ khi nháp hay chờ duyệt | Không hàng | C3: thành hàng | VK16 |
| Trang một người cùng khuôn bộ OKR | Nguyên tắc 3 | VK3 để OKR cá nhân ngoài phạm vi | C3: chân trời | mục chờ VK-C3 |
| Ô chu kỳ | Một chu kỳ cho mọi nơi trong khu | Mỗi màn một mặc định (VK2) | C4: một chu kỳ cho cả khu | VK17 |
| Chữ lọc phạm vi | Chính nghiên cứu lệch: «Tôi dẫn · Đang theo dõi» ở Bộ OKR, «Bộ OKR bạn dẫn · Bạn theo dõi» ở Cập nhật gần đây | VK3 và VK12 hai bộ chữ | C5: «Tất cả · Tôi dẫn · Đang theo dõi» | `CONTEXT.md`, `ghi_chu` VK12 |
| Từ điển cho «Cập nhật gần đây» | Nơi đến ở đầu thanh bên | `CONTEXT.md` không có mục | Thêm mục | `CONTEXT.md` |
| Sáu tên còn treo | Bảng «Đặt tên»: Vết và Diễn biến thành Lịch sử, «Đặt cược» thành «Phỏng đoán», «Cần bàn» thành «Đáng bàn», nút «Thêm» thành «Thêm việc», «Tiếp cuộc đang soạn» thành «Tiếp tục soạn OKR»; bản tiếng Anh: cột «Actions» thành «Tasks», thẻ «Overview» thành «Company-wide» | Mục chờ VK-C1 | C8: duyệt cả bảng | VK18 (thay VK-C1) |

Còn ba điều nghiên cứu đề xuất mà lần đối chiếu này không trình, nên chưa thành hàng hay mục chờ:

- Khối «Hỏi nhanh Kara» ở cột phải trang và chi tiết, thay nút «Hỏi Kara» ở đầu khu.
- Hộp cập nhật điền sẵn số cũ, gõ «+» để cộng thêm.
- Tên SV1 «Của tôi chỉ liệt KR…» dễ đọc thành bỏ cả «Đơn vị bạn dẫn», «Việc cần bạn»; `bat_khi` của SV1 chỉ bỏ bảng
  hàng loạt.

## 5. Con trỏ vào kho nguồn

Kho riêng tư `phanlemanh/crm-onehub-nguon`, ghim ở commit `88462c4`. Cột băm là `git hash-object` ghi trong `nguon.md`
của từng thư mục, để kiểm tệp không đổi.

| Con trỏ | Nội dung | Băm |
| --- | --- | --- |
| `crm-onehub-nguon:raw/2026-10-18-vo-khu-muc-tieu/bao-cao-tability-1810.md@88462c4` | Báo cáo 18/10, bản chữ của artifact: vỏ, kiến trúc thông tin, đặt tên, P1–P12 | `8fd5d2360516be0870bb9fdef3cc3e10905036bd` |
| `crm-onehub-nguon:raw/2026-10-18-vo-khu-muc-tieu/thao-luan.md@88462c4` | Thảo luận phiên nghiên cứu và phiên cắt, dựng lại 24/10 từ bản ghi phiên | `df51d9b763c89be5fce891b6046c3943e65720a2` |
| `crm-onehub-nguon:raw/2026-10-18-vo-khu-muc-tieu/ban-do-ma-onehub-16db97019.md@88462c4` | Bản đồ mã khu Mục tiêu ở `onehub` `16db97019`, nay đã cũ | `5509c2daf81f564986dea7641917bd8fd221d83f` |
| `crm-onehub-nguon:raw/2026-10-18-vo-khu-muc-tieu/nguon.md@88462c4` | Nguồn, ngày, băm từng tệp và ảnh | — |
| `crm-onehub-nguon:wiki/dot/okr-vo-khu-1810.md@88462c4` | Trang đợt: mã → tệp nguồn và điều đã chốt | `ebd6ec1f8b129770249fb32ef6e17be070b8ce30` |
| `crm-onehub-nguon:raw/2026-10-14-dieu-huong-okr/thao-luan.md@88462c4` | Thảo luận rà điều hướng OKR 14/10 (DH1–DH5) | `b824319f3030656834f2b42e9f06383a48a4f9c3` |

Trong báo cáo, các phần hay dùng: đặc tả vỏ (bảng «Phần · Đặc tả»), «Trước và sau theo từng chiều», «Trước và sau theo
việc hằng tuần», «Bảng chuyển chỗ», bảng «Đặt tên» và «Bản tiếng Anh», P1–P12, «Giữ nguyên, vì OneHub đang hơn».

## 6. Không chép vào kho này

- `thao-luan.md` của hai đợt: có đường dẫn máy, mã phiên và số production nội bộ.
- `ban-do-ma-onehub-16db97019.md`: mã đã cũ so với `onehub`, có đường dẫn máy.
- `bao-cao-tability-1810.html`: trang gốc của artifact, trùng nội dung bản chữ.
- Mọi ảnh trong `anh/`: bản mẫu mang tên người thật làm trưởng mẫu, ảnh Tability chụp trong không gian đã đăng nhập.
