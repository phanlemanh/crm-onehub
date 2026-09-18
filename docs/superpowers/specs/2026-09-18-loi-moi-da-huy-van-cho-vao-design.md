# Lời mời đã huỷ vẫn cho vào — thiết kế

Hồ sơ: `_acceptance/loi-moi-da-huy-van-cho-vao/` · hạng T3 · mặt: api

## Điều đã đo được, không phải điều nhớ được

Mọi con số dưới đây đọc từ gói **thật sự được nạp**:
`packages/auth/node_modules/better-auth` → `1.6.25`.

Kho có hai bản better-auth trong `node_modules/.bun`: `1.6.25` (phụ thuộc thật
của `packages/auth` và `apps/api`) và `1.4.22` (chỉ là phụ thuộc bắc cầu của
`@better-auth/cli`). Hợp đồng viết theo bản `1.4.22`. Kết luận về chính tả không
đổi, nhưng mọi phép đo của vòng này phải neo vào bản mà mã nạp, không neo vào bản
tình cờ có trong cây.

Gói xuất ra một kiểu:

```
InvitationStatus = "pending" | "accepted" | "rejected" | "canceled"
```

Bốn giá trị, `canceled` một chữ L. Hai lần xuất hiện của `"cancelled"` hai chữ L
trong gói nằm ở plugin `oauth-popup`, không thuộc miền lời mời.

## Từ vựng của kho, và chỗ nó rẽ khỏi gói

| Nơi | Vai | Giá trị |
| --- | --- | --- |
| `workspace.service.ts:307` | ghi khi mời | `"pending"` |
| `workspace.service.ts:342, 409` | ghi khi thu hồi | `"cancelled"` — **ngoài** `InvitationStatus` |
| `organization.ts:116` | ghi khi kết nạp | `"accepted"` |
| `allow-list.ts:67` | đọc để quyết cho vào | chặn khi `status === "cancelled"` |
| `workspace.service.ts:292` | đọc để chống mời trùng | cho qua khi `status ∈ {pending, accepted}` |
| `workspace.service.ts:69` | đọc để hiện màn | lạ → `"pending"` |

Hai vế ghi và đọc của kho **khớp nhau**, nên nút thu hồi của kho đang chặn đúng.
Lỗ nằm ở các trạng thái do **gói** ghi: `cancel-invitation` và
`reject-invitation` của plugin organization được phơi qua HTTP (plugin bật ở
`auth.ts:214`, không mã nào của kho chặn hai lộ trình đó), chúng ghi `"canceled"`
và `"rejected"`, và cả hai đều lọt qua phép kiểm hiện tại.

`workspace.service.ts:292` là bằng chứng kho **đã biết** lối đúng: nó kiểm theo
danh sách trắng. Vòng này đem lối ấy sang chỗ quyết định cho vào.

## Bốn khuyết tật, bốn địa chỉ

1. **Kiểm theo danh sách cấm** — `allow-list.ts:67`, `candidate.status !== "cancelled"`. Phục vụ AC-1, AC-2, AC-3.
2. **Ép kiểu ở ranh giới đọc** — `allow-list.ts:105`, `rows as AllowanceRow[]`. Prisma trả `status: string`; câu ép kiểu này nói dối trình biên dịch, và chính nó làm khuyết tật 1 vô hình. Phục vụ AC-4.
3. **Tập trạng thái của kho sai** — `AllowanceStatus = "pending" | "accepted" | "cancelled"`: sai chính tả một giá trị và thiếu hẳn `"rejected"`. Phục vụ AC-5.
4. **Mặc định im lặng khi hiện** — `workspace.service.ts:69`, giá trị lạ hoá `"pending"`. Lời mời đã huỷ qua gói hiện lên màn quản trị như đang chờ. Phục vụ AC-6.

## Khuyết tật thứ năm, hợp đồng chưa biết

Kho ghi `"cancelled"` — một giá trị **không nằm trong** `InvitationStatus`. Nên
sửa vế đọc sang từ vựng của gói mà không đụng dữ liệu cũ sẽ **cho vào lại mọi
người từng bị thu hồi** qua giao diện kho: dòng của họ mang `"cancelled"`, không
còn khớp luật chặn nào, và danh sách trắng cũng không chứa nó — nhưng luật mới
chặn theo *không nằm trong danh sách trắng*, nên họ bị chặn. Rủi ro thật nằm ở
hướng ngược lại: nếu ai đó viết luật mới theo kiểu «chặn khi thuộc tập kết thúc»
thay vì «cho vào khi thuộc tập còn hiệu lực», `"cancelled"` sẽ lọt.

