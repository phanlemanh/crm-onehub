---
schema_version: 1
feature: Bộ dựng chung nhận chuỗi từ ngoài — một component hiện đúng tiếng người đọc mà chỗ gọi không phải truyền gì
slug: bo-dung-chung-nhan-chuoi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc:
---

# Acceptance Contract: bo-dung-chung-nhan-chuoi

## Context

Đây là vòng ② trong năm vòng ở `_acceptance/tieng-viet-cho-crm/opportunity.md`.
Người đảo thứ tự ngày 2026-09-01 và đưa nó lên trước vòng ①.

Vòng ① dựng xong đường ngôn ngữ rồi dừng ở S4: hai phép đo trượt vì bảng dùng
chung khoá cứng chín chuỗi tiếng Anh và chém tiêu đề cột dài không dấu ba chấm.
Chỗ gọi không truyền vào được. Vòng này mở đường đó.

Bảng thứ tự cũ nói vòng ② ràng buộc vòng ③. Vòng chấm chứng minh nó ràng buộc cả
vòng ①.

Source input: `_acceptance/tieng-viet-cho-crm/opportunity.md` · giả định #3

## Criteria

- AC-1: Given nhân viên đang đọc tiếng Việt, When họ mở một màn có bảng dùng chung, Then mười một chuỗi bảng đang khoá cứng hiện tiếng Việt: `Clear` · `Filters` · `Sort` · `Sort by` · `Detail` · `Ascending` · `Descending` · `Columns` · `Toggle columns` · `Select every row on this page` · `Select row`.
- AC-2: Given nhân viên đang đọc tiếng Việt, When màn hiện phân trang, nút đóng hộp thoại, ô ngày, ô gợi ý, vòng quay ảnh, hoặc con quay chờ, Then chữ của chúng là tiếng Việt.
- AC-3: Given một component dùng chung dựng ở nơi KHÔNG có nhà cung cấp ngôn ngữ, When nó vẽ, Then nó hiện tiếng Anh và không lỗi nào nổ.
- AC-4: Given khuôn mới đã dựng, When đếm sáu chỗ gọi `DataTable`, Then không chỗ nào phải truyền thêm chuỗi để có tiếng Việt.
- AC-5: Given quét mọi file ở tầng đầu của `packages/ui/src/components/`, When đếm chuỗi tiếng Anh nhìn thấy được còn khoá cứng, Then còn đúng 0. Phép đo tự liệt kê danh sách; hợp đồng không liệt kê hộ nó.
- AC-6: Given một tiêu đề cột dài hơn bề rộng cột, When màn hiện ở 768px, Then chữ bị cắt mang dấu ba chấm, và tiêu đề đầy đủ đọc được bằng trình đọc màn hình.
- AC-7: Given người đổi tiếng, When màn vẽ lại, Then chữ trong bảng dùng chung đổi theo NGAY, không cần tải lại trang.
- AC-8: Given kho bản dịch của vòng này, When vòng ③ quét 177 file nhãn ứng dụng, Then nó dùng lại đúng khuôn này, không dựng khuôn thứ hai. (judgment)
- AC-9: Given bản tiếng Việt của bảng dùng chung, When một nhân viên quan hệ đối tác đọc nó, Then chữ đọc như tiếng Việt của người trong nghề. (judgment)

## Coverage

Ba trục, quét theo lát cắt của trục "loại chữ".

