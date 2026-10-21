# Khoá việc con đúng thứ tự — thiết kế

Hàng DA13 của `docs/plan/lo-trinh-viec-du-an.json`, đợt `viec-du-an-kho-tai-lieu`, dãy V2. Cổng Đáng `build` (chủ kho
21/10 «DA13 Build»). Nguồn: sổ `_acceptance/va-gantt-lich-bay-ngay/decisions.jsonl` dòng `d-20261020T032627Z-13` và
`-14` (Ngoài-1, Ngoài-2 của DA12, chủ kho chọn «mở hợp đồng mới»).

## Lỗi

Mọi đường ghi chạm một dự án khoá theo một thứ tự: hàng `duAn` trước, rồi mọi hàng `viec` của dự án theo `id`
(`khoaMot` ở `packages/db/src/du-an-ghi.ts`, `khoaDuAn` ở `packages/db/src/viec-ghi.ts`). `taoViecCon` đi ngược:

1. `SELECT … FROM viec WHERE id = <cha> FOR UPDATE` — giữ hàng việc cha.
2. `taoViec` → `docDuAnNhanViec` → `SELECT … FROM "duAn" WHERE id = <P> FOR UPDATE` — chờ hàng dự án.

Người khác đang sửa mốc, thêm hay gỡ phụ thuộc, sửa dự án, đổi ngày một việc hay chuyển một việc vào P thì đã giữ
hàng `duAn` của P và đang xin các hàng `viec` của P — trong đó có việc cha. Hai giao dịch chờ nhau; Postgres phát
hiện vòng sau `deadlock_timeout` (1 giây) và huỷ một bên với lỗi `40P01`. `dichLoi` của API không biết lỗi này nên
người dùng nhận 500, lời chung chung. Không mất dữ liệu; thử lại là qua.

## Sửa

`taoViecCon` khoá theo đúng thứ tự chung:

1. Đọc `duAnId` của việc cha, không khoá.
2. Khoá hàng `duAn` của dự án đó (`SELECT … FOR UPDATE`). Việc cha không thuộc dự án nào thì không khoá dự án nào.
3. Khoá và đọc việc cha như nay.
4. `duAnId` đọc lại ở bước 3 khác bước 1 — có người vừa chuyển việc cha sang dự án khác, ra khỏi dự án, hay từ ngoài
   vào dự án trong lúc mình chờ khoá — thì ném `LoiChaDoiDuAn` (một `LoiViec` mã `khong-hop-le`, lời
   `DU_AN.thongDiep.chaDoiDuAn` «Việc cha vừa đổi dự án. Hãy thử lại.») trước khi khoá dự án mới. Khoá dự án mới lúc
   đã giữ việc cha là đi ngược thứ tự lần nữa.
5. `ViecBangService.taoCon` bắt riêng `LoiChaDoiDuAn` và chạy lại cả việc thêm việc con trong một giao dịch mới, tối đa
   `DU_AN.thuLaiViecCon` (3) lượt. Lượt sau đọc dự án mới ở bước 1 nên khoá đúng. Hết lượt mới trả 400 với lời trên.
   Người dùng vì thế thấy đúng như trước vòng này ở ca hiếm này: việc con được tạo, nằm cùng dự án hiện tại của việc
   cha.

Các lời kiểm còn lại (quyền, một tầng, việc cha đang mở, trần 300, dự án đã đóng) giữ nguyên thứ tự và lời. Hàng
`duAn` bị khoá lại trong `docDuAnNhanViec` là khoá lại trong cùng giao dịch, không chờ.

Chỉ khoá hàng `duAn`, không khoá mọi việc của dự án như `khoaDuAn`: bên nào giữ hàng `duAn` cũng loại bên kia, nên
không có vòng với các đường ghi dự án; và mặt tranh chấp của thêm việc con giữ ở hai hàng (dự án, việc cha) thay vì
tới 300 hàng việc. Đúng gợi ý ghi ở hàng DA13 («khoá duAn trước khoá việc cha»).