Đây chính là lý do AC-3 đòi chứng bằng một giá trị rác: luật phải fail-closed
theo cấu trúc, không theo việc liệt kê đủ các giá trị xấu.

Phần dữ liệu cũ vẫn cần một quyết định của người ở Cổng 1 — xem mục cuối.

## Cách chữa

**Một nguồn từ vựng, khẳng định lúc biên dịch.** `packages/auth/src/invitation-status.ts`
khai tập trạng thái của miền và một khẳng định kiểu rằng tập ấy **bằng đúng**
`InvitationStatus` mà gói xuất. Gói thêm hay đổi một giá trị thì `check-types`
đỏ. Đây là cách duy nhất thoả AC-5 mà không chép tay danh sách rồi tin nó: danh
sách không được chép, nó được **so**.

**Phân tích tại ranh giới, không ép kiểu.** `readAllowState` phân tích từng dòng
bằng một bộ phân tích của miền. Dòng không phân tích được không bị bỏ qua im
lặng và cũng không làm sập lượt đăng nhập: nó thành một dòng mang trạng thái
`unknown` có tên, và `decideSignIn` **không** coi `unknown` là còn hiệu lực.
Lỗi có tên được ghi nhật ký; quyết định thì fail-closed.

**Cho vào theo danh sách trắng.** Tập còn hiệu lực là `{pending, accepted}`. Mọi
thứ khác — `canceled`, `rejected`, `cancelled` của dữ liệu cũ, hay một chuỗi rác
chưa từng thấy — đều dẫn tới từ chối, vì luật hỏi «có nằm trong tập còn hiệu lực
không», không hỏi «có phải một trong các giá trị xấu đã biết không».

**Hiện đúng trạng thái.** `toStatus` thôi ép giá trị lạ thành `"pending"`.

## Đo thế nào, và chiều đỏ của từng phép

Mỗi phép đo mới đi kèm cặp hai chiều trên cùng một cữ liệu: vật lành → xanh, phá
vật thật trong bản sao → đỏ với thông điệp ghim tên ô.

| Eval | Đo gì | Chiều đỏ |
| --- | --- | --- |
| E1 | `decideSignIn` từ chối `canceled` và `rejected` | đổi luật về danh sách cấm → đỏ, thông điệp ghim tên trạng thái lọt |
| E2 | giá trị rác bị từ chối | thêm một nhánh cho-vào-nếu-không-biết → đỏ |
| E3 | dữ liệu cũ `"cancelled"` bị từ chối | bỏ nó khỏi tập kết thúc mà không sửa danh sách trắng → đỏ |
| E4 | tập của kho **bằng** `InvitationStatus` của gói, đọc từ gói đã cài | thêm một giá trị giả vào tập của kho → đỏ, in cả hai tập |
| E5 | ranh giới đọc không còn `as`, dòng lạ thành `unknown` có tên | trả lại câu ép kiểu → đỏ |
| E6 | API không báo lời mời đã huỷ là đang chờ | trả lại mặc định im lặng ở `toStatus` → đỏ |

E4 là phép đo neo cả hồ sơ: nó đọc `InvitationStatus` từ `node_modules` của gói
đang nạp, nên nó đỏ khi ai đó nâng gói và từ vựng đổi — đúng điều AC-5 đòi.

## Điều người phải quyết ở Cổng 1

1. **Dữ liệu cũ.** Bảng thật có thể đang có dòng `"cancelled"` do kho ghi. Luật
   mới chặn chúng đúng, nhưng chúng vẫn là giá trị ngoài từ vựng của gói. Có đi
   kèm một lượt chuyển dữ liệu `"cancelled"` → `"canceled"` trong vòng này
   không, hay để lại và chỉ chặn ở tầng đọc? Hợp đồng đang để dòng `[GIẢ ĐỊNH]`
   cho câu này.
2. **Vế ghi.** `revokeAllowance` có đổi sang ghi `"canceled"` không? Đổi thì kho
   nói cùng một thứ tiếng với gói; không đổi thì tầng đọc phải mãi mãi mang
   `"cancelled"` như một giá trị cũ cần biết.
3. **Mặt của AC-6.** Khuyết tật nằm ở tầng API (`toStatus`), màn chỉ hiện lại
   thứ API trả. Hợp đồng khai `surfaces: [api]`. Đo ở tầng API là đủ cho tiêu
   chí, hay muốn thêm một phép đo lớp nhìn-thấy trên màn quản trị?