- Trục **loại chữ**: chữ trên nút | chữ trong menu | chữ khi rỗng | nhãn chỉ trình đọc màn hình nghe thấy [thước CE: WCAG 2.2 SC 1.3.1 và SC 4.1.2 — nhãn cho trình đọc màn hình là chữ thật, không phải chú thích, `[NGÀNH: WCAG 2.2]`]
- Trục **chỗ gọi**: đã truyền chuỗi vào (`empty`, `facet.empty`, `tabs.allLabel`) | chưa truyền gì | dựng ngoài nhà cung cấp ngôn ngữ [thước CE: `[SUY-TỪ-REPO: AGENTS.md]` — luật "thứ người tự dựng máy chủ có thể thiếu thì phải im lặng bỏ khả năng, không được nổ"]
- Trục **thời điểm**: lượt vẽ đầu | ngay sau khi người đổi tiếng [thước CE: `[SUY-TỪ-REPO: packages/ui/src/components/*` đã dùng `createContext` ở 15 file và đã phụ thuộc `next-themes`]`]

Cross-cutting: chuỗi tiếng Việt dài hơn tiếng Anh 20–30%, và bảng có cột rộng cố
định (AC-6).

## Out of scope

- **Không chạm `packages/ui/src/components/ai-elements/**`.** Đếm được: 23 file, 12 file mang chữ, tổng 37 chuỗi — nhiều hơn cả phần còn lại của bộ dựng chung. Đó là bảng tác nhân, không hiện trên màn công ty, và có tài liệu riêng `docs/agent-panel.md`. Nó đi cùng vòng ⑤.
- **Không đổi `aria-label="Comp AI Logo"` trong `logo.tsx`.** Đó là tên hãng cũ sót lại trong bản rẽ, không phải việc dịch. Ghi thành issue riêng.
- Không dịch nhãn của ứng dụng — 177 file, đó là vòng ③.
- Không dịch câu máy chủ trả về — 181 câu, đó là vòng ④.
- **Không thêm thư viện đa ngôn ngữ.** Hai mươi lăm chuỗi không đủ căn cứ chọn thư viện; chọn bây giờ là chọn mà chưa có bằng chứng của 177 file. Khuôn vòng này phải để vòng ③ đổi nguồn chuỗi mà không đổi chỗ gọi.
- Không thêm ngôn ngữ thứ ba.

## Notes

Hợp đồng viết TRƯỚC khi có mã.

**Vì sao AC-5 đo bằng máy quét chứ không bằng danh sách trong hợp đồng.** Vòng ①
trượt đúng ở chỗ này: nó viết ra một danh sách ngoại lệ bằng tay, và danh sách đó
thiếu. Danh sách viết tay già đi từ lúc ký. Ở đây hợp đồng chỉ khai **ranh giới**
(tầng đầu của `components/`, trừ `logo.tsx`), còn việc liệt kê từng chuỗi là việc
của phép đo, chạy lại mỗi vòng chấm.

**Ràng buộc kỹ thuật đã đếm 2026-09-01:**

| Đếm được | Số |
| --- | --- |
| File ở tầng đầu `packages/ui/src/components/` | 75 |
| File trong đó mang chữ nhìn thấy được | 9 |
| Chuỗi phải dịch | 25 |
| Riêng `data-table.tsx` giữ | 14 |
| Chỗ gọi `DataTable` | 6 |
| File đã dùng `createContext` trong bộ dựng chung | 15 |

**Nguồn của AC-6:** `data-table.tsx` đặt `overflow-hidden` lên ô tiêu đề cùng một
bề rộng cố định, và không đặt `truncate`. Chữ bị chém trần, người đọc không nhận
được tín hiệu nào rằng chữ đã cụt.

**Ranh giới với vòng ③:** vòng này chốt **cách một component nhận chuỗi**. Vòng ③
chốt **kho chuỗi ở đâu và ai dịch**. Hai việc khác nhau, và AC-8 là chỗ người
chấm xem vòng này có ép vòng ③ dựng lại từ đầu không.

**Phí bản rẽ:** khuôn phải là thứ gửi ngược lên hãng được. Một component nhận
chuỗi qua nhà cung cấp và có sẵn mặc định tiếng Anh chạy y nguyên trong kho của
hãng, nơi không ai dựng nhà cung cấp đó — AC-3 là phép đo của chính điều này.

**Đã đọc trước khi viết:** `docs/design.md`, `AGENTS.md`, `CONTEXT.md`,
`_acceptance/tieng-viet-cho-crm/{opportunity,contract,gap-probe}.md`.