## Đo

Bài mới `apps/api/test/viec-con-khoa.spec.ts`, tiền tố `vck-`. Dựng đúng thứ tự xen kẽ gây vòng, tất định, không
dựa vào may rủi:

- Giao dịch B (bên «người khác») mở bằng `db.$transaction`, khoá hàng `duAn` của P, rồi chờ.
- Bên A gọi `viec.taoCon` qua tRPC thật (cùng đường người dùng đi).
- Máy đọc `pg_stat_activity` (B tự lấy `pg_backend_pid()`) tới khi thấy một tiến trình của chính kho thử
  (`datname = current_database()`) mà `pg_blocking_pids` của nó chứa pid B — bằng chứng A đang bị chính B chặn, không
  phải một tiến trình lạ. Giao dịch B mở với `timeout` 30 giây để lời ghim 10 giây tới được trước hạn của Prisma. Không thấy trong 10 giây thì bài ném lời ghim, không đi tiếp (chặn bài xanh vì không bao giờ xen
  kẽ).
- B làm thao tác của mình qua hàm ghi thật trong cùng giao dịch, rồi commit.
- Với mã cũ: A đã giữ việc cha, B xin việc cha, Postgres huỷ một bên → bài đỏ đúng lời ghim. Với mã mới: A chưa giữ
  gì ngoài hàng chờ, B đi hết, A đi sau → cả hai xong.

Ma trận thao tác của B viết sẵn trước khi chạy, lấy từ mọi chỗ gọi `khoaMot` và `khoaDuAn` (grep 21/10): thêm mốc,
sửa mốc, xoá mốc, thêm phụ thuộc, gỡ phụ thuộc, sửa dự án, đổi ngày một việc, chuyển một việc vào P — tám dòng thành
công; đóng P — một dòng A nhận «Dự án đã đóng.». Xoá dự án và mở lại dự án không vào ma trận: xoá chỉ được khi dự án
chưa có lịch sử (dự án có việc thì đã có), mở lại cần dự án đã đóng.

Chuyển việc cha giữa lúc chờ: ba dòng P→Q, P→ngoài, ngoài→P. B chạy trọn `doiDuAn` trong giao dịch (giữ dự án cũ,
dự án mới và việc cha), chờ A tới chỗ chờ, rồi commit. Hai tầng đo cùng xen kẽ ấy: qua `viec.taoCon`, A trả 200 và
việc con nằm đúng dự án hiện tại của việc cha; gọi thẳng `taoViecCon` trong một giao dịch, lượt đó ném
`LoiChaDoiDuAn` — tầng này giữ lời kiểm lại không bị bỏ mà vẫn xanh nhờ một lần may.

Chiều đỏ ở răng đột biến `_acceptance/khoa-viec-con-dung-thu-tu/rang/dot-bien.mjs` (khuôn của DA12): (a) đưa khoá
việc cha về trước `khoaDuAn` → bài ma trận đỏ với «vck doi thu»; (b) bỏ lời kiểm lại dự án → bài chuyển việc cha đỏ
với «vck chuyen cha» ở tầng gọi thẳng.

## Không làm

- Bắt `40P01` rồi tự thử lại ở API: che lỗi thay vì gỡ; đường khác ngược thứ tự sẽ không ai thấy.
- Rà mọi đường ghi việc đơn lẻ (`docViecGhi`) có chạm dự án qua khoá ngoại: ngoài câu giao của hàng. Grep 21/10:
  mọi chỗ ghi `duAnVet` hay đặt `Viec.duAnId` đều khoá hàng `duAn` trước, nên chưa thấy đường nào; `docs/api.md` ghi rõ
  là chưa rà.
- Giao diện: không đổi màn nào. Lời 400 mới hiện qua thông báo lỗi sẵn có của ô thêm việc con.
